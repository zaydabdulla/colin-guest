"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Product } from "@/lib/data";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { useCartStore } from "@/lib/store";

export function ProductCard({ 
  product, 
  index = 0, 
  isDense = false 
}: { 
  product: Product, 
  index?: number,
  isDense?: boolean 
}) {
  const [imgIndex, setImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { wishlistItems, toggleWishlist } = useCartStore();
  const isWishlisted = wishlistItems.some((item: Product) => item.id === product.id);

  // We ensure there are multiple images for prototyping tracking
  const srcs = product.srcs && product.srcs.length > 1 ? product.srcs : [product.src, product.src, product.src];

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    setImgIndex((prev) => (prev + 1) % srcs.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex((prev) => (prev - 1 + srcs.length) % srcs.length);
  };

  return (
    <div className="group flex flex-col relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <motion.div 
        initial={{ opacity: 1, y: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ 
          duration: 0.8,
          delay: index % 4 * 0.1, 
          ease: "easeOut"
        } as any}
        className="relative w-full aspect-[4/5] bg-[#f8f8f8] rounded-[24px] mb-3 overflow-hidden flex items-center justify-center p-0 border border-black/5 group-hover:shadow-md transition-shadow duration-500"
      >
        {/* Heart / Bookmark Icon mapped to global store */}
        {!isDense && (
          <button 
            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            className="absolute top-4 right-4 z-40 text-black hover:scale-110 transition-transform"
          >
            <Bookmark size={20} strokeWidth={1.5} className={isWishlisted ? "fill-black" : ""} />
          </button>
        )}

        {/* Image Slider / Swipe Area - Mobile Swipeable, Desktop Hover-Swap */}
        <div 
          className="relative w-full h-full overflow-x-auto md:overflow-hidden snap-x snap-mandatory no-scrollbar flex items-center justify-start transition-transform duration-700 ease-in-out"
          style={{ 
            transform: isHovered && srcs.length > 1 ? 'translateX(-100%)' : 'translateX(0%)'
          }}
        >
          {srcs.map((src, i) => (
            <div key={i} className="flex-none w-full h-full snap-center relative">
              <Link 
                href={`/product/${encodeURIComponent(product.id)}`} 
                className="relative w-full h-full mix-blend-multiply drop-shadow-2xl flex items-center justify-center"
              >
                <Image 
                  src={src}
                  alt={`${product.title} - view ${i + 1}`}
                  fill
                  className="object-contain transition-transform duration-700 group-hover:scale-105"
                  priority={i === 0}
                />
              </Link>
            </div>
          ))}
        </div>

        {/* Dynamic Hover Arrows (Desktop Only) */}
        {isHovered && srcs.length > 1 && !isDense && (
          <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 hidden md:flex justify-between z-40 pointer-events-none">
             <button 
               onClick={handlePrev} 
               className="bg-white/80 p-2.5 rounded-full shadow-sm hover:bg-white text-black transition-colors backdrop-blur-sm hover:scale-105 active:scale-95 pointer-events-auto"
             >
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
             </button>
             <button 
               onClick={handleNext} 
               className="bg-white/80 p-2.5 rounded-full shadow-sm hover:bg-white text-black transition-colors backdrop-blur-sm hover:scale-105 active:scale-95 pointer-events-auto"
             >
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
             </button>
          </div>
        )}
      </motion.div>
      
      {/* Product Details - Hidden in Dense View */}
      {!isDense && (
        <Link href={`/product/${encodeURIComponent(product.id)}`} className="flex justify-between items-end px-2 z-10">
          <div>
            <h4 className="text-xs font-bold tracking-wide mb-1 truncate max-w-[200px] hover:underline cursor-pointer text-black">{product.title}</h4>
            <p className="text-[10px] font-medium tracking-widest text-black/80">{product.price}</p>
          </div>
          <span className="text-sm font-light text-black/60">+</span>
        </Link>
      )}
    </div>
  );
}
