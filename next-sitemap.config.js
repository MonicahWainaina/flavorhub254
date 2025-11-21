/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://flavorhub254.vercel.app', // Change to your production URL if different
  generateRobotsTxt: true,
  // Optional: Exclude admin or test routes from sitemap
  exclude: [
    '/admin/*',
    '/test-auth',
    '/login',
    '/checkout',
    '/api/*',
    '/_next/*',
  ],
  // Optional: Add extra robots.txt policies
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/admin', '/api', '/test-auth', '/checkout'] },
    ],
  },
};