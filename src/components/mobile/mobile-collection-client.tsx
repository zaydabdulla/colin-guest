"use client";

import { useState, useMemo } from "react";

import Image from "next/image";
import Link from "next/link";
import { Product, Collection } from "@/lib/data";
import { Plus, Bookmark, ShoppingBag } from "lucide-react";
import { FilterDrawer } from "../filter-drawer";
import { useCartStore } from "@/lib/store";

// Helper function to extract colors (copied from desktop client)
function parseColors(colorData: string | undefined, options: any[], tags: string[] = []): string[] {
  let colors: string[] = [];
  if (colorData) {
    try {
      if (colorData.startsWith('[') || colorData.startsWith('{')) {
        const parsed = JSON.parse(colorData);
        if (Array.isArray(parsed)) {
          colors = parsed.map(p => typeof p === 'object' ? (p.label || p.name || p.value) : String(p));
        } else if (typeof parsed === 'object') {
          colors = [parsed.label || parsed.name || parsed.value];
        } else {
          colors = [String(parsed)];
        }
      } else if (colorData.includes(',')) {
        colors = colorData.split(',').map(c => c.trim());
      } else {
        colors = [colorData.trim()];
      }
    } catch (e) {
      if (colorData.includes(',')) {
        colors = colorData.split(',').map(c => c.trim());
      } else {
        colors = [colorData.trim()];
      }
    }
  }
  if (colors.length === 0 && options) {
    const colorOption = options.find(o => o.name.toLowerCase() === 'color' || o.name.toLowerCase() === 'colour');
    if (colorOption) colors = colorOption.values;
  }
  return Array.from(new Set(colors.map(c => c.toLowerCase().trim()))).filter(Boolean);
}

interface MobileCollectionClientProps {

  category: string;
  formattedCategory: string;
  displayProducts: Product[];
  collections: Collection[];
}

