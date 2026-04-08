import type { MetadataRoute } from 'next';

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://bpkhub.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/my', '/auth', '/showcase', '/status'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
