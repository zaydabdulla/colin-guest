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
    comment: "These are the best tank tops out there! I HIGHLY recommend! Will buy more.",
    image: "/black_acid_wash_hoodies.jpg",
    aspectRatio: "aspect-[3/3.8]",
  },
  {
    id: "3",
    name: "Farhan Ahammed",
    rating: 5,
    comment: "Heavyweight fabric is unmatched. Cut sits perfectly.",
    image: "/blacks_set.jpg",
    aspectRatio: "aspect-[3/3.8]",
  },
];

const REVIEWS_COL_2: CustomerReview[] = [
  {
    id: "2",
    name: "Fidel Shaan",
    rating: 5,
    comment: "Bought 6 black, they look insane.",
    image: "/black_faded_jean.jpg",
    aspectRatio: "aspect-[3/5]", // Taller card creating the staggered collage structure
  },
  {
    id: "4",
    name: "Mowfaq Rahman",
    rating: 5,
    comment: "The wash finish looks even better in person.",
    image: "/grey_hoodie_washed_jean.jpg",
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
      className="bg-[#fcfcfc] border border-black/5 rounded-xl overflow-hidden shadow-sm hover:border-black/20 transition-all duration-200 flex flex-col cursor-pointer mb-2.5 sm:mb-3"
    >
      {/* Customer Photo with Staggered Collage Aspect Ratio */}
      <div className={`relative w-full ${review.aspectRatio} bg-[#f4f4f4] overflow-hidden`}>
        <Image
          src={review.image}
          alt={`${review.name}'s review photo`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>

      {/* Card Details - PDP Aesthetic Typography & Short Review */}
      <div className="p-2 sm:p-2.5 flex flex-col flex-1 justify-between bg-white min-h-[110px] sm:min-h-[125px]">
        <div>
          {/* 5 Stars */}
          <div className="flex items-center gap-0.5 mb-1.5">
            {[...Array(review.rating)].map((_, i) => (
              <Star
                key={i}
                size={11}
                className="fill-black text-black shrink-0"
              />
            ))}
          </div>

          {/* Short Review Text */}
          <p className="text-[9.5px] sm:text-[10px] leading-snug text-black/75 font-medium font-sans mb-3">
            {review.comment}
          </p>
        </div>

        {/* Customer Name at Bottom */}
        <div className="mt-auto pt-1.5 border-t border-black/5">
          <span className="text-[9.5px] sm:text-[10px] font-bold tracking-tight text-[#1a1a1a] truncate block">
            {review.name}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <section className={`w-full py-4 sm:py-6 bg-white relative z-10 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Header - PDP Typography */}
        <div className="text-center mb-4 sm:mb-5">
          <h3 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] text-black/30">
            HEAR FROM OUR CUSTOMERS
          </h3>
          <p className="mt-1 text-[8px] sm:text-[8.5px] font-bold uppercase tracking-[0.2em] text-black/20">
            REAL REVIEWS. REAL PEOPLE.
          </p>
        </div>

        {/* 2-Column Staggered Collage Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 items-start max-w-4xl mx-auto">
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
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl overflow-hidden max-w-xs w-full shadow-2xl relative flex flex-col max-h-[85vh]"
            >
              <button
                onClick={() => setActiveImageModal(null)}
                className="absolute top-2.5 right-2.5 z-10 p-1.5 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
              >
                <X size={13} />
              </button>

              <div className="relative w-full aspect-[4/5] bg-neutral-900">
                <Image
                  src={activeImageModal.image}
                  alt={activeImageModal.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-3 bg-white flex flex-col gap-1">
                <div className="flex items-center gap-0.5">
                  {[...Array(activeImageModal.rating)].map((_, i) => (
                    <Star key={i} size={11} className="fill-black text-black" />
                  ))}
                </div>
                <p className="text-[9.5px] leading-relaxed text-black/60 font-medium mt-1">
                  "{activeImageModal.comment}"
                </p>
                <span className="text-[9.5px] font-bold tracking-tight text-[#1a1a1a] mt-1">
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
