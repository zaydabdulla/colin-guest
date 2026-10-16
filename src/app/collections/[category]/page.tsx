import { getCollectionProducts, getAllProducts, getAllCollections, getCollection } from "@/lib/shopify";
import { ProductCard } from "@/components/product-card";
import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { Product, Collection, extractProductMedia } from "@/lib/data";
import CategoryClient from "@/components/category-client";
import { MobileCollectionClient } from "@/components/mobile/mobile-collection-client";
import { notFound } from "next/navigation";

const INTERNAL_COLLECTIONS = [
  '18-gst-products',
  '5-gst-products',
  'frontpage',
  'landing-page',
];

export default async function CategoryGrid({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const catLower = category.toLowerCase().trim();

  // Block internal utility collections from public rendering
  if (INTERNAL_COLLECTIONS.includes(catLower)) {
    notFound();
  }
  
  // Map display category to Shopify handle
  let shopifyProducts = [];
  let currentCollection = null;
  const isAll = catLower === 'all';
  
  if (isAll) {
    shopifyProducts = await getAllProducts();
  } else {
    let shopifyHandle = category;
    if (catLower === 'hoodies') shopifyHandle = 'hoodie';
    if (catLower === 'jeans') shopifyHandle = 'jeans';
    if (catLower === 'jackets') shopifyHandle = 'jackets';
    
    currentCollection = await getCollection(shopifyHandle);
    if (!currentCollection) {
      // Real 404 for invalid/missing collection handles (resolves soft-404 audit blocker)
      notFound();
    }

    shopifyProducts = await getCollectionProducts(shopifyHandle);

    // Fallback: If collection products query returns empty, filter all products by productType or category
    if (!shopifyProducts || shopifyProducts.length === 0) {
      const allProds = await getAllProducts();
      shopifyProducts = allProds.filter((p: any) => {
        const pType = (p.productType || "").toLowerCase();
        const pCat = (p.category?.name || "").toLowerCase();
        const pTitle = (p.title || "").toLowerCase();
        return pType.includes(catLower) || pCat.includes(catLower) || pTitle.includes(catLower);
      });
    }
  }

  // Fetch all collections for the "Browse Categories" section
  const allCollections = await getAllCollections();
  const collections = allCollections.filter((c: Collection) => c.title.toLowerCase() !== 'landing page');
  
  // Map Shopify products to our Product type
  const displayProducts: Product[] = shopifyProducts.map((p: any, index: number) => {
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
      desc: p.description,
      category: p.category?.name || p.productType || category.charAt(0).toUpperCase() + category.slice(1),
      type: p.productType || "General",
      variants: p.variants?.edges?.map((e: any) => e.node) || [],
      options: p.options || [],
      createdAt: p.createdAt,
      salesCount: p.salesCount || 0,
      metafieldKeys: [
        p.color1 && 'custom.color',
        p.color2 && 'custom.Color',
        p.color3 && 'shopify.color',
        p.color4 && 'shopify.Color',
        p.color5 && 'shopify.color-label',
        p.color6 && 'shopify.base-color',
        p.color7 && 'shopify.label',
        p.color8 && 'shopify.name'
      ].filter(Boolean).join(', '),
      shopifyCategory: p.category?.name,
      colorMetafield: [p.color1, p.color2, p.color3, p.color4, p.color5, p.color6, p.color7, p.color8]
        .filter((m: any) => m && m.value)
        .map((m: any) => m.value)
        .join(','),
      tags: p.tags || []
    };
  });

  const formattedCategory = isAll ? 'ALL PRODUCTS' : category.split('-').join(' ');

  return (
    <>
      {/* Desktop View - Strict Isolation */}
      <div className="hidden md:block min-h-screen bg-white text-black font-sans relative">
        <CategoryClient 
          category={category}
          formattedCategory={formattedCategory}
          displayProducts={displayProducts}
          collections={collections}
          descriptionHtml={currentCollection?.descriptionHtml}
        />
      </div>

      {/* Mobile View - Strict Isolation */}
      <div className="block md:hidden min-h-screen bg-[#f4f4f4]">
        <MobileCollectionClient
          category={category}
          formattedCategory={formattedCategory}
          displayProducts={displayProducts}
          collections={collections}
          descriptionHtml={currentCollection?.descriptionHtml}
        />
      </div>
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const catLower = category.toLowerCase().trim();

  if (INTERNAL_COLLECTIONS.includes(catLower)) {
    return {
      robots: { index: false, follow: false },
    };
  }

  const isAll = catLower === 'all';
  let shopifyHandle = category;
  if (catLower === 'hoodies') shopifyHandle = 'hoodie';
  if (catLower === 'jeans') shopifyHandle = 'jeans';
  if (catLower === 'jackets') shopifyHandle = 'jackets';

  const collection = !isAll ? await getCollection(shopifyHandle) : null;

  const formattedCategory = isAll
    ? 'All Products'
    : category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const title = collection?.seo?.title || `${formattedCategory} | COLIN GUEST`;
  const description = collection?.seo?.description || `Explore our curated selection of ${formattedCategory} at COLIN GUEST. Timeless luxury designer silhouettes.`;
  const canonicalUrl = `https://www.colinguest.com/collections/${category}`;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

