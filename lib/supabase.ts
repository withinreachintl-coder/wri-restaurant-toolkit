import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Organization = {
  id: string
  name: string
  owner_email: string
  subscription_status: 'trial' | 'active' | 'past_due' | 'canceled'
  plan: 'free' | 'pro'
  trial_ends_at: string | null
  created_at: string
}

export type User = {
  id: string
  auth_id: string
  email: string
  name: string
  org_id: string
  role: 'owner' | 'manager' | 'staff'
  created_at: string
}

export type LPAudit = {
  id: string
  org_id: string
  completed_by_user_id: string
  audit_date: string
  items: Array<{
    id: string
    title: string
    status: 'pass' | 'fail' | 'na'
    notes: string
  }>
  completed_at: string
  created_at: string
}

export type RMRequest = {
  id: string
  org_id: string
  submitted_by_user_id: string
  title: string
  description: string | null
  location: string | null
  photo_url: string | null
  status: 'open' | 'in_progress' | 'resolved'
  status_history: Array<{
    status: string
    changed_at: string
    changed_by_user_id: string
  }>
  created_at: string
  updated_at: string
}

export type ShiftHandoff = {
  id: string
  org_id: string
  written_by_user_id: string
  note: string
  shift_date: string
  shift_type: 'morning' | 'evening' | 'close'
  created_at: string
}

export type DailySummary = {
  id: string
  org_id: string
  summary_date: string
  lp_completed: boolean
  rm_opened: number
  rm_resolved: number
  shift_note_present: boolean
  summary_text: string | null
  created_at: string
}
