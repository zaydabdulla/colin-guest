"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, Clock, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { type Product } from "@/lib/data";
import { ProductCard } from "@/components/product-card";

// Import Mobile-specific client for isolation
import { MobileWishlistClient } from "@/components/mobile/mobile-wishlist-client";

export default function WishlistDashboard() {
  const router = useRouter();
  const { wishlistItems, isLoggedIn, toggleWishlist } = useCartStore();

  return (
    <>
      {/* MOBILE VIEW: Strict Isolation */}
      <div className="block md:hidden">
        <MobileWishlistClient />
      </div>

      {/* DESKTOP VIEW: Strict Isolation */}
      <main className="hidden md:block min-h-screen bg-white text-black font-sans relative pt-[72px]">
        {/* CONDITION 2: Guest + Has Items (Displays the slim top banner) */}
        {!isLoggedIn && wishlistItems.length > 0 && (
          <div className="w-full border-b border-black/10 flex justify-between items-center py-6 px-12 bg-white">
            <div>
              <h4 className="font-extrabold text-sm tracking-tight mb-1">Don't lose your Lists!</h4>
              <p className="text-[11px] text-black/50 font-medium tracking-wide">Login to save your favorites and access them whenever, wherever!</p>
            </div>
            <Link href="/login"
              className="flex items-center gap-2 bg-[#d7d7d7] text-black px-6 py-3 rounded-full text-[11px] font-bold tracking-wide hover:bg-[#c0c0c0] transition-colors"
            >
              Login to Save <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Header Section */}
        <div className="max-w-[1500px] mx-auto px-8 pt-12 pb-4">
            <h1 className="text-2xl md:text-3xl font-serif italic text-black tracking-tight mb-0.5">
              Wishlist.
            </h1>
            <p className="text-[8px] font-bold uppercase tracking-[0.5em] text-black/40">
              Curated Selection
            </p>
        </div>

        {/* Grid rendering (Visible for Condition 2 & Condition 3) */}
        {wishlistItems.length > 0 && (
           <div className="max-w-[1500px] mx-auto px-8 pt-12 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
               {wishlistItems.map((product: Product, i: number) => (
                 <div key={product.id}>
                    <ProductCard product={product} index={i} />
                 </div>
               ))}
            </div>
           </div>
        )}

        {/* CONDITION 1: Guest + Empty Wishlist (Displays the splash screen) */}
        {!isLoggedIn && wishlistItems.length === 0 && (
          <div className="max-w-[1400px] mx-auto px-8 pt-24 flex flex-col items-center">
            <div className="text-center w-full max-w-[500px] mb-12">
               <h3 className="text-sm font-bold tracking-tight mb-2">Save things as you browse</h3>
               <p className="text-[11px] text-black/60 mb-6 font-medium">Tap ♡ on any product. It lands here so you don't lose it.</p>
               
               <div className="bg-[#fcf3e8] border border-[#f5dab1] rounded-[8px] px-6 py-4 flex items-center justify-center gap-3 mb-8 shadow-sm">
                 <Clock size={16} className="text-[#d98c36]" strokeWidth={2.5} />
                 <span className="text-[11px] font-medium text-[#c47116]">Saves stay through this session. <strong className="font-extrabold text-[#7a4103]">Log in to keep them permanently.</strong></span>
               </div>

               <div className="flex flex-col gap-3">
                 <Link href="/login" className="w-full text-center border border-black rounded-[8px] py-4 text-sm font-bold shadow-sm hover:bg-black/5 transition-colors block">
                   Log in to save permanently →
                 </Link>
                 <button onClick={() => router.back()} className="w-full bg-[#ebebeb] text-black rounded-[8px] py-4 text-sm font-semibold hover:bg-black/10 transition-colors cursor-pointer">
                   Keep browsing first
                 </button>
               </div>
               
               <p className="text-[11px] font-medium text-black/40 mt-6 tracking-wide">
                 No account? <a href="#" className="font-bold text-black underline underline-offset-2 hover:text-black/60 transition-colors">Sign up — it takes a minute</a>
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
            
            <h3 className="text-3xl font-serif italic mb-4 tracking-tight">Your curations await.</h3>
            <p className="text-xs text-black/50 font-medium tracking-widest uppercase mb-10 max-w-[320px] leading-relaxed">
              You haven't saved any pieces yet. Explore the latest collections to define your silhouette.
            </p>

            <Link href="/collections#categories" className="px-12 py-5 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-[0.4em] hover:scale-105 transition-transform shadow-xl">
               Explore Collections
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
