"use client";

import { useState, useMemo } from "react";
import { SlidersHorizontal, LayoutGrid, Grid3X3 } from "lucide-react";
import { ProductCard } from "./product-card";
import { Product, Collection } from "@/lib/data";
import Link from "next/link";
import { motion } from "framer-motion";
import { FilterDrawer } from "./filter-drawer";

interface CategoryClientProps {
  category: string;
  formattedCategory: string;
  displayProducts: Product[];
  collections: Collection[];
}

const colorMap: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  black: "#000000",
  white: "#ffffff",
  green: "#22c55e",
  yellow: "#eab308",
  brown: "#92400e",
  purple: "#a855f7",
  grey: "#6b7280"
};

function parseColors(colorData: string | undefined, options: any[], tags: string[] = []): string[] {
  let colors: string[] = [];

  // 1. Try Metafield
  if (colorData) {
    try {
      // Handle potential JSON (arrays or objects)
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
        // Handle comma-separated strings
        colors = colorData.split(',').map(c => c.trim());
      } else {
        // Handle single strings
        colors = [colorData.trim()];
      }
    } catch (e) {
      // Fallback: If JSON parsing fails, treat as raw string
      if (colorData.includes(',')) {
        colors = colorData.split(',').map(c => c.trim());
      } else {
        colors = [colorData.trim()];
      }
    }
  }

  // 2. Fallback to Options
  if (colors.length === 0 && options) {
    const colorOption = options.find(o => {
      const name = o.name.toLowerCase();
      return name === 'color' || name === 'colour';
    });
    if (colorOption) {
      colors = colorOption.values;
    }
  }

  // 3. Fallback to Tags
  if (colors.length === 0 && tags && tags.length > 0) {
    tags.forEach(tag => {
      const lowerTag = tag.toLowerCase();
      if (lowerTag.startsWith('color:')) {
        colors.push(tag.split(':')[1].trim());
      } else if (colorMap[lowerTag]) {
        // If the tag matches one of our known colors exactly
        colors.push(tag);
      }
    });
  }

  return Array.from(new Set(colors.map(c => c.toLowerCase().trim()))).filter(Boolean);
}

