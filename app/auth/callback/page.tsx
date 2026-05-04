'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // The singleton supabase client was instantiated at app boot, so its
    // detectSessionInUrl pass already ran on a page without a fragment.
    // By the time we mount here, INITIAL_SESSION has fired and won't re-trigger.
    // Parse the fragment ourselves and hand tokens directly to setSession.
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')

    if (!access_token || !refresh_token) {
      router.replace('/login?error=callback_failed')
      return
    }

    supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
      if (error) {
        console.error('Callback setSession error:', error)
        router.replace('/login?error=callback_failed')
      } else {
        router.replace('/dashboard')
      }
    })
  }, [router])

  return (
    <main style={{
      background: '#1C1917',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <p style={{
        fontFamily: 'var(--font-dmsans)',
        fontSize: '16px',
        color: '#F5F0E8',
      }}>
        Signing you in...
      </p>
    </main>
  )
}
