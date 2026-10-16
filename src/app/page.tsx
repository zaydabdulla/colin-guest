import type { Metadata } from "next";
import { getCollectionProducts, getAllProducts, getAllCollections } from "@/lib/shopify";
// Force Redeploy: 2026-04-24T00:50:12Z
import { Product, Collection, extractProductMedia } from "@/lib/data";
import LookbookClient from "@/components/lookbook-client";
import { MobileCollectionsHub } from "@/components/mobile/mobile-collections-hub";

export const metadata: Metadata = {
  title: { absolute: "Colin Guest | Premium Men's Streetwear Online India" },
  description: "Oversized hoodies, graphic shirts, co-ord sets and baggy jeans. Premium men's streetwear from Colin Guest, delivered across India.",
  alternates: {
    canonical: "https://www.colinguest.com",
  },
  openGraph: {
    title: "Colin Guest | Premium Men's Streetwear Online India",
    description: "Oversized hoodies, graphic shirts, co-ord sets and baggy jeans. Premium men's streetwear from Colin Guest, delivered across India.",
    url: "https://www.colinguest.com",
    siteName: "COLIN GUEST",
    images: [{ url: "/collections_hero.jpg", width: 1200, height: 630, alt: "Colin Guest" }],
  },
};

export default async function Home() {
  let shopifyProducts = await getCollectionProducts("Landing Page");

  // If "Landing Page" collection is empty or missing, fetch all products as fallback
  if (shopifyProducts.length === 0) {
    console.log("No specific 'Landing Page' collection found. Falling back to all products.");
    shopifyProducts = await getAllProducts();
  }

  // Map Shopify products to our Product type
  const displayProducts: Product[] = shopifyProducts.map((p: any) => {
    const rawUrls = p.images?.map((img: any) => img.url) || [];
    const media = extractProductMedia(rawUrls);
    return {
      id: p.id,
      handle: p.handle,
      src: media.primarySrc,
      secondarySrc: media.secondarySrc,
      srcs: media.showcaseImages,
      sizeChartSrc: media.sizeChartImage || undefined,
      title: p.title,
      price: `${p.priceRange.minVariantPrice.currencyCode === 'INR' ? 'RS. ' : '$'}${parseFloat(p.priceRange.minVariantPrice.amount).toLocaleString()}`,
      amount: parseFloat(p.priceRange.minVariantPrice.amount),
      desc: p.teaser?.value || p.description,
      category: p.productType || "Collection",
      type: p.productType || "General"
    };
  });

  // Fetch collections for mobile integration
  const allCollections = await getAllCollections();
  const filteredCollections = allCollections.filter((c: Collection) => c.title.toLowerCase() !== 'landing page');

  // For Collections Hub
  const landingPageCollection = allCollections.find(c => c.title.toLowerCase() === 'landing page');
  const allProductsImage = landingPageCollection?.image?.url || "/collections_hero.jpg";

  return (
    <>
      <h1 className="sr-only">Premium Men&apos;s Streetwear Online India | Colin Guest</h1>

      {/* Desktop View - Strict Isolation */}
      <div className="hidden md:block">
        <LookbookClient products={displayProducts} />
      </div>

      {/* Mobile View - Strict Isolation */}
      <div className="block md:hidden">
        <MobileCollectionsHub
          collections={filteredCollections}
          allProductsImage={allProductsImage}
        />
      </div>
    </>
  );
}


