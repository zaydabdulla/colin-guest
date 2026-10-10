import { MetadataRoute } from 'next';
import { getAllProducts, getAllCollections } from '@/lib/shopify';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.colinguest.com';

  // Base static public routes (excluding private auth routes like login/signup)
  const staticRoutes = [
    { route: '', priority: 1.0, changeFrequency: 'daily' as const },
    { route: '/collections', priority: 0.9, changeFrequency: 'daily' as const },
    { route: '/lookbook', priority: 0.8, changeFrequency: 'weekly' as const },
    { route: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
    { route: '/shipping', priority: 0.5, changeFrequency: 'monthly' as const },
    { route: '/returns', priority: 0.5, changeFrequency: 'monthly' as const },
    { route: '/privacy', priority: 0.4, changeFrequency: 'monthly' as const },
    { route: '/terms', priority: 0.4, changeFrequency: 'monthly' as const },
  ].map((item) => ({
    url: `${baseUrl}${item.route}`,
    lastModified: new Date('2026-04-01'),
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));

  // Fetch collections with real updatedAt timestamps
  let collectionRoutes: any[] = [];
  try {
    const collections = await getAllCollections();
    collectionRoutes = collections
      .filter((c: any) => c.handle && c.title?.toLowerCase() !== 'landing page')
      .map((c: any) => ({
        url: `${baseUrl}/collections/${c.handle}`,
        lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date('2026-04-01'),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }));
  } catch (e) {
    console.error('Error loading collections for sitemap:', e);
  }

  // Fetch products with real updatedAt timestamps
  let productRoutes: any[] = [];
  try {
    const products = await getAllProducts();
    productRoutes = products
      .filter((p: any) => p.handle)
      .map((p: any) => ({
        url: `${baseUrl}/product/${p.handle}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : (p.createdAt ? new Date(p.createdAt) : new Date('2026-04-01')),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }));
  } catch (e) {
    console.error('Error loading products for sitemap:', e);
  }

  return [...staticRoutes, ...collectionRoutes, ...productRoutes];
}
