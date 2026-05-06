"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, Clock, ArrowRight, Plus } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { type Product } from "@/lib/data";

export function MobileWishlistClient() {
  const router = useRouter();
  const { wishlistItems, isLoggedIn, toggleWishlist } = useCartStore();

  return (
    <div className="min-h-screen bg-white text-black font-sans relative pt-[60px]">
      {/* CONDITION 2: Guest + Has Items (Displays the slim top banner) */}
      {!isLoggedIn && wishlistItems.length > 0 && (
        <div className="w-full border-b border-black/10 flex flex-col justify-between items-center py-6 px-6 bg-white gap-4">
          <div className="text-center">
            <h4 className="font-extrabold text-sm tracking-tight mb-1 uppercase">Don't lose your Lists!</h4>
            <p className="text-[10px] text-black/50 font-medium tracking-wide uppercase">Login to save your favorites and access them whenever, wherever!</p>
          </div>
          <Link href="/login"
            className="flex items-center gap-2 bg-[#d7d7d7] text-black px-6 py-3 rounded-full text-[11px] font-bold tracking-wide hover:bg-[#c0c0c0] transition-colors w-full justify-center uppercase"
          >
            Login to Save <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Grid rendering (Visible for Condition 2 & Condition 3) */}
      {wishlistItems.length > 0 && (
         <div className="max-w-[1500px] mx-auto px-4 pt-8 pb-40">
            {/* 2 columns on mobile for optimal scanning */}
             <div className="grid grid-cols-2 gap-1 px-0 w-full">
                {wishlistItems.map((product: Product) => (
                  <div key={product.id} className="flex flex-col group relative">
                     {/* Product Image Container */}
                     <div className="w-full">
                       <div className="relative aspect-[2/3] w-full bg-[#e8e8e8] overflow-hidden rounded-xl mb-1.5">
                         {/* Swipable Carousel */}
                         <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar relative">
                           {(product.srcs && product.srcs.length > 0 ? product.srcs : [product.src]).map((src, i) => (
                             <div key={i} className="w-full h-full flex-none snap-center relative">
                               <Link href={`/product/${encodeURIComponent(product.id)}`} className="w-full h-full block">
                                 <Image
                                   src={src || "/placeholder.jpg"}
                                   alt={`${product.title} - view ${i + 1}`}
                                   fill
                                   className="object-cover"
                                   sizes="50vw"
                                   priority={i === 0}
                                 />
                               </Link>
                             </div>
                           ))}

                           {/* Bookmark Ribbon Icon */}
                           <button 
                             onClick={(e) => { 
                               e.preventDefault(); 
                               e.stopPropagation(); 
                               toggleWishlist(product); 
                             }} 
                             className="absolute top-1.5 right-1.5 z-20 text-white drop-shadow-sm transition-opacity active:opacity-50"
                           >
                             <Bookmark 
                               className={`w-6 h-6 fill-white stroke-white`} 
                               strokeWidth={1.5} 
                             />
                           </button>

                           {/* Pagination Dots Indicator */}
                           {(product.srcs && product.srcs.length > 1) && (
                             <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10 pointer-events-none">
                               {product.srcs.map((_, i) => (
                                 <div key={i} className="w-1.5 h-1.5 rounded-full bg-white shadow-sm opacity-60"></div>
                               ))}
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                     
                     <div className="flex flex-col px-2 pb-4">
                        <div className="flex justify-between items-start w-full">
                          <Link href={`/product/${encodeURIComponent(product.id)}`} className="w-full pr-1">
                            <h3 className="text-[7px] font-bold uppercase tracking-widest text-black mb-0.5">
                              {product.title}
                            </h3>
                          </Link>
                          <button className="text-black/40 hover:text-black shrink-0 mt-[-4px]">
                            <Plus className="w-3 h-3" strokeWidth={1.5} />
                          </button>
                        </div>
                        <p className="text-[6.5px] font-bold tracking-wider text-black/60">
                          {product.price}
                        </p>
                     </div>
                  </div>
                ))}
             </div>
         </div>
      )}

      {/* CONDITION 1: Guest + Empty Wishlist (Displays the splash screen) */}
      {!isLoggedIn && wishlistItems.length === 0 && (
        <div className="max-w-[1400px] mx-auto px-6 pt-20 flex flex-col items-center">
          <div className="text-center w-full max-w-[500px] mb-12">
             <div className="mb-8 flex justify-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border border-black/5 shadow-inner">
                  <Bookmark size={32} strokeWidth={1} className="text-black/20" />
                </div>
             </div>
             <h3 className="text-lg font-bold tracking-tight mb-2 uppercase">Save things as you browse</h3>
             <p className="text-[11px] text-black/60 mb-8 font-medium px-4 uppercase tracking-wider">Tap the bookmark on any product. It lands here so you don't lose it.</p>
             
             <div className="bg-[#fcf3e8] border border-[#f5dab1] rounded-[12px] px-6 py-4 flex items-center justify-center gap-3 mb-8 shadow-sm text-left">
               <Clock size={16} className="text-[#d98c36] shrink-0" strokeWidth={2.5} />
               <span className="text-[10px] font-medium text-[#c47116] uppercase tracking-tight">Saves stay through this session. <strong className="font-extrabold text-[#7a4103]">Log in to keep them permanently.</strong></span>
             </div>

             <div className="flex flex-col gap-3">
               <Link href="/login" className="w-full text-center bg-black text-white rounded-full py-4 text-[11px] font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-transform">
                 Log in to save permanently →
               </Link>
               <button onClick={() => router.back()} className="w-full bg-[#f3f3f3] text-black rounded-full py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-[#e5e5e5] transition-colors">
                 Keep browsing first
               </button>
             </div>
             
             <p className="text-[10px] font-bold text-black/40 mt-8 tracking-widest uppercase">
               No account? <Link href="/signup" className="text-black underline underline-offset-4 transition-colors">Sign up</Link>
             </p>
          </div>
        </div>
      )}

      {/* CONDITION 3: Logged In + Empty Wishlist (Premium Editorial Landing) */}
      {isLoggedIn && wishlistItems.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-8 py-24 text-center">
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-black/5 blur-3xl rounded-full scale-150" />
            <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl border border-black/5">
              <Bookmark size={32} strokeWidth={1} className="text-black/20" />
            </div>
          </div>
          
          <h3 className="text-2xl font-serif italic mb-4 tracking-tight uppercase">Your curations await.</h3>
          <p className="text-[10px] text-black/50 font-medium tracking-[0.2em] uppercase mb-10 max-w-[320px] leading-relaxed">
            You haven't saved any pieces yet. Explore the latest collections to define your silhouette.
          </p>

          <Link href="/collections/all" className="px-12 py-5 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-[0.4em] active:scale-95 transition-transform shadow-xl">
             Explore Collections
          </Link>
        </div>
      )}
    </div>
  );
}
