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
    window.location.href = '/'
  }

  if (loading) {
    return (
      <main style={{ background: '#FAFAF9', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <p>Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ background: '#FAFAF9', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ background: '#1C1917', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: 700, color: '#F5F0E8', margin: 0 }}>
              {user?.org_name}
            </h1>
            <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '12px', color: '#F5F0E8', margin: '4px 0 0 0' }}>
              Restaurant Toolkit
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '13px', color: '#F5F0E8', margin: 0 }}>
                {user?.name}
              </p>
              <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '11px', color: '#F5F0E8', margin: '4px 0 0 0' }}>
                {user?.role}
              </p>
            </div>
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
