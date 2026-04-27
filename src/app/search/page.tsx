import { searchProducts, getAllCollections } from "@/lib/shopify";
import CategoryClient from "@/components/category-client";
import { Product, Collection } from "@/lib/data";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const { q: searchQuery } = await searchParams;

  if (!searchQuery) {
    return (
      <main className="min-h-screen bg-white text-black font-sans pt-32 px-8">
        <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Search Results</h1>
        <div className="w-full py-32 flex flex-col items-center justify-center border border-dashed border-black/10 rounded-lg mt-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Please enter a search query</p>
        </div>
      </main>
    );
  }

  const [shopifyProducts, allCollections] = await Promise.all([
    searchProducts(searchQuery),
    getAllCollections()
  ]);

  const collections = allCollections.filter((c: Collection) => c.title.toLowerCase() !== 'landing page');

  const displayProducts: Product[] = shopifyProducts.map((p: any, index: number) => ({
    id: p.id,
    src: p.images[0]?.url || "/placeholder.jpg",
    secondarySrc: p.images[1]?.url,
    srcs: p.images.map((img: any) => img.url),
    title: p.title,
    price: `${p.priceRange.minVariantPrice.currencyCode === 'INR' ? 'RS. ' : '$'}${parseFloat(p.priceRange.minVariantPrice.amount).toLocaleString()}`,
    amount: parseFloat(p.priceRange.minVariantPrice.amount),
    desc: p.description,
    category: p.category?.name || p.productType || "Result",
    shopifyCategory: p.category?.name,
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
    colorMetafield: [p.color1, p.color2, p.color3, p.color4, p.color5, p.color6, p.color7, p.color8]
      .filter((m: any) => m && m.value)
      .map((m: any) => m.value)
      .join(','),
    tags: p.tags || []
  }));

  const formattedCategory = `SEARCH RESULTS FOR "${searchQuery.toUpperCase()}"`;

  return (
    <main className="min-h-screen bg-white text-black font-sans relative">
      <CategoryClient 
        category="search"
        formattedCategory={formattedCategory}
        displayProducts={displayProducts}
        collections={collections}
      />
    </main>
  );
}
