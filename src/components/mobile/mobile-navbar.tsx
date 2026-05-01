"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { Search, ShoppingBag, Menu, X, User, Home, Bookmark, Compass, Camera, Send, ChevronRight } from "lucide-react";

import { useCartStore } from "@/lib/store";
import { getAllCollections, searchProducts } from "@/lib/shopify";
import { Collection, Product } from "@/lib/data";

export function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { openCart, items, isLoggedIn, wishlistItems, openWishlist } = useCartStore();

  const isAboutPage = pathname === "/about" || pathname === "/about/";
  const isCollectionsHub = pathname === "/collections" || pathname === "/collections/";
  const isTransparentPage = isAboutPage || isCollectionsHub;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowScrollArrow(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
  }, [searchResults, collections, isSearchOpen]);

  // Fetch collections for initial search state
  useEffect(() => {
    const fetchCollections = async () => {
      const fetchedCollections = await getAllCollections();
      setCollections(fetchedCollections.filter((c: Collection) => c.title.toLowerCase() !== 'landing page'));
    };
    fetchCollections();
  }, []);

  // Search logic (debounced)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const results = await searchProducts(searchQuery);
          const mappedResults: Product[] = results.map((p: any) => ({
            id: p.id,
            src: p.images[0]?.url || "/placeholder.jpg",
            title: p.title,
            price: `${p.priceRange.minVariantPrice.amount} ${p.priceRange.minVariantPrice.currencyCode}`,
            amount: parseFloat(p.priceRange.minVariantPrice.amount),
            desc: p.description || "",
            category: p.category?.name || p.productType || "Result",
            shopifyCategory: p.category?.name,
            type: p.productType || "General"
          }));
          setSearchResults(mappedResults);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Focus search input when overlay opens - REMOVED to prevent keyboard popping on icon touch
  /*
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);
  */

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearchSubmit();
  };

  // Close menu/search when route changes
  useEffect(() => {
    setIsOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Lock body scroll when menu/search is open
  useEffect(() => {
    if (isOpen || isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isSearchOpen]);

  return (
    <>
      {/* 1. TOP ICONS: Menu (Left), Logo (Center), Wishlist + Cart (Right) */}
      <div className={`fixed top-0 left-0 right-0 z-[500] h-[64px] safe-top px-5 transition-colors duration-500 ${
        isTransparentPage ? "bg-transparent" : "bg-white"
      }`}>
        <div className={`grid grid-cols-3 items-center h-full w-full relative transition-colors duration-500 ${
          isTransparentPage ? "text-white" : "text-black"
        }`}>
          
          {/* Left: 2-Line Menu Icon */}
          <div className="flex justify-start">
            <button
              onClick={() => setIsOpen(true)}
              className="p-3 -ml-3 pointer-events-auto transition-transform active:scale-95"
              aria-label="Open Menu"
            >
              <div className="w-4.5 flex flex-col gap-[2.5px]">
                <div className={`h-[1.2px] w-full ${isTransparentPage ? "bg-white" : "bg-black"}`}></div>
                <div className={`h-[1.2px] w-2/3 ${isTransparentPage ? "bg-white" : "bg-black"}`}></div>
              </div>
            </button>
          </div>

          {/* Center: Logo Image (1/3 width) */}
          <div className="flex justify-center items-center h-full">
            <Link
              href="/"
              className="pointer-events-auto flex items-center justify-center h-[40px] w-full max-w-[100px] relative"
            >
              <div className={`relative w-full h-full overflow-visible ${isTransparentPage ? "invert brightness-[10]" : ""}`}>
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
                <span className={`absolute top-1.5 right-1.5 flex h-3 w-3 items-center justify-center rounded-full text-[7px] font-semibold border ${
                  isTransparentPage ? "bg-white text-black border-black" : "bg-black text-white border-white"
                }`}>
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
                <span className={`absolute top-1.5 right-1.5 flex h-3 w-3 items-center justify-center rounded-full text-[7px] font-semibold border ${
                  isTransparentPage ? "bg-white text-black border-black" : "bg-black text-white border-white"
                }`}>
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
        <div className="pointer-events-auto flex items-center justify-between px-8 py-3.5 bg-white/[0.03] backdrop-blur-3xl backdrop-saturate-[1.8] border border-white/20 rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.15),0_12px_40px_rgba(0,0,0,0.12)] w-full max-w-[280px] transition-all">
          <Link href="/" className={`${pathname === "/" ? "text-black" : "text-black/40"} transition-colors active:scale-90`}>
            <Home className="w-5.5 h-5.5" strokeWidth={1.5} />
          </Link>

          <Link href="/collections/all" className={`${pathname.startsWith("/collections") ? "text-black" : "text-black/40"} transition-colors active:scale-90`}>
            <Compass className="w-5.5 h-5.5" strokeWidth={1.5} />
          </Link>

          <button 
            onClick={() => setIsSearchOpen(true)}
            className={`${isSearchOpen ? "text-black" : "text-black/40"} transition-colors active:scale-90`}
          >
            <Search className="w-5.5 h-5.5" strokeWidth={1.5} />
          </button>

          <Link href={isLoggedIn ? "/profile" : "/login"} className={`${pathname === "/profile" || pathname === "/login" ? "text-black" : "text-black/40"} transition-colors active:scale-90`}>
            <User className="w-5.5 h-5.5" strokeWidth={1.5} />
          </Link>
        </div>
      </div>


      {/* 3. COMPACT MENU DRAWER */}
      {/* Overlay Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[505] transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 3. EDITORIAL SIDE MENU */}
      {/* Overlay Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/15 backdrop-blur-[2px] z-[505] transition-opacity duration-500"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 bottom-0 w-[75%] max-w-[260px] z-[510] bg-white/90 backdrop-blur-3xl shadow-[20px_0_80px_rgba(0,0,0,0.05)] transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) rounded-r-[32px] border-r border-white/20 ${
          isOpen ? "translate-x-0 flex flex-col pointer-events-auto" : "-translate-x-full pointer-events-none"
        }`}
      >
        <div className="flex flex-col h-full relative pt-16 pb-12">
          {/* Close Button - Minimalist */}
          <div className="absolute top-8 right-8 z-10">
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-black/40 hover:text-black transition-colors"
              aria-label="Close Menu"
            >
              <X className="w-5 h-5" strokeWidth={1} />
            </button>
          </div>

          {/* Menu Branding (Very Small) */}
          <div className="px-10 mb-8">
            <span className="text-[7px] font-semibold uppercase tracking-[0.5em] text-black/20">Index</span>
          </div>

          {/* Main Links - Editorial Style */}
          <nav className="flex-1 px-10 flex flex-col gap-2 overflow-y-auto no-scrollbar">
            {[
              { name: "Shop All", href: "/collections/all", num: "01" },
              { name: "New Arrivals", href: "/collections/new", num: "02" },
              { name: "Tops", href: "/collections/tops", num: "03" },
              { name: "Bottoms", href: "/collections/bottoms", num: "04" },
              { name: "About", href: "/about", num: "05" },
            ].map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={isOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.5 }}
              >
                <Link 
                  href={link.href} 
                  className="group flex items-baseline gap-4 py-1.5"
                >
                  <span className="text-[6px] font-medium text-black/20 group-hover:text-black transition-colors tabular-nums">{link.num}</span>
                  <span className="text-[12px] font-medium uppercase tracking-[0.25em] text-black/60 group-hover:text-black transition-colors">
                    {link.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Footer Contents - Compressed */}
          <div className="px-10 space-y-8">
            <div className="flex gap-6 items-center">
              <a 
                href="https://www.instagram.com/colin__guest/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-black/30 hover:text-black transition-colors" 
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <Link href="#" className="text-black/30 hover:text-black transition-colors" aria-label="Twitter">
                <Send size={14} strokeWidth={1.5} />
              </Link>
            </div>
            
            <div className="space-y-1.5">
              <p className="text-[6px] font-semibold text-black/10 uppercase tracking-[0.3em]">© 2024 Colin Guest</p>
              <p className="text-[6px] font-medium text-black/10 uppercase tracking-[0.3em]">Architectural Identity</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SEARCH OVERLAY */}
      {/* Backdrop */}
      {isSearchOpen && !isTransparentPage && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[590] transition-opacity duration-500"
          onClick={() => setIsSearchOpen(false)}
        />
      )}

      <motion.div
        initial={{ y: "-100%" }}
        animate={{ 
          y: isSearchOpen ? 0 : "-100%" 
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-[600] flex flex-col rounded-b-[24px] overflow-hidden ${
          isTransparentPage 
            ? "bg-transparent backdrop-blur-3xl border-none" 
            : "bg-white shadow-[0_10px_40px_rgba(0,0,0,0.12)]"
        }`}
      >
        <div className="flex flex-col pt-[env(safe-area-inset-top,20px)] pb-6">
          {/* Search Header */}
          <div className="px-6 py-2.5 flex items-center gap-3 mt-1">
            <div className="relative flex-1">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`w-full rounded-full py-2.5 px-6 text-[16px] outline-none border-none transition-all font-medium ${
                  isTransparentPage 
                    ? "bg-white/10 text-white placeholder:text-white/20 focus:bg-white/20" 
                    : "bg-[#f4f4f5] text-black placeholder:text-black/30"
                }`}
              />
              <Search
                size={16}
                onClick={() => handleSearchSubmit()}
                className={`absolute right-5 top-1/2 -translate-y-1/2 ${
                  isTransparentPage ? "text-white/40" : "text-black/30"
                }`}
              />
            </div>
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery("");
              }}
              className={`p-2 rounded-full ${
                isTransparentPage ? "bg-white/10 text-white" : "bg-black/5 text-black"
              }`}
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>

          {/* Search Results / Categories */}
          <div className="flex-1 overflow-y-auto pb-4">
            <h3 className={`px-6 text-[8px] font-bold uppercase tracking-[0.3em] mb-2 mt-4 ${
              isTransparentPage ? "text-white/40" : "text-black/30"
            }`}>
              {searchQuery.trim() ? (isSearching ? "Searching..." : `Results for "${searchQuery}"`) : "Collections"}
            </h3>

            <div className={`mx-6 rounded-[24px] p-1.5 relative ${
              isTransparentPage ? "bg-white/5" : "bg-[#f4f4f5]"
            }`}>
              <div 
                ref={scrollContainerRef}
                onScroll={checkScroll}
                className="flex gap-2.5 overflow-x-auto no-scrollbar snap-x snap-mandatory py-1 px-1"
              >
                {searchQuery.trim() ? (
                  searchResults.length > 0 ? (
                    searchResults.map((product, idx) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="snap-start flex-shrink-0 w-[110px]"
                      >
                        <Link
                          href={`/product/${encodeURIComponent(product.id)}`}
                          onClick={() => setIsSearchOpen(false)}
                          className={`flex flex-col h-full rounded-[16px] p-1 pb-3 transition-all ${
                            isTransparentPage 
                              ? "bg-white/10 text-white" 
                              : "bg-white text-black shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                          }`}
                        >
                          <div className="aspect-square relative rounded-[12px] overflow-hidden mb-2">
                            <Image
                              src={product.src}
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <p className="text-[8px] font-semibold uppercase tracking-[0.15em] px-2 line-clamp-1">
                            {product.title}
                          </p>
                          <p className="text-[7px] font-medium opacity-30 uppercase tracking-widest px-2 mt-0.5">
                            {product.price}
                          </p>
                        </Link>
                      </motion.div>
                    ))
                  ) : (
                    !isSearching && (
                      <div className={`w-full py-6 text-center text-[9px] font-bold uppercase tracking-widest opacity-30 ${
                        isTransparentPage ? "text-white" : "text-black"
                      }`}>
                        No products found
                      </div>
                    )
                  )
                ) : (
                  collections.map((collection, idx) => (
                    <motion.div
                      key={collection.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="snap-start flex-shrink-0 w-[110px]"
                    >
                      <Link
                        href={`/collections/${collection.handle}`}
                        onClick={() => setIsSearchOpen(false)}
                        className={`flex flex-col h-full rounded-[16px] p-1 pb-3 transition-all ${
                          isAboutPage 
                            ? "bg-white/10 text-white" 
                            : "bg-white text-black shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                        }`}
                      >
                        <div className="aspect-square relative rounded-[12px] overflow-hidden mb-2">
                          {collection.image ? (
                            <Image
                              src={collection.image.url}
                              alt={collection.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-black/5 flex items-center justify-center">
                              <Search size={14} className="opacity-10" />
                            </div>
                          )}
                        </div>
                        <p className="text-[8px] font-semibold uppercase tracking-[0.15em] px-2 line-clamp-1">
                          {collection.title}
                        </p>
                        <p className="text-[7px] font-medium opacity-30 uppercase tracking-widest px-2 mt-0.5">
                          Discover
                        </p>
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
              
              {/* Scroll Indicator Arrow */}
              {showScrollArrow && (
                <div className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-end pr-2 pointer-events-none z-10 bg-gradient-to-l from-[#f4f4f5] via-[#f4f4f5]/80 to-transparent rounded-r-[24px]">
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-1.5 rounded-full bg-white shadow-sm"
                  >
                    <ChevronRight size={12} className="text-black/40" />
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
