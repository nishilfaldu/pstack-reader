import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { docsUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return source.getPages().map((page) => ({
    url: docsUrl(page.slugs),
    changeFrequency: 'weekly',
    priority: page.slugs.length ? 0.7 : 1,
  }));
}
