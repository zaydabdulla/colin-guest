"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/lib/store";

export function WishlistPopup() {
  const { wishlistPopupProduct, clearWishlistPopup } = useCartStore();
  const [phase, setPhase] = useState<1 | 2>(1);

  // Lifecyle execution loops matching the buttery Phase 1 vs Phase 2 crossfade
  useEffect(() => {
    if (wishlistPopupProduct) {
      setPhase(1); // Reset to Phase 1 ('Item Saved') initially
      
      const phase2Timer = setTimeout(() => {
        setPhase(2); // Crossfade morphs into Button after 1500ms
      }, 1500);

      const dismissTimer = setTimeout(() => {
        clearWishlistPopup(); // Unmount physically offscreen flawlessly after 5s
      }, 5000);

      return () => {
        clearTimeout(phase2Timer);
        clearTimeout(dismissTimer);
      };
    }
  }, [wishlistPopupProduct, clearWishlistPopup]);

  return (
    <AnimatePresence>
      {wishlistPopupProduct && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-8 right-8 z-[100] w-[340px] bg-white rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.12)] border border-black/5 flex items-center p-3 gap-4"
        >
          {/* Left Block: Bounded Thumbnail */}
          <div className="w-[84px] h-[84px] bg-[#ebebeb] rounded-[16px] relative flex-shrink-0 overflow-hidden">
             {/* Note Object.contain to safely respect specific PNG cuts without morphing dimensions */}
            {wishlistPopupProduct.src ? (
              <Image 
                src={wishlistPopupProduct.src} 
                alt={wishlistPopupProduct.title} 
                fill 
                className="object-contain p-2 mix-blend-multiply"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[8px] font-bold text-black/20 uppercase tracking-widest">No Image</span>
              </div>
            )}
          </div>

          {/* Right Block: Liquid Logic Framer Module */}
          <div className="flex-1 relative flex items-center h-full min-h-[84px]">
            <AnimatePresence mode="wait">
              {phase === 1 ? (
                <motion.div
                  key="phase1"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5 }}
                  transition={{ duration: 0.2 }}
                  className="text-[13px] font-semibold tracking-tight text-black flex items-center h-full w-full pl-2"
                >
                  Item Saved
                </motion.div>
              ) : (
                <motion.div
                  key="phase2"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col justify-center h-full w-full"
                >
                  <p className="text-[11px] font-medium leading-tight mb-3 text-black pr-2">
                     {wishlistPopupProduct.title}
                  </p>
                  
                  {/* Clean black route button accurately mapped to image_17 proportions */}
                  <Link 
                    href="/wishlist"
                    onClick={clearWishlistPopup}
                    className="bg-black text-white text-[10px] font-bold tracking-wide py-2.5 rounded-full text-center hover:bg-black/80 transition-colors mr-3 shadow-sm"
                  >
                    View Wishlist
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
