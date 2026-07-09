import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/profile', '/orders', '/account/', '/api/'],
    },
    sitemap: 'https://www.colinguest.com/sitemap.xml',
  };
}
