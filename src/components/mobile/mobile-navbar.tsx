"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { Search, ShoppingBag, Menu, X, User, Home, Bookmark, Compass } from "lucide-react";

import { useCartStore } from "@/lib/store";
import { usePathname } from "next/navigation";

export function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { openCart, items, isLoggedIn, wishlistItems, openWishlist } = useCartStore();
  const pathname = usePathname();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* 1. TOP ICONS: Menu (Left), Logo (Center), Wishlist + Cart (Right) */}
      <div className="fixed top-0 left-0 right-0 z-[500] bg-white h-[64px] safe-top px-5">
        <div className="grid grid-cols-3 items-center h-full text-black w-full relative">
          
          {/* Left: 2-Line Menu Icon */}
          <div className="flex justify-start">
            <button
              onClick={() => setIsOpen(true)}
              className="p-3 -ml-3 pointer-events-auto transition-transform active:scale-95"
              aria-label="Open Menu"
            >
              <div className="w-4.5 flex flex-col gap-[2.5px]">
                <div className="h-[1.2px] w-full bg-black"></div>
                <div className="h-[1.2px] w-2/3 bg-black"></div>
              </div>
            </button>
          </div>

          {/* Center: Logo Image (1/3 width) */}
          <div className="flex justify-center items-center h-full">
            <Link
              href="/"
              className="pointer-events-auto flex items-center justify-center h-[40px] w-full max-w-[100px] relative"
            >
              <div className="relative w-full h-full overflow-visible">
                <Image
                  src="/logo_cg.png"
                  alt="COLIN GUEST"
                  fill
                  className="object-contain object-center scale-[4.8] pointer-events-none"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Right: Wishlist & Cart (1/3 width) */}
          <div className="flex justify-end items-center gap-1">
            <Link
              href="/wishlist"
              className="relative p-2 transition-transform active:scale-95 pointer-events-auto"
              aria-label="Wishlist"
            >
              <Bookmark className="w-5.5 h-5.5" strokeWidth={1.2} />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black text-[8px] font-bold text-white border border-white">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => {
                console.log("Cart opened");
                openCart();
              }}
              className="relative p-2 transition-transform active:scale-95 pointer-events-auto"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5.5 h-5.5" strokeWidth={1.2} />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black text-[8px] font-bold text-white border border-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>


      {/* 2. BOTTOM FLOATING NAV AREA (Pill) */}
      <div className="fixed bottom-6 left-0 right-0 z-40 px-6 flex items-end justify-center pointer-events-none">
        {/* Glass Pill */}
        <div className="pointer-events-auto flex items-center justify-between px-8 py-4 bg-white/20 backdrop-blur-lg backdrop-saturate-150 border border-white/20 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-[280px] transition-all">
          <Link href="/" className="text-black hover:opacity-70 transition-opacity">
            <Home className="w-6 h-6" strokeWidth={1.5} />
          </Link>

          <Link href="/collections/all" className="text-black hover:opacity-70 transition-opacity">
            <Compass className="w-6 h-6" strokeWidth={1.5} />
          </Link>

          <button className="text-black hover:opacity-70 transition-opacity">
            <Search className="w-6 h-6" strokeWidth={1.5} />
          </button>

          <Link href={isLoggedIn ? "/profile" : "/login"} className="text-black hover:opacity-70 transition-opacity">
            <User className="w-6 h-6" strokeWidth={1.5} />
          </Link>
        </div>
      </div>


      {/* 3. FULL SCREEN MENU DRAWER */}
      <div
        className={`fixed inset-0 z-[510] bg-white transition-transform duration-500 ease-in-out ${
          isOpen ? "translate-x-0 flex flex-col pointer-events-auto" : "-translate-x-full hidden pointer-events-none"
        }`}
      >
        <div className="flex flex-col h-full relative">
          {/* Close Button Top Right */}
          <div className="absolute top-6 right-6 z-10">
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-black transition-transform active:scale-95 bg-gray-100 rounded-full"
              aria-label="Close Menu"
            >
              <X className="w-6 h-6" strokeWidth={1.5} />
            </button>
          </div>

          {/* Menu Links */}
          <nav className="flex-1 px-8 pt-32 pb-10 overflow-y-auto flex flex-col gap-10">
            <Link href="/collections/all" className="block text-4xl font-black uppercase tracking-tight text-black">
              Shop All
            </Link>
            <Link href="/collections/new" className="block text-4xl font-black uppercase tracking-tight text-black">
              New Arrivals
            </Link>
            <Link href="/collections/tops" className="block text-4xl font-black uppercase tracking-tight text-black">
              Tops
            </Link>
            <Link href="/collections/bottoms" className="block text-4xl font-black uppercase tracking-tight text-black">
              Bottoms
            </Link>
            <Link href="/about" className="block text-4xl font-black uppercase tracking-tight text-black">
              About
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}


