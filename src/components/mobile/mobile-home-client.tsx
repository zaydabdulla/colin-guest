"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Product, Collection } from "@/lib/data";
import { Plus, Bookmark, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { getAllProducts, getCollectionProducts } from "@/lib/shopify";

interface MobileHomeClientProps {
  products: Product[];
  collections: Collection[];
}

export function MobileHomeClient({ products, collections }: MobileHomeClientProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [vh, setVh] = useState("100vh");
  
  // Collections Hub Data State
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [importedProducts, setImportedProducts] = useState<any[]>([]);
  const { toggleWishlist, wishlistItems } = useCartStore();

  useEffect(() => {
    const fetchData = async () => {
      const all = await getAllProducts();
      setLatestProducts(all.slice(0, 4));
      setImportedProducts(all.slice(4, 8));
    };
    fetchData();
  }, []);

  // Handle dynamic viewport height for mobile browsers
  useEffect(() => {
    const updateHeight = () => {
      if (window.CSS && window.CSS.supports("height", "100dvh")) {
        setVh("100dvh");
      } else {
        setVh(`${window.innerHeight}px`);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const repeatedProducts = [...products, ...products, ...products];

  const { scrollXProgress } = useScroll({
    container: scrollRef,
  });

  const splitRatio = "60%";

  const formatPrice = (p: any) => {
    const amount = p.priceRange?.minVariantPrice?.amount || "0";
    const currency = p.priceRange?.minVariantPrice?.currencyCode || "INR";
    return `${currency} ${parseFloat(amount).toLocaleString()}`;
  };

  // --- STACKED CAROUSEL LOGIC ---
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
    <div className="bg-[#f4f4f4] min-h-screen font-sans overflow-x-hidden">
      
      {/* 1. LOOKBOOK MODELS CAROUSEL (Hero Section) */}
      <section className="relative w-full overflow-hidden bg-[#f4f4f4]" style={{ height: '75vh' }}>
        <div className="flex-1 relative h-full overflow-hidden">
          {/* The Scrollable Layer - Touch Area for Swiping */}
          <div
            ref={scrollRef}
            className="absolute inset-0 overflow-x-auto snap-x snap-mandatory hide-scrollbar z-20 overscroll-x-contain"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex h-full" style={{ width: `${repeatedProducts.length * 100}vw` }}>
              {repeatedProducts.map((_, index) => (
                <div
                  key={`scroll-item-${index}`}
                  className="w-screen h-full flex flex-col snap-center flex-shrink-0"
                />
              ))}
            </div>
          </div>

          {/* The Animated Images Layer */}
          <div 
            className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none flex items-start justify-center overflow-hidden bg-[#f4f4f4] pt-[80px]"
          >
            <div className="relative w-full h-full flex items-start justify-center">
              {repeatedProducts.map((product, index) => (
                <HeroModel
                  key={`hero-${index}`}
                  product={product}
                  index={index}
                  total={repeatedProducts.length}
                  progress={scrollXProgress}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. LATEST DROP SECTION (Brought from Collections Hub) */}
      <section className="pt-0 pb-12">
        <div className="flex justify-between items-center mb-8 px-6">
          <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/30">Latest drop</h2>
          <Link href="/collections/all" className="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 rounded-full active:bg-black/10 transition-colors">
            <span className="text-[8px] font-bold uppercase tracking-widest text-black/40">Discover more</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-1 w-full">
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
              <div className="px-3 flex flex-col pb-6">
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

      {/* 3. STACKED COLLECTION SWIPER (Brought from Collections Hub) */}
      <section className="pt-12 pb-24 relative overflow-hidden h-[620px] flex flex-col items-center">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative w-full max-w-[280px] h-full flex items-center justify-center px-4">
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
                      scale: 1 - Math.abs(pos) * 0.1,
                      x: pos * 50,
                      opacity: 1,
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 35 }}
                    className="absolute w-full aspect-[2/3] rounded-[18px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] bg-white cursor-pointer"
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

      {/* 4. IMPORTED PIECES SECTION (Brought from Collections Hub) */}
      <section className="py-12">
        <div className="flex justify-between items-center mb-8 px-6">
          <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/30">Imported Pieces</h2>
          <Link href="/collections/all" className="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 rounded-full active:bg-black/10 transition-colors">
            <span className="text-[8px] font-bold uppercase tracking-widest text-black/40">Discover more</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-1 w-full">
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
              <div className="px-3 flex flex-col pb-6">
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

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

function HeroModel({ product, index, total, progress }: { product: Product, index: number, total: number, progress: any }) {
  const activeIndex = useTransform(progress, [0, 1], [0, total - 1]);
  const relativeIndex = useTransform(activeIndex, (v) => index - v);

  const scale = useTransform(relativeIndex, [-2, -1, 0, 1, 2], [0.6, 0.85, 1.1, 0.85, 0.6]);
  const opacity = useTransform(relativeIndex, [-2, -1.2, -0.8, 0, 0.8, 1.2, 2], [0, 0.4, 0.95, 1, 0.95, 0.4, 0]);
  const x = useTransform(relativeIndex, [-2, -1, 0, 1, 2], ["-110%", "-62%", "0%", "62%", "110%"]);
  const zIndex = useTransform(relativeIndex, (v) => Math.round(100 - Math.abs(v) * 20));

  return (
    <motion.div
      style={{ scale, opacity, x, zIndex, position: "absolute", transformOrigin: "center center", willChange: "transform, opacity", translateZ: 0 }}
      className="w-[75vw] max-w-[360px] h-full flex items-center justify-center pointer-events-none"
    >
      <div className="relative w-full h-full max-h-[92%] pt-8">
        <Image src={product.src} alt={product.title} fill className="object-contain" sizes="(max-width: 768px) 75vw, 400px" quality={70} />
      </div>
    </motion.div>
  );
}
