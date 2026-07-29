"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock, MapPin, X } from "lucide-react";
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
    label: "Boutique Facade",
    src: "/store4.JPG",
    fallbackSrc: "/collections_hero.jpg",
  },
  {
    id: "2",
    label: "Sanctuary Lounge",
    src: "/store1.JPG",
    fallbackSrc: "/collections_hero.jpg",
  },
  {
    id: "3",
    label: "Archival Gallery",
    src: "/store2.JPG",
    fallbackSrc: "/collections_hero.jpg",
  },
  {
    id: "4",
    label: "VIP Fitting Suite",
    src: "/store3.JPG",
    fallbackSrc: "/collections_hero.jpg",
  },
  {
    id: "5",
    label: "Editorial Display",
    src: "/store5.JPG",
    fallbackSrc: "/collections_hero.jpg",
  },
];

interface OurStoreProps {
  show?: boolean;
  className?: string;
}

export function OurStore({ show = SHOW_OUR_STORE, className = "" }: OurStoreProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!show) return null;

  const currentPhoto = STORE_PHOTOS[activeIndex];

  const moveCarousel = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setActiveIndex((prev) => (prev === 0 ? STORE_PHOTOS.length - 1 : prev - 1));
    } else {
      setActiveIndex((prev) => (prev === STORE_PHOTOS.length - 1 ? 0 : prev + 1));
    }
  };

  const getPosition = (index: number) => {
    const diff = index - activeIndex;
    const count = STORE_PHOTOS.length;
    let finalDiff = diff;
    if (diff > count / 2) finalDiff -= count;
    if (diff < -count / 2) finalDiff += count;
    return finalDiff;
  };

  const googleMapsUrl = "https://maps.app.goo.gl/XoNamgJh3rDWnZHDA";

  return (
    <section className={`w-full py-6 md:py-16 bg-transparent relative z-10 font-sans ${className}`}>
      <div className="max-w-md sm:max-w-lg md:max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Mobile Header (Visible on Mobile Only) */}
        <div className="flex md:hidden items-end justify-between mb-4 sm:mb-5">
          <div>
            <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.2em] text-[#b89759] block mb-1 font-sans italic">
              OUR STORE
            </span>
            <h2 className="text-xl sm:text-2xl font-normal text-[#1a1a1a] tracking-tight font-sans">
              Visit Our Store
            </h2>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5 font-normal font-sans">
              Experience our collections in person.
            </p>
          </div>

          {/* Navigation Arrows for Mobile */}
          <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
            <button
              type="button"
              onClick={() => moveCarousel('left')}
              aria-label="Previous store photo"
              className="w-8 h-8 rounded-full border border-black/15 bg-white text-black flex items-center justify-center hover:bg-neutral-100 active:scale-95 transition-all shadow-sm"
            >
              <ArrowLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => moveCarousel('right')}
              aria-label="Next store photo"
              className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center hover:bg-black active:scale-95 transition-all shadow-sm"
            >
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Wrapper (Mobile: Column, Desktop: Carousel Left + Info Right) */}
        <div className="flex flex-col md:flex-row md:items-center md:gap-12 lg:gap-16">
          
          {/* Left Column: Image Carousel */}
          <div className="w-full md:w-1/2 flex flex-col items-center">
            <div className="relative w-full h-[340px] sm:h-[380px] md:h-[440px] flex items-center justify-center overflow-hidden py-2">
              <div className="relative w-full h-full flex items-center justify-center">
                {STORE_PHOTOS.map((photo, index) => {
                  const pos = getPosition(index);
                  if (Math.abs(pos) > 2) return null;

                  return (
                    <motion.div
                      key={photo.id}
                      style={{ zIndex: 10 - Math.abs(pos) }}
                      animate={{
                        scale: 1 - Math.abs(pos) * 0.12,
                        x: pos * 60,
                        opacity: Math.abs(pos) === 2 ? 0.35 : Math.abs(pos) === 1 ? 0.75 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 260, damping: 32 }}
                      className="absolute w-[78%] sm:w-[75%] md:w-[82%] aspect-[3.8/4.6] rounded-[24px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.12)] border-[2px] border-white cursor-pointer select-none touch-pan-y"
                      onClick={() => {
                        if (pos !== 0) setActiveIndex(index);
                        else setIsLightboxOpen(true);
                      }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(_, info) => {
                        if (info.offset.x > 35) moveCarousel('left');
                        if (info.offset.x < -35) moveCarousel('right');
                      }}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={photo.src}
                          alt={photo.label}
                          fill
                          unoptimized
                          className="object-cover pointer-events-none"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-1.5 mt-3 md:mt-4 mb-5 md:mb-0">
              {STORE_PHOTOS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 transition-all duration-500 rounded-full ${
                    activeIndex === i ? "w-4 bg-[#1a1a1a]" : "w-1.5 bg-neutral-300 hover:bg-neutral-400"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Desktop Header & Store Info Card */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            
            {/* Desktop Header */}
            <div className="hidden md:block mb-8">
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#b89759] block mb-2 font-sans italic">
                OUR STORE
              </span>
              <h2 className="text-3xl lg:text-4xl font-normal text-[#1a1a1a] tracking-tight font-sans mb-2">
                Visit Our Store
              </h2>
              <p className="text-sm text-neutral-500 font-normal font-sans">
                Experience our curated collections in person with bespoke assistance.
              </p>
            </div>

            {/* Desktop Navigation Arrows Header Controls */}
            <div className="hidden md:flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-black/40">
                {currentPhoto.label} ({activeIndex + 1}/{STORE_PHOTOS.length})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveCarousel('left')}
                  aria-label="Previous store photo"
                  className="w-9 h-9 rounded-full border border-black/15 bg-white text-black flex items-center justify-center hover:bg-neutral-100 active:scale-95 transition-all shadow-sm"
                >
                  <ArrowLeft size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => moveCarousel('right')}
                  aria-label="Next store photo"
                  className="w-9 h-9 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center hover:bg-black active:scale-95 transition-all shadow-sm"
                >
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>

            {/* Location & Hours Card (Refined Editorial Card) */}
            <div className="bg-[#f6f5f2] rounded-2xl p-5 md:p-6 border border-black/5 shadow-sm flex flex-col gap-4">
              
              {/* Row 1: Location */}
              <div className="flex items-start gap-3.5 pb-4 border-b border-black/8">
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <MapPin size={18} className="stroke-[1.75]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm md:text-base font-bold text-[#1a1a1a] tracking-tight">
                    Areekode, Malappuram
                  </h4>
                  <p className="text-xs text-neutral-500 leading-normal font-normal mt-0.5">
                    Areekode, Malappuram District, Kerala, India
                  </p>
                </div>
              </div>

              {/* Row 2: Hours & Get Directions Button */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Clock size={18} className="stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm md:text-base font-bold text-[#1a1a1a] tracking-tight">
                      Open Daily
                    </h4>
                    <p className="text-xs text-neutral-500 font-normal leading-tight mt-0.5">
                      10:00 AM – 09:00 PM
                    </p>
                  </div>
                </div>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-[#1a1a1a] text-white rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-black active:scale-95 transition-all shadow-sm shrink-0"
                >
                  <span>Get Directions</span>
                  <ArrowUpRight size={14} />
                </a>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Lightbox Modal */}
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
              className="bg-white rounded-2xl overflow-hidden max-w-sm sm:max-w-md w-full shadow-2xl relative flex flex-col max-h-[85vh]"
            >
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-3 right-3 z-10 p-2 bg-black/70 text-white rounded-full hover:bg-black transition-colors"
              >
                <X size={15} />
              </button>

              <div className="relative w-full aspect-[4/5] bg-neutral-900">
                <Image
                  src={currentPhoto.src}
                  alt={currentPhoto.label}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div className="p-4 bg-white flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#1a1a1a]">{currentPhoto.label}</h4>
                  <p className="text-xs text-neutral-500">Areekode, Malappuram • Open Daily 10:00 AM - 09:00 PM</p>
                </div>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#1a1a1a] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>Directions</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