export function MobileCollectionClient({
  category,
  formattedCategory,
  displayProducts,
  collections
}: MobileCollectionClientProps) {
  const { openWishlist, openCart } = useCartStore();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDense, setIsDense] = useState(false);
  const [sortOption, setSortOption] = useState("featured");
  const [selectedFilters, setSelectedFilters] = useState({
    sizes: [] as string[],
    colors: [] as string[],
    types: [] as string[],
    availability: null as string | null,
  });

  const categories = [
    { name: "View all", handle: "all" },
    ...collections.map(c => ({ name: c.title, handle: c.handle }))
  ];

  // Dynamic filter options
  const filterOptions = useMemo(() => {
    const sizeCounts: Record<string, number> = {};
    const colorCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};

    displayProducts.forEach(product => {
      const sizeOption = product.options?.find(o => o.name.toLowerCase() === 'size');
      if (sizeOption) sizeOption.values.forEach(v => sizeCounts[v] = (sizeCounts[v] || 0) + 1);
      
      const colors = parseColors(product.colorMetafield, product.options || [], product.tags || []);
      colors.forEach(color => colorCounts[color] = (colorCounts[color] || 0) + 1);

      const typeValue = product.shopifyCategory || product.type;
      if (typeValue) typeCounts[typeValue] = (typeCounts[typeValue] || 0) + 1;
    });

    return {
      sizes: Object.entries(sizeCounts).sort(([a], [b]) => a.localeCompare(b)).map(([value, count]) => ({ value, count })),
      colors: Object.entries(colorCounts).sort(([a], [b]) => a.localeCompare(b)).map(([value, count]) => ({ value, count })),
      types: Object.entries(typeCounts).sort(([a], [b]) => a.localeCompare(b)).map(([value, count]) => ({ value, count })),
    };
  }, [displayProducts]);

  const handleFilterChange = (type: string, value: string) => {
    setSelectedFilters(prev => {
      if (type === 'availability') return { ...prev, availability: prev.availability === value ? null : value };
      const key = type as keyof typeof prev;
      const current = prev[key] as string[];
      return { ...prev, [key]: current.includes(value) ? current.filter(v => v !== value) : [...current, value] };
    });
  };

  const clearAllFilters = () => setSelectedFilters({ sizes: [], colors: [], types: [], availability: null });

  // Filter and Sort
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...displayProducts];
    result = result.filter(product => {
      if (selectedFilters.sizes.length > 0) {
        const productSizes = product.options?.find(o => o.name.toLowerCase() === 'size')?.values || [];
        if (!selectedFilters.sizes.some(size => productSizes.includes(size))) return false;
      }
      if (selectedFilters.colors.length > 0) {
        const productColors = parseColors(product.colorMetafield, product.options || [], product.tags || []);
        if (!selectedFilters.colors.some(color => productColors.includes(color))) return false;
      }
      if (selectedFilters.types.length > 0) {
        const productType = product.shopifyCategory || product.type;
        if (!selectedFilters.types.includes(productType)) return false;
      }
      if (selectedFilters.availability) {
        const inStock = product.variants?.some(v => v.availableForSale);
        if (selectedFilters.availability === "In stock" && !inStock) return false;
        if (selectedFilters.availability === "Out of stock" && inStock) return false;
      }
      return true;
    });

    switch (sortOption) {
      case "price-ascending": result.sort((a, b) => a.amount - b.amount); break;
      case "price-descending": result.sort((a, b) => b.amount - a.amount); break;
      case "title-ascending": result.sort((a, b) => a.title.localeCompare(b.title)); break;
      case "title-descending": result.sort((a, b) => b.title.localeCompare(a.title)); break;
      case "created-descending": result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()); break;
      case "created-ascending": result.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()); break;
      case "best-selling": result.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)); break;
    }
    return result;
  }, [displayProducts, selectedFilters, sortOption]);

  return (
    <div className="min-h-screen bg-[#f4f4f4] pt-20 pb-32 w-full overflow-x-hidden font-sans">
      
      <FilterDrawer 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        totalProducts={displayProducts.length}
        filteredCount={filteredAndSortedProducts.length}
        filterOptions={filterOptions}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onClearAll={clearAllFilters}
        onApply={() => setIsFilterOpen(false)}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />

      {/* Top Row: Category Title & Controls */}
      <div className="flex items-center justify-between px-4 mb-6">
        {/* Category Title */}
        <h1 className="text-[16px] font-semibold text-black">
          {formattedCategory.charAt(0).toUpperCase() + formattedCategory.slice(1).toLowerCase()}
        </h1>

        {/* Torch & Filters */}
        <div className="flex items-center gap-2 relative z-[110]">
          <button 
            type="button"
            onClick={() => {
              console.log("Torch clicked");
              setIsDense(!isDense);
            }}
            className="flex items-center justify-center p-3 transition-opacity active:opacity-50 pointer-events-auto"
            aria-label="Toggle grid density"
          >
            <div className="relative">
              <svg width="20" height="10" viewBox="0 0 24 12" fill="none" className="text-black -scale-x-100 relative z-10">
                <rect x="2" y="4" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
                <path d="M14 3.5V8.5L20 10V2L14 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                {isDense && <circle cx="20" cy="6" r="1.5" fill="currentColor" />}
              </svg>
              {isDense && (
                <div className="absolute top-1/2 -left-6 -translate-y-1/2 w-12 h-8 pointer-events-none z-0 overflow-visible">
                  {/* Core white light */}
                  <div className="absolute inset-0 bg-white/40 blur-md rounded-full scale-x-150" />
                  {/* Vibrant color glow (Purple/Blue/Orange) */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-orange-500/40 blur-xl rounded-full scale-x-200 animate-pulse" />
                  {/* Beam effect */}
                  <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-16 h-10 bg-blue-400/20 blur-2xl rounded-full rotate-[-10deg]" />
                </div>
              )}
            </div>
          </button>

          
          <button 
            type="button"
            onClick={() => {
              console.log("Filter clicked");
              setIsFilterOpen(true);
            }}
            className="text-[11px] font-bold text-black px-3 py-2 transition-opacity active:opacity-40 pointer-events-auto bg-black/5 rounded-full"
          >
            Advance Filters
          </button>
        </div>

      </div>


      {/* Category Pills (Horizontal Scroll) */}
      <div className="flex overflow-x-auto hide-scrollbar gap-1.5 px-4 mb-5">
        {categories.map((c) => {
          const isActive = category.toLowerCase() === c.handle.toLowerCase();
          return (
            <Link
              key={c.handle}
              href={`/collections/${c.handle}`}
              className={`flex-none px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                isActive 
                  ? "bg-white text-black shadow-sm" 
                  : "bg-white text-gray-500 shadow-sm opacity-90"
              }`}
            >
              {c.name}
            </Link>
          );
        })}
      </div>


      {/* Dynamic Product Grid */}
      <div className={`grid gap-1.5 px-1.5 w-full transition-all duration-500 ease-in-out ${isDense ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {filteredAndSortedProducts.map((product) => (
          <div key={`mobile-grid-${product.id}`} className="flex flex-col group relative">
            
            {/* Product Image Container */}
            <Link href={`/product/${encodeURIComponent(product.id)}`} className="w-full">
              <div className="relative aspect-[2/3] w-full bg-[#e8e8e8] overflow-hidden rounded-xl mb-1.5">

                <Image
                  src={product.src}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
                
                {/* Bookmark Ribbon Icon */}
                <button className="absolute top-2 right-2 z-10 text-white drop-shadow-sm transition-opacity">
                  <Bookmark className="w-6 h-6 fill-white stroke-none" />
                </button>

                {/* Pagination Dots */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-white opacity-90"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                </div>
              </div>
            </Link>

            {/* Product Details (Title, +, Price) */}
            <div className={`flex flex-col px-1 ${isDense ? 'pb-2' : 'pb-4'}`}>
              <div className="flex justify-between items-start w-full">
                <Link href={`/product/${encodeURIComponent(product.id)}`} className="w-full pr-1">
                  <h3 className={`${isDense ? 'text-[8px]' : 'text-[11px]'} font-bold uppercase tracking-widest text-black/90 leading-tight line-clamp-2`}>
                    {product.title}
                  </h3>
                </Link>
                <button className="text-gray-500 hover:text-black shrink-0 mt-[-2px]">
                  <Plus className={`${isDense ? 'w-3 h-3' : 'w-4 h-4'}`} strokeWidth={1.5} />
                </button>
              </div>
              <p className={`${isDense ? 'text-[7px]' : 'text-[10px]'} font-medium tracking-wider text-gray-500 mt-0.5`}>
                {product.price}
              </p>

            </div>

          </div>
        ))}
      </div>
      
      {filteredAndSortedProducts.length === 0 && (
        <div className="w-full py-20 flex flex-col items-center justify-center text-center px-6">
          <p className="text-[12px] font-medium text-gray-500">No products match your filters.</p>
        </div>
      )}


      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
