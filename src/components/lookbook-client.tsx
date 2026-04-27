"use client";

import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/data";

interface LookbookClientProps {
  products: Product[];
}

export default function LookbookClient({ products }: LookbookClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Repeat the products 30 times as requested
  const repeatedProducts = Array(30).fill(products).flat();
  const totalItems = repeatedProducts.length;

  // Track the scroll of the whole page
  const { scrollYProgress } = useScroll({ container: containerRef });
  
  return (
    <main ref={containerRef} className="bg-[#f9f9fa] text-black font-sans relative h-screen overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
      <div className="flex w-full pt-20 relative">
        {/* LEFT/CENTER: Sticky Carousel */}
        <div className="w-[75%] sticky top-20 h-[calc(100vh-5rem)] flex items-center justify-center z-10 overflow-hidden">
          <div className="relative w-full h-[85%] flex items-center justify-center">
             {repeatedProducts.map((model, index) => (
                <ScrollModel 
                  key={`${model.id}-${index}`}
                  model={model}
                  index={index}
                  total={totalItems}
                  progress={scrollYProgress}
                />
             ))}
          </div>
        </div>

        {/* RIGHT: Synchronized Scrollable Column */}
        <div className="w-[25%] bg-white border-l border-black/5 relative z-30 shadow-[-10px_0_30px_rgba(0,0,0,0.03)]">
           <div className="flex flex-col">
              {repeatedProducts.map((listModel, index) => (
                <div key={`sidebar-${listModel.id}-${index}`} className="min-h-screen p-6 border-b border-black/5 flex flex-col justify-center items-center group snap-start snap-always">
                  <Link href={`/product/${encodeURIComponent(listModel.id)}`} className="relative w-[75%] aspect-[3/4] mb-8 overflow-hidden rounded-sm bg-[#fafafa] flex items-center justify-center pt-8">
                    <div className="relative w-[90%] h-[90%]">
                        <Image 
                        src={listModel.src}
                        alt={listModel.title}
                        fill
                        className="object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        />
                    </div>
                  </Link>
                  <div className="w-full text-center flex flex-col items-center">
                    <Link href={`/product/${encodeURIComponent(listModel.id)}`}>
                      <h4 className="text-sm font-bold uppercase tracking-widest mb-3 hover:opacity-60 transition-opacity">{listModel.title}</h4>
                    </Link>
                    <p className="text-[11px] font-medium text-black/50 leading-relaxed mb-4 px-4 max-w-[90%]">{listModel.desc}</p>
                    <p className="text-sm font-semibold tracking-wider mb-6">{listModel.price}</p>
                    
                    <Link href={`/product/${encodeURIComponent(listModel.id)}`}>
                      <button className="px-10 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black/80 transition-colors rounded-sm">
                        Shop The Look
                      </button>
                    </Link>
                  </div>
               </div>
              ))}
              <div className="h-[20vh] bg-white"></div>
           </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </main>
  );
}

function ScrollModel({ model, index, total, progress }: any) {
  const activeFloat = useTransform(progress, [0, 1], [0, total - 0.7]);
  const relativePosRaw = useTransform(activeFloat, v => index - v);
  const relativePos = useTransform(relativePosRaw, v => Math.max(-1.5, Math.min(v, 4)));

  const x = useTransform(relativePos, [-1, 0, 1, 2, 3], [600, 180, -120, -320, -480], { clamp: true });
  const scale = useTransform(relativePos, [-1, 0, 1, 2, 3], [1.1, 1.0, 0.72, 0.52, 0.35], { clamp: true });
  const opacity = useTransform(relativePos, [-1, -0.5, 0, 1, 2, 3], [0, 0.8, 1, 0.75, 0.35, 0], { clamp: true });
  const zIndex = useTransform(relativePos, v => Math.round(100 - Math.abs(v) * 20));
  
  return (
    <motion.div 
      style={{ 
        x, 
        scale, 
        opacity, 
        zIndex,
        z: 0,
        willChange: "transform, opacity",
        backfaceVisibility: "hidden" as any
      }}
      className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center pointer-events-none"
    >
      <div className="relative w-full h-[85vh] max-w-[80vw]">
        <Image 
          src={model.src} 
          alt={model.title} 
          fill 
          className="object-contain" 
          priority={index < 10} 
          sizes="(max-width: 768px) 100vw, 80vw"
        />
      </div>
    </motion.div>
  );
}

