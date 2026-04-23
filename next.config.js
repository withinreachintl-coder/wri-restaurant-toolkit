const path = require('path')

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-toolkit-cache',
        expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\/_next\/image\?.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^\/dashboard/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'dashboard-page',
        expiration: { maxEntries: 10, maxAgeSeconds: 24 * 60 * 60 },
        networkTimeoutSeconds: 5,
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    }
    return config
  },
  async headers() {
    return [
      {
        source: '/:file(manifest.json|favicon.ico|icon-192.png|icon-512.png|sw.js|workbox-:hash.js)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'X-Robots-Tag', value: 'noindex' },
        ],
      },
    ]
  },
}

module.exports = withPWA(nextConfig)
