"use client";

import { useCartStore, type CartItem } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, ShoppingBag, ArrowRight, ChevronRight, ArrowLeft, Loader2, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { getAllProducts, createShopifyCheckout } from "@/lib/shopify";
import { Product } from "@/lib/data";
import { signIn as socialSignIn } from "next-auth/react";

export function CartDrawer() {
  const router = useRouter();
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, addToCart } = useCartStore();
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowAuthPrompt(false);
      setIsSocialLoading(false);
    }
  }, [isOpen]);

  const parsePrice = (priceStr: string) => {
    if (!priceStr) return 0;
    return parseInt(priceStr.replace(/[^0-9]/g, ''));
  };
  
  const total = items.reduce((sum: number, item: CartItem) => sum + (parsePrice(item.product.price) * item.quantity), 0);
  const formattedTotal = "RS. " + total.toLocaleString();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const allProducts = await getAllProducts();
        const cartProductIds = new Set(items.map(item => item.product.id));

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
            
            if (items.some(item => item.product.type === p.type)) score += 5;
            if (!hasTop && !hasBottom) score += 5;

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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "contain";
    } else {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
    };
  }, [isOpen]);

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
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-[600]"
          />

          {/* Cart Sidebar Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full md:w-[360px] bg-[#fcfcfc] z-[601] flex flex-col shadow-2xl md:rounded-l-[16px] overflow-hidden border-l border-black/5"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 text-black border-b border-black/[0.04] bg-[#fcfcfc] shrink-0 select-none">
              <div className="flex items-center gap-2">
                <ShoppingBag size={13} strokeWidth={1.2} className="text-black/80" />
                <span className="text-[9.5px] font-light uppercase tracking-[0.28em] text-black/90 leading-none">Your Bag</span>
                <span className="bg-black/[0.04] text-black/50 text-[7px] font-semibold w-4.5 h-4.5 rounded-full flex items-center justify-center ml-1">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-1 -mr-1 hover:opacity-50 transition-opacity flex items-center justify-center text-black/75"
                aria-label="Close cart"
              >
                <X size={12} strokeWidth={1.2} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 bg-white text-black overflow-hidden flex flex-col relative">
              <AnimatePresence mode="wait">
                {showAuthPrompt ? (
                  /* Archived Identity Prompt */
                  <motion.div
                    key="auth-prompt"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-white z-[402] flex flex-col justify-center px-6 py-4"
                  >
                    <button
                      onClick={() => setShowAuthPrompt(false)}
                      className="absolute top-4 left-4 p-1.5 -ml-1.5 hover:opacity-60 transition-opacity flex items-center justify-center text-black"
                      aria-label="Back to cart"
                    >
                      <ArrowLeft size={14} strokeWidth={1.5} />
                    </button>
                    
                    <div className="text-center max-w-[240px] mx-auto w-full">
                      <h3 className="text-base font-serif italic text-black mb-1">Archived Identity</h3>
                      <p className="text-[7.5px] font-bold uppercase tracking-[0.3em] text-black/40 mb-6">
                        Sign in for a premium, swifter checkout
                      </p>
                      
                      <div className="space-y-2.5 w-full">
                        <button
                          type="button"
                          disabled={isSocialLoading}
                          onClick={async () => {
                            setIsSocialLoading(true);
                            try {
                              await socialSignIn('google', { callbackUrl: window.location.href });
                            } catch (error) {
                              setIsSocialLoading(false);
                            }
                          }}
                          className="w-full border border-black/10 py-2.5 rounded-full text-[8.5px] font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-black/5 transition-colors text-black/60 disabled:opacity-50 cursor-pointer"
                        >
                          {isSocialLoading ? (
                            <Loader2 size={11} className="animate-spin text-black/40" />
                          ) : (
                            <>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335" />
                              </svg>
                              Sign in with Google
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => {
                            closeCart();
                            router.push('/login');
                          }}
                          className="w-full bg-black text-white py-2.5 rounded-full text-[8.5px] font-bold uppercase tracking-[0.2em] flex items-center justify-center hover:bg-black/80 transition-colors shadow-sm cursor-pointer"
                        >
                          Sign In / Register
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3 py-4">
                        <div className="h-[1px] bg-black/10 flex-1" />
                        <span className="text-[7px] font-bold text-black/20 uppercase tracking-widest">or</span>
                        <div className="h-[1px] bg-black/10 flex-1" />
                      </div>
                      
                      <button
                        onClick={async () => {
                          setShowAuthPrompt(false);
                          setIsCheckingOut(true);
                          const state = useCartStore.getState();
                          const result = await createShopifyCheckout(items, state.user?.email, state.accessToken);
                          if (result.success && result.url) {
                            window.location.href = result.url;
                            setTimeout(() => setIsCheckingOut(false), 500);
                          } else {
                            alert(result.error || "Failed to initiate checkout");
                            setIsCheckingOut(false);
                          }
                        }}
                        className="text-[8px] font-bold uppercase tracking-[0.25em] text-black/40 hover:text-black transition-colors cursor-pointer"
                      >
                        Continue as Guest →
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* Standard Cart View */
                  <motion.div
                    key="cart-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    {/* Cart Items List */}
                    <div
                      className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-3 custom-scrollbar"
                      data-lenis-prevent
                    >
                      {items.length === 0 ? (
                        <div className="h-48 flex flex-col items-center justify-center text-black/20">
                          <ShoppingBag size={32} strokeWidth={1} className="mb-3 drop-shadow-sm" />
                          <p className="font-bold tracking-widest text-[8.5px] uppercase text-black/40">Your bag is empty.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {items.map((item: CartItem, index: number) => (
                            <div 
                              key={item.id} 
                              className="relative border border-black/5 rounded-xl p-3 bg-white shadow-[0_1px_5px_rgba(0,0,0,0.01)] flex gap-3 group"
                            >
                              {/* Product Image */}
                              <div className="relative w-14 h-14 rounded-lg bg-[#f4f4f5] overflow-hidden shrink-0 border border-black/5 flex items-center justify-center">
                                {item.product.src ? (
                                  <Image 
                                    src={item.product.src} 
                                    alt={item.product.title} 
                                    fill 
                                    className="object-contain p-1 hover:scale-105 transition-transform duration-500" 
                                    priority={index === 0} 
                                  />
                                ) : (
                                  <ShoppingBag size={16} className="text-black/10" />
                                )}
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 flex flex-col justify-between">
                                <div>
                                  <h4 className="font-bold text-[8.5px] tracking-tight uppercase text-black max-w-[82%] truncate">
                                    {item.product.title}
                                  </h4>
                                  <p className="text-[7px] text-black/40 font-bold uppercase tracking-wider mt-0.5">
                                    Size: {item.size.includes('/') ? item.size.split('/').pop()?.trim() : item.size}
                                  </p>
                                </div>

                                {/* Quantity Selector */}
                                <div className="border border-black/10 rounded-full flex items-center px-2 py-0.5 mt-2 w-fit gap-2.5 text-[8.5px] font-bold bg-white select-none">
                                  <button 
                                    onClick={() => updateQuantity(item.id, -1)} 
                                    className="hover:opacity-60 text-[10px] font-medium leading-none"
                                  >
                                    -
                                  </button>
                                  <span className="text-center font-bold text-[8px] min-w-[10px]">{item.quantity}</span>
                                  <button 
                                    onClick={() => updateQuantity(item.id, 1)} 
                                    className="hover:opacity-60 text-[10px] font-medium leading-none"
                                  >
                                    +
                                  </button>
                                </div>

                                {/* Price on Bottom Right */}
                                <span className="absolute bottom-3 right-3 text-[8.5px] font-bold text-black">
                                  {item.product.price}
                                </span>

                                {/* Delete Button on Top Right */}
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="absolute top-3 right-3 w-4 h-4 rounded-full border border-black/5 hover:bg-black/5 hover:border-black/10 flex items-center justify-center text-black/30 hover:text-black transition-all"
                                  aria-label="Remove item"
                                >
                                  <X size={8} strokeWidth={2.5} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {items.length > 3 && (
                        <div className="sticky bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
                      )}
                    </div>

                    {/* Footer Section */}
                    <div className="mt-auto flex flex-col">
                      {/* Suggested Products (Keep Existing Logic, Compact Layout) */}
                      {items.length > 0 && suggestions.length > 0 && (
                        <div className="bg-[#fcfcfc] border-t border-black/5 pt-3.5 pb-2 px-5 relative shrink-0">
                           <h3 className="text-[7.5px] font-bold uppercase tracking-[0.2em] mb-2.5 text-black/40 flex items-center gap-1.5">
                             <span className="w-3.5 h-[1px] bg-black/15" />
                             You May Also Like
                           </h3>
                           
                           <div className="relative group/scroll">
                             <div 
                               ref={scrollContainerRef}
                               onScroll={checkScroll}
                               className="flex gap-3 overflow-x-auto pb-1.5 custom-scrollbar snap-x snap-mandatory"
                             >
                               {suggestions.map((product) => (
                                 <div key={product.id} className="min-w-[130px] max-w-[130px] snap-start group/suggestion relative">
                                   <div className="flex gap-2.5 items-center">
                                     <div className="relative w-11 h-11 rounded-md bg-[#f4f4f5] border border-black/5 overflow-hidden shrink-0 shadow-sm">
                                       {product.src && (
                                         <button 
                                           onClick={() => {
                                             closeCart();
                                             router.push(`/product/${encodeURIComponent(product.id)}`);
                                           }}
                                           className="absolute inset-0 z-10"
                                         >
                                           <Image src={product.src} alt={product.title} fill className="object-cover group-hover/suggestion:scale-110 transition-transform duration-500" />
                                         </button>
                                       )}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                       <button 
                                         onClick={() => {
                                           closeCart();
                                           router.push(`/product/${encodeURIComponent(product.id)}`);
                                         }}
                                         className="text-left w-full"
                                       >
                                         <p className="text-[8px] font-bold text-black truncate uppercase tracking-tight hover:opacity-60 transition-opacity">{product.title}</p>
                                       </button>
                                       <p className="text-[7.5px] text-black/40 font-medium mt-0.5">{product.price}</p>
                                       <button 
                                         onClick={() => addToCart(product, "Free Size")}
                                         className="mt-0.5 text-[7.5px] font-bold uppercase tracking-widest text-black/20 hover:text-black transition-colors"
                                       >
                                         Add +
                                       </button>
                                     </div>
                                   </div>
                                 </div>
                               ))}
                             </div>
         
                             {showScrollArrow && (
                               <div className="absolute right-[-10px] top-0 bottom-0 w-10 flex items-center justify-center pointer-events-none z-10 bg-gradient-to-l from-[#fcfcfc] via-[#fcfcfc]/80 to-transparent">
                                 <motion.div
                                   initial={{ opacity: 0, x: -5 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   className="p-1 rounded-full bg-white shadow-md border border-black/5"
                                 >
                                   <ChevronRight size={10} className="text-black/40" />
                                 </motion.div>
                                </div>
                             )}
                           </div>
                        </div>
                      )}

                      {/* Subtotal & Checkout Call to Action */}
                      {items.length > 0 && (
                        <div className="border-t border-black/5 bg-[#fcfcfc] p-4 shrink-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[7.5px] font-bold text-black/40 uppercase tracking-[0.15em]">Subtotal</span>
                            <span className="text-[10.5px] font-bold text-black">{formattedTotal}</span>
                          </div>
                          <p className="text-[7px] italic text-black/40 font-medium mb-3 text-center">
                            Shipping & taxes calculated at checkout
                          </p>
                          
                          <button
                            disabled={isCheckingOut}
                            onClick={async () => {
                              const state = useCartStore.getState();
                              if (!state.isLoggedIn) {
                                setShowAuthPrompt(true);
                                return;
                              }

                              setIsCheckingOut(true);
                              const result = await createShopifyCheckout(items, state.user?.email, state.accessToken);
                              if (result.success && result.url) {
                                window.location.href = result.url;
                                setTimeout(() => setIsCheckingOut(false), 500);
                              } else {
                                alert(result.error || "Failed to initiate checkout");
                                setIsCheckingOut(false);
                              }
                            }}
                            className={`w-full bg-black text-white px-5 py-3 rounded-full flex justify-center items-center gap-1.5 text-[8px] font-bold tracking-[0.18em] hover:bg-black/85 transition-all shadow-md active:scale-[0.99] ${isCheckingOut ? 'opacity-70 pointer-events-none' : ''} cursor-pointer uppercase`}
                          >
                            {isCheckingOut ? 'Processing...' : 'Proceed to checkout'}
                            <ArrowRight size={9} strokeWidth={2.5} />
                          </button>

                          {/* Trust Badges */}
                          <div className="flex justify-center gap-5 mt-3 text-[6.5px] font-bold text-black/30 tracking-[0.1em] uppercase select-none">
                            <span className="flex items-center gap-1">
                              <ShieldCheck size={9} strokeWidth={2.5} /> Secure Checkout
                            </span>
                            <span className="flex items-center gap-1">
                              <Truck size={9} strokeWidth={2.5} /> Express Shipping
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
