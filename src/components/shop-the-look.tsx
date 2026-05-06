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

    let candidates = [];

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
    <div className="w-full my-6 border-y border-black/[0.05] bg-[#fcfcfc] overflow-hidden">
      <div className="w-full px-6 md:px-10 py-6 md:py-8 relative group/container">
        {/* Architectural vertical lines for full width rhythm */}
        <div className="absolute top-0 left-1/4 w-[1px] h-full bg-black/[0.02] pointer-events-none hidden md:block" />
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-black/[0.02] pointer-events-none hidden md:block" />
        <div className="absolute top-0 right-1/4 w-[1px] h-full bg-black/[0.02] pointer-events-none hidden md:block" />
        
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 md:gap-20 lg:gap-32">
            
            {/* Left Column: Title */}
            <div className="lg:flex-1 space-y-2 max-w-[220px] text-center lg:text-left">
              <div className="space-y-1">
                <p className="text-[8px] font-semibold uppercase tracking-[0.4em] text-black/20 italic">Archive Duo</p>
                <h2 className="text-xl md:text-2xl font-medium uppercase tracking-[0.1em] leading-tight text-black">
                  <span className="italic font-light inline md:block md:opacity-30 mr-1 md:mr-0">Elevate</span>
                  The Look
                </h2>
              </div>
              <p className="text-[10px] font-medium text-black/30 leading-tight italic hidden lg:block">
                “Architectural balance.”
              </p>
            </div>

            {/* Center Column: Products */}
            <div className="flex flex-col md:flex-row items-center gap-6 lg:gap-14">
              <div className="flex items-center gap-6 md:gap-12 relative">
                {/* Product 1 */}
                <div className="relative group/item text-center max-w-[120px] md:max-w-[140px]">
                  <div className="w-20 h-28 md:w-24 md:h-32 relative overflow-hidden rounded-sm transition-all duration-700 shadow-sm border border-black/5 bg-white mx-auto">
                    <Image src={currentProduct.src} alt={currentProduct.title} fill className="object-cover" />
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <p className="text-[8px] font-bold text-black truncate uppercase tracking-tight">{currentProduct.title}</p>
                    <p className="text-[9px] font-medium text-black/50">{currentProduct.price}</p>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <Plus size={10} strokeWidth={1} className="text-black/30" />
                </div>

                {/* Product 2 */}
                <div className="relative group/item text-center max-w-[120px] md:max-w-[140px]">
                  <div className="w-20 h-28 md:w-24 md:h-32 relative overflow-hidden rounded-sm transition-all duration-700 shadow-sm border border-black/5 bg-white mx-auto">
                    <Image src={pairing.src} alt={pairing.title} fill className="object-cover" />
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <p className="text-[8px] font-bold text-black truncate uppercase tracking-tight">{pairing.title}</p>
                    <p className="text-[9px] font-medium text-black/50">{pairing.price}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Action */}
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
  );
}
