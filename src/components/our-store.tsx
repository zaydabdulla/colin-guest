"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Maximize2, Clock, MapPin, X, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * FEATURE TOGGLE: Set to false to hide the Store section
 */
export const SHOW_OUR_STORE = true;

interface StorePhoto {
  id: string;
  label: string;
  src: string;
  fallbackSrc: string;
}

const STORE_PHOTOS: StorePhoto[] = [
  {
    id: "1",
    label: "01 / 05 • SANCTUARY LOUNGE",
    src: "/store1.JPG",
    fallbackSrc: "/store1.jpg",
  },
  {
    id: "2",
    label: "02 / 05 • ARCHIVAL GALLERY",
    src: "/store2.JPG",
    fallbackSrc: "/store2.jpg",
  },
  {
    id: "3",
    label: "03 / 05 • VIP FITTING SUITE",
    src: "/store3.JPG",
    fallbackSrc: "/store3.jpg",
  },
  {
    id: "4",
    label: "04 / 05 • ARCHITECTURAL FACADE",
    src: "/store4.JPG",
    fallbackSrc: "/store4.jpg",
  },
  {
    id: "5",
    label: "05 / 05 • EDITORIAL COLLECTION",
    src: "/store5.JPG",
    fallbackSrc: "/store5.jpg",
  },
];

interface OurStoreProps {
  show?: boolean;
  className?: string;
}

export function OurStore({ show = SHOW_OUR_STORE, className = "" }: OurStoreProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!show) return null;

  const currentPhoto = STORE_PHOTOS[activeIndex];
  const currentSrc = failedImages[currentPhoto.id] ? currentPhoto.fallbackSrc : currentPhoto.src;

  const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=Areekode+Malappuram+Kerala";

  const nextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % STORE_PHOTOS.length);
  };

  const prevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + STORE_PHOTOS.length) % STORE_PHOTOS.length);
  };

  return (
    <section className={`w-full py-6 md:py-10 bg-white relative z-10 ${className}`}>
      <div className="max-w-md sm:max-w-lg md:max-w-xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-4 sm:mb-5">
          <h3 className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.3em] text-[#1a1a1a] font-sans">
            OUR STORE
          </h3>
          <p className="mt-1 text-[8px] sm:text-[8.5px] font-normal uppercase tracking-[0.2em] text-black/40 font-sans">
            FLAGSHIP BOUTIQUE
          </p>
        </div>

        {/* High-Fashion Interactive Kinetic Store Showcase Card */}
        <div className="bg-[#fcfcfc] border border-black/10 rounded-3xl p-3 sm:p-4 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col gap-3 group relative">
          
          {/* Interactive Photo Frame */}
          <div 
            onClick={() => setIsLightboxOpen(true)}
            className="relative w-full aspect-[4/4.5] sm:aspect-[16/11] bg-neutral-100 rounded-2xl overflow-hidden cursor-pointer border border-black/5"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhoto.id}
                initial={{ opacity: 0.4, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.4, scale: 0.98 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={currentSrc}
                  alt={currentPhoto.label}
                  fill
                  unoptimized
                  onError={() => setFailedImages((prev) => ({ ...prev, [currentPhoto.id]: true }))}
                  className="object-cover"
                  sizes="(max-width: 768px) 90vw, 50vw"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20 pointer-events-none" />

            {/* Top Left Tag on Photo */}
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/15">
              <span className="text-[7.5px] font-bold text-white uppercase tracking-[0.2em]">
                {currentPhoto.label}
              </span>
            </div>

            {/* Top Right Expand Icon */}
            <div className="absolute top-2.5 right-2.5 p-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/15 text-white/80 hover:text-white transition-colors">
              <Maximize2 size={11} />
            </div>

            {/* Bottom Controls Bar */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
              {/* Dot Indicators */}
              <div className="flex items-center gap-1.5 px-2 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/15">
                {STORE_PHOTOS.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeIndex ? "w-3.5 bg-white" : "w-1.5 bg-white/40"
                    }`}
                  />
                ))}
              </div>

              {/* Arrow Swiper Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevPhoto}
                  className="p-1 bg-black/40 backdrop-blur-md rounded-full border border-white/15 hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft size={12} />
                </button>
                <button
                  type="button"
                  onClick={nextPhoto}
                  className="p-1 bg-black/40 backdrop-blur-md rounded-full border border-white/15 hover:bg-black/70 transition-colors"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>

          </div>

          {/* Minimalist Details & Direct Directions */}
          <div className="px-1 pt-0.5 pb-0.5 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xs sm:text-sm md:text-base font-bold text-[#1a1a1a] tracking-wider uppercase font-sans">
                  AREEKODE, MALAPPURAM
                </h3>
                <div className="flex items-center gap-1.5 mt-1 text-[8.5px] sm:text-[9.5px] text-neutral-500 font-medium font-sans">
                  <Clock size={11} className="text-black/50 shrink-0" />
                  <span>OPEN DAILY 9:00 AM – 10:00 PM</span>
                </div>
              </div>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-black text-white rounded-full text-[8.5px] sm:text-[9.5px] md:text-[10px] font-bold uppercase tracking-wider hover:bg-black/80 transition-colors flex items-center gap-1 shrink-0 shadow-sm"
              >
                <span>Get Directions</span>
                <ArrowUpRight size={11} className="shrink-0" />
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
                  alt={currentPhoto.label}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div className="p-4 bg-white flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1a1a1a]">OUR STORE</h4>
                  <p className="text-[9.5px] text-black/50">Areekode, Malappuram • Open Daily 9-10</p>
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
    </section>
  );
}
