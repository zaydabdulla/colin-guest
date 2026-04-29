"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/data";

interface MobileLookbookProps {
  products: Product[];
}

export default function MobileLookbook({ products }: MobileLookbookProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [vh, setVh] = useState("100vh");

  // Handle dynamic viewport height for mobile browsers
  useEffect(() => {
    const updateHeight = () => {
      // Use dvh if supported, otherwise fallback to innerHeight
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

  // We'll use a higher number of items to make the scroll feel infinite or at least long enough
  const repeatedProducts = [...products, ...products, ...products];

  const { scrollXProgress } = useScroll({
    container: scrollRef,
  });

  // Responsive split: Tall screens get more image space, short screens preserve text space
  // We use a CSS variable for consistency between the scroll layer and image layer
  const splitRatio = "min(65%, calc(100% - 180px))";

  return (
    <div 
      className="fixed inset-0 bg-[#f9f9fa] flex flex-col overflow-hidden font-sans select-none"
      style={{ height: vh }}
    >
      {/* Header - Adaptive padding for notches */}
      <header className="h-[64px] pt-[env(safe-area-inset-top,0px)] flex items-center justify-between px-6 shrink-0 bg-[#f9f9fa] border-b border-black/[0.03] z-30 box-content">
        <div className="w-10 flex items-center justify-start">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </div>

        <div className="relative h-5 w-28">
          <Image
            src="/logo_cg.png"
            alt="COLIN GUEST"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="flex items-center gap-5 w-20 justify-end">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
      </header>

      {/* Main Container - Refactored for global scroll and responsiveness */}
      <div className="flex-1 relative overflow-hidden">
        {/* 1. The Scrollable Layer (Captures touch/scroll anywhere) */}
        <div
          ref={scrollRef}
          className="absolute inset-0 overflow-x-auto snap-x snap-mandatory hide-scrollbar z-20 overscroll-x-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex h-full" style={{ width: `${repeatedProducts.length * 100}vw` }}>
            {repeatedProducts.map((product, index) => (
              <div
                key={`scroll-item-${index}`}
                className="w-screen h-full flex flex-col snap-center flex-shrink-0"
              >
                {/* Top Spacer: Transparent touch area for images */}
                <div style={{ height: `calc(${splitRatio})` }} className="w-full" />

                {/* Bottom Content: Visible product details */}
                <div 
                  className="flex-1 w-full bg-white flex flex-col items-center justify-start px-8 pt-4 pb-[env(safe-area-inset-bottom,20px)] border-t border-black/[0.02] shadow-[0_-10px_30px_rgba(0,0,0,0.02)]"
                >
                  <Link
                    href={`/product/${encodeURIComponent(product.id)}`}
                    className="flex flex-col items-center active:opacity-70 transition-opacity w-full max-w-[280px]"
                  >
                    <h2 className="text-[12px] sm:text-[14px] font-bold uppercase tracking-[0.25em] text-black mb-1.5 text-center leading-tight">
                      {product.title}
                    </h2>
                    <p className="text-[10px] sm:text-[11px] font-medium text-[#8E8E8E] text-center leading-[1.6] mb-3 line-clamp-2">
                      {product.desc}
                    </p>
                    <div className="text-[13px] sm:text-[15px] font-bold tracking-widest text-black uppercase border-b border-black pb-0.5">
                      {product.price}
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. The Animated Images Layer (Behind the scrollable layer) */}
        <div 
          className="absolute top-0 left-0 w-full z-10 pointer-events-none flex items-center justify-center overflow-hidden bg-[#f9f9fa]"
          style={{ height: `calc(${splitRatio})` }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
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

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
          overscroll-behavior-y: none;
          background-color: #f9f9fa;
        }
        .font-serif {
          font-family: 'Playfair Display', serif;
        }
      `}</style>
    </div>
  );
}

function HeroModel({ product, index, total, progress }: { product: Product, index: number, total: number, progress: any }) {
  const activeIndex = useTransform(progress, [0, 1], [0, total - 1]);
  const relativeIndex = useTransform(activeIndex, (v) => index - v);

  // Responsive scaling and offsets
  const scale = useTransform(
    relativeIndex,
    [-2, -1, 0, 1, 2],
    [0.6, 0.85, 1.1, 0.85, 0.6]
  );

  const opacity = useTransform(
    relativeIndex,
    [-2, -1.2, -0.8, 0, 0.8, 1.2, 2],
    [0, 0.4, 0.95, 1, 0.95, 0.4, 0]
  );

  // Using vw for offsets makes it responsive to width, but we can also use dynamic logic
  const x = useTransform(
    relativeIndex,
    [-2, -1, 0, 1, 2],
    ["-110%", "-62%", "0%", "62%", "110%"]
  );

  const zIndex = useTransform(relativeIndex, (v) => {
    const distance = Math.abs(v);
    return Math.round(100 - distance * 20);
  });

  return (
    <motion.div
      style={{
        scale,
        opacity,
        x,
        zIndex,
        position: "absolute",
        transformOrigin: "center center",
        willChange: "transform, opacity",
        translateZ: 0,
      }}
      className="w-[75vw] max-w-[360px] h-full flex items-center justify-center pointer-events-none py-4"
    >
      <div className="relative w-full h-full max-h-[85%]">
        <Image
          src={product.src}
          alt={product.title}
          fill
          className="object-contain"
          priority={index >= 8 && index <= 12}
          sizes="(max-width: 768px) 75vw, 400px"
          quality={70}
        />
      </div>
    </motion.div>
  );
}
