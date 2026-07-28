
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Product } from "@/lib/data";
import { useCartStore } from "@/lib/store";
import { ProductCard } from "@/components/product-card";
import { MobileProductClient } from "@/components/mobile/mobile-product-client";
import { ShopTheLook } from "@/components/shop-the-look";
import { motion, AnimatePresence } from "framer-motion";
import { PincodeChecker } from "@/components/pincode-checker";
import { CustomerCollage } from "@/components/customer-collage";

interface ProductClientProps {
  product: Product;
  suggestedProducts: Product[];
  allProducts: Product[];
}

export default function ProductClient({ product, suggestedProducts, allProducts }: ProductClientProps) {
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
        <MobileProductClient product={product} suggestedProducts={suggestedProducts} allProducts={allProducts} />
      </div>

      {/* Desktop View - Strict Isolation */}
      <main className="hidden md:block bg-[#fcfcfc] text-black font-sans relative">
        <div className="flex w-full min-h-screen pt-[80px] px-4 gap-4 items-start">
          
          {/* Leftmost Column: Static Anchor */}
          <div className="flex-1 sticky top-[80px] h-[calc(100vh-80px)] pb-4 shrink-0 flex items-center justify-center">
            <div className="relative w-full h-full bg-white rounded-2xl overflow-hidden flex items-center justify-center border border-black/5 shadow-sm">
              {displayImages[0] ? (
                <Image 
                  src={displayImages[0]}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="text-black/10 font-bold uppercase tracking-widest text-[10px]">No Preview</div>
              )}
            </div>
          </div>

          {/* Middle Column: Scrollable Gallery */}
          <div className="flex-1 flex flex-col gap-4 pb-[20vh]">
            {displayImages.map((src, i) => (
               <div key={i} className="relative w-full aspect-[2/3] bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center">
                   {src ? (
                     <Image src={src} alt={`Gallery ${i}`} fill className="object-cover" priority={i === 0} />
                   ) : (
                     <div className="text-black/5 font-bold uppercase tracking-widest text-[10px]">No Detail Image</div>
                   )}
               </div>
            ))}
          </div>

          {/* Rightmost Column: Sticky Checkout Panel */}
          <div className="flex-1 sticky top-[80px] h-[calc(100vh-80px)] pb-4 shrink-0 overflow-y-auto custom-scrollbar">
             <div className="bg-[#fcfcfc] rounded-2xl p-5 min-h-full border border-black/5 shadow-sm">

                 <div className="flex justify-between items-center mb-1 w-full">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <h1 className="text-xs md:text-[13.5px] font-bold tracking-tight text-[#1a1a1a] truncate">
                      {product.title}
                    </h1>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product)}
                      className="active:opacity-50 transition-opacity shrink-0 pb-0.5"
                    >
                      <Bookmark
                        size={12}
                        className={`transition-colors pointer-events-none ${isWishlisted ? "fill-black text-black" : "text-black/30"}`}
                      />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("Size Guide: " + (product.sizeGuide || "Standard fitting."))}
                    className="px-2 py-1 bg-black/5 rounded text-[8px] md:text-[9.5px] font-bold text-black/50 tracking-wider hover:bg-black/10 transition-colors shrink-0"
                  >
                    Size Guide
                  </button>
                </div>

                <div className="mb-2">
                  <p className="text-[9.5px] md:text-[11px] font-bold text-black/45">
                    {product.price}
                  </p>
                </div>
                
                {/* Size Selection */}
                <div className="mt-3 mb-3">
                  <div className="grid grid-cols-4 lg:grid-cols-5 gap-2">
                    {product.variants && product.variants.length > 0 ? (
                      product.variants.map(variant => (
                        <button 
                          key={variant.id} 
                          onClick={() => variant.availableForSale && setSelectedSize(variant.title)}
                          className={`py-2 text-[9px] md:text-[10.5px] rounded-full font-bold transition-all duration-300 ${
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
                            const colorNames = ['white', 'black', 'blue', 'red', 'green', 'grey', 'gray', 'yellow', 'brown', 'purple', 'navy', 'orange', 'olive', 'khaki', 'acid wash', 'faded'];
                            if (colorNames.some(color => variant.title.toLowerCase().includes(color))) {
                              return "ONE SIZE";
                            }
                            
                            return variant.title;
                          })()}
                        </button>
                      ))
                    ) : (
                      <div className="col-span-full py-2 text-[9px] md:text-[10.5px] font-bold text-black/40 uppercase tracking-[0.2em] italic">
                        Standard Archival Fit / One Size
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mb-3">
                  <button 
                    disabled={isAllSoldOut || !selectedSize}
                    onClick={() => product && selectedSize && addToCart(product, selectedSize)}
                    className={`flex-1 border border-black/10 bg-white text-black py-3 rounded-full text-[9px] md:text-[10.5px] font-bold uppercase hover:border-black transition-colors shadow-sm tracking-[0.1em] ${isAllSoldOut ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    {isAllSoldOut ? 'SOLD OUT' : 'ADD TO BAG'}
                  </button>
                  {!isAllSoldOut && (
                    <button 
                      onClick={() => { product && selectedSize && addToCart(product, selectedSize || 'M'); setTimeout(openCart, 100); }}
                      className="flex-1 bg-black border border-black text-white py-3 rounded-full text-[9px] md:text-[10.5px] font-bold uppercase hover:bg-black/80 transition-colors shadow-sm tracking-[0.1em]"
                    >
                      BUY NOW
                    </button>
                  )}
                </div>

                {/* Pincode Checker */}
                <PincodeChecker />

                {/* Tabs / Accordion */}
                <div className="mt-2 bg-[#f8f8f8] rounded-3xl border border-[#eeeeee] overflow-hidden">
                  <div className="flex border-b border-black/5 bg-[#f8f8f8] relative">
                    {['Details & Description', 'Washcare', 'Shipping'].map(tab => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 px-1 text-[7.5px] md:text-[9px] font-bold uppercase tracking-wide relative transition-all active:bg-black/5 ${activeTab === tab ? 'text-black' : 'text-black/30'
                          }`}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <span className="truncate block w-full px-0.5 relative z-10">{tab}</span>
                        {activeTab === tab && (
                          <motion.div
                            layoutId="activeTabUnderlineDesktop"
                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="py-3 px-4 text-[9px] md:text-[10.5px] leading-relaxed text-black/65 font-medium bg-white [&_p]:text-[9px] md:[&_p]:text-[10.5px] [&_p]:leading-relaxed [&_ul]:text-[9px] md:[&_ul]:text-[10.5px] [&_li]:text-[9px] md:[&_li]:text-[10.5px] overflow-hidden relative">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.18, ease: "easeInOut" }}
                      >
                        {activeTab === 'Details & Description' && (
                          <div className="space-y-5">
                            <div>
                              <h4 className="text-black text-[9.5px] md:text-[11px] font-bold uppercase tracking-wider mb-1.5">Details</h4>
                              <p className="text-[9px] md:text-[10.5px] leading-relaxed text-black/65 font-medium">
                                {product.details || "100% premium cotton construction. Heavyweight fabric (260 gsm). High-definition graphic print."}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-black text-[9.5px] md:text-[11px] font-bold uppercase tracking-wider mb-1.5">Description</h4>
                              {product.descriptionHtml ? (
                                <div
                                  className="text-[9px] md:text-[10.5px] leading-relaxed text-black/65 font-medium [&_p]:text-[9px] md:[&_p]:text-[10.5px] [&_p]:leading-relaxed [&_ul]:text-[9px] md:[&_ul]:text-[10.5px] [&_li]:text-[9px] md:[&_li]:text-[10.5px]"
                                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                                />
                              ) : (
                                <p className="text-[9px] md:text-[10.5px] leading-relaxed text-black/65 font-medium">
                                  {product.desc || `A signature piece from the Colin Guest collection. Designed for a relaxed, architectural fit that maintains its structure.`}
                                </p>
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
          </div>
        </div>

        <section className="bg-[#fcfcfc] w-full pt-12 pb-52 px-12 border-t border-black/5 z-20 relative">
          <div className="max-w-6xl mx-auto">
            <CustomerCollage />
            <ShopTheLook currentProduct={product} allProducts={allProducts} />
            <h2 className="text-xl font-bold tracking-tight mt-16 mb-8">You may also like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
               {suggestedProducts.map((suggested, i) => (
                 <ProductCard key={suggested.id} product={suggested} index={i} />
               ))}
            </div>

            {/* Discover All Button with rotating black neon border */}
            <div className="flex justify-center mt-12 relative z-10">
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
          </div>
        </section>

        <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 2.5px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.12);
            border-radius: 99px;
            transition: background 0.2s ease;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.25);
          }
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />
      </main>
    </>
  );
}
