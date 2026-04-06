'use client'

import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type DailySummary = {
  summary_date: string
  lp_completed: boolean
  rm_opened: number
  rm_resolved: number
  shift_note_present: boolean
  summary_text: string | null
}

export default function DailySummaryPage() {
  const [summaries, setSummaries] = useState<DailySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [today, setToday] = useState<DailySummary | null>(null)

  useEffect(() => {
    const loadSummaries = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          window.location.href = '/login'
          return
        }

        const { data: userData } = await supabase
          .from('users')
          .select('org_id')
          .eq('auth_id', authUser.id)
          .single()

        if (!userData) throw new Error('User not found')
        setOrgId(userData.org_id)

        // Load summaries from last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: summariesData } = await supabase
          .from('daily_summaries')
          .select('*')
          .eq('org_id', userData.org_id)
          .gte('summary_date', thirtyDaysAgo.toISOString().split('T')[0])
          .order('summary_date', { ascending: false })

        setSummaries(summariesData || [])

        // Check if we have today's summary
        const todayStr = new Date().toISOString().split('T')[0]
        const todaySummary = summariesData?.find(s => s.summary_date === todayStr)
        if (todaySummary) {
          setToday(todaySummary)
        } else {
          // Generate today's summary
          generateSummary(userData.org_id, todayStr)
        }
      } catch (err) {
        console.error('Failed to load summaries:', err)
      } finally {
        setLoading(false)
      }
    }

    loadSummaries()
  }, [])

  const generateSummary = async (orgId: string, dateStr: string) => {
    try {
      // Get LP audits for today
      const { data: lpData } = await supabase
        .from('lp_audits')
        .select('id')
        .eq('org_id', orgId)
        .eq('audit_date', dateStr)

      // Get R&M requests for today
      const { data: rmData } = await supabase
        .from('rm_requests')
        .select('status')
        .eq('org_id', orgId)
        .gte('created_at', `${dateStr}T00:00:00`)
        .lte('created_at', `${dateStr}T23:59:59`)

      // Get shift handoffs for today
      const { data: shiftData } = await supabase
        .from('shift_handoffs')
        .select('id')
        .eq('org_id', orgId)
        .eq('shift_date', dateStr)

      const lpCompleted = (lpData?.length || 0) > 0
      const rmOpened = rmData?.filter(r => r.status === 'open').length || 0
      const rmResolved = rmData?.filter(r => r.status === 'resolved').length || 0
      const shiftNotePresent = (shiftData?.length || 0) > 0

      const summaryText = `
📋 Daily Operations Summary - ${new Date(dateStr).toLocaleDateString()}

LP Audit: ${lpCompleted ? '✅ Completed' : '⏳ Pending'}
R&M Requests: ${rmOpened} open, ${rmResolved} resolved
Shift Notes: ${shiftNotePresent ? '✅ Present' : '⏳ None'}

End of day report generated at ${new Date().toLocaleTimeString()}
      `.trim()

      const newSummary: DailySummary = {
        summary_date: dateStr,
        lp_completed: lpCompleted,
        rm_opened: rmOpened,
        rm_resolved: rmResolved,
        shift_note_present: shiftNotePresent,
        summary_text: summaryText,
      }

      setToday(newSummary)
    } catch (err) {
      console.error('Failed to generate summary:', err)
    }
  }

  if (loading) return <div style={{ padding: '24px' }}>Loading...</div>

  return (
    <main style={{ background: '#FAFAF9', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ background: '#1C1917', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '18px', fontWeight: 700, color: '#F5F0E8', margin: 0, cursor: 'pointer' }}>
              ← Back to Dashboard
            </h1>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '48px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '28px', fontWeight: 600, color: '#1C1917', marginBottom: '8px' }}>
          Daily Summary
        </h2>
        <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '14px', color: '#6B5B4E', marginBottom: '32px' }}>
          Operations overview and end-of-day reports
        </p>

        {/* Today's Summary */}
        {today && (
          <div style={{ background: '#FFFFFF', border: '2px solid #D97706', borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
            <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '18px', fontWeight: 600, color: '#1C1917', margin: '0 0 16px 0' }}>
              Today's Summary
            </h3>

            {/* Status Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: today.lp_completed ? '#ECFDF5' : '#FEF3C7', border: `1px solid ${today.lp_completed ? '#D1FAE5' : '#FCD34D'}`, borderRadius: '6px', padding: '12px' }}>
                <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '12px', color: '#6B5B4E', margin: '0 0 4px 0' }}>LP Audit</p>
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '16px', fontWeight: 600, color: today.lp_completed ? '#059669' : '#D97706', margin: 0 }}>
                  {today.lp_completed ? '✅ Done' : '⏳ Pending'}
                </p>
              </div>

              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '12px' }}>
                <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '12px', color: '#6B5B4E', margin: '0 0 4px 0' }}>R&M Requests</p>
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '16px', fontWeight: 600, color: '#1C1917', margin: 0 }}>
                  {today.rm_opened} open
                </p>
              </div>

              <div style={{ background: today.rm_resolved > 0 ? '#ECFDF5' : '#F3F4F6', border: `1px solid ${today.rm_resolved > 0 ? '#D1FAE5' : '#E5E7EB'}`, borderRadius: '6px', padding: '12px' }}>
                <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '12px', color: '#6B5B4E', margin: '0 0 4px 0' }}>Resolved</p>
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '16px', fontWeight: 600, color: '#059669', margin: 0 }}>
                  {today.rm_resolved}
                </p>
              </div>

              <div style={{ background: today.shift_note_present ? '#ECFDF5' : '#FEF3C7', border: `1px solid ${today.shift_note_present ? '#D1FAE5' : '#FCD34D'}`, borderRadius: '6px', padding: '12px' }}>
                <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '12px', color: '#6B5B4E', margin: '0 0 4px 0' }}>Shift Notes</p>
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '16px', fontWeight: 600, color: today.shift_note_present ? '#059669' : '#D97706', margin: 0 }}>
                  {today.shift_note_present ? '✅ Yes' : '⏳ None'}
                </p>
              </div>
            </div>

            {today.summary_text && (
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '12px' }}>
                <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '13px', color: '#1C1917', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {today.summary_text}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Historical Summaries */}
        <h3 style={{ fontFamily: 'var(--font-dmsans)', fontSize: '13px', fontWeight: 600, color: '#6B5B4E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
          Last 30 Days
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {summaries.length === 0 ? (
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E0D8', borderRadius: '8px', padding: '32px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '14px', color: '#6B5B4E', margin: 0 }}>
                No summaries yet. Complete your daily tasks above.
              </p>
            </div>
          ) : (
            summaries.map(summary => (
              <div key={summary.summary_date} style={{ background: '#FFFFFF', border: '1px solid #E5E0D8', borderRadius: '6px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '13px', fontWeight: 500, color: '#1C1917', margin: 0 }}>
                    {new Date(summary.summary_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#6B5B4E' }}>
                    {summary.lp_completed ? '✅' : '⏳'} LP
                  </span>
                  <span style={{ fontSize: '12px', color: '#6B5B4E' }}>
                    {summary.rm_opened > 0 ? `🔧${summary.rm_opened}` : '✅'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6B5B4E' }}>
                    {summary.shift_note_present ? '✅' : '⏳'} Notes
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
