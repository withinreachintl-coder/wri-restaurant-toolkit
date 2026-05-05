'use client'

import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })

    if (authError) {
      setError(authError.message)
    } else {
      setMessage('Check your email for the magic link!')
      setEmail('')
    }
    setLoading(false)
  }

  return (
    <main style={{ background: '#1C1917', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '420px', width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '28px', fontWeight: 700, color: '#F5F0E8', marginBottom: '8px' }}>
          Welcome Back
        </h1>
        <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '14px', color: '#F5F0E8', marginBottom: '32px' }}>
          Sign in to your restaurant toolkit
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontFamily: 'var(--font-dmsans)', fontSize: '13px', fontWeight: 500, color: '#F5F0E8', display: 'block', marginBottom: '8px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="manager@restaurant.com"
              style={{
                width: '100%',
                fontFamily: 'var(--font-dmsans)',
                fontSize: '14px',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '4px',
                boxSizing: 'border-box',
                color: '#F5F0E8',
              }}
            />
          </div>

          {error && (
            <div style={{ color: '#DC2626', fontSize: '13px', marginBottom: '16px', padding: '12px', background: 'rgba(220,38,38,0.1)', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{ color: '#059669', fontSize: '13px', marginBottom: '16px', padding: '12px', background: 'rgba(5,150,105,0.1)', borderRadius: '4px' }}>
              {message}
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
              fontWeight: 600,
              padding: '14px 24px',
              borderRadius: '4px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '13px', color: '#F5F0E8' }}>
            No account yet?{' '}
            <Link href="/" style={{ color: '#D97706', textDecoration: 'underline' }}>
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
