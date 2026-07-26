"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * FEATURE TOGGLE: Set to false to hide this section across the PDP pages
 * until official customer try-on photos are uploaded.
 */
export const SHOW_CUSTOMER_COLLAGE = true;

interface CustomerReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  image: string;
  aspectRatio: string; // Staggered height for true collage structure
}

const REVIEWS_COL_1: CustomerReview[] = [
  {
    id: "1",
    name: "Zayd Abdulla",
    rating: 5,
    comment: "Heavyweight cotton with the perfect drop shoulder. Highly recommend.",
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=800&auto=format&fit=crop",
    aspectRatio: "aspect-[3/3.8]",
  },
  {
    id: "3",
    name: "Farhan Ahammed",
    rating: 5,
    comment: "Quality is crazy good. Fits true to size and looks effortless.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop",
    aspectRatio: "aspect-[3/3.8]",
  },
];

const REVIEWS_COL_2: CustomerReview[] = [
  {
    id: "2",
    name: "Fidel Shaan",
    rating: 5,
    comment: "Fit and wash are 10/10. Exactly the luxury aesthetic I wanted.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop",
    aspectRatio: "aspect-[3/4.8]", // Taller card creating the staggered collage structure
  },
  {
    id: "4",
    name: "Mowfaq Rahman",
    rating: 5,
    comment: "Best fit in my wardrobe. Fast delivery too.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    aspectRatio: "aspect-[3/4]",
  },
];

interface CustomerCollageProps {
  /** Optional override for visibility toggle */
  show?: boolean;
  className?: string;
}

export function CustomerCollage({ show = SHOW_CUSTOMER_COLLAGE, className = "" }: CustomerCollageProps) {
  const [activeImageModal, setActiveImageModal] = useState<CustomerReview | null>(null);

  if (!show) {
    return null;
  }

  const renderCard = (review: CustomerReview) => (
    <div
      key={review.id}
      onClick={() => setActiveImageModal(review)}
      className="bg-white border border-neutral-200/90 rounded-xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow duration-300 flex flex-col cursor-pointer mb-3 sm:mb-4"
    >
      {/* Customer Photo - Guaranteed high-res load with unoptimized flag */}
      <div className={`relative w-full ${review.aspectRatio} bg-neutral-100 overflow-hidden`}>
        <Image
          src={review.image}
          alt={`${review.name}'s try-on photo`}
          fill
          unoptimized
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>

      {/* Card Details */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between bg-white min-h-[120px] sm:min-h-[135px]">
        <div>
          {/* 5 Solid Black Stars */}
          <div className="flex items-center gap-0.5 mb-2">
            {[...Array(review.rating)].map((_, i) => (
              <Star
                key={i}
                size={13}
                className="fill-black text-black shrink-0"
              />
            ))}
          </div>

          {/* Short & Aesthetic Review Text */}
          <p className="text-[11.5px] sm:text-xs text-neutral-900 font-medium leading-relaxed font-sans mb-3">
            {review.comment}
          </p>
        </div>

        {/* Customer Name at Bottom */}
        <div className="mt-auto pt-2 border-t border-neutral-100">
          <span className="text-xs sm:text-sm font-semibold text-neutral-900 font-sans tracking-tight block truncate">
            {review.name}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <section className={`w-full py-8 md:py-12 bg-white relative z-10 ${className}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Header - Bold Solid Black Typography */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-black uppercase font-sans">
            HEAR FROM OUR CUSTOMERS
          </h2>
          <p className="mt-2 text-[10.5px] sm:text-xs font-bold tracking-[0.25em] text-black uppercase font-sans">
            REAL REVIEWS. REAL PEOPLE.
          </p>
        </div>

        {/* 2-Column Staggered Collage Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 items-start max-w-4xl mx-auto">
          {/* Left Column */}
          <div className="flex flex-col">
            {REVIEWS_COL_1.map((review) => renderCard(review))}
          </div>

          {/* Right Column (Taller Staggered Collage) */}
          <div className="flex flex-col">
            {REVIEWS_COL_2.map((review) => renderCard(review))}
          </div>

          {/* Desktop Fill Columns */}
          <div className="hidden md:flex flex-col">
            {REVIEWS_COL_1.map((review) => renderCard({ ...review, id: `d1-${review.id}` }))}
          </div>
          <div className="hidden md:flex flex-col">
            {REVIEWS_COL_2.map((review) => renderCard({ ...review, id: `d2-${review.id}` }))}
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
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl overflow-hidden max-w-sm w-full shadow-2xl relative flex flex-col max-h-[85vh]"
            >
              <button
                onClick={() => setActiveImageModal(null)}
                className="absolute top-3 right-3 z-10 p-2 bg-black/70 text-white rounded-full hover:bg-black transition-colors"
              >
                <X size={16} />
              </button>

              <div className="relative w-full aspect-[3/4] bg-neutral-900">
                <Image
                  src={activeImageModal.image}
                  alt={activeImageModal.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div className="p-4 bg-white flex flex-col gap-1.5">
                <div className="flex items-center gap-0.5">
                  {[...Array(activeImageModal.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-black text-black" />
                  ))}
                </div>
                <p className="text-xs font-medium text-neutral-900 leading-snug mt-1 font-sans">
                  "{activeImageModal.comment}"
                </p>
                <span className="text-sm font-semibold text-neutral-900 font-sans tracking-tight mt-1">
                  {activeImageModal.name}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
