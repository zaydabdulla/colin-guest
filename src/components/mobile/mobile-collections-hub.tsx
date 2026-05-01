"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue } from "framer-motion";
import { Collection, Product } from "@/lib/data";
import { Plus, Bookmark, ChevronRight, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { getAllProducts, getCollectionProducts } from "@/lib/shopify";

interface MobileCollectionsHubProps {
  collections: Collection[];
  allProductsImage: string;
}

export function MobileCollectionsHub({ collections, allProductsImage }: MobileCollectionsHubProps) {
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [importedProducts, setImportedProducts] = useState<any[]>([]);
  const [accessoryProducts, setAccessoryProducts] = useState<any[]>([]);
  const { toggleWishlist, wishlistItems } = useCartStore();

  useEffect(() => {
    const fetchData = async () => {
      const all = await getAllProducts();
      setLatestProducts(all.slice(0, 4));
      setImportedProducts(all.slice(4, 8));
      const acc = await getCollectionProducts('accessories');
      setAccessoryProducts(acc.length > 0 ? acc : all.slice(8, 12));
    };
    fetchData();
  }, []);

  const formatPrice = (p: any) => {
    const amount = p.priceRange?.minVariantPrice?.amount || "0";
    const currency = p.priceRange?.minVariantPrice?.currencyCode || "INR";
    return `${currency} ${parseFloat(amount).toLocaleString()}`;
  };

  // --- STACKED LOOPING CAROUSEL LOGIC ---
  const carouselCollections = useMemo(() => {
    if (collections.length === 0) return [];
    let items = [...collections];
    while (items.length < 6) items = [...items, ...collections];
    return items.slice(0, 6);
  }, [collections]);

  const [activeIndex, setActiveIndex] = useState(2); 
  
  const moveCarousel = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setActiveIndex(prev => (prev === 0 ? carouselCollections.length - 1 : prev - 1));
    } else {
      setActiveIndex(prev => (prev === carouselCollections.length - 1 ? 0 : prev + 1));
    }
  };

  const getPosition = (index: number) => {
    const diff = index - activeIndex;
    const count = carouselCollections.length;
    let finalDiff = diff;
    if (diff > count / 2) finalDiff -= count;
    if (diff < -count / 2) finalDiff += count;
    return finalDiff;
  };

  return (
    <div className="bg-[#f4f4f4] min-h-screen pb-32 font-sans overflow-x-hidden">
      
      {/* 1. LARGE HERO PHOTO */}
      <section className="relative w-full h-[95vh] overflow-hidden bg-transparent">
        <Image
          src="/mobile_hero.png"
          alt="Hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex flex-col justify-end items-center p-16 pb-24">
          <Link 
            href="/collections/all"
            className="text-white/40 text-[9px] font-medium uppercase tracking-[0.4em] border-b border-white/10 pb-2 active:opacity-50 transition-opacity"
          >
            Shop now
          </Link>
        </div>
      </section>

      {/* 2. LATEST DROP SECTION */}
      <section className="pt-6 pb-12 px-6">
        <div className="flex justify-between items-center mb-8 px-1">
          <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/30">Latest drop</h2>
          <Link href="/collections/all" className="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 rounded-full active:bg-black/10 transition-colors">
            <span className="text-[8px] font-bold uppercase tracking-widest text-black/40">Discover more</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-1.5 gap-y-8">
          {latestProducts.map((product) => (
            <div key={product.id} className="flex flex-col">
              <div className="relative aspect-[2/3] bg-[#e8e8e8] rounded-xl overflow-hidden mb-1.5">
                <Link href={`/product/${encodeURIComponent(product.id)}`}>
                  <Image src={product.images?.[0]?.url || "/placeholder.jpg"} alt={product.title} fill className="object-cover" />
                </Link>
                <button onClick={() => toggleWishlist(product)} className="absolute top-1.5 right-1.5 p-2 z-10 text-white transition-opacity active:opacity-50">
                  <Bookmark size={24} className={wishlistItems.some(item => item.id === product.id) ? "fill-white" : "fill-none"} strokeWidth={1.5} />
                </button>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1 z-10 pointer-events-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60 shadow-sm" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 shadow-sm" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 shadow-sm" />
                </div>
              </div>
              <div className="px-1 flex flex-col">
                <div className="flex justify-between items-start w-full">
                  <Link href={`/product/${encodeURIComponent(product.id)}`} className="w-full pr-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-black mb-0.5 truncate">{product.title}</h3>
                  </Link>
                  <button className="text-black/40 shrink-0 mt-[-2px]"><Plus size={16} strokeWidth={1.5} /></button>
                </div>
                <p className="text-[10px] font-bold tracking-wider text-black/60">{formatPrice(product)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. REFINED STACKED COLLECTION SWIPER */}
      <section className="py-24 relative overflow-hidden h-[620px] flex flex-col items-center">
        <div className="px-6 mb-12 text-center">
          <h2 className="text-[9px] font-bold tracking-[0.6em] uppercase text-black/20">Featured Series</h2>
        </div>
        
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative w-full max-w-[340px] h-full flex items-center justify-center px-4">
            <AnimatePresence initial={false}>
              {carouselCollections.map((collection, index) => {
                const pos = getPosition(index);
                if (Math.abs(pos) > 2) return null;

                return (
                  <motion.div
                    key={`${collection.id}-${index}`}
                    style={{ zIndex: 10 - Math.abs(pos) }}
                    initial={false}
                    animate={{
                      scale: 1 - Math.abs(pos) * 0.12,
                      x: pos * 45,
                      opacity: 1,
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 35 }}
                    className="absolute w-full aspect-[2/3] rounded-[48px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] bg-white cursor-pointer"
                    onClick={() => {
                      if (pos !== 0) setActiveIndex(index);
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(_, info) => {
                      if (info.offset.x > 40) moveCarousel('left');
                      if (info.offset.x < -40) moveCarousel('right');
                    }}
                  >
                    <Link href={`/collections/${collection.handle}`} className="block w-full h-full relative">
                      <Image src={collection.image?.url || "/placeholder.jpg"} alt={collection.title} fill className="object-cover" />
                      <div className="absolute inset-0 flex flex-col justify-end items-center pb-8 px-4">
                        <p className="text-white text-[10px] font-bold uppercase tracking-[0.3em] drop-shadow-md">{collection.title}</p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex justify-center gap-1.5 mt-12">
          {carouselCollections.map((_, i) => (
            <div 
              key={i} 
              className={`h-0.5 transition-all duration-700 rounded-full ${activeIndex === i ? "w-8 bg-black" : "w-1.5 bg-black/10"}`}
            />
          ))}
        </div>
      </section>

      {/* 5. IMPORTED PIECES SECTION */}
      <section className="py-12 px-6">
        <div className="flex justify-between items-center mb-8 px-1">
          <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/30">Imported Pieces</h2>
          <Link href="/collections/all" className="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 rounded-full active:bg-black/10 transition-colors">
            <span className="text-[8px] font-bold uppercase tracking-widest text-black/40">Discover more</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-1.5 gap-y-8">
          {importedProducts.map((product) => (
            <div key={product.id} className="flex flex-col">
              <div className="relative aspect-[2/3] bg-[#e8e8e8] rounded-xl overflow-hidden mb-1.5">
                <Link href={`/product/${encodeURIComponent(product.id)}`}>
                  <Image src={product.images?.[0]?.url || "/placeholder.jpg"} alt={product.title} fill className="object-cover" />
                </Link>
                <button onClick={() => toggleWishlist(product)} className="absolute top-1.5 right-1.5 p-2 z-10 text-white transition-opacity active:opacity-50">
                  <Bookmark size={24} className={wishlistItems.some(item => item.id === product.id) ? "fill-white" : "fill-none"} strokeWidth={1.5} />
                </button>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1 z-10 pointer-events-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60 shadow-sm" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 shadow-sm" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 shadow-sm" />
                </div>
              </div>
              <div className="px-1 flex flex-col">
                <div className="flex justify-between items-start w-full">
                  <Link href={`/product/${encodeURIComponent(product.id)}`} className="w-full pr-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-black mb-0.5 truncate">{product.title}</h3>
                  </Link>
                  <button className="text-black/40 shrink-0 mt-[-2px]"><Plus size={16} strokeWidth={1.5} /></button>
                </div>
                <p className="text-[10px] font-bold tracking-wider text-black/60">{formatPrice(product)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="py-24 flex flex-col items-center opacity-5"><p className="text-[10px] font-bold uppercase tracking-[1.4em] text-black">COLIN GUEST</p></div>
    </div>
  );
}
