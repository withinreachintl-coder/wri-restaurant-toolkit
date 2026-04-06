# WRI Restaurant Toolkit - Database Schema for Approval

## Overview

This document presents the complete database schema for the WRI Restaurant Toolkit. All data is isolated per organization using Supabase Row-Level Security (RLS) policies.

---

## Data Model

### 1. Organizations

Represents each restaurant (the "tenant" in a multi-tenant system).

```
organizations
├── id (UUID, PK)
├── name (varchar) — Restaurant name (from signup form)
├── owner_email (varchar, UNIQUE)
├── subscription_status (enum: trial | active | past_due | canceled)
├── plan (enum: free | pro)
├── trial_ends_at (timestamp)
├── stripe_customer_id (varchar)
├── stripe_subscription_id (varchar)
├── created_at, updated_at
```

**Access**: Users can only see their own org via RLS.

---

### 2. Users

Staff and managers in an organization.

```
users
├── id (UUID, PK)
├── auth_id (UUID) — Foreign key to Supabase auth.users.id
├── email (varchar)
├── name (varchar)
├── org_id (UUID, FK → organizations)
├── role (enum: owner | manager | staff)
├── created_at, updated_at
```

**Access**: Users can see all members of their org.

---

### 3. LP Audits (Loss Prevention)

Daily restaurant safety/compliance checklists.

```
lp_audits
├── id (UUID, PK)
├── org_id (UUID, FK → organizations)
├── completed_by_user_id (UUID, FK → users)
├── audit_date (date) — When the audit was for
├── items (JSONB) — [{id, title, status: 'pass'|'fail'|'na', notes}]
├── completed_at (timestamp) — When submitted
├── created_at, updated_at
```

**Standard Items**:
- Walk-in cooler temp (38°F or below)
- Freezer temp (0°F or below)
- Food storage & cross-contamination
- Kitchen/dining cleanliness
- Pest evidence
- Cash handling
- Inventory spot-check
- Waste disposal
- Sanitizer levels

**Access**: Users can view and submit audits only for their org.

---

### 4. R&M Requests (Repair & Maintenance)

Maintenance requests from staff to management.

```
rm_requests
├── id (UUID, PK)
├── org_id (UUID, FK → organizations)
├── submitted_by_user_id (UUID, FK → users)
├── title (varchar) — e.g., "Fryer broken"
├── description (text)
├── location (varchar) — Kitchen, Back office, Dining area, etc.
├── photo_url (varchar) — Supabase Storage URL
├── status (enum: open | in_progress | resolved)
├── status_history (JSONB) — [{status, changed_at, changed_by_user_id}]
├── created_at, updated_at
```

**Workflow**:
1. Staff submits request with title, description, location, photo
2. Manager views on dashboard
3. Manager changes status: open → in_progress → resolved
4. Each status change is timestamped and user-tracked

**Access**: Users can view and submit/update requests for their org.

---

### 5. Shift Handoffs

Notes from outgoing manager to incoming manager.

```
shift_handoffs
├── id (UUID, PK)
├── org_id (UUID, FK → organizations)
├── written_by_user_id (UUID, FK → users)
├── note (text) — Handoff message
├── shift_date (date)
├── shift_type (enum: morning | evening | close)
├── created_at, updated_at
```

**Usage**:
- Manager writes handoff before shift ends
- Next manager sees it on dashboard login
- Visible as a log (last 7 days)

**Access**: Users can view and write handoffs for their org.

---

### 6. Daily Summaries

Auto-generated end-of-day summaries (pulled from other tables).

```
daily_summaries
├── id (UUID, PK)
├── org_id (UUID, FK → organizations)
├── summary_date (date)
├── lp_completed (boolean) — Did LP audit happen today?
├── rm_opened (integer) — How many R&M requests opened today?
├── rm_resolved (integer) — How many resolved today?
├── shift_note_present (boolean) — Shift handoff note exists?
├── summary_text (text) — Formatted summary for dashboard/email
├── emailed_at (timestamp) — When email was sent
├── created_at
```

**Auto-generated**: Cron job at 11:59 PM UTC compiles daily data.

**Access**: Users can view summaries for their org.

---

## Security Model (RLS)

### Enforcement

All tables have RLS enabled. A helper function `get_user_org_id()` reads the current user's org:

```sql
CREATE FUNCTION get_user_org_id()
RETURNS UUID AS $$
SELECT org_id FROM users WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE;
```

### Policies by Table

**Organizations**:
- SELECT: User can view their own org
- INSERT: Only via signup (backend-controlled)
- UPDATE: Owner only

**Users**:
- SELECT: Can see members of own org
- INSERT: Can add themselves (backend validates)

**LP Audits**:
- SELECT: Can view own org's audits
- INSERT: Can submit audits for own org

