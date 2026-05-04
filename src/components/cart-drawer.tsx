"use client";

import { useCartStore, type CartItem } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, ShoppingBag, ArrowRight } from "lucide-react";

export function CartDrawer() {
  const router = useRouter();
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, isLoggedIn } = useCartStore();

  const parsePrice = (priceStr: string) => parseInt(priceStr.replace(/[^0-9]/g, ''));
  // Summing total exactly like a real ecommerce API engine
  const total = items.reduce((sum: number, item: CartItem) => sum + (parsePrice(item.product.price) * item.quantity), 0);
  
  // Format to match Bluorng's explicit syntax "RS. 17,400"
  const formattedTotal = "RS. " + total.toLocaleString();

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
            className="fixed top-[calc(64px+env(safe-area-inset-top,0px))] right-0 h-[calc(100%-64px-env(safe-area-inset-top,0px))] md:top-0 md:h-full w-[75%] md:w-[420px] bg-[#e5e7eb] z-[401] flex flex-col shadow-2xl rounded-l-[16px] overflow-hidden"
          >
             {/* Header matches desktop grey aesthetic */}
             <div className="flex items-center gap-4 px-6 py-5 text-black bg-[#e5e7eb]">
                <button 
                  onClick={closeCart} 
                  className="p-1 -ml-1 hover:opacity-60 transition-opacity flex items-center justify-center"
                  aria-label="Close cart"
                >
                  <X size={18} strokeWidth={1} />
                </button>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] leading-none">Your Cart</span>
             </div>

             {/* White body area - straightened as requested */}
             <div className="flex-1 bg-white text-black overflow-hidden flex flex-col relative">
               
               <div className="flex-1 overflow-y-auto px-5 pt-6 pb-32">
                  {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-black/20">
                       <ShoppingBag size={48} strokeWidth={1} className="mb-4 drop-shadow-sm" />
                       <p className="font-bold tracking-widest text-[10px] uppercase text-black/40">Your bag is empty.</p>
                    </div>
                  ) : (
                    items.map((item: CartItem, index: number) => (
                      <div key={item.id} className="flex gap-4 mb-6 group">
                         {/* Product Image Square (Tightened sizing) */}
                         <div className="relative w-[72px] h-[72px] rounded-lg bg-gradient-to-br from-[#161616] to-[#252525] overflow-hidden shrink-0 border border-black/10 shadow-sm">
                           {/* Priority layout to avoid popping */}
                           <Image src={item.product.src} alt={item.product.title} fill className="object-contain hover:scale-105 transition-transform duration-500 p-1" priority={index === 0} />
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
                    ))
                  )}
               </div>

               {/* Floating Footer Pill */}
               {items.length > 0 && (
                 <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-white via-white to-white/60 pointer-events-none">
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
