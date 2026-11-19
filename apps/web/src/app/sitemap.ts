import { MetadataRoute } from 'next';
import { db } from '@/server/db';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const properties = db.getPublishedProperties();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mandya-realestate.pages.dev';

  const propertyUrls: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${baseUrl}/property/${p.id}`,
    lastModified: new Date(p.updatedAt || p.createdAt),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    ...propertyUrls,
  ];
}
