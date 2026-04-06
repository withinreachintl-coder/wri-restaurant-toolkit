'use client'

import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [restaurantName, setRestaurantName] = useState('')
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert([{
          name: restaurantName,
          owner_email: email || user.email,
          plan: 'pro',
          subscription_status: 'trial',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        }])
        .select()
        .single()

      if (orgError) throw orgError
      if (!org) throw new Error('Failed to create organization')

      // Create user record
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          auth_id: user.id,
          email: email || user.email,
          name: userName,
          org_id: org.id,
          role: 'owner',
        }])

      if (userError) throw userError

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ background: '#1C1917', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '400px', width: '100%', background: '#FFFFFF', border: '1px solid #E5E0D8', borderRadius: '8px', padding: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '24px', fontWeight: 600, color: '#1C1917', marginBottom: '8px' }}>
          Create Your Account
        </h1>
        <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '14px', color: '#6B5B4E', marginBottom: '32px' }}>
          Set up your restaurant toolkit
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontFamily: 'var(--font-dmsans)', fontSize: '13px', fontWeight: 500, color: '#1C1917', display: 'block', marginBottom: '8px' }}>
              Restaurant Name
            </label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              required
              placeholder="My Restaurant"
              style={{
                width: '100%',
                fontFamily: 'var(--font-dmsans)',
                fontSize: '14px',
                padding: '12px 16px',
                border: '1px solid #E5E0D8',
                borderRadius: '4px',
                boxSizing: 'border-box',
                color: '#1C1917',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontFamily: 'var(--font-dmsans)', fontSize: '13px', fontWeight: 500, color: '#1C1917', display: 'block', marginBottom: '8px' }}>
              Your Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              placeholder="John Manager"
              style={{
                width: '100%',
                fontFamily: 'var(--font-dmsans)',
                fontSize: '14px',
                padding: '12px 16px',
                border: '1px solid #E5E0D8',
                borderRadius: '4px',
                boxSizing: 'border-box',
                color: '#1C1917',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px', padding: '12px 16px', background: '#F3F4F6', borderRadius: '4px', fontFamily: 'var(--font-dmsans)', fontSize: '13px', color: '#6B5B4E' }}>
            Email: {email}
          </div>

          {error && (
            <div style={{ color: '#DC2626', fontSize: '13px', marginBottom: '16px', padding: '12px', background: '#FEE2E2', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
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
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupForm />
    </Suspense>
  )
}
