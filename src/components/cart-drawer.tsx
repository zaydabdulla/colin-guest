"use client";

import { useCartStore, type CartItem } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, ShoppingBag, ArrowRight, Plus, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { getAllProducts } from "@/lib/shopify";
import { Product } from "@/lib/data";

export function CartDrawer() {
  const router = useRouter();
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, addToCart } = useCartStore();
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const parsePrice = (priceStr: string) => parseInt(priceStr.replace(/[^0-9]/g, ''));
  // Summing total exactly like a real ecommerce API engine
  const total = items.reduce((sum: number, item: CartItem) => sum + (parsePrice(item.product.price) * item.quantity), 0);
  
  // Format to match Bluorng's explicit syntax "RS. 17,400"
  const formattedTotal = "RS. " + total.toLocaleString();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const allProducts = await getAllProducts();
        const cartProductIds = new Set(items.map(item => item.product.id));
        
        // Analyze cart for pairing logic
        const topKeywords = ["shirt", "hoodie", "top", "jacket", "tee", "t-shirt", "vest", "knitwear", "sweater", "blazer"];
        const bottomKeywords = ["jeans", "pants", "trousers", "shorts", "cargo", "skirt", "joggers", "denim"];
        
        const hasTop = items.some(item => {
          const t = item.product.title.toLowerCase();
          const type = (item.product.type || "").toLowerCase();
          return topKeywords.some(k => t.includes(k) || type.includes(k));
        });

        const hasBottom = items.some(item => {
          const t = item.product.title.toLowerCase();
          const type = (item.product.type || "").toLowerCase();
          return bottomKeywords.some(k => t.includes(k) || type.includes(k));
        });

        // Scoring algorithm
        const scoredProducts = allProducts
          .filter(p => !cartProductIds.has(p.id))
          .map(p => {
            let score = 0;
            const t = p.title.toLowerCase();
            const type = (p.type || "").toLowerCase();
            
            const isTop = topKeywords.some(k => t.includes(k) || type.includes(k));
            const isBottom = bottomKeywords.some(k => t.includes(k) || type.includes(k));

            if (hasTop && isBottom) score += 10;
            if (hasBottom && isTop) score += 10;
            if (!hasTop && !hasBottom) score += 5; // Default variety

            return { product: p, score };
          })
          .sort((a, b) => b.score - a.score)
          .map(item => ({
            ...item.product,
            src: item.product.images[0]?.url || "/placeholder.jpg"
          }))
          .slice(0, 10);

        setSuggestions(scoredProducts);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };

    if (isOpen) {
      fetchSuggestions();
    }
  }, [isOpen, items]);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowScrollArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
  }, [suggestions, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 z-[400]"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-[calc(64px+env(safe-area-inset-top,0px))] right-0 h-[calc(100%-64px-env(safe-area-inset-top,0px))] md:top-0 md:h-full w-[85%] md:w-[420px] bg-[#e5e7eb] z-[401] flex flex-col shadow-2xl rounded-l-[16px] overflow-hidden"
          >
             {/* Header matches desktop grey aesthetic */}
             <div className="flex items-center gap-4 px-6 py-3 md:py-5 text-black bg-[#e5e7eb]">
                <button 
                  onClick={closeCart} 
                  className="p-1 -ml-1 hover:opacity-60 transition-opacity flex items-center justify-center"
                  aria-label="Close cart"
                >
                  <X size={16} strokeWidth={1} />
                </button>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] leading-none">Your Cart</span>
             </div>

             {/* White body area - straightened as requested */}
             <div className="flex-1 bg-white text-black overflow-hidden flex flex-col relative">
               
               {/* Main Cart Items Scroll Area */}
               <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4 custom-scrollbar">
                  {items.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-black/20">
                       <ShoppingBag size={48} strokeWidth={1} className="mb-4 drop-shadow-sm" />
                       <p className="font-bold tracking-widest text-[10px] uppercase text-black/40">Your bag is empty.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {items.map((item: CartItem, index: number) => (
                        <div key={item.id} className="flex gap-4 group">
                          {/* Product Image Square (Tightened sizing) */}
                          <div className="relative w-[72px] h-[72px] rounded-lg bg-[#f4f4f5] overflow-hidden shrink-0 border border-black/5 shadow-sm flex items-center justify-center">
                            {/* Priority layout to avoid popping */}
                            {item.product.src ? (
                              <Image src={item.product.src} alt={item.product.title} fill className="object-contain hover:scale-105 transition-transform duration-500 p-1" priority={index === 0} />
                            ) : (
                              <ShoppingBag size={20} className="text-white/20" />
                            )}
                          </div>

                          <div className="flex-1 flex flex-col">
                              
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h4 className="font-extrabold text-[10px] tracking-tight text-black">{item.product.title}</h4>
                                  <p className="text-[9px] text-black/60 font-medium mt-1">
                                    {item.size.includes('/') ? item.size.split('/').pop()?.trim() : item.size}
                                  </p>
                                </div>
                                <span className="text-[9px] text-black font-medium">{item.product.price}</span>
                              </div>
                              
                              {/* Horizontal Control Bar exactly mapped to image_10 syntax */}
                              <div className="mt-auto border-y border-black/10 flex items-stretch h-8 text-[11px]">
                                <div className="flex items-center border-r border-black/10 w-[70px] shrink-0">
                                  <button onClick={() => updateQuantity(item.id, -1)} className="flex-1 h-full flex items-center justify-center hover:bg-black/5 text-[15px] font-medium leading-none">-</button>
                                  <span className="flex-1 text-center font-medium text-[10px]">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item.id, 1)} className="flex-1 h-full flex items-center justify-center hover:bg-black/5 text-[15px] font-medium leading-none">+</button>
                                </div>

                                <button 
                                  onClick={() => removeFromCart(item.id)} 
                                  className="flex-1 h-full flex items-center justify-end pr-3 text-[11px] font-medium hover:bg-black/5 transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
               </div>

               {/* "You May Also Like" - Anchored to bottom of body, scrollable horizontally */}
               <div className="bg-[#fcfcfc] border-t border-black/5 pt-5 pb-28 px-5 relative">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-black/40 flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-black/10" />
                    You May Also Like
                  </h3>
                  
                  <div className="relative group/scroll">
                    <div 
                      ref={scrollContainerRef}
                      onScroll={checkScroll}
                      className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory"
                    >
                      {suggestions.map((product) => (
                        <div key={product.id} className="min-w-[160px] max-w-[160px] snap-start group/suggestion relative">
                          <div className="flex gap-3 items-center">
                            <div className="relative w-16 h-16 rounded-md bg-[#f4f4f5] border border-black/5 overflow-hidden shrink-0 shadow-sm">
                              {product.src && (
                                <Image src={product.src} alt={product.title} fill className="object-cover group-hover/suggestion:scale-110 transition-transform duration-500" />
                              )}
                              <button 
                                onClick={() => addToCart(product, "Free Size")}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover/suggestion:opacity-100 transition-opacity flex items-center justify-center"
                              >
                                <Plus size={16} className="text-white" />
                              </button>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[9px] font-bold text-black truncate uppercase tracking-tight">{product.title}</p>
                              <p className="text-[9px] text-black/40 font-medium mt-0.5">{product.price}</p>
                              <button 
                                onClick={() => addToCart(product, "Free Size")}
                                className="mt-1.5 text-[8px] font-bold uppercase tracking-widest text-black/20 hover:text-black transition-colors"
                              >
                                Add +
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Scroll Indicator Arrow */}
                    {showScrollArrow && (
                      <div className="absolute right-[-20px] top-0 bottom-0 w-16 flex items-center justify-center pointer-events-none z-10 bg-gradient-to-l from-[#fcfcfc] via-[#fcfcfc]/80 to-transparent">
                        <motion.div
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-1.5 rounded-full bg-white shadow-md border border-black/5"
                        >
                          <ChevronRight size={14} className="text-black/40" />
                        </motion.div>
                      </div>
                    )}
                  </div>
               </div>

               {/* Floating Footer Checkout Button */}
               {items.length > 0 && (
                 <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
                    <button 
                      onClick={() => {
                        closeCart();
                        router.push("/checkout");
                      }}
                      className="w-full pointer-events-auto bg-black text-white px-6 py-[18px] rounded-[2rem] flex justify-between items-center shadow-lg hover:scale-[1.02] transition-transform"
                    >
                       <span className="text-[13px] font-medium">Check out</span>
                       <span className="text-[10px] font-bold tracking-wide flex items-center gap-2">
                         {formattedTotal}
                         <ArrowRight size={14} />
                       </span>
                    </button>
                 </div>
               )}
               
             </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
