'use client'

import Link from 'next/link'
import { useState } from 'react'

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

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to send magic link')
      } else {
        setMessage('Check your email for the magic link!')
        setEmail('')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ background: '#1C1917', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '400px', width: '100%', background: '#FFFFFF', border: '1px solid #E5E0D8', borderRadius: '8px', padding: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '24px', fontWeight: 600, color: '#1C1917', marginBottom: '8px' }}>
          Welcome Back
        </h1>
        <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '14px', color: '#6B5B4E', marginBottom: '32px' }}>
          Sign in to your restaurant toolkit
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontFamily: 'var(--font-dmsans)', fontSize: '13px', fontWeight: 500, color: '#1C1917', display: 'block', marginBottom: '8px' }}>
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
                border: '1px solid #E5E0D8',
                borderRadius: '4px',
                boxSizing: 'border-box',
                color: '#1C1917',
              }}
            />
          </div>

          {error && (
            <div style={{ color: '#DC2626', fontSize: '13px', marginBottom: '16px', padding: '12px', background: '#FEE2E2', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{ color: '#059669', fontSize: '13px', marginBottom: '16px', padding: '12px', background: '#ECFDF5', borderRadius: '4px' }}>
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
              fontWeight: 500,
              padding: '12px 24px',
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
          <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '13px', color: '#6B5B4E' }}>
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
