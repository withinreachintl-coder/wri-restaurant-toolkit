-- ============================================================================
-- 0001 — Signup Bootstrap & Schema Convergence
-- ============================================================================
-- Context: SPEC-0013. The toolkit currently has a dual-ID users table
-- (public.users.id != auth.users.id, linked via public.users.auth_id) which
-- blocks signup bootstrap end-to-end. This migration converges to the
-- single-ID model used by sibling repos wri-par-tracker and wri-tip-pool:
-- public.users.id IS the auth.users.id, with FK and ON DELETE CASCADE.
--
-- Pre-conditions (verified before drafting):
--   * public.users:             0 rows
--   * public.organizations:     0 rows
--   * public.lp_audits:         0 rows
--   * public.rm_requests:       0 rows
--   * public.shift_handoffs:    0 rows
--   * public.daily_summaries:   0 rows
--   * public.lp_audit_templates: 1 row (the seed)
--   * auth.users:               2 rows (orphaned; will get public.users rows
--     on next login via the new server-side callback bootstrap).
--
-- Trust boundary change:
--   Before: client (anon-key) inserts directly into public.organizations and
--   public.users from app/signup/page.tsx. Both inserts blocked by RLS today
--   (no INSERT policy on organizations; chicken-and-egg WITH CHECK on users).
--   After: server-side app/auth/callback/route.ts uses the service role
--   key to upsert organizations and users on first login. No client-side
--   signup write paths remain.
--
-- Apply method: Supabase MCP apply_migration (records in
-- supabase_migrations.schema_migrations as `signup_bootstrap_schema_converge`).
-- This on-disk file is a documentation artifact.
-- ============================================================================

-- 1. Recreate get_user_org_id() to use auth.uid() = users.id directly
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID
LANGUAGE SQL
STABLE
AS $$
  SELECT org_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;

-- 2. Drop the misleading client-side users INSERT policy
DROP POLICY IF EXISTS "Users can insert themselves" ON public.users;

-- 2.5. SPEC-0013 SCOPE NOTE: drop RLS policies on orphan tables
--      (audit_forms, audit_exceptions, r_m_tickets) that reference
--      users.auth_id, blocking the column drop in Step 3. These tables
--      themselves are out of scope for SPEC-0013 (filed as SPEC-0014:
--      prune restaurant-ops orphans). After this migration, the tables
--      remain in place but with no RLS policies — RLS-on + no-policy
--      means all non-service-role access is denied, which is acceptable
--      because the tables are empty (verified) and not referenced by
--      toolkit code.
--      TODO(SPEC-0014): Evaluate these tables for DROP. This migration
--      only removes their now-broken policies.
DROP POLICY IF EXISTS audit_forms_select      ON public.audit_forms;
DROP POLICY IF EXISTS audit_forms_insert      ON public.audit_forms;
DROP POLICY IF EXISTS audit_forms_update      ON public.audit_forms;
DROP POLICY IF EXISTS audit_exceptions_select ON public.audit_exceptions;
DROP POLICY IF EXISTS audit_exceptions_insert ON public.audit_exceptions;
DROP POLICY IF EXISTS audit_exceptions_update ON public.audit_exceptions;
DROP POLICY IF EXISTS r_m_tickets_select      ON public.r_m_tickets;
DROP POLICY IF EXISTS r_m_tickets_insert      ON public.r_m_tickets;
DROP POLICY IF EXISTS r_m_tickets_update      ON public.r_m_tickets;

-- 3. Drop public.users.auth_id (cascades drop of users_auth_id_key + idx_users_auth_id)
ALTER TABLE public.users DROP COLUMN IF EXISTS auth_id;

-- 4. Converge users.id to auth.users.id
ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;

ALTER TABLE public.users
  ADD CONSTRAINT users_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Document trust boundaries
COMMENT ON TABLE public.organizations IS
  'INSERTs and UPDATEs gated to service role only (no RLS policies). All writes go through app/auth/callback/route.ts on first login. SPEC-0013.';

COMMENT ON TABLE public.users IS
  'INSERTs gated to service role only (no client INSERT policy). Writes go through app/auth/callback/route.ts on first login. public.users.id = auth.users.id (FK, ON DELETE CASCADE). SPEC-0013.';

-- 6. lp_audit_templates: ensure RLS on, add SELECT for authenticated
ALTER TABLE public.lp_audit_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone authenticated can read templates"
  ON public.lp_audit_templates;

CREATE POLICY "anyone authenticated can read templates"
  ON public.lp_audit_templates
  FOR SELECT
  TO authenticated
  USING (true);
