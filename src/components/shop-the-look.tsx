"use client";

import { Product } from "@/lib/data";
import { useCartStore } from "@/lib/store";
import Image from "next/image";
import { Plus, Check, ShoppingBag } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ShopTheLookProps {
  currentProduct: Product;
  allProducts: Product[];
}

export function ShopTheLook({ currentProduct, allProducts }: ShopTheLookProps) {
  const { addToCart, openCart } = useCartStore();
  const [isAdded, setIsAdded] = useState(false);

  const pairing = useMemo(() => {
    const type = (currentProduct.type || "").toLowerCase();
    const title = (currentProduct.title || "").toLowerCase();

    // Comprehensive keyword mapping for evolving collections
    const topKeywords = ["shirt", "hoodie", "top", "jacket", "tee", "t-shirt", "vest", "knitwear", "sweater", "blazer", "outerwear", "coat"];
    const bottomKeywords = ["jeans", "pants", "trousers", "shorts", "cargo", "skirt", "joggers", "leggings", "denim", "bottom"];

    const isTop = topKeywords.some(k => type.includes(k) || title.includes(k));
    const isBottom = bottomKeywords.some(k => type.includes(k) || title.includes(k));

    // Ensure we only suggest products that are currently in stock
    const availablePool = allProducts.filter(p => p.id !== currentProduct.id && p.variants?.some(v => v.availableForSale));

    let candidates: Product[] = [];

    if (isTop) {
      // If viewing a Top, prioritize finding a Bottom
      candidates = availablePool.filter(p => {
        const pType = (p.type || "").toLowerCase();
        const pTitle = (p.title || "").toLowerCase();
        return bottomKeywords.some(k => pType.includes(k) || pTitle.includes(k));
      });
    } else if (isBottom) {
      // If viewing a Bottom, prioritize finding a Top
      candidates = availablePool.filter(p => {
        const pType = (p.type || "").toLowerCase();
        const pTitle = (p.title || "").toLowerCase();
        return topKeywords.some(k => pType.includes(k) || pTitle.includes(k));
      });
    }

    // Secondary stage: If no strict cross-category match, find something of the same type
    if (candidates.length === 0) {
      candidates = availablePool.filter(p => p.type === currentProduct.type);
    }

    // Final Fallback: Any available product from the Archive
    if (candidates.length === 0) {
      candidates = availablePool;
    }

    return candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : null;
  }, [currentProduct, allProducts]);

  if (!pairing) return null;

  const totalAmount = currentProduct.amount + pairing.amount;
  const formattedTotal = currentProduct.price.startsWith("RS") 
    ? `RS. ${totalAmount.toLocaleString()}` 
    : `$${totalAmount.toLocaleString()}`;

  const handleAddBoth = () => {
    // Add current product (default size if available)
    const currentSize = currentProduct.variants?.find(v => v.availableForSale)?.title || "M";
    addToCart(currentProduct, currentSize);

    // Add pairing product (default size if available)
    const pairingSize = pairing.variants?.find(v => v.availableForSale)?.title || "M";
    addToCart(pairing, pairingSize);

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      openCart();
    }, 1500);
  };

  return (
    <div className="w-full my-1 border-y border-black/[0.05] bg-[#fcfcfc] overflow-hidden">
      <div className="w-full px-6 md:px-10 py-4 md:py-6 relative group/container">
        
        <div className="max-w-[1400px] mx-auto relative z-10 px-4">
          <div className="flex flex-col lg:flex-row items-stretch justify-center gap-2 lg:gap-0">
            
            {/* Left Column: Title */}
            <div className="flex items-center space-y-2 max-w-[180px] text-center lg:text-left shrink-0 py-4">
              <div className="space-y-1">
                <h2 className="text-2xl md:text-3xl font-serif italic text-black tracking-tight leading-tight">
                  <span className="font-light inline md:block opacity-30 mr-1 md:mr-0 not-italic">Elevate</span>
                  The Look
                </h2>
              </div>
            </div>

            {/* Architectural Divider 1 */}
            <div className="w-[1px] h-auto bg-black/[0.03] mx-6 lg:mx-12 hidden lg:block" />

            {/* Center Column: Products */}
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 py-4">
              <div className="flex items-center gap-6 md:gap-12 relative">
                  {/* Product 1 */}
                  <div className="relative group/item text-center max-w-[160px] md:max-w-[280px]">
                    <div className="w-36 h-48 md:w-56 md:h-72 relative overflow-hidden rounded-sm transition-all duration-700 shadow-sm border border-black/5 bg-white mx-auto">
                      <Image src={currentProduct.src} alt={currentProduct.title} fill className="object-cover" />
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-[10px] font-bold text-black truncate uppercase tracking-tight">{currentProduct.title}</p>
                      <p className="text-[11px] font-medium text-black/50">{currentProduct.price}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <Plus size={16} strokeWidth={1} className="text-black/30" />
                  </div>

                  {/* Product 2 */}
                  <div className="relative group/item text-center max-w-[160px] md:max-w-[280px]">
                    <div className="w-36 h-48 md:w-56 md:h-72 relative overflow-hidden rounded-sm transition-all duration-700 shadow-sm border border-black/5 bg-white mx-auto">
                      <Image src={pairing.src} alt={pairing.title} fill className="object-cover" />
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-[10px] font-bold text-black truncate uppercase tracking-tight">{pairing.title}</p>
                      <p className="text-[11px] font-medium text-black/50">{pairing.price}</p>
                    </div>
                  </div>
                </div>
              </div>

            {/* Architectural Divider 2 */}
            <div className="w-[1px] h-auto bg-black/[0.03] mx-6 lg:mx-12 hidden lg:block" />

            {/* Right Column: Action Area */}
            <div className="flex items-center justify-center py-4">
              <div className="flex flex-col items-center text-center min-w-[180px]">
                  <div className="mb-4">
                    <p className="text-[9px] font-semibold text-black/20 uppercase tracking-[0.3em] mb-2 italic">Combined Total</p>
                    <p className="text-lg md:text-xl font-light tracking-[0.05em] text-black">{formattedTotal}</p>
                  </div>
                  
                  <button
                    onClick={handleAddBoth}
                    disabled={isAdded}
                    className={`group relative h-9 px-6 rounded-full border transition-all duration-500 overflow-hidden ${
                      isAdded 
                        ? 'bg-black text-white border-black' 
                        : 'bg-black/[0.03] text-black border-black/10 hover:bg-black hover:text-white hover:border-black'
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {isAdded ? (
                        <motion.div
                          key="added"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 text-[8px] font-medium uppercase tracking-[0.2em]"
                        >
                          <Check size={10} strokeWidth={2} />
                          Added Both
                        </motion.div>
                      ) : (
                        <motion.div
                          key="add"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[8px] font-medium uppercase tracking-[0.3em]"
                        >
                          Buy The Duo
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
              </div>
            </div>
            </div>
          </div>
      </div>
    </div>
  );
}
