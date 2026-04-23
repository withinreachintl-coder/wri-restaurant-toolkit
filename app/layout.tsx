import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WRI Restaurant Toolkit',
  description: 'Loss prevention audits, repair tracking, shift handoffs, and daily summaries for restaurant teams.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Toolkit',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Playfair+Display:wght@500;700&display=swap"
          rel="stylesheet"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Toolkit" />
        <meta name="theme-color" content="#1C1917" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body style={{ '--font-playfair': '"Playfair Display", serif', '--font-dmsans': '"DM Sans", sans-serif' } as React.CSSProperties}>
        {children}
      </body>
    </html>
  )
}
