import Link from 'next/link'

export default function LandingPage() {
  return (
    <main style={{ background: '#1C1917', minHeight: '100vh', color: '#F5F0E8' }}>
      {/* Nav */}
      <nav style={{ background: '#1C1917', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 24px' }}>
        <div style={{ maxWidth: '768px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                background: 'rgba(217,119,6,0.15)',
                border: '1px solid rgba(217,119,6,0.3)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D97706',
                fontSize: '16px',
                fontWeight: 700,
              }}
            >
              ✓
            </div>
            <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '18px', fontWeight: 600 }}>
              Restaurant Toolkit
            </span>
          </div>
          <Link
            href="/login"
            style={{
              fontFamily: 'var(--font-dmsans)',
              fontSize: '13px',
              fontWeight: 500,
              color: '#F5F0E8',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '4px',
              padding: '8px 20px',
              textDecoration: 'none',
            }}
          >
            Log In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '768px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'var(--font-dmsans)',
            fontSize: '13px',
            fontWeight: 500,
            color: '#D97706',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}
        >
          For restaurant managers
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: '24px',
          }}
        >
          Every shift. Every repair.
          <br />
          Every handoff. All in one place.
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-dmsans)',
            fontSize: '16px',
            fontWeight: 300,
            lineHeight: 1.7,
            color: '#A89880',
            maxWidth: '520px',
            margin: '0 auto 40px',
          }}
        >
          Loss prevention audits, repair request tracking, shift handoffs, and daily operational summaries. Simplify your restaurant operations with one unified dashboard.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/login"
            style={{
              fontFamily: 'var(--font-dmsans)',
              background: '#D97706',
              color: '#1C1917',
              fontSize: '15px',
              fontWeight: 500,
              padding: '14px 32px',
              borderRadius: '4px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Start 14-Day Free Trial
          </Link>
          <a
            href="#features"
            style={{
              fontFamily: 'var(--font-dmsans)',
              fontSize: '15px',
              fontWeight: 500,
              color: '#F5F0E8',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '14px 32px',
              borderRadius: '4px',
              display: 'inline-block',
            }}
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
      </div>

      {/* Features */}
      <section id="features" style={{ maxWidth: '768px', margin: '0 auto', padding: '48px 24px' }}>
        <h2
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '24px',
            fontWeight: 600,
            marginBottom: '48px',
            textAlign: 'center',
          }}
        >
          Built for Restaurant Managers
        </h2>

        <div style={{ display: 'grid', gap: '32px' }}>
          {[
            { icon: '📋', title: 'LP Audits', desc: 'Daily loss prevention checklists with digital sign-off and 30-day history.' },
            { icon: '🔧', title: 'R&M Tracking', desc: 'Staff submit repairs, managers track status. Photos, timestamps, accountability.' },
            { icon: '📝', title: 'Shift Handoffs', desc: 'Outgoing managers write notes. Incoming managers see priorities before service starts.' },
            { icon: '📊', title: 'Daily Summary', desc: 'Auto-generated end-of-day summary. Emailed to owner every night.' },
          ].map((feature, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '24px',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{feature.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                {feature.title}
              </h3>
              <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '14px', fontWeight: 300, color: '#A89880', lineHeight: 1.6 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
      </div>

      {/* Pricing */}
      <section style={{ maxWidth: '768px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '24px', fontWeight: 600, marginBottom: '12px' }}>
          $49/month
        </h2>
        <p style={{ fontFamily: 'var(--font-dmsans)', fontSize: '14px', fontWeight: 300, color: '#A89880', marginBottom: '32px' }}>
          14-day free trial. No credit card required.
        </p>
        <Link
          href="/login"
          style={{
            fontFamily: 'var(--font-dmsans)',
            background: '#D97706',
            color: '#1C1917',
            fontSize: '15px',
            fontWeight: 500,
            padding: '14px 32px',
            borderRadius: '4px',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Start Free Trial
        </Link>
      </section>
    </main>
  )
}
