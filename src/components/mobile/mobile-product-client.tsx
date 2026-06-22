"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/data";
import { useCartStore } from "@/lib/store";
import { Bookmark, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "../product-card";
import { ShopTheLook } from "../shop-the-look";

interface MobileProductClientProps {
  product: Product;
  suggestedProducts: Product[];
  allProducts: Product[];
}

export function MobileProductClient({ product, suggestedProducts, allProducts }: MobileProductClientProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.variants?.find(v => v.availableForSale)?.title || null
  );
  const [activeTab, setActiveTab] = useState<string>("Details & Description");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { openCart, addToCart, wishlistItems, toggleWishlist } = useCartStore();
  const isWishlisted = wishlistItems.some((item: Product) => item.id === product.id);
  const [showSuggestArrow, setShowSuggestArrow] = useState(false);
  const suggestScrollRef = useRef<HTMLDivElement>(null);

  const checkSuggestScroll = () => {
    if (suggestScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = suggestScrollRef.current;
      setShowSuggestArrow(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkSuggestScroll();
  }, [suggestedProducts]);

  const displayImages = product.srcs && product.srcs.length > 0 ? product.srcs : [product.src];

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollPosition = scrollRef.current.scrollLeft;
      const imageWidth = scrollRef.current.offsetWidth;
      if (imageWidth > 0) {
        const newIndex = Math.round(scrollPosition / imageWidth);
        setCurrentImageIndex(newIndex);
      }
    }
  };

  const isAllSoldOut = !product.variants || product.variants.length === 0 || product.variants.every(v => !v.availableForSale);

  return (
    <div className="bg-white min-h-screen pb-[120px] pt-[64px] relative overflow-x-hidden w-full max-w-full">
      {/* Breadcrumbs */}
      <div className="px-6 py-3 bg-white flex items-center gap-1.5 text-[8px] font-bold text-black/30 uppercase tracking-[0.2em]">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span className="text-black/20">&gt;</span>
        <Link href="/collections/all" className="hover:text-black transition-colors">
          {(product.category || product.type || "BESTSELLERS").toUpperCase()}
        </Link>
        <span className="text-black/20">&gt;</span>
        <span className="text-black/60 font-semibold truncate max-w-[150px]">{product.title}</span>
      </div>

      {/* 1. Image Slider */}
      <div className="w-full aspect-[4/5] bg-[#f4f4f4] overflow-hidden relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full scroll-smooth"
        >
          {displayImages.map((src, i) => (
            <div key={i} className="flex-none w-full h-full snap-center relative">
              {src ? (
                <Image
                  src={src}
                  alt={`${product.title} - Image ${i + 1}`}
                  fill
                  className="object-cover"
                  priority={i === 0}
                />
              ) : (
                <div className="w-full h-full bg-[#f4f4f4] flex items-center justify-center text-black/10 text-[10px] uppercase font-bold tracking-widest">
                  No Image
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Image Counter Indicator */}
        <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full pointer-events-none">
          <p className="text-[10px] font-bold text-white tracking-widest">
            {currentImageIndex + 1} / {displayImages.length}
          </p>
        </div>
      </div>

      {/* 2. Product Info Section */}
      <div className="px-6 pt-4 pb-3 bg-white relative z-10">
        <div className="flex justify-between items-center mb-1 w-full">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <h1 className="text-xs font-bold tracking-tight text-[#1a1a1a] truncate">
              {product.title}
            </h1>
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className="active:opacity-50 transition-opacity shrink-0 pb-0.5"
            >
              <Bookmark
                size={11}
                className={`transition-colors pointer-events-none ${isWishlisted ? "fill-black text-black" : "text-black/30"}`}
              />
            </button>
          </div>
          <button
            type="button"
            onClick={() => alert("Size Guide: " + (product.sizeGuide || "Standard fitting."))}
            className="px-2 py-1 bg-black/5 rounded text-[8px] font-bold text-black/50 tracking-wider hover:bg-black/10 transition-colors shrink-0"
          >
            Size Guide
          </button>
        </div>

        <div className="mb-2">
          <p className="text-[9.5px] font-bold text-black/40">
            {product.price}
          </p>
        </div>

        {/* 3. Size Selection */}
        <div className="mt-4">
          <div className="grid grid-cols-5 gap-2">
            {product.variants && product.variants.length > 0 ? (
              product.variants.map(variant => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => variant.availableForSale && setSelectedSize(variant.title)}
                  className={`py-2.5 text-[9px] rounded-full font-bold transition-all duration-200 active:scale-95 ${selectedSize === variant.title
                    ? 'bg-black text-white border-black'
                    : !variant.availableForSale
                      ? 'bg-[#f5f5f5] text-black/20 pointer-events-none line-through'
                      : 'bg-white border border-[#e5e5e5] text-black active:bg-gray-100'
                    }`}
                >
                  {(() => {
                    const sizeOpt = variant.selectedOptions?.find((opt: any) => opt.name.toLowerCase() === 'size');
                    if (sizeOpt) return sizeOpt.value;
                    if (variant.title.includes('/')) return variant.title.split('/').pop()?.trim();
                    return variant.title;
                  })()}
                </button>
              ))
            ) : (
              <div className="col-span-full py-4 text-[10px] font-bold text-black/30 uppercase tracking-[0.2em] italic text-center">
                Standard Archival Fit / One Size
              </div>
            )}
          </div>
        </div>

        {/* 4. Action Buttons */}
        <div className="mt-4 space-y-2">
          <button
            type="button"
            disabled={isAllSoldOut || !selectedSize}
            onClick={() => product && selectedSize && addToCart(product, selectedSize)}
            className={`w-full py-3.5 rounded-full border border-black text-[9px] font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.98] ${isAllSoldOut || !selectedSize ? 'bg-black/5 text-black/40 border-black/10 cursor-not-allowed' : 'bg-white text-black active:bg-gray-50'
              }`}
          >
            {isAllSoldOut ? 'SOLD OUT' : 'ADD TO BAG'}
          </button>

          {!isAllSoldOut && (
            <button
              type="button"
              disabled={!selectedSize}
              onClick={() => {
                if (product && selectedSize) {
                  addToCart(product, selectedSize);
                  setTimeout(openCart, 100);
                }
              }}
              className={`w-full py-3.5 rounded-full bg-black text-white text-[9px] font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.98] active:bg-black/80 ${!selectedSize ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              BUY NOW
            </button>
          )}
        </div>

        {/* 5. Tabs / Accordion */}
        <div className="mt-5 bg-[#f8f8f8] rounded-3xl border border-[#eeeeee] overflow-hidden">
          <div className="flex border-b border-black/5 bg-[#f8f8f8] relative">
            {['Details & Description', 'Washcare', 'Shipping'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-1 text-[7px] font-bold uppercase tracking-wide relative transition-all active:bg-black/5 ${activeTab === tab ? 'text-black' : 'text-black/30'
                  }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <span className="truncate block w-full px-0.5 relative z-10">{tab}</span>
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-5 text-[9px] leading-relaxed text-black/60 font-medium bg-white [&_p]:text-[9px] [&_p]:leading-relaxed [&_ul]:text-[9px] [&_li]:text-[9px] overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
              >
                {activeTab === 'Details & Description' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-black text-[9px] font-bold mb-2">Details</h4>
                      <p>{product.details || "100% premium cotton construction. Heavyweight fabric (260 gsm). High-definition graphic print."}</p>
                    </div>
                    <div>
                      <h4 className="text-black text-[9px] font-bold mb-2">Description</h4>
                      {product.descriptionHtml ? (
                        <div
                          className="text-[9px] leading-relaxed text-black/60 font-medium [&_p]:text-[9px] [&_p]:leading-relaxed [&_ul]:text-[9px] [&_li]:text-[9px]"
                          dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                        />
                      ) : (
                        <p>{product.desc || `A signature piece from the Colin Guest collection. Designed for a relaxed, architectural fit that maintains its structure.`}</p>
                      )}
                    </div>
                  </div>
                )}
                {activeTab === 'Washcare' && (
                  <p>{product.washcare || "Machine wash cold inside out. Tumble dry low or hang dry to preserve structural integrity."}</p>
                )}
                {activeTab === 'Shipping' && (
                  <p>{product.shipping || "Complimentary express worldwide shipping on orders above $500. Secure tracking provided upon dispatch."}</p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 5.5 Shop the Look (Outfit pairing) */}
      <ShopTheLook currentProduct={product} allProducts={allProducts} />

      {/* 6. You May Also Like */}
      <div className="mt-8 bg-white relative z-10">
        <h3 className="px-6 text-[10px] font-bold uppercase tracking-[0.3em] mb-6 text-black/30">You may also like</h3>
        <div className="relative">
          <div
            ref={suggestScrollRef}
            onScroll={checkSuggestScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 no-scrollbar pb-8 -mx-6 scroll-smooth scroll-pl-8 scroll-pr-8"
          >
            <div className="flex-none w-8" /> {/* Leading spacer */}
            {suggestedProducts && suggestedProducts.length > 0 ? (
              suggestedProducts.map((suggested, i) => (
                <div key={suggested.id} className="min-w-[65vw] flex-shrink-0 snap-start">
                  <ProductCard product={suggested} index={i} disableSlider={true} />
                </div>
              ))
            ) : (
              <div className="w-full text-center py-12 text-black/20 text-xs uppercase tracking-widest px-6">
                No recommendations available
              </div>
            )}
            <div className="flex-none w-8" /> {/* Trailing spacer */}
          </div>

          {/* Scroll Indicator Arrow */}
          {showSuggestArrow && (
            <div className="absolute right-0 top-0 bottom-8 w-16 flex items-center justify-end pr-4 pointer-events-none z-20 bg-gradient-to-l from-white via-white/80 to-transparent">
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-2 rounded-full bg-white shadow-md border border-black/5"
              >
                <ChevronRight size={14} className="text-black/40" />
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Discover All Button with rotating black neon border */}
      <div className="flex justify-center mt-6 mb-12 relative z-10">
        <Link
          href="/collections/all"
          className="relative group p-[1.2px] overflow-hidden rounded-full active:scale-95 transition-transform"
        >
          {/* Continuous Black Neon Light Border */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-250%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_330deg,#000_360deg)] opacity-30"
          />

          {/* Glossy Button Surface */}
          <div className="relative px-6 py-2.5 bg-white/40 backdrop-blur-[10px] rounded-full border border-black/10 shadow-[0_5px_15px_rgba(0,0,0,0.05)] flex items-center justify-center">
            <span className="text-black text-[8px] font-bold uppercase tracking-[0.4em] whitespace-nowrap">Discover all</span>
          </div>
        </Link>
      </div>



      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
