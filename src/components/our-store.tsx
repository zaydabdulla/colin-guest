"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

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
      
      {/* MOBILE LAYOUT (100% UNTOUCHED) */}
      <div className="md:hidden max-w-md sm:max-w-lg mx-auto px-4 sm:px-6">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div>
            <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.2em] text-[#b89759] block mb-0.5 font-sans italic">
              OUR STORE
            </span>
            <h2 className="text-xl sm:text-2xl font-normal text-[#1a1a1a] tracking-tight font-sans">
              Visit Our Store
            </h2>
          </div>
        </div>

        {/* Mobile Carousel & Card */}
        <div className="flex flex-col items-center">
          <div className="w-full flex flex-col items-center relative">
            <div className="relative w-full h-[340px] sm:h-[380px] flex items-center justify-center overflow-hidden py-2">
              
              {/* Minimal Left Arrow on Carousel Frame */}
              <button
                type="button"
                onClick={() => moveCarousel('left')}
                aria-label="Previous store photo"
                className="absolute left-1 sm:left-2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-md border border-black/10 text-black flex items-center justify-center hover:bg-white active:scale-95 transition-all shadow-md"
              >
                <ArrowLeft size={14} />
              </button>

              {/* Stacked Swiper Cards */}
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
                      className="absolute w-[78%] sm:w-[75%] aspect-[3.8/4.6] rounded-[24px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.12)] border-[2px] border-white cursor-pointer select-none touch-pan-y"
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

              {/* Minimal Right Arrow on Carousel Frame */}
              <button
                type="button"
                onClick={() => moveCarousel('right')}
                aria-label="Next store photo"
                className="absolute right-1 sm:right-2 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center hover:bg-black active:scale-95 transition-all shadow-md"
              >
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-1.5 mt-3 mb-5">
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

          {/* Location & Hours Card (Mobile) */}
          <div className="w-full bg-[#f6f5f2] rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-black/5 shadow-sm flex flex-col gap-3 sm:gap-4">
            <div className="flex items-start gap-2.5 sm:gap-3.5 pb-3 sm:pb-4 border-b border-black/8">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <MapPin size={15} className="stroke-[1.75]" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[12.5px] sm:text-sm font-bold text-[#1a1a1a] tracking-tight">
                  Areekode, Malappuram
                </h4>
                <p className="text-[10.5px] sm:text-xs text-neutral-500 leading-normal font-normal mt-0.5">
                  Areekode, Malappuram District, Kerala, India
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 sm:gap-3 pt-0.5 sm:pt-1">
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Clock size={15} className="stroke-[1.75]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[12.5px] sm:text-sm font-bold text-[#1a1a1a] tracking-tight">
                    Open Daily
                  </h4>
                  <p className="text-[10.5px] sm:text-xs text-neutral-500 font-normal leading-tight mt-0.5">
                    10:00 AM – 09:00 PM
                  </p>
                </div>
              </div>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#1a1a1a] text-white rounded-lg sm:rounded-xl text-[10.5px] sm:text-xs font-semibold flex items-center gap-1.5 sm:gap-2 hover:bg-black active:scale-95 transition-all shadow-sm shrink-0"
              >
                <span>Get Directions</span>
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP LAYOUT (Compact, screen-fitting landscape stage matching mockup) */}
      <div className="hidden md:block max-w-6xl mx-auto px-6 lg:px-8">
        
        {/* Top Header (Compact) */}
        <div className="text-left mb-4">
          <span className="text-[10px] lg:text-[11px] font-medium uppercase tracking-[0.2em] text-[#b89759] block mb-1 font-sans italic">
            OUR STORE
          </span>
          <h2 className="text-2xl lg:text-3xl font-serif text-[#1a1a1a] tracking-tight mb-1 font-sans">
            Visit Our Store
          </h2>
          <p className="text-xs lg:text-sm text-neutral-500 font-normal font-sans">
            Experience our collections in person.
          </p>
        </div>

        {/* Full Width Landscape Carousel Stage */}
        <div className="relative w-full h-[280px] sm:h-[310px] md:h-[340px] lg:h-[360px] flex items-center justify-center overflow-hidden my-3">
          
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => moveCarousel('left')}
            aria-label="Previous store photo"
            className="absolute left-2 lg:left-4 z-30 w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white text-black border border-black/10 flex items-center justify-center hover:bg-neutral-100 active:scale-95 transition-all shadow-md"
          >
            <ArrowLeft size={16} />
          </button>

          {/* Carousel Stack */}
          <div className="relative w-full h-full flex items-center justify-center">
            {STORE_PHOTOS.map((photo, index) => {
              const pos = getPosition(index);
              if (Math.abs(pos) > 2) return null;

              return (
                <motion.div
                  key={photo.id}
                  style={{ zIndex: 10 - Math.abs(pos) }}
                  animate={{
                    scale: 1 - Math.abs(pos) * 0.14,
                    x: pos * 300,
                    opacity: Math.abs(pos) === 2 ? 0.25 : Math.abs(pos) === 1 ? 0.65 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 32 }}
                  className="absolute w-[50%] lg:w-[46%] aspect-[16/10] rounded-[20px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.12)] border-[2px] border-white cursor-pointer select-none"
                  onClick={() => {
                    if (pos !== 0) setActiveIndex(index);
                    else setIsLightboxOpen(true);
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

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => moveCarousel('right')}
            aria-label="Next store photo"
            className="absolute right-2 lg:right-4 z-30 w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white text-black border border-black/10 flex items-center justify-center hover:bg-neutral-100 active:scale-95 transition-all shadow-md"
          >
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-2 mb-5">
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

        {/* Compact Horizontal Location & Hours Card */}
        <div className="w-full bg-[#f6f5f2] rounded-xl p-4 lg:p-4.5 border border-black/5 shadow-sm flex items-center justify-between gap-4">
          
          {/* Column 1: Location */}
          <div className="flex items-center gap-3 flex-1 pr-4 border-r border-black/10">
            <div className="w-9 h-9 rounded-full bg-[#e8e6df] text-[#1a1a1a] flex items-center justify-center shrink-0 shadow-sm">
              <MapPin size={17} className="stroke-[1.75]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs lg:text-sm font-bold text-[#1a1a1a] tracking-tight">
                Areekode, Malappuram
              </h4>
              <p className="text-[10.5px] lg:text-xs text-neutral-500 leading-normal font-normal mt-0.5">
                Areekode, Malappuram District, Kerala, India
              </p>
            </div>
          </div>

          {/* Column 2: Hours */}
          <div className="flex items-center gap-3 flex-1 px-4 border-r border-black/10">
            <div className="w-9 h-9 rounded-full bg-[#e8e6df] text-[#1a1a1a] flex items-center justify-center shrink-0 shadow-sm">
              <Clock size={17} className="stroke-[1.75]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs lg:text-sm font-bold text-[#1a1a1a] tracking-tight">
                Open Daily
              </h4>
              <p className="text-[10.5px] lg:text-xs text-neutral-500 font-normal leading-tight mt-0.5">
                10:00 AM – 09:00 PM
              </p>
            </div>
          </div>

          {/* Column 3: Get Directions Button */}
          <div className="flex items-center justify-end pl-4">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-[#1a1a1a] text-white rounded-full text-[10.5px] lg:text-xs font-semibold flex items-center gap-1.5 hover:bg-black active:scale-95 transition-all shadow-sm shrink-0"
            >
              <span>Get Directions</span>
              <ArrowUpRight size={14} />
            </a>
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

