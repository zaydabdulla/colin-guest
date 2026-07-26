"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Navigation, Clock, Compass, Maximize2, X, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * FEATURE TOGGLE: Set to false to hide the Store section
 */
export const SHOW_OUR_STORE = true;

interface StorePhoto {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  fallbackSrc: string;
}

const STORE_PHOTOS: StorePhoto[] = [
  {
    id: "1",
    title: "Flagship Salon & Lounge",
    subtitle: "Architectural Noir Interior",
    src: "/store1.jpg",
    fallbackSrc: "/collections_hero.jpg",
  },
  {
    id: "2",
    title: "Archival Rack & Runway",
    subtitle: "Exclusive Runway Collection",
    src: "/store2.jpg",
    fallbackSrc: "/login.jpg",
  },
  {
    id: "3",
    title: "Private Fitting Suite",
    subtitle: "Custom Tailoring & Styling",
    src: "/store3.jpg",
    fallbackSrc: "/mobile_hero.png",
  },
];

interface OurStoreProps {
  show?: boolean;
  className?: string;
}

export function OurStore({ show = SHOW_OUR_STORE, className = "" }: OurStoreProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!show) return null;

  const currentPhoto = STORE_PHOTOS[activePhotoIndex];
  const currentSrc = failedImages[currentPhoto.id] ? currentPhoto.fallbackSrc : currentPhoto.src;

  const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=Areekode+Malappuram+Kerala";

  return (
    <section className={`w-full py-12 md:py-16 bg-[#fcfcfc] border-t border-black/5 relative z-10 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header - COLIN GUEST PDP Aesthetics */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/5 rounded-full mb-3 border border-black/5">
            <Compass size={11} className="text-black/60 animate-spin-slow" />
            <span className="text-[8px] sm:text-[8.5px] font-bold uppercase tracking-[0.25em] text-black/50">
              11.2384° N, 75.9774° E
            </span>
          </div>

          <h2 className="text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-[0.3em] text-[#1a1a1a] font-sans">
            OUR FLAGSHIP STORE
          </h2>
          <p className="mt-1.5 text-[8.5px] sm:text-[9.5px] font-medium tracking-[0.2em] text-black/40 uppercase font-sans">
            AREEKODE, MALAPPURAM
          </p>
        </div>

        {/* Flagship Showcase Container */}
        <div className="bg-white border border-black/5 rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left / Top: Interactive Gallery Swiper */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            {/* Main Interactive Display Frame */}
            <div 
              onClick={() => setIsLightboxOpen(true)}
              className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-[#f4f4f4] rounded-xl overflow-hidden group cursor-pointer border border-black/5"
            >
              <Image
                src={currentSrc}
                alt={currentPhoto.title}
                fill
                unoptimized
                onError={() => setFailedImages((prev) => ({ ...prev, [currentPhoto.id]: true }))}
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />

              {/* Ambient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

              {/* Photo Title Overlay */}
              <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between text-white">
                <div>
                  <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/70 block">
                    {currentPhoto.subtitle}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold tracking-tight text-white mt-0.5">
                    {currentPhoto.title}
                  </h4>
                </div>

                <div className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/20 text-white/80 group-hover:text-white transition-colors">
                  <Maximize2 size={12} />
                </div>
              </div>
            </div>

            {/* Thumbnail Navigation Row */}
            <div className="grid grid-cols-3 gap-2.5">
              {STORE_PHOTOS.map((photo, i) => {
                const thumbSrc = failedImages[photo.id] ? photo.fallbackSrc : photo.src;
                const isActive = i === activePhotoIndex;

                return (
                  <button
                    key={photo.id}
                    onClick={() => setActivePhotoIndex(i)}
                    className={`relative w-full aspect-[16/10] rounded-lg overflow-hidden border transition-all duration-200 ${
                      isActive 
                        ? "border-black ring-1 ring-black/20 opacity-100 scale-[1.02]" 
                        : "border-black/5 opacity-50 hover:opacity-80"
                    }`}
                  >
                    <Image
                      src={thumbSrc}
                      alt={photo.title}
                      fill
                      unoptimized
                      onError={() => setFailedImages((prev) => ({ ...prev, [photo.id]: true }))}
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right / Bottom: Location Info & Experience Card */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full py-2">
            <div>
              {/* Live Status Badge */}
              <div className="inline-flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-[0.2em] text-black/50 mb-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                OPEN FOR EXPERIENCE
              </div>

              <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#1a1a1a] mb-2 font-sans">
                COLIN GUEST FLAGSHIP
              </h3>

              <p className="text-[10px] sm:text-[11px] leading-relaxed text-black/60 font-medium font-sans mb-6">
                Step inside our physical sanctuary in Areekode. Experience raw fabric textures, custom tailoring, and the full archival collection in person.
              </p>

              {/* Detail Items */}
              <div className="space-y-3.5 border-t border-b border-black/5 py-4 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin size={14} className="text-black/40 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-black/35 block">
                      LOCATION
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-medium text-black/80 block">
                      Main Road, Areekode, Malappuram, Kerala — 673639
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={14} className="text-black/40 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-black/35 block">
                      BOUTIQUE HOURS
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-medium text-black/80 block">
                      10:00 AM – 9:30 PM (Mon – Sun)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-black text-white py-3 px-4 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-black/85 transition-colors shadow-sm"
              >
                <Navigation size={12} />
                <span>GET DIRECTIONS</span>
              </a>

              <button
                type="button"
                onClick={() => alert("To book a private styling session at our Areekode store, please contact us or visit us directly!")}
                className="flex-1 border border-black/10 bg-white text-black py-3 px-4 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:border-black transition-colors"
              >
                <Sparkles size={12} className="text-black/60" />
                <span>STYLING SESSION</span>
              </button>
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
              className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[90vh]"
            >
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-3 right-3 z-10 p-2 bg-black/70 text-white rounded-full hover:bg-black transition-colors"
              >
                <X size={16} />
              </button>

              <div className="relative w-full aspect-[16/10] bg-neutral-900">
                <Image
                  src={currentSrc}
                  alt={currentPhoto.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div className="p-4 bg-white flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1a1a1a]">{currentPhoto.title}</h4>
                  <p className="text-[10px] text-black/50">{currentPhoto.subtitle} • Areekode Flagship</p>
                </div>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-black text-white rounded-full text-[8.5px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Navigation size={10} /> Directions
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
