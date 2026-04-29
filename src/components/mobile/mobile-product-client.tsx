"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Product } from "@/lib/data";
import { useCartStore } from "@/lib/store";
import { Bookmark } from "lucide-react";
import { ProductCard } from "../product-card";

interface MobileProductClientProps {
  product: Product;
  suggestedProducts: Product[];
}

export function MobileProductClient({ product, suggestedProducts }: MobileProductClientProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.variants?.find(v => v.availableForSale)?.title || null
  );
  const [activeTab, setActiveTab] = useState<string>("Details & Description");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { openCart, addToCart, wishlistItems, toggleWishlist } = useCartStore();
  const isWishlisted = wishlistItems.some((item: Product) => item.id === product.id);

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
    <div className="bg-white min-h-screen pb-[200px] pt-[75px] relative overflow-x-hidden w-full max-w-full">
      {/* 1. Image Slider */}
      <div className="w-full aspect-[4/5] bg-[#f4f4f4] overflow-hidden relative">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full scroll-smooth"
        >
          {displayImages.map((src, i) => (
            <div key={i} className="flex-none w-full h-full snap-center relative">
              <Image 
                src={src} 
                alt={`${product.title} - Image ${i + 1}`}
                fill
                className="object-cover"
                priority={i === 0}
              />
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
      <div className="px-6 pt-8 pb-6 bg-white relative z-10">
        <div className="flex justify-between items-start mb-1">
          <h1 className="text-xl font-bold tracking-tight text-[#1a1a1a] flex-1 pr-4">
            {product.title}
          </h1>
          <button 
            type="button"
            onClick={() => alert("Size Guide: " + (product.sizeGuide || "Standard fitting."))}
            className="text-[7px] font-black text-black/40 uppercase tracking-[0.2em] hover:text-black transition-colors pt-2 shrink-0"
          >
            Size Guide
          </button>
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold text-black/50 uppercase tracking-wide">
            {product.price}
          </p>
          <button 
            type="button"
            onClick={() => toggleWishlist(product)}
            className="active:opacity-50 transition-opacity"
          >
            <Bookmark 
              size={18} 
              className={`transition-colors pointer-events-none ${isWishlisted ? "fill-black text-black" : "text-black/20"}`} 
            />
          </button>
        </div>

        {/* 3. Size Selection */}
        <div className="mt-8">
          <div className="grid grid-cols-5 gap-2">
            {product.variants && product.variants.length > 0 ? (
              product.variants.map(variant => (
                <button 
                  key={variant.id} 
                  type="button"
                  onClick={() => variant.availableForSale && setSelectedSize(variant.title)}
                  className={`py-4 text-[10px] rounded-full font-bold transition-all duration-200 active:scale-95 ${
                    selectedSize === variant.title 
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
              ['XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(size => {
                const isOutOfStock = ['XXXS', 'XXS', 'XXXL'].includes(size);
                return (
                  <button 
                    key={size} 
                    type="button"
                    onClick={() => !isOutOfStock && setSelectedSize(size)}
                    className={`py-4 text-[10px] rounded-full font-bold transition-all duration-200 active:scale-95 ${
                      selectedSize === size 
                        ? 'bg-black text-white border-black' 
                        : isOutOfStock
                          ? 'bg-[#f5f5f5] text-black/20 pointer-events-none line-through'
                          : 'bg-white border border-[#e5e5e5] text-black active:bg-gray-100'
                    }`}
                  >
                    {size}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* 4. Action Buttons */}
        <div className="mt-10 space-y-3">
          <button 
            type="button"
            disabled={isAllSoldOut || !selectedSize}
            onClick={() => product && selectedSize && addToCart(product, selectedSize)}
            className={`w-full py-5 rounded-full border border-black text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] ${
              isAllSoldOut || !selectedSize ? 'bg-black/5 text-black/40 border-black/10 cursor-not-allowed' : 'bg-white text-black active:bg-gray-50'
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
              className={`w-full py-5 rounded-full bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] active:bg-black/80 ${
                !selectedSize ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              BUY NOW
            </button>
          )}
        </div>

        {/* 5. Tabs / Accordion */}
        <div className="mt-12 bg-[#f8f8f8] rounded-3xl border border-[#eeeeee] overflow-hidden">
          <div className="flex border-b border-black/5 bg-[#f8f8f8]">
            {['Details & Description', 'Washcare', 'Shipping'].map(tab => (
              <button 
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-5 px-1 text-[8px] sm:text-[9px] font-black uppercase tracking-widest relative transition-all active:bg-black/5 ${
                  activeTab === tab ? 'text-black' : 'text-black/30'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <span className="truncate block w-full px-0.5">{tab}</span>
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />
                )}
              </button>
            ))}
          </div>
          
          <div className="p-6 text-[11px] leading-relaxed text-black/60 font-medium min-h-[200px] bg-white">
            {activeTab === 'Details & Description' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-black font-bold mb-2">Details</h4>
                  <p>{product.details || "100% premium cotton construction. Heavyweight fabric (260 gsm). High-definition graphic print."}</p>
                </div>
                <div>
                  <h4 className="text-black font-bold mb-2">Description</h4>
                  {product.descriptionHtml ? (
                    <div 
                      className="prose prose-sm max-w-none text-black/60"
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
          </div>
        </div>
      </div>

      {/* 6. You May Also Like */}
      <div className="mt-8 bg-white relative z-10">
        <h3 className="px-6 text-[10px] font-bold uppercase tracking-[0.3em] mb-6 text-black/30">You may also like</h3>
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 no-scrollbar pb-8 -mx-6 px-6 scroll-smooth">
          {suggestedProducts && suggestedProducts.length > 0 ? (
            suggestedProducts.map((suggested, i) => (
              <div key={suggested.id} className="min-w-[65vw] flex-shrink-0 snap-start">
                <ProductCard product={suggested} index={i} />
              </div>
            ))
          ) : (
            <div className="w-full text-center py-12 text-black/20 text-xs uppercase tracking-widest px-6">
              No recommendations available
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-8 py-12 border-t border-black/5 text-center bg-white relative z-10">
        <p className="text-[10px] font-bold text-black/20 tracking-[0.5em] uppercase">
          colinguest.com
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
