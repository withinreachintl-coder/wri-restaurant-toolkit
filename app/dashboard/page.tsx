'use client'

import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import PwaInstallPrompt from '../components/PwaInstallPrompt'

type DashboardUser = {
  name: string
  role: string
  org_name: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          window.location.href = '/login'
          return
        }

        const { data: userData } = await supabase
          .from('users')
          .select('name, role, organizations(name)')
          .eq('auth_id', authUser.id)
          .single()

        if (userData) {
          setUser({
            name: userData.name,
            role: userData.role,
            org_name: (userData.organizations as any)?.name || 'Restaurant',
          })
        }
      } catch (err) {
        console.error('Failed to load user:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-dmsans)', fontSize: '16px', color: '#6B5B4E' }}>Loading...</div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F5F0E8' }}>
      {/* Header */}
      <header style={{
        background: '#1C1917',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: 600, color: '#F5F0E8' }}>
          WRI Toolkit
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user && (
            <span style={{ fontFamily: 'var(--font-dmsans)', fontSize: '14px', color: '#A89880' }}>
              {user.name} · {user.org_name}
            </span>
          )}
          <button
            onClick={handleLogout}
            style={{
              fontFamily: 'var(--font-dmsans)',
              fontSize: '13px',
              fontWeight: 500,
              color: '#F5F0E8',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '24px', fontWeight: 600, color: '#1C1917', marginBottom: '32px' }}>
          Welcome to Restaurant Toolkit
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          {[
            { icon: '📋', title: 'LP Audits', desc: 'Daily loss prevention checklists', href: '/lp-audit' },
            { icon: '🔧', title: 'R&M Requests', desc: 'Track repair & maintenance', href: '/rm-requests' },
            { icon: '📝', title: 'Shift Handoffs', desc: 'Manager-to-manager notes', href: '/shift-handoffs' },
            { icon: '📊', title: 'Daily Summary', desc: 'End-of-day operations summary', href: '/daily-summary' },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E0D8',
                borderRadius: '8px',
                padding: '24px',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#D97706')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E0D8')}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '18px', fontWeight: 600, color: '#1C1917', margin: 0, marginBottom: '8px' }}>
                {item.title}
              </h3>
              <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '14px', color: '#6B5B4E', margin: 0 }}>
                {item.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
      <PwaInstallPrompt />
    </main>
  )
}
