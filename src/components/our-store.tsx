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
    fallbackSrc: "/store4.jpg",
  },
  {
    id: "2",
    label: "Sanctuary Lounge",
    src: "/store1.JPG",
    fallbackSrc: "/store1.jpg",
  },
  {
    id: "3",
    label: "Archival Gallery",
    src: "/store2.JPG",
    fallbackSrc: "/store2.jpg",
  },
  {
    id: "4",
    label: "VIP Fitting Suite",
    src: "/store3.JPG",
    fallbackSrc: "/store3.jpg",
  },
  {
    id: "5",
    label: "Editorial Display",
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
    <section className={`w-full py-8 md:py-14 bg-white relative z-10 font-sans ${className}`}>
      <div className="max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Header matching AI Mockup */}
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <span className="text-[11px] sm:text-[12px] font-medium uppercase tracking-[0.18em] text-[#b89759] block mb-1 font-sans italic">
              OUR STORE
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#1a1a1a] tracking-tight font-sans">
              Visit Our Store
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-normal font-sans">
              Experience our collections in person.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2 shrink-0 pb-1">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous store photo"
              className="w-10 h-10 rounded-full border border-black/15 bg-white text-black flex items-center justify-center hover:bg-neutral-100 active:scale-95 transition-all shadow-sm"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next store photo"
              className="w-10 h-10 rounded-full bg-[#1c1c1c] text-white flex items-center justify-center hover:bg-black active:scale-95 transition-all shadow-sm"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* 3D Peek Carousel Frame matching AI Mockup */}
        <div className="relative w-full flex items-center justify-center overflow-hidden py-2">
          
          {/* Peek Left Card */}
          <div 
            onClick={handlePrev}
            className="absolute left-[-20%] sm:left-[-12%] w-[45%] sm:w-[42%] aspect-[3.8/4.8] sm:aspect-[4/4.8] rounded-3xl overflow-hidden opacity-60 scale-90 cursor-pointer pointer-events-auto border border-black/10 shadow-md transition-all duration-500 z-0"
          >
            <Image
              src={prevSrc}
              alt={prevPhoto.label}
              fill
              unoptimized
              className="object-cover"
            />
          </div>

          {/* Active Main Center Card */}
          <div 
            onClick={() => setIsLightboxOpen(true)}
            className="relative w-[82%] sm:w-[80%] aspect-[3.8/4.8] sm:aspect-[4/4.8] rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.14)] border-[2.5px] border-white z-10 cursor-pointer group"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhoto.id}
                initial={{ opacity: 0.5, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.5, scale: 0.98 }}
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
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Peek Right Card */}
          <div 
            onClick={handleNext}
            className="absolute right-[-20%] sm:right-[-12%] w-[45%] sm:w-[42%] aspect-[3.8/4.8] sm:aspect-[4/4.8] rounded-3xl overflow-hidden opacity-60 scale-90 cursor-pointer pointer-events-auto border border-black/10 shadow-md transition-all duration-500 z-0"
          >
            <Image
              src={nextSrc}
              alt={nextPhoto.label}
              fill
              unoptimized
              className="object-cover"
            />
          </div>

        </div>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-5 mb-7">
          {STORE_PHOTOS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-4 bg-[#1c1c1c]" : "w-2 bg-neutral-300 hover:bg-neutral-400"
              }`}
            />
          ))}
        </div>

        {/* Bottom Information Box matching AI Mockup */}
        <div className="bg-[#f6f5f2] rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 border border-black/5 shadow-sm flex flex-col gap-4">
          
          {/* Row 1: Location */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-black/8">
            <div className="w-11 h-11 rounded-full bg-[#1c1c1c] text-white flex items-center justify-center shrink-0 shadow-sm">
              <MapPin size={20} className="stroke-[1.75]" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-[#1c1c1c] tracking-tight">
                Areekode, Malappuram
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5 font-normal">
                Areekode, Malappuram District, Kerala, India
              </p>
            </div>
          </div>

          {/* Row 2: Hours & Directions Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#1c1c1c] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Clock size={20} className="stroke-[1.75]" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#1c1c1c] tracking-tight">
                  Open Daily
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5 font-normal">
                  10:00 AM – 09:00 PM
                </p>
              </div>
            </div>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-[#1c1c1c] text-white rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 hover:bg-black active:scale-95 transition-all shadow-sm shrink-0"
            >
              <span>Get Directions</span>
              <ArrowUpRight size={16} />
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
              className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl relative flex flex-col max-h-[85vh]"
            >
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-3 right-3 z-10 p-2 bg-black/70 text-white rounded-full hover:bg-black transition-colors"
              >
                <X size={16} />
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

              <div className="p-4 sm:p-5 bg-white flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#1a1a1a]">{currentPhoto.label}</h4>
                  <p className="text-xs text-neutral-500">Areekode, Malappuram • Open Daily</p>
                </div>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#1c1c1c] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>Directions</span>
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
