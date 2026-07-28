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
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!show) return null;

  const currentPhoto = STORE_PHOTOS[activeIndex];
  const currentSrc = failedImages[currentPhoto.id] ? currentPhoto.fallbackSrc : currentPhoto.src;

  const prevIndex = (activeIndex - 1 + STORE_PHOTOS.length) % STORE_PHOTOS.length;
  const nextIndex = (activeIndex + 1) % STORE_PHOTOS.length;

  const prevPhoto = STORE_PHOTOS[prevIndex];
  const nextPhoto = STORE_PHOTOS[nextIndex];

  const prevSrc = failedImages[prevPhoto.id] ? prevPhoto.fallbackSrc : prevPhoto.src;
  const nextSrc = failedImages[nextPhoto.id] ? nextPhoto.fallbackSrc : nextPhoto.src;

  const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=Areekode+Malappuram+Kerala";

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % STORE_PHOTOS.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + STORE_PHOTOS.length) % STORE_PHOTOS.length);
  };

  return (
    <section className={`w-full py-6 md:py-10 bg-white relative z-10 font-sans ${className}`}>
      <div className="max-w-md sm:max-w-lg md:max-w-xl mx-auto px-4 sm:px-6">
        
        {/* Header matching AI Mockup & Brand Font */}
        <div className="flex items-end justify-between mb-4 sm:mb-5">
          <div>
            <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.2em] text-[#b89759] block mb-1 font-sans italic">
              OUR STORE
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-normal text-[#1a1a1a] tracking-tight font-sans">
              Visit Our Store
            </h2>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5 font-normal font-sans">
              Experience our collections in person.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous store photo"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-black/15 bg-white text-black flex items-center justify-center hover:bg-neutral-100 active:scale-95 transition-all shadow-sm"
            >
              <ArrowLeft size={14} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next store photo"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center hover:bg-black active:scale-95 transition-all shadow-sm"
            >
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Smooth 3D Carousel Frame with Swipe Support & Fallback Safety */}
        <div className="relative w-full flex items-center justify-center overflow-hidden py-1">
          
          {/* Peek Left Card */}
          <div 
            onClick={handlePrev}
            className="absolute left-[-16%] sm:left-[-10%] w-[42%] aspect-[3.8/4.6] rounded-2xl overflow-hidden opacity-50 scale-90 cursor-pointer border border-black/10 shadow-sm transition-all duration-300 z-0"
          >
            <Image
              src={prevSrc}
              alt={prevPhoto.label}
              fill
              unoptimized
              onError={() => setFailedImages((prev) => ({ ...prev, [prevPhoto.id]: true }))}
              className="object-cover"
            />
          </div>

          {/* Active Main Center Card */}
          <motion.div 
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -40) handleNext();
              if (info.offset.x > 40) handlePrev();
            }}
            onClick={() => setIsLightboxOpen(true)}
            className="relative w-[80%] sm:w-[78%] aspect-[3.8/4.6] rounded-[24px] overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.1)] border-[2px] border-white z-10 cursor-pointer touch-pan-y"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhoto.id}
                initial={{ opacity: 0.8, scale: 1.01 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.8, scale: 0.99 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={currentSrc}
                  alt={currentPhoto.label}
                  fill
                  unoptimized
                  onError={() => setFailedImages((prev) => ({ ...prev, [currentPhoto.id]: true }))}
                  className="object-cover"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Peek Right Card */}
          <div 
            onClick={handleNext}
            className="absolute right-[-16%] sm:right-[-10%] w-[42%] aspect-[3.8/4.6] rounded-2xl overflow-hidden opacity-50 scale-90 cursor-pointer border border-black/10 shadow-sm transition-all duration-300 z-0"
          >
            <Image
              src={nextSrc}
              alt={nextPhoto.label}
              fill
              unoptimized
              onError={() => setFailedImages((prev) => ({ ...prev, [nextPhoto.id]: true }))}
              className="object-cover"
            />
          </div>

        </div>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-4 mb-5">
          {STORE_PHOTOS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-3.5 bg-[#1a1a1a]" : "w-1.5 bg-neutral-300 hover:bg-neutral-400"
              }`}
            />
          ))}
        </div>

        {/* Compact Bottom Information Box */}
        <div className="bg-[#f6f5f2] rounded-2xl p-4 border border-black/5 shadow-sm flex flex-col gap-3">
          
          {/* Row 1: Location */}
          <div className="flex items-center gap-3 pb-3 border-b border-black/8">
            <div className="w-9 h-9 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center shrink-0 shadow-sm">
              <MapPin size={16} className="stroke-[1.75]" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-bold text-[#1a1a1a] tracking-tight truncate">
                Areekode, Malappuram
              </h4>
              <p className="text-[10px] text-neutral-500 leading-tight font-normal truncate mt-0.5">
                Areekode, Malappuram District, Kerala, India
              </p>
            </div>
          </div>

          {/* Row 2: Hours & Directions Button (Compact Layout) */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Clock size={16} className="stroke-[1.75]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-[#1a1a1a] tracking-tight">
                  Open Daily
                </h4>
                <p className="text-[10px] text-neutral-500 font-normal leading-tight mt-0.5">
                  10:00 AM – 09:00 PM
                </p>
              </div>
            </div>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-[#1a1a1a] text-white rounded-xl text-[10.5px] font-semibold flex items-center gap-1.5 hover:bg-black active:scale-95 transition-all shadow-sm shrink-0"
            >
              <span>Get Directions</span>
              <ArrowUpRight size={13} />
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
                  onError={() => setFailedImages((prev) => ({ ...prev, [currentPhoto.id]: true }))}
                  className="object-cover"
                />
              </div>

              <div className="p-3.5 bg-white flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1a1a1a]">{currentPhoto.label}</h4>
                  <p className="text-[9.5px] text-neutral-500">Areekode, Malappuram • Open Daily 10-9</p>
                </div>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-[#1a1a1a] text-white rounded-lg text-[9.5px] font-semibold flex items-center gap-1"
                >
                  <span>Directions</span>
                  <ArrowUpRight size={12} />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
