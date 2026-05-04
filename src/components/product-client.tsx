
"use client";

import { useState } from "react";
import Image from "next/image";
import { Bookmark } from "lucide-react";
import { Product } from "@/lib/data";
import { useCartStore } from "@/lib/store";
import { ProductCard } from "@/components/product-card";
import { MobileProductClient } from "@/components/mobile/mobile-product-client";

interface ProductClientProps {
  product: Product;
  suggestedProducts: Product[];
}

export default function ProductClient({ product, suggestedProducts }: ProductClientProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.variants?.find(v => v.availableForSale)?.title || null
  );
  const [activeTab, setActiveTab] = useState<string>("Details & Description");

  const { openCart, addToCart, wishlistItems, toggleWishlist } = useCartStore();
  const isWishlisted = wishlistItems.some((item: Product) => item.id === product.id);

  // Determine if all variants are sold out
  const isAllSoldOut = !product.variants || product.variants.length === 0 || product.variants.every(v => !v.availableForSale);

  // If we only have 1 image, duplicate it twice so the scrolling feature still functions visually.
  const displayImages = product.srcs && product.srcs.length > 1 ? product.srcs : [product.src, product.src, product.src];

  return (
    <>
      {/* Mobile View - Strict Isolation */}
      <div className="md:hidden">
        <MobileProductClient product={product} suggestedProducts={suggestedProducts} />
      </div>

      {/* Desktop View - Strict Isolation */}
      <main className="hidden md:block bg-[#fcfcfc] text-black font-sans relative">
        <div className="flex w-full min-h-screen pt-[80px] px-4 gap-4">
          
          {/* Leftmost Column: Static Anchor */}
          <div className="flex-1 sticky top-[80px] h-[calc(100vh-80px)] pb-4 shrink-0 flex items-center justify-center">
            <div className="relative w-full h-full bg-white rounded-2xl overflow-hidden flex items-center justify-center border border-black/5 shadow-sm">
              <Image 
                src={displayImages[0]}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Middle Column: Scrollable Gallery */}
          <div className="flex-1 flex flex-col gap-4 pb-[20vh]">
            {displayImages.map((src, i) => (
               <div key={i} className="relative w-full aspect-[2/3] bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm">
                   <Image src={src} alt={`Gallery ${i}`} fill className="object-cover" priority={i === 0} />
               </div>
            ))}
          </div>

          {/* Rightmost Column: Sticky Checkout Panel */}
          <div className="flex-1 sticky top-[80px] h-[calc(100vh-80px)] pb-4 shrink-0 overflow-y-auto hide-scrollbar">
             <div className="bg-[#fcfcfc] rounded-2xl p-6 min-h-full flex flex-col border border-black/5 shadow-sm">
                
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-xl font-bold tracking-tight">{product.title}</h1>
                  <button onClick={() => toggleWishlist(product)} className="text-black/40 hover:text-black transition-colors">
                    <Bookmark size={20} className={isWishlisted ? "fill-black text-black" : ""} />
                  </button>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-xs font-semibold text-black/60">{product.price}</p>
                  {product.sizeGuide ? (
                    <div 
                      onClick={() => {
                        // Logic for size guide - maybe a popup or scroll to section
                        alert("Size Guide: " + product.sizeGuide);
                      }}
                      className="bg-black/10 px-3 py-1.5 rounded text-[8px] font-extrabold cursor-pointer hover:bg-black/20 uppercase tracking-widest text-black/70"
                    >
                      Size Guide
                    </div>
                  ) : (
                    <div className="bg-black/10 px-3 py-1.5 rounded text-[8px] font-extrabold cursor-not-allowed uppercase tracking-widest text-black/30">Size Guide</div>
                  )}
                </div>
                
                <div className="grid grid-cols-4 lg:grid-cols-5 gap-2 mb-6">
                  {product.variants && product.variants.length > 0 ? (
                    product.variants.map(variant => (
                      <button 
                        key={variant.id} 
                        onClick={() => variant.availableForSale && setSelectedSize(variant.title)}
                        className={`py-2 text-[9px] rounded-full font-bold transition-all duration-300 ${
                          selectedSize === variant.title 
                            ? 'border border-black bg-black text-white' 
                            : !variant.availableForSale
                              ? 'bg-[rgba(0,0,0,0.05)] text-black/30 pointer-events-none line-through decoration-black/30'
                              : 'border border-black/10 bg-white hover:border-black'
                        }`}
                      >
                        {(() => {
                          // 1. Try to find the explicit "Size" option value
                          const sizeOpt = variant.selectedOptions?.find((opt: any) => opt.name.toLowerCase() === 'size');
                          if (sizeOpt) return sizeOpt.value;
                          
                          // 2. If no explicit size option, but it's a multi-option title (e.g. "White / S")
                          if (variant.title.includes('/')) {
                            const parts = variant.title.split('/').map((p: string) => p.trim());
                            // We take the last part assuming it's the size
                            return parts.pop();
                          }
                          
                          // 3. If it's a single option and looks like a color, or we can't find a size, return "ONE SIZE"
                          // This handles products that might only have color variants or are "Universal" fit
                          const colorNames = ['white', 'black', 'blue', 'red', 'green', 'grey', 'gray', 'yellow', 'brown', 'purple', 'navy', 'orange', 'olive', 'khaki', 'acid wash', 'faded'];
                          if (colorNames.some(color => variant.title.toLowerCase().includes(color))) {
                            return "ONE SIZE";
                          }
                          
                          return variant.title;
                        })()}
                      </button>
                    ))
                  ) : (
                    ['XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(size => {
                      const isOutOfStock = ['XXXS', 'XXS', 'M', 'XL', 'XXL', 'XXXL'].includes(size);
                      return (
                        <button 
                          key={size} 
                          onClick={() => !isOutOfStock && setSelectedSize(size)}
                          className={`py-2 text-[9px] rounded-full font-bold transition-all duration-300 ${
                            selectedSize === size 
                              ? 'border border-black bg-black text-white' 
                              : isOutOfStock
                                ? 'bg-[rgba(0,0,0,0.05)] text-black/30 pointer-events-none line-through decoration-black/30'
                                : 'border border-black/10 bg-white hover:border-black'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="flex gap-3 mb-6">
                  <button 
                    disabled={isAllSoldOut || !selectedSize}
                    onClick={() => product && selectedSize && addToCart(product, selectedSize)}
                    className={`flex-1 border border-black/10 bg-white text-black py-3 rounded-full text-[9px] font-extrabold uppercase hover:border-black transition-colors shadow-sm tracking-[0.1em] ${isAllSoldOut ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    {isAllSoldOut ? 'SOLD OUT' : 'ADD TO BAG'}
                  </button>
                  {!isAllSoldOut && (
                    <button 
                      onClick={() => { product && selectedSize && addToCart(product, selectedSize || 'M'); setTimeout(openCart, 100); }}
                      className="flex-1 bg-black border border-black text-white py-3 rounded-full text-[9px] font-extrabold uppercase hover:bg-black/80 transition-colors shadow-sm tracking-[0.1em]"
                    >
                      BUY NOW
                    </button>
                  )}
                </div>

                <div className="mt-0 bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm mb-4">
                  <div className="flex">
                    {['Details & Description', 'Washcare', 'Shipping'].map(tab => (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-4 text-[9px] font-extrabold uppercase tracking-widest transition-colors ${activeTab === tab ? 'border-b-2 border-black text-black' : 'border-b-2 border-transparent text-black/40 hover:text-black bg-[#fafafa]'}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  
                  <div className="p-5 text-[10px] font-medium text-black/50 leading-relaxed">
                    {activeTab === 'Details & Description' && (
                      <div className="space-y-4">
                        <div>
                          <strong className="text-black block mb-1 font-bold">Details</strong>
                          {product.details || "100% premium quality. Weight - 250 gsm. Screen print."}
                        </div>
                        <div>
                          <strong className="text-black block mb-1 font-bold">Description</strong>
                          {product.descriptionHtml ? (
                            <div 
                              className="prose prose-sm max-w-none text-black/50"
                              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                            />
                          ) : (
                            <>Strong, clean, and easy to style. The {product.title.toLowerCase()} is designed for everyday luxury with a bold edge. {product.desc}</>
                          )}
                        </div>
                      </div>
                    )}
                    {activeTab === 'Washcare' && (
                      <div className="space-y-4">
                        {product.washcare || "Dry clean only. Avoid abrasive surfaces. Machine wash cold inside out if necessary. Hang dry to preserve perfectly tailored structural integrity. Do not bleach."}
                      </div>
                    )}
                    {activeTab === 'Shipping' && (
                      <div className="space-y-4">
                        {product.shipping || "Complimentary express shipping on all orders. Dispatch within 24 hours. Returns guaranteed within 30 days of standard receipt. Items must be in pristine condition."}
                      </div>
                    )}
                  </div>
                </div>
             </div>
          </div>
        </div>

        <section className="bg-[#fcfcfc] w-full pt-12 pb-52 px-12 border-t border-black/5 z-20 relative">
          <h2 className="text-xl font-bold tracking-tight mb-8">You may also like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
             {suggestedProducts.map((suggested, i) => (
               <ProductCard key={suggested.id} product={suggested} index={i} />
             ))}
          </div>
        </section>

        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />
      </main>
    </>
  );
}
