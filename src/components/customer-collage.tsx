"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { CheckCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * FEATURE TOGGLE: Set to false to hide this section across the PDP pages
 * until official customer try-on photos are uploaded.
 */
export const SHOW_CUSTOMER_COLLAGE = true;

interface CustomerReview {
  id: string;
  name: string;
  image: string;
  fallbackImage: string;
}

const REVIEWS_COL_1: CustomerReview[] = [
  {
    id: "1",
    name: "Shanu",
    image: "/customer1.jpg",
    fallbackImage: "/collections_hero.jpg",
  },
  {
    id: "3",
    name: "Manu & Shibina",
    image: "/customer3.jpg",
    fallbackImage: "/mobile_hero.png",
  },
];

const REVIEWS_COL_2: CustomerReview[] = [
  {
    id: "2",
    name: "Hanan Shah",
    image: "/customer2.jpg",
    fallbackImage: "/login.jpg",
  },
  {
    id: "4",
    name: "Nihala ch",
    image: "/customer4.jpg",
    fallbackImage: "/collections_hero.jpg",
  },
];

const FIFTH_REVIEW: CustomerReview = {
  id: "5",
  name: "Crab",
  image: "/customer5.jpg",
  fallbackImage: "/collections_hero.jpg",
};

interface CustomerCollageProps {
  /** Optional override for visibility toggle */
  show?: boolean;
  className?: string;
}

