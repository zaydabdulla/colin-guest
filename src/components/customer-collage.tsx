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
  aspectRatio: string; // Tighter staggered height
}

const REVIEWS: CustomerReview[] = [
  {
    id: "1",
    name: "Zayd Abdulla",
    rating: 5,
    comment: "These are the best tank tops out there! I HIGHLY recommend! Will buy more.",
    image: "/black_acid_wash_hoodies.jpg",
    aspectRatio: "aspect-[3/3.6]",
  },
  {
    id: "2",
    name: "Fidel Shaan",
    rating: 5,
    comment: "Bought 6 black, they look insane.",
    image: "/black_faded_jean.jpg",
    aspectRatio: "aspect-[3/4.4]", // Taller card matching reference screenshot right column
  },
  {
    id: "3",
    name: "Farhan Ahammed",
    rating: 5,
    comment: "Heavyweight fabric is unmatched. Cut sits perfectly on shoulders.",
    image: "/blacks_set.jpg",
    aspectRatio: "aspect-[3/3.8]",
  },
  {
    id: "4",
    name: "Mowfaq Rahman",
    rating: 5,
    comment: "The wash finish looks even better in person. 10/10 quality.",
    image: "/grey_hoodie_washed_jean.jpg",
    aspectRatio: "aspect-[3/3.5]",
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

  return (
    <section className={`w-full py-6 md:py-10 bg-white relative z-10 ${className}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Header - Compact & Brand Font */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-black uppercase font-sans">
            HEAR FROM OUR CUSTOMERS
          </h2>
          <p className="mt-1 text-[9.5px] sm:text-[10.5px] font-bold tracking-[0.25em] text-neutral-500 uppercase font-sans">
            REAL REVIEWS. REAL PEOPLE.
          </p>
        </div>

        {/* 2-Column Mobile / 4-Column Desktop Compact Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4 items-start max-w-4xl mx-auto">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              onClick={() => setActiveImageModal(review)}
              className="bg-white border border-neutral-200/80 rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow duration-300 flex flex-col cursor-pointer"
            >
              {/* Customer Photo - Product images from website */}
              <div className={`relative w-full ${review.aspectRatio} bg-neutral-100 overflow-hidden`}>
                <Image
                  src={review.image}
                  alt={`${review.name}'s review photo`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>

              {/* Card Bottom Section - Compact Padding & Website Font */}
              <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between bg-white min-h-[130px] sm:min-h-[150px]">
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

                  {/* Review Text */}
                  <p className="text-[11px] sm:text-[12px] text-neutral-900 font-medium leading-snug font-sans mb-3">
                    {review.comment}
                  </p>
                </div>

                {/* Customer Name at Bottom */}
                <div className="mt-auto pt-1.5 border-t border-neutral-100">
                  <span className="text-xs sm:text-sm font-semibold text-neutral-900 font-sans tracking-tight block truncate">
                    {review.name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal on Image Click */}
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
              className="bg-white rounded-xl overflow-hidden max-w-sm w-full shadow-2xl relative flex flex-col max-h-[90vh]"
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
                  className="object-cover"
                />
              </div>

              <div className="p-4 bg-white flex flex-col gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(activeImageModal.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-black text-black" />
                  ))}
                </div>
                <p className="text-sm font-medium text-black leading-snug">
                  "{activeImageModal.comment}"
                </p>
                <span className="text-sm font-semibold text-neutral-900 mt-1">
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
