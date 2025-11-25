/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            // Report-only CSP: logs violations but does not block resources
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.gstatic.com;",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
              "img-src 'self' data: https://res.cloudinary.com;",
              "font-src 'self' https://fonts.gstatic.com;",
              "connect-src 'self' https://res.cloudinary.com https://api.openai.com https://*.upstash.io https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com;",
              "frame-src 'self';",
              "object-src 'none';",
              "base-uri 'self';",
              "form-action 'self';"
            ].join(' '),
          },
        ],
      },
    ];
  },
  // ...other config
};

export default nextConfig;