export default function CategoryClient({ category, formattedCategory, displayProducts, collections }: CategoryClientProps) {
  const [isDense, setIsDense] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState("featured");
  
  const [selectedFilters, setSelectedFilters] = useState({
    sizes: [] as string[],
    colors: [] as string[],
    types: [] as string[],
    availability: null as string | null,
  });

  const categories = [
    { name: 'View all', id: 'all' },
    ...collections.map(c => ({
      name: c.title,
      id: c.handle
    }))
  ];

  // Dynamically extract filter options from displayProducts with counts
  const filterOptions = useMemo(() => {
    const sizeCounts: Record<string, number> = {};
    const colorCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};

    console.log("DEBUG: Processing products for filters...");

    displayProducts.forEach(product => {
      // Size counts (from Options)
      const sizeOption = product.options?.find(o => o.name.toLowerCase() === 'size');
      if (sizeOption) {
        sizeOption.values.forEach(v => {
          sizeCounts[v] = (sizeCounts[v] || 0) + 1;
        });
      }

      // Color counts
      const colors = parseColors(product.colorMetafield, product.options || [], product.tags || []);
      console.log(`DEBUG: Product "${product.title}" - Keys: [${product.metafieldKeys}] - Metafield:`, product.colorMetafield, "Extracted Colors:", colors);
      colors.forEach(color => {
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      });

      // Type counts (Priority: shopifyCategory > productType)
      const typeValue = product.shopifyCategory || product.type;
      if (typeValue) {
        typeCounts[typeValue] = (typeCounts[typeValue] || 0) + 1;
      }
    });

    return {
      sizes: Object.entries(sizeCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([value, count]) => ({ value, count })),
      colors: Object.entries(colorCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([value, count]) => ({ value, count })),
      types: Object.entries(typeCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([value, count]) => ({ value, count })),
    };
  }, [displayProducts]);

  const handleFilterChange = (type: string, value: string) => {
    setSelectedFilters(prev => {
      if (type === 'availability') {
        return { ...prev, availability: prev.availability === value ? null : value };
      }
      
      const key = type as keyof typeof prev;
      const current = prev[key] as string[];
      const next = current.includes(value) 
        ? current.filter(v => v !== value) 
        : [...current, value];
      
      return { ...prev, [key]: next };
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      sizes: [],
      colors: [],
      types: [],
      availability: null,
    });
  };

  // Filter and Sort Logic
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...displayProducts];

    // 1. Filtering
    result = result.filter(product => {
      // Size filter
      if (selectedFilters.sizes.length > 0) {
        const productSizes = product.options?.find(o => o.name.toLowerCase() === 'size')?.values || [];
        if (!selectedFilters.sizes.some(size => productSizes.includes(size))) return false;
      }

      // Color filter
      if (selectedFilters.colors.length > 0) {
        const productColors = parseColors(product.colorMetafield, product.options || [], product.tags || []);
        if (!selectedFilters.colors.some(color => productColors.includes(color))) return false;
      }

      // Type filter
      if (selectedFilters.types.length > 0) {
        const productType = product.shopifyCategory || product.type;
        if (!selectedFilters.types.includes(productType)) return false;
      }

      // Availability filter
      if (selectedFilters.availability) {
        const inStock = product.variants?.some(v => v.availableForSale);
        if (selectedFilters.availability === "In stock" && !inStock) return false;
        if (selectedFilters.availability === "Out of stock" && inStock) return false;
      }

      return true;
    });

    // 2. Sorting
    switch (sortOption) {
      case "price-ascending":
        result.sort((a, b) => a.amount - b.amount);
        break;
      case "price-descending":
        result.sort((a, b) => b.amount - a.amount);
        break;
      case "title-ascending":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-descending":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "created-descending":
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case "created-ascending":
        result.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        break;
      case "best-selling":
        result.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        break;
      // Featured and relevance can be default order
    }

    return result;
  }, [displayProducts, selectedFilters, sortOption]);

  return (
    <div className="pt-20 px-8 max-w-[1800px] mx-auto pb-24 transition-all duration-700">
      
      {/* Filter Drawer Component */}
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

      {/* Top Header Row */}
      <div className="flex flex-col gap-6 mb-10">
         <div className="flex justify-between items-center">
            <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">{formattedCategory}</h1>
            
            <div className="flex items-center gap-4">
              {/* Architectural Grid Toggle */}
              <button 
                onClick={() => setIsDense(!isDense)}
                className="p-2 transition-all duration-300 hover:bg-black/5 rounded-full relative group"
                title={isDense ? "Switch to Standard View" : "Switch to Dense View"}
              >
                <motion.div
                  key={isDense ? "dense" : "standard"}
                  initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex items-center justify-center text-black"
                >
                  {isDense ? (
                    <Grid3X3 size={20} strokeWidth={1.5} />
                  ) : (
                    <LayoutGrid size={20} strokeWidth={1.5} />
                  )}
                </motion.div>
                
                {/* Subtle tool-tip style highlight */}
                <div className={`absolute inset-0 rounded-full border border-black/10 transition-opacity ${isDense ? 'opacity-100' : 'opacity-0'}`} />
              </button>

              <button 
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 border border-black/5 rounded-full px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest hover:border-black/20 transition-all bg-white shadow-sm"
              >
                <SlidersHorizontal size={12} /> Advance Filters
              </button>
            </div>
         </div>

         {/* Editorial Category Toggles */}
         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar relative">
            {categories.map((cat) => {
              const isActive = category.toLowerCase() === cat.id;
              return (
                <Link 
                  key={cat.id}
                  href={`/collections/${cat.id}`}
                  className="relative group px-6 py-1.5"
                >
                  {/* Liquid Bubble Background */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeCategory"
                      className="absolute inset-0 bg-black/5 backdrop-blur-xl rounded-full border border-black/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_4px_12px_rgba(0,0,0,0.05)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className={`relative z-10 text-[9px] font-bold uppercase tracking-widest transition-colors duration-300 ${
                    isActive ? 'text-black' : 'text-black/30 group-hover:text-black'
                  }`}>
                    {cat.name}
                  </span>
                </Link>
              );
            })}
         </div>
      </div>

      {/* Grid with Dynamic Density */}
      <section>
        <div className={`grid gap-2 transition-all duration-700 ease-in-out ${
          isDense 
            ? 'grid-cols-3 md:grid-cols-6 lg:grid-cols-10' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {filteredAndSortedProducts.map((product, i) => (
            <div key={product.id} className={`transition-all duration-700 ${isDense ? 'scale-[0.98]' : 'scale-100'}`}>
               <ProductCard product={product} index={i} isDense={isDense} />
            </div>
          ))}
        </div>
        
        {filteredAndSortedProducts.length === 0 && (
          <div className="w-full py-32 flex flex-col items-center justify-center border border-dashed border-black/10 rounded-lg">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">No products match your filters</p>
            <p className="text-[9px] uppercase tracking-[0.1em] opacity-20 mt-2">Try removing some filters to see more results</p>
          </div>
        )}
      </section>
    </div>
  );
}
