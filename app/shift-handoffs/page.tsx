'use client'

import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type ShiftHandoff = {
  id: string
  note: string
  shift_type: 'morning' | 'evening' | 'close'
  shift_date: string
  created_at: string
}

type UserInfo = {
  name: string
  role: string
}

export default function ShiftHandoffsPage() {
  const [handoffs, setHandoffs] = useState<ShiftHandoff[]>([])
  const [loading, setLoading] = useState(true)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [newNote, setNewNote] = useState('')
  const [shiftType, setShiftType] = useState<'morning' | 'evening' | 'close'>('close')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadHandoffs = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          window.location.href = '/login'
          return
        }

        const { data: userData } = await supabase
          .from('users')
          .select('org_id, name, role')
          .eq('auth_id', authUser.id)
          .single()

        if (!userData) throw new Error('User not found')
        setOrgId(userData.org_id)
        setUserInfo({ name: userData.name, role: userData.role })

        // Load handoffs from last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { data: handoffsData } = await supabase
          .from('shift_handoffs')
          .select('*')
          .eq('org_id', userData.org_id)
          .gte('shift_date', sevenDaysAgo.toISOString().split('T')[0])
          .order('shift_date', { ascending: false })
          .order('shift_type', { ascending: false })

        setHandoffs(handoffsData || [])
      } catch (err) {
        console.error('Failed to load handoffs:', err)
      } finally {
        setLoading(false)
      }
    }

    loadHandoffs()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgId) return
    setSaving(true)

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('Not authenticated')

      const today = new Date().toISOString().split('T')[0]

      const { data: newHandoff, error } = await supabase
        .from('shift_handoffs')
        .insert([{
          org_id: orgId,
          written_by_user_id: authUser.id,
          note: newNote,
          shift_type: shiftType,
          shift_date: today,
        }])
        .select()
        .single()

      if (error) throw error
      if (newHandoff) {
        setHandoffs([newHandoff, ...handoffs])
        setNewNote('')
        alert('Shift note saved!')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save note')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ padding: '24px' }}>Loading...</div>

  const shiftIcons = {
    morning: '🌅',
    evening: '🌆',
    close: '🌙',
  }

  const shiftLabels = {
    morning: 'Morning Shift',
    evening: 'Evening Shift',
    close: 'Close Shift',
  }

  const groupedByDate = handoffs.reduce((acc, handoff) => {
    if (!acc[handoff.shift_date]) acc[handoff.shift_date] = []
    acc[handoff.shift_date].push(handoff)
    return acc
  }, {} as Record<string, ShiftHandoff[]>)

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
          Shift Handoff Notes
        </h2>
        <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '14px', color: '#6B5B4E', marginBottom: '32px' }}>
          Leave notes for the next shift manager
        </p>

        {/* New Note Form */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E0D8', borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
          <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '18px', fontWeight: 600, color: '#1C1917', margin: '0 0 20px 0' }}>
            Write a Note
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontFamily: 'var(--font-dmsans)', fontSize: '13px', fontWeight: 500, color: '#1C1917', display: 'block', marginBottom: '6px' }}>
                Shift Type
              </label>
              <select
                value={shiftType}
                onChange={(e) => setShiftType(e.target.value as any)}
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-dmsans)',
                  fontSize: '14px',
                  padding: '10px 12px',
                  border: '1px solid #E5E0D8',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  color: '#1C1917',
                }}
              >
                <option value="morning">🌅 Morning Shift</option>
                <option value="evening">🌆 Evening Shift</option>
                <option value="close">🌙 Close Shift</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'var(--font-dmsans)', fontSize: '13px', fontWeight: 500, color: '#1C1917', display: 'block', marginBottom: '6px' }}>
                Note
              </label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                required
                placeholder="What should the next shift know? Issues, inventory, staff notes, etc..."
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-dmsans)',
                  fontSize: '14px',
                  padding: '12px',
                  border: '1px solid #E5E0D8',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  minHeight: '100px',
                  color: '#1C1917',
                  resize: 'vertical',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                background: '#D97706',
                color: '#1C1917',
                fontFamily: 'var(--font-dmsans)',
                fontSize: '14px',
                fontWeight: 500,
                padding: '12px 24px',
                borderRadius: '4px',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          </form>
        </div>

        {/* Recent Handoffs */}
        <h3 style={{ fontFamily: 'var(--font-dmsans)', fontSize: '13px', fontWeight: 600, color: '#6B5B4E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
          Recent Notes (Last 7 Days)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Object.entries(groupedByDate).length === 0 ? (
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E0D8', borderRadius: '8px', padding: '32px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '14px', color: '#6B5B4E', margin: 0 }}>
                No notes yet. Start by writing one above.
              </p>
            </div>
          ) : (
            Object.entries(groupedByDate).map(([date, dateHandoffs]) => (
              <div key={date}>
                <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '12px', fontWeight: 600, color: '#6B5B4E', marginBottom: '8px', textTransform: 'uppercase' }}>
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {dateHandoffs.map(handoff => (
                    <div key={handoff.id} style={{ background: '#FFFFFF', border: '1px solid #E5E0D8', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '18px' }}>{shiftIcons[handoff.shift_type]}</span>
                        <span style={{ fontFamily: 'var(--font-dmsans)', fontSize: '13px', fontWeight: 600, color: '#1C1917' }}>
                          {shiftLabels[handoff.shift_type]}
                        </span>
                      </div>
                      <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '13px', color: '#1C1917', margin: 0, lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                        {handoff.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
