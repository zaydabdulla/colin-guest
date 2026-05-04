"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingBag, Bookmark, User, ChevronDown, X, ChevronRight, Menu } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useCartStore } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { getAllCollections, searchProducts } from "@/lib/shopify";
import { Collection, Product } from "@/lib/data";

import { motion } from "framer-motion";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { items, openCart, wishlistItems, isLoggedIn, user, logout } = useCartStore();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowScrollArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
  }, [searchResults, collections, isSearchOpen]);

  useEffect(() => {
    const fetchCollections = async () => {
      const fetchedCollections = await getAllCollections();
      setCollections(fetchedCollections.filter((c: Collection) => c.title.toLowerCase() !== 'landing page'));
    };
    fetchCollections();
  }, []);

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

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const navLinks = [
    { name: "The Lookbook", href: "/" },
    { name: "Collections", href: "/collections" },
    { name: "About", href: "/about" },
  ];

  const isAboutPage = pathname === "/about";
  const isCollectionsPage = pathname === "/collections";

  // Liquid Logic: Transparent at top, frosted on scroll
  const getNavStyles = () => {
    if (isSearchOpen) return "bg-transparent border-none shadow-none";
    if (isAboutPage) return "bg-transparent border-none";
    if (isCollectionsPage) {
      return scrolled
        ? "bg-white/40 backdrop-blur-2xl shadow-sm"
        : "bg-transparent border-none";
    }
    return "bg-[#f9f9fa]/90 backdrop-blur-md border-b border-black/5";
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-700 ease-out hidden md:block ${getNavStyles()}`}>
      <div className={`grid grid-cols-3 items-center px-8 h-[72px] ${isSearchOpen && !isAboutPage ? "bg-white" : ""} ${isAboutPage ? "text-white" : "text-black"}`}>
        {/* LEFT: Menu & Branding */}
        <div className="flex justify-start items-center gap-4">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className={`p-2 transition-transform active:scale-95 ${isAboutPage ? "text-white" : "text-black"}`}
          >
            <Menu size={20} />
          </button>
          <Link href="/" className={`relative h-[72px] w-64 transition-opacity flex items-center overflow-hidden ml-[-24px] ${isAboutPage ? "invert brightness-200" : "hover:opacity-60"}`}>
            <Image
              src="/logo_cg.png"
              alt="COLIN GUEST"
              fill
              className="object-cover"
              priority
            />
          </Link>
        </div>

        {/* CENTER: Editorial Navigation */}
        <div className="hidden md:flex justify-center gap-12 text-[10px] tracking-[0.2em] uppercase font-bold">
          {navLinks.map((link) => {
            const isActive = link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 transition-colors ${isAboutPage
                  ? isActive ? 'text-white' : 'text-white/50 hover:text-white'
                  : isActive ? 'text-black' : 'text-black/40 hover:text-black'
                  }`}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className={`absolute bottom-0 left-0 right-0 h-[1px] ${isAboutPage ? "bg-white" : "bg-black"}`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* RIGHT: Constant Icons Cluster */}
        <div className={`flex items-center justify-end gap-6 text-xs font-semibold tracking-widest uppercase ${isAboutPage ? "text-white" : "text-black"}`}>
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`cursor-pointer transition-colors ${isAboutPage ? "text-white/50 hover:text-white" : "text-black/40 hover:text-black"}`}
          >
            <Search size={18} />
          </button>

          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className={`flex items-center gap-1 transition-colors ${isAboutPage ? "text-white/50 hover:text-white" : "text-black/40 hover:text-black"}`}
              >
                <User size={18} strokeWidth={1.5} className={isAboutPage ? "fill-white" : "fill-black"} />
                <ChevronDown size={12} className={`transition-transform duration-300 ${isAccountOpen ? "rotate-180" : ""}`} />
              </button>

              {isAccountOpen && (
                <>
                  {/* Backdrop for closing */}
                  <div className="fixed inset-0 z-[-1]" onClick={() => setIsAccountOpen(false)} />

                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`absolute right-0 mt-4 w-48 py-2 rounded-lg shadow-2xl border backdrop-blur-xl z-[100] ${isAboutPage
                      ? "bg-black/80 border-white/10 text-white"
                      : "bg-white/80 border-black/5 text-black"
                      }`}
                  >
                    <div className="px-4 py-2 border-b border-white/10 mb-1">
                      <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">Account</p>
                    </div>
                    <Link 
                      href="/profile" 
                      onClick={() => setIsAccountOpen(false)}
                      className="block px-4 py-2.5 text-[11px] font-bold hover:bg-black/5 transition-colors tracking-widest uppercase"
                    >
                      Profile
                    </Link>
                    <Link 
                      href="/orders" 
                      onClick={() => setIsAccountOpen(false)}
                      className="block px-4 py-2.5 text-[11px] font-bold hover:bg-black/5 transition-colors tracking-widest uppercase"
                    >
                      Orders
                    </Link>
                    <div className="h-[1px] bg-black/5 my-1" />
                    <button
                      onClick={() => {
                        logout();
                        setIsAccountOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-[11px] font-bold hover:bg-red-50 hover:text-red-600 transition-colors tracking-widest uppercase"
                    >
                      Logout
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          ) : (
            <Link href="/login" className={`cursor-pointer block transition-colors ${isAboutPage ? "text-white/50 hover:text-white" : "text-black/40 hover:text-black"}`}>
              <User size={18} strokeWidth={1.5} />
            </Link>
          )}

          <Link href="/wishlist" className={`cursor-pointer block relative transition-colors ${isAboutPage ? "text-white/50 hover:text-white" : "text-black/40 hover:text-black"}`}>
            <Bookmark size={18} strokeWidth={1.5} />
            {wishlistItems.length > 0 && (
              <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${isAboutPage ? "bg-white" : "bg-black"}`} />
            )}
          </Link>

          <div
            className={`flex items-center gap-2 cursor-pointer transition-colors ${isAboutPage ? "text-white/50 hover:text-white" : "text-black/40 hover:text-black"}`}
            onClick={openCart}
          >
            <ShoppingBag size={18} />
            <span className="text-[10px] font-bold">({items.length})</span>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isSearchOpen ? "auto" : 0,
          opacity: isSearchOpen ? 1 : 0
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`overflow-hidden rounded-b-[40px] transition-colors duration-500 border-none ${isAboutPage
          ? "bg-black/20 backdrop-blur-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]"
          : "bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]"
          }`}
      >
        <div className="px-10 py-5 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-6 mb-3 relative">
            <div className="relative flex-1">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search here..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`w-full rounded-[16px] py-3 px-8 text-[14px] outline-none border-none transition-all font-medium ${isAboutPage
                  ? "bg-white/10 text-white placeholder:text-white/20 focus:bg-white/20"
                  : "bg-[#f4f4f5] text-black placeholder:text-black/20"
                  }`}
              />
              <Search
                size={18}
                onClick={() => handleSearchSubmit()}
                className={`absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer transition-opacity hover:opacity-60 ${isAboutPage ? "text-white/40" : "text-black/20"}`}
              />
            </div>
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery("");
              }}
              className={`p-2 rounded-full transition-all duration-300 ${isAboutPage ? "hover:bg-white/10" : "hover:bg-black/5"}`}
            >
              <X size={24} strokeWidth={1} className={isAboutPage ? "text-white/80" : "text-black/80"} />
            </button>
          </div>
 
          <div className="mb-1">
            <h3 className={`text-[9px] font-sans font-bold uppercase tracking-[0.2em] mb-2 ml-2 ${isAboutPage ? "text-white/60" : "text-black"}`}>
              {searchQuery.trim() ? (isSearching ? "Searching..." : `Results for "${searchQuery}"`) : "Collections"}
            </h3>
 
            <div className={`rounded-[32px] p-1.5 px-2 relative ${isAboutPage ? "bg-white/5" : "bg-[#f0f0f0]"}`}>
              <div 
                ref={scrollContainerRef}
                onScroll={checkScroll}
                className="flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory min-h-[160px]"
              >
                {searchQuery.trim() ? (
                  searchResults.length > 0 ? (
                    searchResults.map((product, idx) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04, duration: 0.4 }}
                        className="snap-start"
                      >
                        <Link
                          href={`/product/${encodeURIComponent(product.id)}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="group flex-shrink-0 w-[140px] block"
                        >
                          <div className={`rounded-[24px] p-1 pb-3 flex flex-col h-full transition-all duration-500 border-none ${isAboutPage
                            ? "bg-white/10 shadow-[0_2px_8px_rgba(255,255,255,0.02)] hover:bg-white/20 hover:shadow-[0_4px_15px_rgba(255,255,255,0.05)]"
                            : "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.04)]"
                            }`}>
                            <div className="aspect-[1/1] relative rounded-[20px] overflow-hidden mb-2">
                              {product.src ? (
                                <Image
                                  src={product.src}
                                  alt={product.title}
                                  fill
                                  className="object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110"
                                />
                              ) : (
                                <div className={`w-full h-full flex items-center justify-center font-sans font-bold text-[10px] uppercase tracking-[0.2em] ${isAboutPage ? "bg-white/5 text-white/20" : "bg-gray-50 text-black/10"}`}>
                                  {product.title}
                                </div>
                              )}
                            </div>
                            <p className={`text-[9px] font-sans font-bold text-center px-2 line-clamp-1 uppercase tracking-[0.2em] mb-0.5 ${isAboutPage ? "text-white" : "text-black"}`}>
                              {product.title}
                            </p>
                            <p className={`text-[8px] font-sans font-medium text-center opacity-40 uppercase tracking-widest ${isAboutPage ? "text-white" : "text-black"}`}>
                              {product.price}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    ))
                  ) : (
                    !isSearching && (
                      <div className={`w-full py-12 text-center text-[11px] font-bold uppercase tracking-widest opacity-30 ${isAboutPage ? "text-white" : "text-black"}`}>
                        No products found
                      </div>
                    )
                  )
                ) : (
                  collections.map((collection, idx) => (
                    <motion.div
                      key={collection.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: isSearchOpen ? 1 : 0, y: isSearchOpen ? 0 : 10 }}
                      transition={{ delay: 0.1 + idx * 0.04, duration: 0.4 }}
                      className="snap-start"
                    >
                      <Link
                        href={`/collections/${collection.handle}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="group flex-shrink-0 w-[160px] block"
                      >
                        <div className={`rounded-[28px] p-1.5 pb-4 flex flex-col h-full transition-all duration-500 border-none ${isAboutPage
                          ? "bg-white/10 shadow-[0_2px_8px_rgba(255,255,255,0.02)] hover:bg-white/20 hover:shadow-[0_4_15px_rgba(255,255,255,0.05)]"
                          : "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.04)]"
                          }`}>
                          <div className="aspect-[1/1] relative rounded-[22px] overflow-hidden mb-3">
                            {collection.image ? (
                              <Image
                                src={collection.image.url}
                                alt={collection.image.altText || collection.title}
                                fill
                                className="object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110"
                              />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center font-sans font-bold text-[10px] uppercase tracking-[0.2em] ${isAboutPage ? "bg-white/5 text-white/20" : "bg-gray-50 text-black/10"}`}>
                                {collection.title}
                              </div>
                            )}
                          </div>
                          <p className={`text-[10px] font-sans font-bold text-center px-1 line-clamp-1 uppercase tracking-[0.2em] ${isAboutPage ? "text-white" : "text-black"}`}>
                            {collection.title}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Scroll Indicator Arrow */}
              {showScrollArrow && (
                <div className={`absolute right-0 top-0 bottom-0 w-24 flex items-center justify-end pr-6 pointer-events-none z-10 bg-gradient-to-l from-[#f0f0f0] via-[#f0f0f0]/80 to-transparent rounded-r-[38px] ${isAboutPage ? "from-black/20 via-black/10" : ""}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-2.5 rounded-full bg-white shadow-lg border border-black/5"
                  >
                    <ChevronRight size={18} className="text-black/40" />
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      {/* Desktop Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
            />
            
            {/* Drawer Content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[400px] bg-white z-[201] flex flex-col shadow-2xl"
            >
              <div className="p-8 flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30">Menu</span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 px-12 py-12 flex flex-col gap-8">
                {[
                  { name: "Shop All", href: "/collections/all" },
                  { name: "Bestsellers", href: "/collections/bestsellers" },
                  { name: "New Arrival", href: "/collections/new-arrivals" },
                  { name: "Login", href: "/login" },
                  { name: "About", href: "/about" },
                ].map((link, idx) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                  >
                    <Link 
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-2xl font-bold uppercase tracking-[0.15em] hover:text-black/40 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="p-12 border-t border-black/5 space-y-8">
                <div className="flex gap-8">
                  <a href="https://www.instagram.com/colin__guest/" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                  </a>
                  <a href="https://wa.me/yourwhatsappnumber" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08c0 4.84-3.87 8.77-8.64 8.77-1.54 0-3.05-.41-4.37-1.21l-4.27 1.12 1.13-4.16c-.86-1.28-1.32-2.78-1.32-4.52C4.54 6.24 8.4 2.31 13.17 2.31c4.77 0 8.83 3.93 8.83 8.77zM17.48 14.19c-.26-.14-1.54-.76-1.78-.85-.24-.09-.42-.14-.59.14-.17.28-.68.85-.83 1.03-.15.19-.3.21-.56.07-.26-.14-1.1-.4-2.1-1.3-.77-.69-1.3-1.53-1.45-1.8-.15-.26-.01-.41.12-.54.12-.13.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.59-1.42-.81-1.95-.21-.51-.43-.44-.59-.45-.15-.01-.32-.01-.49-.01-.17 0-.45.06-.68.32-.24.25-.9.88-.9 2.15s.92 2.5 1.05 2.68c.13.17 1.8 2.76 4.36 3.86.61.26 1.09.42 1.46.54.61.2 1.17.17 1.6.11.49-.07 1.54-.63 1.76-1.24.21-.61.21-1.13.15-1.24-.07-.12-.24-.19-.5-.33z"/>
                </svg>
                  </a>
                </div>
                <p className="text-[8px] font-bold uppercase tracking-[0.4em] opacity-20">Architectural Integrity</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
