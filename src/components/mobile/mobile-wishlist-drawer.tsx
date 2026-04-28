"use client";

import { useCartStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, Bookmark, ArrowRight, Trash2, ShoppingBag } from "lucide-react";
import { Product } from "@/lib/data";

export function WishlistDrawer() {
  const { 
    wishlistItems, 
    isWishlistOpen, 
    closeWishlist, 
    toggleWishlist,
    addToCart,
    openCart
  } = useCartStore();

  const handleMoveToCart = (product: Product) => {
    // Add to cart with a default size (usually the first one if available, but here we'll just use a placeholder or prompt)
    // For now, since we don't have a size picker in the drawer, we'll just add it or maybe just open the product page.
    // Looking at the store, addToCart requires a size.
    // So let's just provide a "View Product" button instead, or if we want to be fancy, a link.
  };

  return (
    <AnimatePresence>
      {isWishlistOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWishlist}
            className="fixed inset-0 bg-black/50 z-[100]"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:max-w-[420px] bg-[#e5e7eb] z-[101] flex flex-col shadow-2xl"
          >
             {/* Header matches CartDrawer exactly */}
             <div className="flex items-center justify-between px-5 py-4 text-black bg-[#e5e7eb]">
                <span className="text-[13px] font-medium tracking-wide leading-none uppercase">Your Wishlist</span>
                <button onClick={closeWishlist} className="hover:opacity-60 transition-opacity">
                  <X size={18} strokeWidth={1} />
                </button>
             </div>

             {/* Content Area */}
             <div className="flex-1 bg-white text-black rounded-t-xl overflow-hidden flex flex-col relative shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
               
               <div className="flex-1 overflow-y-auto px-5 pt-5 pb-32">
                  {wishlistItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-black/20">
                       <Bookmark size={48} strokeWidth={1} className="mb-4 drop-shadow-sm" />
                       <p className="font-bold tracking-widest text-[10px] uppercase text-black/40">Your wishlist is empty.</p>
                       <button 
                        onClick={closeWishlist}
                        className="mt-6 text-[10px] font-bold uppercase tracking-widest text-black underline underline-offset-4"
                       >
                         Continue Browsing
                       </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {wishlistItems.map((product: Product, index: number) => (
                        <div key={product.id} className="flex gap-4 group">
                           {/* Product Image Square */}
                           <div className="relative w-[85px] h-[105px] rounded-lg bg-[#f5f5f5] overflow-hidden shrink-0 border border-black/5 shadow-sm">
                             <Image 
                               src={product.src} 
                               alt={product.title} 
                               fill 
                               className="object-contain hover:scale-105 transition-transform duration-500 p-2 mix-blend-multiply" 
                               priority={index === 0} 
                             />
                           </div>

                           <div className="flex-1 flex flex-col py-1">
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h4 className="font-extrabold text-[11px] tracking-tight text-black uppercase">{product.title}</h4>
                                  <p className="text-[9px] text-black/60 font-medium mt-1 uppercase tracking-wider">
                                    {product.category || "COLLECTION"}
                                  </p>
                                </div>
                                <span className="text-[10px] font-bold text-black">{product.price}</span>
                              </div>
                              
                              <div className="mt-auto flex items-center gap-3">
                                <Link 
                                  href={`/product/${encodeURIComponent(product.id)}`}
                                  onClick={closeWishlist}
                                  className="flex-1 bg-black text-white text-[9px] font-bold py-2 rounded-full text-center uppercase tracking-widest hover:bg-black/80 transition-colors"
                                >
                                  View Details
                                </Link>
                                <button 
                                  onClick={() => toggleWishlist(product)}
                                  className="p-2 rounded-full border border-black/10 hover:bg-black/5 transition-colors text-black/40 hover:text-black"
                                  title="Remove from wishlist"
                                >
                                  <Trash2 size={14} strokeWidth={1.5} />
                                </button>
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
               </div>

               {/* Footer Link to full page if they have items */}
               {wishlistItems.length > 0 && (
                 <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-white via-white to-white/60 pointer-events-none">
                    <Link 
                      href="/wishlist"
                      onClick={closeWishlist}
                      className="w-full pointer-events-auto bg-black text-white px-6 py-[18px] rounded-[2rem] flex justify-center items-center shadow-lg hover:scale-[1.02] transition-transform"
                    >
                       <span className="text-[11px] font-bold uppercase tracking-[0.2em]">View Full Dashboard</span>
                       <ArrowRight size={14} className="ml-2" />
                    </Link>
                 </div>
               )}
               
             </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
