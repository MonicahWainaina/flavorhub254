/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://flavorhub254.com',
  generateRobotsTxt: true,
  // Exclude private or login-only routes so Google only sees public URLs
  exclude: [
    '/admin*',
    '/verify-email*',
    '/favourites*',
    '/login*',
    '/checkout*',
    '/api/*',
    '/_next/*',
  ],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      // Disallow private areas
      { userAgent: '*', disallow: ['/admin', '/verify-email', '/favourites', '/login', '/checkout', '/api'] },
    ],
  },
};