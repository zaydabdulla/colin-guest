"use client";

import { useState, useMemo } from "react";

import Image from "next/image";
import Link from "next/link";
import { Product, Collection } from "@/lib/data";
import { Plus, Bookmark, ShoppingBag, LayoutGrid, Grid3X3 } from "lucide-react";
import { motion } from "framer-motion";
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
  const { openWishlist, openCart, toggleWishlist, wishlistItems } = useCartStore();
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
    <div className="min-h-screen bg-white font-sans">
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

      <div className="pt-[64px] bg-white">
        <div className="bg-[#f4f4f4] rounded-t-[32px] w-full overflow-x-hidden pb-12 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">

          <div className="pt-3 flex flex-col gap-3">

            {/* Header Section - Maintaining padding for text */}
            <div className="px-6 flex justify-between items-center w-full">
              <h1 className="text-[9px] font-bold uppercase tracking-widest text-black/80">
                {formattedCategory}
              </h1>

              {/* Torch and Filter Buttons */}
              <div className="flex items-center gap-1.5 relative z-[110]">
                <button
                  type="button"
                  onClick={() => setIsDense(!isDense)}
                  className="flex items-center justify-center p-2 transition-all active:scale-90 pointer-events-auto"
                  aria-label="Toggle grid density"
                >
                  <motion.div
                    key={isDense ? "dense" : "standard"}
                    initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="relative flex items-center justify-center text-black"
                  >
                    {isDense ? (
                      <Grid3X3 size={18} strokeWidth={1.5} />
                    ) : (
                      <LayoutGrid size={18} strokeWidth={1.5} />
                    )}
                  </motion.div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFilterOpen(true)}
                  className="text-[9px] font-semibold uppercase tracking-wider text-black px-3 py-1.5 transition-opacity active:opacity-40 pointer-events-auto bg-black/5 rounded-full"
                >
                  Advance Filters
                </button>
              </div>
            </div>


            {/* Category Pills (Horizontal Scroll) - Maintaining padding for alignment */}
            <div className="flex overflow-x-auto hide-scrollbar gap-1.5 px-6 mb-2 py-1">
              {categories.map((c) => {
                const isActive = category.toLowerCase() === c.handle.toLowerCase();
                return (
                  <Link
                    key={c.handle}
                    href={`/collections/${c.handle}`}
                    className={`flex-none px-3 py-1 rounded-full text-[9px] font-medium uppercase tracking-tight transition-all ${isActive
                        ? "bg-white text-black shadow-sm"
                        : "bg-white text-gray-500 shadow-sm opacity-90"
                      }`}
                  >
                    {c.name}
                  </Link>
                );
              })}
            </div>


            {/* Dynamic Product Grid - Edge-to-Edge */}
            <div className={`grid gap-1 px-0 w-full transition-all duration-500 ease-in-out ${isDense ? 'grid-cols-4' : 'grid-cols-2'}`}>
              {filteredAndSortedProducts.map((product) => (
                <div key={`mobile-grid-${product.id}`} className="flex flex-col group relative">

                  {/* Product Image Container */}
                  <div className="w-full">
                    <div className="relative aspect-[2/3] w-full bg-[#e8e8e8] overflow-hidden rounded-xl mb-1.5">

                      {!isDense ? (
                        /* Swipable Carousel for Standard View */
                        <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar relative">
                          {(product.srcs && product.srcs.length > 0 ? product.srcs : [product.src]).map((src, i) => (
                            <div key={i} className="w-full h-full flex-none snap-center relative">
                              <Link href={`/product/${encodeURIComponent(product.id)}`} className="w-full h-full block">
                                <Image
                                  src={src}
                                  alt={`${product.title} - view ${i + 1}`}
                                  fill
                                  className="object-cover"
                                  sizes="50vw"
                                  priority={i === 0}
                                />
                              </Link>
                            </div>
                          ))}

                          {/* Bookmark Ribbon Icon - Only in Standard View */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist(product);
                            }}
                            className="absolute top-1.5 right-1.5 z-20 text-white drop-shadow-sm transition-opacity active:opacity-50"
                          >
                            <Bookmark
                              className={`w-6 h-6 ${wishlistItems.some((item: any) => item.id === product.id) ? 'fill-white' : 'fill-none'} stroke-white`}
                              strokeWidth={1.5}
                            />
                          </button>

                          {/* Pagination Dots Indicator - Only in Standard View */}
                          {(product.srcs && product.srcs.length > 1) && (
                            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10 pointer-events-none">
                              {product.srcs.map((_, i) => (
                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white shadow-sm opacity-60"></div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Clean Static Card for Dense View */
                        <Link href={`/product/${encodeURIComponent(product.id)}`} className="w-full h-full block">
                          <Image
                            src={product.src}
                            alt={product.title}
                            fill
                            className="object-cover"
                            sizes="25vw"
                          />
                        </Link>
                      )}
                    </div>
                  </div>

                  {!isDense && (
                    <div className="flex flex-col px-2 pb-4">
                      <div className="flex justify-between items-start w-full">
                        <Link href={`/product/${encodeURIComponent(product.id)}`} className="w-full pr-1">
                          <h3 className="text-[7px] font-bold uppercase tracking-widest text-black mb-0.5">
                            {product.title}
                          </h3>
                        </Link>
                        <button className="text-black/40 hover:text-black shrink-0 mt-[-4px]">
                          <Plus className="w-3 h-3" strokeWidth={1.5} />
                        </button>
                      </div>
                      <p className="text-[6.5px] font-bold tracking-wider text-black/60">
                        {product.price}
                      </p>
                    </div>
                  )}

                </div>
              ))}
            </div>

            {filteredAndSortedProducts.length === 0 && (
              <div className="w-full py-20 flex flex-col items-center justify-center text-center px-6">
                <p className="text-[12px] font-medium text-gray-500">No products match your filters.</p>
              </div>
            )}


            <style dangerouslySetInnerHTML={{
              __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
          </div>
        </div>
      </div>
    </div>
  );
}
