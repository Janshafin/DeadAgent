/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Security Headers ──────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
              "connect-src 'self' https://*.firebaseio.com wss://*.firebaseio.com https://*.googleapis.com https://*.walletconnect.com wss://*.walletconnect.com wss://*.walletconnect.org https://rpc.walletconnect.com https://explorer-api.walletconnect.com https://*.infura.io https://*.alchemy.com",
              "img-src 'self' data: blob: https://metadata.ens.domains https://*.walletconnect.com",
              "frame-src 'self' https://*.walletconnect.com https://verify.walletconnect.com",
              "worker-src 'self' blob:",
            ].join('; '),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // HTTPS-only in production: HSTS header
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains; preload',
                },
              ]
            : []),
        ],
      },
    ];
  },

  // ── HTTPS Redirect in Production ──────────────────────────
  async redirects() {
    if (process.env.NODE_ENV !== 'production') return [];
    return [
      {
        source: '/:path*',
        has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
        destination: 'https://:host/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
