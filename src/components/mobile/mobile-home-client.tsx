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

  const mapShopifyProduct = (p: any): Product => ({
    id: p.id,
    src: p.images?.[0]?.url || "",
    secondarySrc: p.images?.[1]?.url,
    srcs: p.images?.map((img: any) => img.url) || [],
    title: p.title,
    price: formatPrice(p),
    amount: parseFloat(p.priceRange?.minVariantPrice?.amount || "0"),
    desc: p.teaser?.value || p.description || "",
    category: p.productType || "Collection",
    type: p.productType || "General",
    variants: p.variants || [],
    handle: p.handle
  });

  useEffect(() => {
    const fetchData = async () => {
      const all = await getAllProducts();
      const mapped = all.map(mapShopifyProduct);
      setLatestProducts(mapped.slice(0, 4));
      setImportedProducts(mapped.slice(4, 8));
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
      <section className="relative w-full overflow-hidden bg-[#f4f4f4]" style={{ height: '82vh' }}>
        <div className="flex-1 relative h-full overflow-hidden">
          {/* The Scrollable Layer - Touch Area for Swiping */}
          <div
            ref={scrollRef}
            className="absolute inset-0 overflow-x-auto snap-x snap-mandatory hide-scrollbar z-20 overscroll-x-contain"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex h-full" style={{ width: `${repeatedProducts.length * 100}vw` }}>
              {repeatedProducts.map((product, index) => (
                <div
                  key={`scroll-item-${index}`}
                  className="w-screen h-full flex flex-col snap-center flex-shrink-0 items-center justify-start pt-[74vh]"
                >
                  <Link
                    href={`/product/${encodeURIComponent(product.id)}`}
                    className="relative z-30 px-6 py-2 active:opacity-50 transition-opacity"
                  >
                    <span className="text-black/60 text-[9px] font-bold uppercase tracking-[0.3em] border-b border-black/20 pb-0.5">
                      Shop the fit
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* The Animated Images Layer */}
          <div 
            className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none flex items-start justify-center overflow-hidden bg-[#f4f4f4] pt-0"
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
      <div className="relative w-full h-full max-h-[80%] pt-8">
        <Image src={product.src} alt={product.title} fill className="object-contain" sizes="(max-width: 768px) 75vw, 400px" quality={70} />
      </div>
    </motion.div>
  );
}
