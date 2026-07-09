import { MetadataRoute } from 'next';
import { getAllProducts, getAllCollections } from '@/lib/shopify';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.colinguest.com';

  // Base routes
  const staticRoutes = [
    '',
    '/about',
    '/lookbook',
    '/collections',
    '/login',
    '/signup',
    '/privacy',
    '/terms',
    '/shipping',
    '/returns',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Fetch collections
  let collectionRoutes: any[] = [];
  try {
    const collections = await getAllCollections();
    collectionRoutes = collections
      .filter((c) => c.handle && c.title.toLowerCase() !== 'landing page')
      .map((c) => ({
        url: `${baseUrl}/collections/${c.handle}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      }));
  } catch (e) {
    console.error('Error loading collections for sitemap:', e);
  }

  // Fetch products
  let productRoutes: any[] = [];
  try {
    const products = await getAllProducts();
    productRoutes = products
      .filter((p) => p.handle)
      .map((p) => ({
        url: `${baseUrl}/product/${p.handle}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.6,
      }));
  } catch (e) {
    console.error('Error loading products for sitemap:', e);
  }

  return [...staticRoutes, ...collectionRoutes, ...productRoutes];
}
