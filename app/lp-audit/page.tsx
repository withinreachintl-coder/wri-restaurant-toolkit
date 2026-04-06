'use client'

import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type AuditItem = {
  id: string
  title: string
  status: 'pass' | 'fail' | 'na'
  notes: string
  category: string
}

export default function LPAuditPage() {
  const [user, setUser] = useState<any>(null)
  const [items, setItems] = useState<AuditItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [orgId, setOrgId] = useState<string | null>(null)

  useEffect(() => {
    const loadAudit = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          window.location.href = '/login'
          return
        }

        const { data: userData } = await supabase
          .from('users')
          .select('org_id, name')
          .eq('auth_id', authUser.id)
          .single()

        if (!userData) throw new Error('User not found')

        setUser(userData)
        setOrgId(userData.org_id)

        // Load template
        const { data: templateData } = await supabase
          .from('lp_audit_templates')
          .select('items')
          .eq('name', 'Standard Restaurant LP Audit')
          .single()

        if (templateData?.items) {
          const parsed = JSON.parse(JSON.stringify(templateData.items))
          setItems(
            parsed.map((item: any) => ({
              ...item,
              status: 'na' as const,
              notes: '',
            }))
          )
        }
      } catch (err) {
        console.error('Failed to load audit:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAudit()
  }, [])

  const handleStatusChange = (id: string, status: 'pass' | 'fail' | 'na') => {
    setItems(items.map(item => item.id === id ? { ...item, status } : item))
  }

  const handleNotesChange = (id: string, notes: string) => {
    setItems(items.map(item => item.id === id ? { ...item, notes } : item))
  }

  const handleSubmit = async () => {
    if (!orgId) return
    setSaving(true)

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('lp_audits')
        .insert([{
          org_id: orgId,
          completed_by_user_id: authUser.id,
          audit_date: new Date().toISOString().split('T')[0],
          items: items.map(({ category, ...rest }) => rest),
          completed_at: new Date().toISOString(),
        }])

      if (error) throw error

      // Reset form
      setItems(items.map(item => ({ ...item, status: 'na', notes: '' })))
      alert('LP Audit saved successfully!')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save audit')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ padding: '24px' }}>Loading...</div>

  const categoryGroups = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, AuditItem[]>)

  const passCount = items.filter(i => i.status === 'pass').length
  const failCount = items.filter(i => i.status === 'fail').length

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
          Loss Prevention Audit
        </h2>
        <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '14px', color: '#6B5B4E', marginBottom: '32px' }}>
          Complete today's daily audit checklist
        </p>

        {/* Progress */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E0D8', borderRadius: '8px', padding: '20px', marginBottom: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '12px', color: '#6B5B4E', margin: '0 0 8px 0' }}>Pass</p>
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '24px', fontWeight: 600, color: '#059669', margin: 0 }}>
                {passCount}/{items.length}
              </p>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '12px', color: '#6B5B4E', margin: '0 0 8px 0' }}>Fail</p>
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '24px', fontWeight: 600, color: '#DC2626', margin: 0 }}>
                {failCount}
              </p>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '12px', color: '#6B5B4E', margin: '0 0 8px 0' }}>Progress</p>
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '24px', fontWeight: 600, color: '#D97706', margin: 0 }}>
                {Math.round((passCount + failCount) / items.length * 100)}%
              </p>
            </div>
          </div>
        </div>

        {/* Categories */}
        {Object.entries(categoryGroups).map(([category, categoryItems]) => (
          <div key={category} style={{ marginBottom: '32px' }}>
            <h3 style={{ fontFamily: 'var(--font-dmsans)', fontSize: '13px', fontWeight: 600, color: '#6B5B4E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
              {category}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {categoryItems.map(item => (
                <div
                  key={item.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E0D8',
                    borderRadius: '8px',
                    padding: '16px',
                  }}
                >
                  <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '14px', fontWeight: 500, color: '#1C1917', margin: '0 0 12px 0' }}>
                    {item.title}
                  </p>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    {(['pass', 'fail', 'na'] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(item.id, status)}
                        style={{
                          flex: 1,
                          fontFamily: 'var(--font-dmsans)',
                          fontSize: '13px',
                          fontWeight: 500,
                          padding: '8px 12px',
                          borderRadius: '4px',
                          border: item.status === status ? '2px solid #D97706' : '1px solid #E5E0D8',
                          background: item.status === status ? '#FFFFFF' : '#FFFFFF',
                          color: item.status === status ? '#D97706' : '#6B5B4E',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          transition: 'all 0.2s',
                        }}
                      >
                        {status === 'na' ? 'N/A' : status}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={item.notes}
                    onChange={(e) => handleNotesChange(item.id, e.target.value)}
                    placeholder="Add notes..."
                    style={{
                      width: '100%',
                      fontFamily: 'var(--font-dmsans)',
                      fontSize: '13px',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid #E5E0D8',
                      boxSizing: 'border-box',
                      minHeight: '60px',
                      resize: 'vertical',
                      color: '#1C1917',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
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
          {saving ? 'Saving...' : 'Submit Audit'}
        </button>
      </div>
    </main>
  )
}
