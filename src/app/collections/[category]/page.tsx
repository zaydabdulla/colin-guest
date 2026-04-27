import { getCollectionProducts, getAllProducts, getAllCollections } from "@/lib/shopify";
import { ProductCard } from "@/components/product-card";
import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { Product, Collection } from "@/lib/data";

import CategoryClient from "@/components/category-client";

export default async function CategoryGrid({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  
  // Map display category to Shopify handle
  let shopifyProducts = [];
  
  if (category.toLowerCase() === 'all') {
    shopifyProducts = await getAllProducts();
  } else {
    let shopifyHandle = category;
    if (category.toLowerCase() === 'hoodies') shopifyHandle = 'hoodie';
    if (category.toLowerCase() === 'jeans') shopifyHandle = 'jeans';
    shopifyProducts = await getCollectionProducts(shopifyHandle);
  }

  // Fetch all collections for the "Browse Categories" section
  const allCollections = await getAllCollections();
  const collections = allCollections.filter((c: Collection) => c.title.toLowerCase() !== 'landing page');
  
  // Map Shopify products to our Product type
  const displayProducts: Product[] = shopifyProducts.map((p: any, index: number) => ({
    id: p.id,
    src: p.images[0]?.url || "/placeholder.jpg",
    secondarySrc: p.images[1]?.url,
    srcs: p.images.map((img: any) => img.url),
    title: p.title,
    price: `${p.priceRange.minVariantPrice.currencyCode === 'INR' ? 'RS. ' : '$'}${parseFloat(p.priceRange.minVariantPrice.amount).toLocaleString()}`,
    amount: parseFloat(p.priceRange.minVariantPrice.amount),
    desc: p.description,
    category: p.category?.name || p.productType || category.charAt(0).toUpperCase() + category.slice(1),
    type: p.productType || "General",
    variants: p.variants?.edges.map((e: any) => e.node) || [],
    options: p.options || [],
    createdAt: p.createdAt,
    salesCount: shopifyProducts.length - index,
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
  }));

  const formattedCategory = category.toLowerCase() === 'all' ? 'ALL PRODUCTS' : category.split('-').join(' ');

  return (
    <main className="min-h-screen bg-white text-black font-sans relative">
      <CategoryClient 
        category={category}
        formattedCategory={formattedCategory}
        displayProducts={displayProducts}
        collections={collections}
      />
    </main>
  );
}
