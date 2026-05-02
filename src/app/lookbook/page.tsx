import { getCollectionProducts, getAllProducts, getAllCollections } from "@/lib/shopify";
import { Product, Collection } from "@/lib/data";
import { MobileHomeClient } from "@/components/mobile/mobile-home-client";

export default async function LookbookPage() {
  let shopifyProducts = await getCollectionProducts("Landing Page");
  
  if (shopifyProducts.length === 0) {
    shopifyProducts = await getAllProducts();
  }
  
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

  const allCollections = await getAllCollections();
  const filteredCollections = allCollections.filter((c: Collection) => c.title.toLowerCase() !== 'landing page');

  return (
    <div className="block md:hidden">
      <MobileHomeClient 
        products={displayProducts} 
        collections={filteredCollections}
      />
    </div>
  );
}
