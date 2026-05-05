-- ============================================================================
-- 0002 — Fix callback path in trust-boundary table COMMENTs
-- ============================================================================
-- Context: SPEC-0013 final review (Flag 4) decided to converge the callback
-- route URL on the par-tracker pattern at app/auth/callback/route.ts (not
-- app/api/auth/callback/route.ts as the original SPEC text said). Migration
-- 0001 wrote the old path into the COMMENT ON TABLE statements for
-- public.organizations and public.users. This migration corrects them so
-- prod table comments point future readers to the actual file location.
--
-- Apply method: Supabase MCP apply_migration (records as
-- `fix_callback_path_in_comments`).
-- ============================================================================

COMMENT ON TABLE public.organizations IS
  'INSERTs and UPDATEs gated to service role only (no RLS policies). All writes go through app/auth/callback/route.ts on first login. SPEC-0013.';

COMMENT ON TABLE public.users IS
  'INSERTs gated to service role only (no client INSERT policy). Writes go through app/auth/callback/route.ts on first login. public.users.id = auth.users.id (FK, ON DELETE CASCADE). SPEC-0013.';