export function CustomerCollage({ show = SHOW_CUSTOMER_COLLAGE, className = "" }: CustomerCollageProps) {
  const [activeImageModal, setActiveImageModal] = useState<CustomerReview | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = containerRef.current;
    if (activeImageModal) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.classList.add('lightbox-open');
      if (section) {
        section.style.zIndex = "99999";
      }
    } else {
      const scrollY = Math.abs(parseFloat(document.body.style.top || '0'));
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.classList.remove('lightbox-open');
      if (scrollY > 0) {
        window.scrollTo(0, scrollY);
      }
      if (section) {
        section.style.zIndex = "20";
      }
    }
    return () => {
      const scrollY = Math.abs(parseFloat(document.body.style.top || '0'));
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.classList.remove('lightbox-open');
      if (scrollY > 0) {
        window.scrollTo(0, scrollY);
      }
      if (section) {
        section.style.zIndex = "20";
      }
    };
  }, [activeImageModal]);

  if (!show) {
    return null;
  }

  const renderCard = (review: CustomerReview, extraClass = "") => {
    const imgSrc = failedImages[review.id] ? review.fallbackImage : review.image;

    return (
      <div
        key={review.id}
        onClick={() => setActiveImageModal(review)}
        className={`group bg-white border border-black/[0.08] hover:border-black/25 rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col cursor-pointer select-none ${extraClass}`}
      >
        {/* Full Uncropped 9:16 Photo */}
        <div className="relative w-full aspect-[9/16] bg-[#f5f5f5] overflow-hidden">
          <Image
            src={imgSrc}
            alt={`${review.name}'s try-on`}
            fill
            unoptimized
            onError={() => setFailedImages((prev) => ({ ...prev, [review.id]: true }))}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 50vw, 20vw"
          />
        </div>

        {/* Minimal Customer Info: Name + Verified Badge Only (No Comment) */}
        <div className="px-2.5 py-2 sm:px-3 sm:py-2.5 flex items-center justify-between bg-white border-t border-black/[0.04]">
          <span className="text-[9.5px] sm:text-[10.5px] font-semibold uppercase tracking-wider text-black/85 truncate font-sans">
            {review.name}
          </span>
          <div className="inline-flex items-center gap-1 text-[8px] sm:text-[9px] font-medium tracking-wide text-black/45 uppercase shrink-0">
            <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#b89759] fill-[#b89759]/20 shrink-0" />
            <span className="font-semibold text-black/55">Verified</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section ref={containerRef} className={`w-full py-4 sm:py-6 md:py-10 bg-white relative z-10 ${className}`}>
      <div className="max-w-3xl md:max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-5 sm:mb-8">
          <h3 className="text-[11.5px] md:text-[14px] lg:text-[15px] font-semibold uppercase tracking-[0.25em] text-[#1a1a1a] font-sans">
            HEAR FROM OUR CUSTOMERS
          </h3>
          <p className="mt-1 text-[9px] md:text-[10.5px] font-normal uppercase tracking-[0.2em] text-black/40 font-sans">
            REAL REVIEWS. REAL PEOPLE.
          </p>
        </div>

        {/* Mobile Layout: 2 Staggered Masonry Columns for a True Collage Feel */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 items-start max-w-2xl mx-auto md:hidden">
          {/* Column 1 (Left) */}
          <div className="flex flex-col gap-2.5 sm:gap-3.5">
            {renderCard(REVIEWS_COL_1[0])} {/* 1. Shanu */}
            {renderCard(REVIEWS_COL_1[1])} {/* 3. Manu & Shibina */}
          </div>

          {/* Column 2 (Right) - Offset Down for Dynamic Asymmetric Collage */}
          <div className="flex flex-col gap-2.5 sm:gap-3.5 pt-8 sm:pt-10">
            {renderCard(REVIEWS_COL_2[0])} {/* 2. Hanan Shah */}
            {renderCard(REVIEWS_COL_2[1])} {/* 4. Nihala ch */}
          </div>
        </div>

        {/* Desktop Layout: 5 Staggered Editorial Columns with Undulating Floating Heights */}
        <div className="hidden md:grid md:grid-cols-5 gap-3 lg:gap-4.5 items-start max-w-5xl lg:max-w-6xl mx-auto">
          <div className="flex flex-col pt-0 transition-transform duration-300 hover:-translate-y-1">
            {renderCard(REVIEWS_COL_1[0])} {/* 1. Shanu */}
          </div>
          <div className="flex flex-col pt-10 lg:pt-14 transition-transform duration-300 hover:-translate-y-1">
            {renderCard(REVIEWS_COL_2[0])} {/* 2. Hanan Shah */}
          </div>
          <div className="flex flex-col pt-2 lg:pt-3 transition-transform duration-300 hover:-translate-y-1">
            {renderCard(REVIEWS_COL_1[1])} {/* 3. Manu & Shibina */}
          </div>
          <div className="flex flex-col pt-12 lg:pt-16 transition-transform duration-300 hover:-translate-y-1">
            {renderCard(REVIEWS_COL_2[1])} {/* 4. Nihala ch */}
          </div>
          <div className="flex flex-col pt-5 lg:pt-7 transition-transform duration-300 hover:-translate-y-1">
            {renderCard(FIFTH_REVIEW)}     {/* 5. Crab */}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveImageModal(null)}
            className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent rounded-2xl overflow-hidden max-w-sm w-full shadow-2xl relative flex flex-col max-h-[85vh] p-2"
            >
              <button
                onClick={() => setActiveImageModal(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/70 hover:bg-black text-white rounded-full transition-colors shadow-lg"
              >
                <X size={15} />
              </button>

              <div className="relative w-full aspect-[9/16] max-h-[78vh] bg-black/95 rounded-2xl overflow-hidden flex items-center justify-center">
                <Image
                  src={failedImages[activeImageModal.id] ? activeImageModal.fallbackImage : activeImageModal.image}
                  alt={activeImageModal.name}
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>

              {/* Minimal Modal Verified Badge Footer */}
              <div className="mt-2.5 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 flex items-center justify-between text-white self-center gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/90">
                  {activeImageModal.name}
                </span>
                <span className="inline-flex items-center gap-1 text-[9.5px] text-white/70 tracking-wide uppercase font-medium">
                  <CheckCircle className="w-3 h-3 text-[#b89759] fill-[#b89759]/20" />
                  <span>Verified Buyer</span>
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
