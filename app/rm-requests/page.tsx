'use client'

import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type RMRequest = {
  id: string
  title: string
  description: string | null
  location: string | null
  status: 'open' | 'in_progress' | 'resolved'
  created_at: string
  updated_at: string
}

export default function RMRequestsPage() {
  const [requests, setRequests] = useState<RMRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ title: '', description: '', location: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadRequests = async () => {
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

        // Load requests
        const { data: requestsData } = await supabase
          .from('rm_requests')
          .select('*')
          .eq('org_id', userData.org_id)
          .order('created_at', { ascending: false })

        setRequests(requestsData || [])
      } catch (err) {
        console.error('Failed to load requests:', err)
      } finally {
        setLoading(false)
      }
    }

    loadRequests()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgId) return
    setSaving(true)

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('Not authenticated')

      const { data: newRequest, error } = await supabase
        .from('rm_requests')
        .insert([{
          org_id: orgId,
          submitted_by_user_id: authUser.id,
          title: formData.title,
          description: formData.description || null,
          location: formData.location || null,
          status: 'open',
          status_history: [{ status: 'open', changed_at: new Date().toISOString(), changed_by_user_id: authUser.id }],
        }])
        .select()
        .single()

      if (error) throw error
      if (newRequest) {
        setRequests([newRequest, ...requests])
        setFormData({ title: '', description: '', location: '' })
        setShowForm(false)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create request')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: 'open' | 'in_progress' | 'resolved') => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('Not authenticated')

      const request = requests.find(r => r.id === id)
      if (!request) return

      const updatedHistory = [
        ...((request as any).status_history || []),
        { status: newStatus, changed_at: new Date().toISOString(), changed_by_user_id: authUser.id }
      ]

      const { error } = await supabase
        .from('rm_requests')
        .update({ status: newStatus, status_history: updatedHistory })
        .eq('id', id)

      if (error) throw error

      setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  const statusColors = {
    open: '#EF4444',
    in_progress: '#F59E0B',
    resolved: '#10B981',
  }

  const statusLabels = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
  }

  if (loading) return <div style={{ padding: '24px' }}>Loading...</div>

  const openCount = requests.filter(r => r.status === 'open').length
  const inProgressCount = requests.filter(r => r.status === 'in_progress').length
  const resolvedCount = requests.filter(r => r.status === 'resolved').length

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
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '28px', fontWeight: 600, color: '#1C1917', margin: 0, marginBottom: '8px' }}>
              Repair & Maintenance Requests
            </h2>
            <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '14px', color: '#6B5B4E', margin: 0 }}>
              Track and manage maintenance requests
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: '#D97706',
              color: '#1C1917',
              fontFamily: 'var(--font-dmsans)',
              fontSize: '13px',
              fontWeight: 500,
              padding: '10px 20px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            + New Request
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Open', count: openCount, color: '#EF4444' },
            { label: 'In Progress', count: inProgressCount, color: '#F59E0B' },
            { label: 'Resolved', count: resolvedCount, color: '#10B981' },
          ].map((stat, i) => (
            <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E5E0D8', borderRadius: '8px', padding: '20px' }}>
              <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '12px', color: '#6B5B4E', margin: '0 0 8px 0' }}>
                {stat.label}
              </p>
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '28px', fontWeight: 600, color: stat.color, margin: 0 }}>
                {stat.count}
              </p>
            </div>
          ))}
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E0D8', borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
            <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '18px', fontWeight: 600, color: '#1C1917', margin: '0 0 20px 0' }}>
              New Request
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontFamily: 'var(--font-dmsans)', fontSize: '13px', fontWeight: 500, color: '#1C1917', display: 'block', marginBottom: '6px' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Fix refrigerator door"
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
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontFamily: 'var(--font-dmsans)', fontSize: '13px', fontWeight: 500, color: '#1C1917', display: 'block', marginBottom: '6px' }}>
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details about the issue..."
                  style={{
                    width: '100%',
                    fontFamily: 'var(--font-dmsans)',
                    fontSize: '14px',
                    padding: '10px 12px',
                    border: '1px solid #E5E0D8',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                    minHeight: '80px',
                    color: '#1C1917',
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontFamily: 'var(--font-dmsans)', fontSize: '13px', fontWeight: 500, color: '#1C1917', display: 'block', marginBottom: '6px' }}>
                  Location (optional)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Kitchen"
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
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    background: '#D97706',
                    color: '#1C1917',
                    fontFamily: 'var(--font-dmsans)',
                    fontSize: '13px',
                    fontWeight: 500,
                    padding: '10px 16px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? 'Creating...' : 'Create Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1,
                    background: '#FFFFFF',
                    color: '#6B5B4E',
                    fontFamily: 'var(--font-dmsans)',
                    fontSize: '13px',
                    fontWeight: 500,
                    padding: '10px 16px',
                    borderRadius: '4px',
                    border: '1px solid #E5E0D8',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Requests List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {requests.length === 0 ? (
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E0D8', borderRadius: '8px', padding: '32px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '14px', color: '#6B5B4E', margin: 0 }}>
                No requests yet. Create one to get started.
              </p>
            </div>
          ) : (
            requests.map(request => (
              <div key={request.id} style={{ background: '#FFFFFF', border: '1px solid #E5E0D8', borderRadius: '8px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontFamily: 'var(--font-dmsans)', fontSize: '14px', fontWeight: 600, color: '#1C1917', margin: '0 0 4px 0' }}>
                      {request.title}
                    </h4>
                    {request.description && (
                      <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '13px', color: '#6B5B4E', margin: '0 0 8px 0' }}>
                        {request.description}
                      </p>
                    )}
                    {request.location && (
                      <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '12px', color: '#A89880', margin: '0' }}>
                        📍 {request.location}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <select
                      value={request.status}
                      onChange={(e) => handleStatusChange(request.id, e.target.value as any)}
                      style={{
                        fontFamily: 'var(--font-dmsans)',
                        fontSize: '12px',
                        fontWeight: 500,
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: '1px solid #E5E0D8',
                        background: '#FFFFFF',
                        color: statusColors[request.status],
                        cursor: 'pointer',
                      }}
                    >
                      {(['open', 'in_progress', 'resolved'] as const).map(status => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                    <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '11px', color: '#A89880', margin: 0 }}>
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
