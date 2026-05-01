import { getCollectionProducts, getAllProducts, getAllCollections } from "@/lib/shopify";
// Force Redeploy: 2026-04-24T00:50:12Z
import { Product, Collection } from "@/lib/data";
import LookbookClient from "@/components/lookbook-client";
import { MobileHomeClient } from "@/components/mobile/mobile-home-client";


export default async function Home() {
  let shopifyProducts = await getCollectionProducts("Landing Page");
  
  // If "Landing Page" collection is empty or missing, fetch all products as fallback
  if (shopifyProducts.length === 0) {
    console.log("No specific 'Landing Page' collection found. Falling back to all products.");
    shopifyProducts = await getAllProducts();
  }
  
  // Map Shopify products to our Product type
  const displayProducts: Product[] = shopifyProducts.map((p: any) => ({
    id: p.id,
    src: p.images[0]?.url || "/placeholder.jpg",
    secondarySrc: p.images[1]?.url,
    srcs: p.images.map((img: any) => img.url),
    title: p.title,
    price: `${p.priceRange.minVariantPrice.currencyCode === 'INR' ? 'RS. ' : '$'}${parseFloat(p.priceRange.minVariantPrice.amount).toLocaleString()}`,
    amount: parseFloat(p.priceRange.minVariantPrice.amount),
    desc: p.teaser?.value || p.description,
    category: p.productType || "Collection",
    type: p.productType || "General"
  }));

  // Fetch collections for mobile integration
  const allCollections = await getAllCollections();
  const filteredCollections = allCollections.filter((c: Collection) => c.title.toLowerCase() !== 'landing page');

  return (
    <>
      {/* Desktop View - Strict Isolation */}
      <div className="hidden md:block">
        <LookbookClient products={displayProducts} />
      </div>

      {/* Mobile View - Strict Isolation */}
      <div className="block md:hidden">
        <MobileHomeClient 
          products={displayProducts} 
          collections={filteredCollections}
        />
      </div>
    </>
  );
}


