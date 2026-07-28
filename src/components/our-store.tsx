"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowUpRight, Compass, Maximize2, MapPin, X, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * FEATURE TOGGLE: Set to false to hide the Store section
 */
export const SHOW_OUR_STORE = true;

interface StoreAngle {
  id: string;
  tag: string;
  src: string;
  fallbackSrc: string;
}

const STORE_ANGLES: StoreAngle[] = [
  {
    id: "1",
    tag: "SANCTUARY LOUNGE",
    src: "/store1.jpg",
    fallbackSrc: "/collections_hero.jpg",
  },
  {
    id: "2",
    tag: "ARCHIVAL RUNWAY RACK",
    src: "/store2.jpg",
    fallbackSrc: "/login.jpg",
  },
  {
    id: "3",
    tag: "VIP SUITE",
    src: "/store3.jpg",
    fallbackSrc: "/mobile_hero.png",
  },
  {
    id: "4",
    tag: "BOUTIQUE FACADE",
    src: "/store4.jpg",
    fallbackSrc: "/collections_hero.jpg",
  },
  {
    id: "5",
    tag: "EDITORIAL DISPLAY",
    src: "/store5.jpg",
    fallbackSrc: "/login.jpg",
  },
];

interface OurStoreProps {
  show?: boolean;
  className?: string;
}

export function OurStore({ show = SHOW_OUR_STORE, className = "" }: OurStoreProps) {
  const [activeAngleIndex, setActiveAngleIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!show) return null;

  const currentAngle = STORE_ANGLES[activeAngleIndex];
  const currentSrc = failedImages[currentAngle.id] ? currentAngle.fallbackSrc : currentAngle.src;

  const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=Areekode+Malappuram+Kerala";

  const nextAngle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveAngleIndex((prev) => (prev + 1) % STORE_ANGLES.length);
  };

  const prevAngle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveAngleIndex((prev) => (prev - 1 + STORE_ANGLES.length) % STORE_ANGLES.length);
  };

  return (
    <section className={`w-full py-8 md:py-12 bg-white relative z-10 ${className}`}>
      <div className="max-w-md sm:max-w-lg md:max-w-xl mx-auto px-4 sm:px-6">
        
        {/* Top Header Pill - Kinetic GPS & Beacon */}
        <div className="mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-black/5 rounded-full border border-black/5">
            <Compass size={10} className="text-black/60 animate-spin-slow" />
            <span className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-black/60 font-sans">
              FLAGSHIP BOUTIQUE
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-black/40">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>AREEKODE, KERALA</span>
          </div>
        </div>

        {/* High-Fashion Interactive Store Card */}
        <div className="bg-[#fcfcfc] border border-black/10 rounded-3xl p-3 sm:p-4 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col gap-3 group relative">
          
          {/* Interactive Photo Frame with 5-Angle Carousel */}
          <div 
            onClick={() => setIsLightboxOpen(true)}
            className="relative w-full aspect-[4/4.5] sm:aspect-[16/11] bg-neutral-100 rounded-2xl overflow-hidden cursor-pointer border border-black/5"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentAngle.id}
                initial={{ opacity: 0.4, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.4, scale: 0.98 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={currentSrc}
                  alt={currentAngle.tag}
                  fill
                  unoptimized
                  onError={() => setFailedImages((prev) => ({ ...prev, [currentAngle.id]: true }))}
                  className="object-cover"
                  sizes="(max-width: 768px) 90vw, 50vw"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* Ambient Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            {/* Top Left Tag on Photo */}
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/15">
              <span className="text-[7.5px] font-bold text-white uppercase tracking-[0.2em]">
                {currentAngle.tag}
              </span>
            </div>

            {/* Top Right Expand Icon */}
            <div className="absolute top-2.5 right-2.5 p-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/15 text-white/80 hover:text-white transition-colors">
              <Maximize2 size={11} />
            </div>

            {/* Bottom Swiper Controls */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
              {/* Dot Indicators for 5 angles */}
              <div className="flex items-center gap-1.5 px-2 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/15">
                {STORE_ANGLES.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setActiveAngleIndex(i); }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeAngleIndex ? "w-3.5 bg-white" : "w-1.5 bg-white/40"
                    }`}
                  />
                ))}
              </div>

              {/* Angle Swiper Arrow Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevAngle}
                  className="p-1 bg-black/40 backdrop-blur-md rounded-full border border-white/15 hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft size={12} />
                </button>
                <button
                  type="button"
                  onClick={nextAngle}
                  className="p-1 bg-black/40 backdrop-blur-md rounded-full border border-white/15 hover:bg-black/70 transition-colors"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>

          </div>

          {/* Details & Direct Directions */}
          <div className="px-1 pt-0.5 pb-0.5 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#1a1a1a] tracking-tight font-sans">
                  Areekode Flagship
                </h3>
                <p className="text-[9.5px] sm:text-[10.5px] md:text-xs text-neutral-500 font-medium leading-normal font-sans mt-0.5 max-w-[260px]">
                  Main Road, Areekode, Malappuram, Kerala 673639
                </p>
              </div>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-black text-white rounded-full text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-wider hover:bg-black/80 transition-colors flex items-center gap-1 shrink-0 shadow-sm"
              >
                <span>Get Direction</span>
                <ArrowUpRight size={12} className="shrink-0" />
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* Lightbox Modal for Full Resolution Viewing */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLightboxOpen(false)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl overflow-hidden max-w-sm w-full shadow-2xl relative flex flex-col max-h-[85vh]"
            >
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-3 right-3 z-10 p-2 bg-black/70 text-white rounded-full hover:bg-black transition-colors"
              >
                <X size={15} />
              </button>

              <div className="relative w-full aspect-[4/5] bg-neutral-900">
                <Image
                  src={currentSrc}
                  alt={currentAngle.tag}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div className="p-4 bg-white flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1a1a1a]">{currentAngle.tag}</h4>
                  <p className="text-[9.5px] text-black/50">Areekode Flagship Store • Malappuram</p>
                </div>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-black text-white rounded-full text-[8.5px] font-bold uppercase tracking-wider flex items-center gap-1"
                >
                  <ArrowUpRight size={10} /> Directions
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}} />
    </section>
  );
}
