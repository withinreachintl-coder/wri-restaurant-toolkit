"use client";

export default function LandingPage() {
  return (
    <main style={{ background: '#1C1917', color: '#F5F0E8', fontFamily: 'DM Sans, sans-serif' }}>

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(28,25,23,0.95)', backdropFilter: 'blur(10px)',
        height: '64px', display: 'flex', alignItems: 'center',
        padding: '0 24px', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', background: '#D97706',
            borderRadius: '6px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '16px', color: '#fff'
          }}>✓</div>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: 700 }}>Restaurant Toolkit</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="https://ops.wireach.tools" style={{ color: '#F5F0E8', textDecoration: 'none', fontSize: '15px' }}>Daily Ops</a>
          <a href="https://staff.wireach.tools" style={{ color: '#F5F0E8', textDecoration: 'none', fontSize: '15px' }}>Staff Comms</a>
          <span style={{ color: '#A8A29E', fontSize: '15px', fontWeight: 700 }}>Toolkit</span>
          <a href="#pricing" style={{ color: '#F5F0E8', textDecoration: 'none', fontSize: '15px' }}>Pricing</a>
          <a href="/login" style={{ border: '1px solid #F5F0E8', padding: '8px 20px', borderRadius: '6px', color: '#F5F0E8', textDecoration: 'none', fontSize: '15px' }}>Sign In</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: '160px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px', maxWidth: '768px', margin: '0 auto' }}>
        <p style={{ color: '#D97706', fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '24px' }}>
          For Independent Restaurants
        </p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '52px', lineHeight: 1.1, fontWeight: 700, marginBottom: '24px' }}>
          Every shift. Every repair. Every handoff.{' '}
          <span style={{ color: '#D97706' }}>All in one place.</span>
        </h1>
        <p style={{ fontSize: '18px', color: '#A8A29E', lineHeight: 1.6, marginBottom: '40px', maxWidth: '560px' }}>
          Loss prevention audits, repair request tracking, shift handoffs, and daily operational summaries. Simplify your restaurant operations with one unified dashboard.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <a href="https://buy.stripe.com/4gM28q0SZbZr5Er9eN9k40b" target="_blank" rel="noopener noreferrer" style={{
            background: '#D97706', color: '#fff', padding: '14px 28px',
            borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '16px'
          }}>Start 14-Day Free Trial</a>

        </div>
      </section>

      {/* Features — 2x2 grid */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: '768px', margin: '0 auto' }}>
        <p style={{ color: '#D97706', fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px' }}>
          What You Get
        </p>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', fontWeight: 700, marginBottom: '48px' }}>
          Built for restaurant managers.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {[
            { icon: '📋', title: 'LP Audits', desc: 'Daily loss prevention checklists with digital sign-off and 30-day history. Know every gap before the inspector does.' },
            { icon: '🔧', title: 'R&M Tracking', desc: 'Staff submit repairs, managers track status. Photos, timestamps, full accountability from submission to resolution.' },
            { icon: '📝', title: 'Shift Handoffs', desc: 'Outgoing managers write notes. Incoming managers see priorities before service starts. No more verbal hand-waves.' },
            { icon: '📊', title: 'Daily Summary', desc: 'Auto-generated end-of-day summary covering ops, repairs, and staffing. Emailed to the owner every night.' },
          ].map((f) => (
            <div key={f.title} style={{ background: '#292524', borderRadius: '12px', padding: '28px' }}>
              <div style={{
                width: '40px', height: '40px', background: '#1C1917', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', marginBottom: '20px'
              }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>{f.title}</h3>
              <p style={{ color: '#A8A29E', fontSize: '14px', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '80px 24px', maxWidth: '768px', margin: '0 auto' }}>
        <p style={{ color: '#D97706', fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px' }}>
          Pricing
        </p>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', fontWeight: 700, marginBottom: '48px' }}>
          Simple, honest pricing.
        </h2>
        <div style={{ background: '#292524', borderRadius: '12px', padding: '40px', border: '1px solid #D97706', maxWidth: '480px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D97706', marginBottom: '16px' }}>Pro</p>
          <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '56px', fontWeight: 700, marginBottom: '8px' }}>
            $49<span style={{ fontSize: '18px', color: '#A8A29E', fontFamily: 'DM Sans, sans-serif' }}>/month</span>
          </p>
          <p style={{ color: '#78716C', fontSize: '14px', marginBottom: '32px' }}>14-day free trial. No credit card required.</p>
          {[
            'LP audit checklists with 30-day history',
            'R&M repair tracking with photo proof',
            'Shift handoff notes',
            'Auto daily summary emailed to owner',
            'Unlimited team members',
            'Priority support',
          ].map(item => (
            <p key={item} style={{ color: '#A8A29E', fontSize: '14px', marginBottom: '12px' }}>✓ {item}</p>
          ))}
          <a href="https://buy.stripe.com/4gM28q0SZbZr5Er9eN9k40b" target="_blank" rel="noopener noreferrer" style={{
            display: 'block', textAlign: 'center', marginTop: '32px',
            background: '#D97706', padding: '14px', borderRadius: '8px',
            color: '#fff', textDecoration: 'none', fontSize: '16px', fontWeight: 600
          }}>Start 14-Day Free Trial</a>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>
          Ready to run a tighter operation?
        </h2>
        <p style={{ color: '#A8A29E', fontSize: '16px', marginBottom: '32px' }}>
          Start your free trial. No credit card. Cancel anytime.
        </p>
        <a href="https://buy.stripe.com/4gM28q0SZbZr5Er9eN9k40b" target="_blank" rel="noopener noreferrer" style={{
          background: '#D97706', color: '#fff', padding: '16px 36px',
          borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '16px'
        }}>Start 14-Day Free Trial</a>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #292524', padding: '24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        maxWidth: '768px', margin: '0 auto', flexWrap: 'wrap', gap: '12px'
      }}>
        <span style={{ color: '#78716C', fontSize: '13px' }}>Built for independent restaurants, by an independent restaurant owner.</span>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#features" style={{ color: '#78716C', fontSize: '13px', textDecoration: 'none' }}>How It Works</a>
          <a href="mailto:support@wireach.tools" style={{ color: '#78716C', fontSize: '13px', textDecoration: 'none' }}>support@wireach.tools</a>
        </div>
      </footer>

    </main>
  )
}