**R&M Requests**:
- SELECT: Can view own org's requests
- INSERT: Can submit for own org
- UPDATE: Can change status for own org

**Shift Handoffs**:
- SELECT: Can view own org's handoffs
- INSERT: Can write for own org

**Daily Summaries**:
- SELECT: Can view own org's summaries
- (No INSERT/UPDATE: Cron only)

---

## Data Isolation Examples

### Example 1: Signup (New Restaurant)

```
1. User submits email: manager@taco-bell-franchise.com, name: "Taco Bell - Downtown"
2. Backend creates:
   - organizations: {id: abc123, name: "Taco Bell - Downtown", owner_email: manager@...}
   - users: {id: xyz789, auth_id: <supabase_auth_id>, org_id: abc123, role: 'owner'}
3. All subsequent queries filtered by org_id = abc123 via RLS
4. User cannot see other organizations' data
```

### Example 2: View LP Audits

```
User from org A queries: SELECT * FROM lp_audits

RLS Policy applied automatically:
  WHERE org_id = get_user_org_id()  -- Returns org_a.id

Result: Only audits from org A returned
Org B's audits are invisible (query returns 0 rows)
```

### Example 3: Submit R&M Request

```
User submits: INSERT INTO rm_requests (title, description, location, org_id, submitted_by_user_id)
VALUES ('Fryer broken', 'Pilot light won\'t ignite', 'Kitchen', ?, ?)

RLS Policy enforces:
  WITH CHECK (org_id = get_user_org_id())

If user tries to INSERT with org_id = different_org:
  → RLS rejects (violates policy)
  → INSERT fails with "new row violates row-level security policy"
```

---

## Data Flow for Each Feature

### LP Audit Submission

```
Manager on dashboard
  → Click "Run LP Audit"
  → Form loads with standard 9 items
  → Manager checks Pass/Fail/N/A for each + adds notes
  → Click "Submit"
  → POST /api/lp-audits
    → Backend creates record with:
       - org_id = user.org_id (from JWT)
       - completed_by_user_id = user.id
       - completed_at = NOW()
    → INSERT into lp_audits table (RLS auto-filters)
  → Dashboard shows "Last LP Audit: Today"
```

### R&M Request Submission

```
Staff submits repair request
  → Form: Title, Description, Location, Photo upload
  → POST /api/rm-requests (with file upload to Supabase Storage)
  → Backend creates record with:
     - org_id = user.org_id
     - submitted_by_user_id = user.id
     - status = 'open'
     - status_history = [{status: 'open', changed_at: NOW(), changed_by: user.id}]
  → Manager sees on dashboard under "Open Requests"
  → Manager clicks "In Progress"
    → PATCH /api/rm-requests/:id
    → Status changed, status_history appended
```

### Shift Handoff

```
Outgoing manager writes note before shift ends
  → POST /api/shift-handoffs
  → Record stored with:
     - org_id = user.org_id
     - shift_date = TODAY
     - shift_type = 'close' (based on time)
  → Incoming manager logs in next shift
  → Dashboard shows "Shift Handoff from [Name]: [Note]"
```

### Daily Summary (Cron)

```
11:59 PM UTC: Cron job runs
  FOR EACH organization:
    1. COUNT LP audits WHERE audit_date = TODAY AND org_id = org.id
    2. COUNT R&M requests WHERE created_at >= TODAY AND org_id = org.id AND status = 'open'
    3. COUNT R&M requests WHERE ... AND status = 'resolved'
    4. SELECT shift_handoffs WHERE shift_date = TODAY AND org_id = org.id LIMIT 1
    5. Generate summary_text
    6. INSERT into daily_summaries
    7. SEND EMAIL to owner via Resend
```

---

## Scalability Notes

- **Indexes**: Added on frequently queried columns (org_id, dates, status)
- **UNIQUE constraint**: organizations.owner_email prevents duplicates
- **Cascade delete**: Deleting org cascades to all org's data
- **JSONB storage**: items (LP audits) and status_history are stored as JSON for flexibility

---

## Approval Checklist

Before proceeding to app code:

- [ ] Schema creates all 6 tables correctly
- [ ] RLS policies enforce org isolation
- [ ] Helper function `get_user_org_id()` works
- [ ] Indexes on frequently queried columns
- [ ] JSONB fields support flexible item storage
- [ ] Stripe fields added to organizations table
- [ ] Supabase Storage bucket configured for R&M photos
- [ ] Resend email fields ready
- [ ] Cron endpoint designed for daily summary generation

---

## Questions Before Approval?

1. Should we add audit logs for who changed R&M status? (Currently tracked in status_history)
2. Should LP audits have severity levels (critical/warning/info)?
3. Should shift handoffs have a "read by" timestamp?
4. Should daily summaries be emailed or just viewable on dashboard?

**Awaiting approval to proceed with Next.js app development.**
