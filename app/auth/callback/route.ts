import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (!code) {
    console.error('[auth/callback] No code provided')
    return NextResponse.redirect(new URL('/login?error=no_code', request.url))
  }

  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { error: exchangeError, data } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError || !data?.user) {
      console.error('[auth/callback] Code exchange failed:', exchangeError?.message)
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
    }

    const user = data.user
    console.log('[auth/callback] Auth successful for:', user.email)

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .single()

    const safeNext = next.startsWith('/') ? next : '/dashboard'

    if (existingUser?.org_id) {
      console.log('[auth/callback] Returning user, redirecting to', safeNext)
      return NextResponse.redirect(new URL(safeNext, request.url))
    }

    const emailPrefix = user.email?.split('@')[0] || 'My Restaurant'

    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .upsert(
        {
          name: emailPrefix,
          owner_email: user.email,
          plan: 'pro',
          subscription_status: 'trial',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        { onConflict: 'owner_email', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    if (orgError || !org?.id) {
      console.error('[auth/callback] Org upsert failed:', orgError?.message, orgError?.details)
      return NextResponse.redirect(new URL('/login?error=org_create_failed', request.url))
    }

    console.log('[auth/callback] Org created:', org.id)

    const { error: userError } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          id: user.id,
          org_id: org.id,
          email: user.email,
          name: emailPrefix,
          role: 'owner',
        },
        { onConflict: 'id', ignoreDuplicates: false }
      )

    if (userError) {
      console.error('[auth/callback] User upsert failed:', userError.message, userError.details)
      return NextResponse.redirect(new URL('/login?error=user_create_failed', request.url))
    }

    console.log('[auth/callback] User created for:', user.email)
    return NextResponse.redirect(new URL(safeNext, request.url))
  } catch (err) {
    console.error('[auth/callback] Unexpected error:', err instanceof Error ? err.message : String(err))
    return NextResponse.redirect(new URL('/login?error=unexpected', request.url))
  }
}
