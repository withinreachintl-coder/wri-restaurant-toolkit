-- WRI Restaurant Toolkit Database Schema
-- Supabase PostgreSQL with Row-Level Security (RLS) enforced per organization

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ORGANIZATIONS TABLE
-- ============================================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  owner_email VARCHAR(255) NOT NULL UNIQUE,
  subscription_status VARCHAR(50) NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'past_due', 'canceled')),
  plan VARCHAR(50) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_organizations_owner_email ON organizations(owner_email);

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID NOT NULL UNIQUE, -- Supabase auth.users.id
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- LP_AUDITS TABLE (Loss Prevention Audits)
-- ============================================================================
CREATE TABLE lp_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  completed_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  audit_date DATE NOT NULL,
  items JSONB NOT NULL, -- [{id: string, title: string, status: 'pass'|'fail'|'na', notes: string}]
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lp_audits_org_id ON lp_audits(org_id);
CREATE INDEX idx_lp_audits_audit_date ON lp_audits(audit_date);
CREATE INDEX idx_lp_audits_completed_at ON lp_audits(completed_at);

-- ============================================================================
-- RM_REQUESTS TABLE (Repair & Maintenance Requests)
-- ============================================================================
CREATE TABLE rm_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  submitted_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  photo_url VARCHAR(512),
  status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  status_history JSONB NOT NULL DEFAULT '[]', -- [{status: string, changed_at: timestamp, changed_by_user_id: uuid}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rm_requests_org_id ON rm_requests(org_id);
CREATE INDEX idx_rm_requests_status ON rm_requests(status);
CREATE INDEX idx_rm_requests_created_at ON rm_requests(created_at);

-- ============================================================================
-- SHIFT_HANDOFFS TABLE
-- ============================================================================
CREATE TABLE shift_handoffs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  written_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  shift_date DATE NOT NULL,
  shift_type VARCHAR(50) NOT NULL CHECK (shift_type IN ('morning', 'evening', 'close')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shift_handoffs_org_id ON shift_handoffs(org_id);
CREATE INDEX idx_shift_handoffs_shift_date ON shift_handoffs(shift_date);
CREATE INDEX idx_shift_handoffs_created_at ON shift_handoffs(created_at);

-- ============================================================================
-- DAILY_SUMMARIES TABLE
-- ============================================================================
CREATE TABLE daily_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,
  lp_completed BOOLEAN DEFAULT FALSE,
  rm_opened INTEGER DEFAULT 0,
  rm_resolved INTEGER DEFAULT 0,
  shift_note_present BOOLEAN DEFAULT FALSE,
  summary_text TEXT,
  emailed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_daily_summaries_org_id ON daily_summaries(org_id);
CREATE INDEX idx_daily_summaries_summary_date ON daily_summaries(summary_date);
CREATE UNIQUE INDEX idx_daily_summaries_org_date ON daily_summaries(org_id, summary_date);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lp_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE rm_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;

-- Helper function: Get user's organization
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
SELECT org_id FROM users WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Organizations: Owner can see/edit their own org
CREATE POLICY "Users can view their own org" ON organizations
  FOR SELECT USING (id = get_user_org_id());

-- Users: Can see other users in same org
CREATE POLICY "Users can view org members" ON users
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can insert themselves" ON users
  FOR INSERT WITH CHECK (org_id = get_user_org_id());

-- LP Audits: Can view/insert/update audits in own org
CREATE POLICY "Users can view org LP audits" ON lp_audits
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can insert LP audits" ON lp_audits
  FOR INSERT WITH CHECK (org_id = get_user_org_id());

-- R&M Requests: Can view/insert/update in own org
CREATE POLICY "Users can view org R&M requests" ON rm_requests
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can insert R&M requests" ON rm_requests
  FOR INSERT WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update R&M requests" ON rm_requests
  FOR UPDATE USING (org_id = get_user_org_id());

-- Shift Handoffs: Can view/insert in own org
CREATE POLICY "Users can view org shift handoffs" ON shift_handoffs
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can insert shift handoffs" ON shift_handoffs
  FOR INSERT WITH CHECK (org_id = get_user_org_id());

-- Daily Summaries: Can view in own org
CREATE POLICY "Users can view org daily summaries" ON daily_summaries
  FOR SELECT USING (org_id = get_user_org_id());

-- ============================================================================
-- DEFAULT LP AUDIT ITEMS
-- ============================================================================
-- These will be used as a template when creating new audits

CREATE TABLE lp_audit_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  items JSONB NOT NULL, -- [{id, title, category}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default template
INSERT INTO lp_audit_templates (name, items) VALUES (
  'Standard Restaurant LP Audit',
  '[
    {"id": "temp_check", "title": "Walk-in cooler temperature (38°F or below)", "category": "Food Safety"},
    {"id": "freezer_check", "title": "Freezer temperature (0°F or below)", "category": "Food Safety"},
    {"id": "food_storage", "title": "Proper food storage (no cross-contamination)", "category": "Food Safety"},
    {"id": "cleanliness", "title": "Kitchen and dining area cleanliness", "category": "Cleanliness"},
    {"id": "pests", "title": "No evidence of pests", "category": "Cleanliness"},
    {"id": "cash_handling", "title": "Cash drawer reconciled and secured", "category": "Security"},
    {"id": "inventory", "title": "Inventory spot-check (no discrepancies)", "category": "Inventory"},
    {"id": "waste", "title": "Proper waste disposal and dumpster locked", "category": "Operations"},
    {"id": "sanitizer", "title": "Sanitizer levels checked and refilled", "category": "Food Safety"}
  ]'::jsonb
);

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View: Recent R&M requests (last 30 days)
CREATE OR REPLACE VIEW recent_rm_requests AS
SELECT 
  r.id, r.org_id, r.title, r.status, r.location,
  u.name as submitted_by,
  r.created_at
FROM rm_requests r
LEFT JOIN users u ON r.submitted_by_user_id = u.id
WHERE r.created_at > NOW() - INTERVAL '30 days'
ORDER BY r.created_at DESC;

-- View: Organization summary (for dashboard)
CREATE OR REPLACE VIEW org_summary AS
SELECT 
  o.id,
  o.name,
  o.subscription_status,
  o.plan,
  (SELECT COUNT(*) FROM users WHERE org_id = o.id) as user_count,
  (SELECT COUNT(*) FROM rm_requests WHERE org_id = o.id AND status != 'resolved') as open_rm_count,
  (SELECT created_at FROM lp_audits WHERE org_id = o.id ORDER BY created_at DESC LIMIT 1) as last_audit_date
FROM organizations o;
