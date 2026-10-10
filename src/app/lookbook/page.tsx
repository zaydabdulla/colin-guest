import { getCollectionProducts, getAllProducts, getAllCollections } from "@/lib/shopify";
import { Product, Collection, extractProductMedia } from "@/lib/data";
import { MobileHomeClient } from "@/components/mobile/mobile-home-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lookbook | COLIN GUEST",
  description: "Browse the COLIN GUEST editorial visual lookbook. Haute couture streetwear archives, premium garments, and contemporary styling.",
  alternates: {
    canonical: "https://www.colinguest.com/lookbook",
  },
  openGraph: {
    title: "Lookbook | COLIN GUEST",
    description: "Browse the COLIN GUEST editorial visual lookbook.",
    url: "https://www.colinguest.com/lookbook",
    images: [
      {
        url: "/collections_hero.jpg",
        width: 1200,
        height: 630,
        alt: "COLIN GUEST Lookbook",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lookbook | COLIN GUEST",
    description: "Browse the COLIN GUEST editorial visual lookbook.",
    images: ["/collections_hero.jpg"],
  },
};

export default async function LookbookPage() {
  let shopifyProducts = await getCollectionProducts("Landing Page");
  
  if (shopifyProducts.length === 0) {
    shopifyProducts = await getAllProducts();
  }
  
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
