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
  fallbackImage: string;
  aspectRatio: string; // Staggered height for true collage structure
}

const REVIEWS_COL_1: CustomerReview[] = [
  {
    id: "1",
    name: "Zayd Abdulla",
    rating: 5,
    comment: "Heavyweight cotton with the perfect drop shoulder. Highly recommend.",
    image: "/customer1.jpg",
    fallbackImage: "/collections_hero.jpg",
    aspectRatio: "aspect-[3/3.6]",
  },
  {
    id: "3",
    name: "Farhan Ahammed",
    rating: 5,
    comment: "Quality is crazy good. Fits true to size and looks effortless.",
    image: "/customer3.jpg",
    fallbackImage: "/mobile_hero.png",
    aspectRatio: "aspect-[3/4.8]", // Taller bottom-left photo as requested!
  },
];

const REVIEWS_COL_2: CustomerReview[] = [
  {
    id: "2",
    name: "Fidel Shaan",
    rating: 5,
    comment: "Fit and wash are 10/10. Exactly the luxury aesthetic I wanted.",
    image: "/customer2.jpg",
    fallbackImage: "/login.jpg",
    aspectRatio: "aspect-[3/4.6]",
  },
  {
    id: "4",
    name: "Mowfaq Rahman",
    rating: 5,
    comment: "Best fit in my wardrobe. Fast delivery too.",
    image: "/customer4.jpg",
    fallbackImage: "/collections_hero.jpg",
    aspectRatio: "aspect-[3/3.6]",
  },
];

interface CustomerCollageProps {
  /** Optional override for visibility toggle */
  show?: boolean;
  className?: string;
}

export function CustomerCollage({ show = SHOW_CUSTOMER_COLLAGE, className = "" }: CustomerCollageProps) {
  const [activeImageModal, setActiveImageModal] = useState<CustomerReview | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  if (!show) {
    return null;
  }

  const renderCard = (review: CustomerReview) => {
    const imgSrc = failedImages[review.id] ? review.fallbackImage : review.image;

    return (
      <div
        key={review.id}
        onClick={() => setActiveImageModal(review)}
        className="bg-white border border-black/5 rounded-lg overflow-hidden shadow-none hover:border-black/15 transition-all duration-200 flex flex-col cursor-pointer mb-2 sm:mb-2.5"
      >
        {/* Customer Photo with Staggered Ratio */}
        <div className={`relative w-full ${review.aspectRatio} bg-[#f4f4f4] overflow-hidden`}>
          <Image
            src={imgSrc}
            alt={`${review.name}'s try-on photo`}
            fill
            unoptimized
            onError={() => setFailedImages((prev) => ({ ...prev, [review.id]: true }))}
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>

        {/* Card Details */}
        <div className="p-2 sm:p-2.5 md:p-3.5 flex flex-col flex-1 justify-between bg-white min-h-[90px] sm:min-h-[105px] md:min-h-[125px]">
          <div>
            {/* Delicate Stars */}
            <div className="flex items-center gap-0.5 mb-1.5">
              {[...Array(review.rating)].map((_, i) => (
                <Star
                  key={i}
                  size={9}
                  className="fill-black text-black shrink-0 md:w-2.5 md:h-2.5"
                />
              ))}
            </div>

            {/* Review Text */}
            <p className="text-[8.5px] md:text-[11px] lg:text-[11.5px] text-black/70 font-normal leading-relaxed font-sans mb-2">
              {review.comment}
            </p>
          </div>

          {/* Customer Name */}
          <div className="mt-auto pt-1.5 border-t border-black/5">
            <span className="text-[8.5px] md:text-[10.5px] lg:text-[11px] font-semibold uppercase tracking-wider text-black/85 truncate block">
              {review.name}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className={`w-full py-4 sm:py-6 md:py-10 bg-white relative z-10 ${className}`}>
      <div className="max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-5 sm:mb-7">
          <h3 className="text-[11.5px] md:text-[14px] lg:text-[15px] font-semibold uppercase tracking-[0.25em] text-[#1a1a1a] font-sans">
            HEAR FROM OUR CUSTOMERS
          </h3>
          <p className="mt-1 text-[9px] md:text-[10.5px] font-normal uppercase tracking-[0.2em] text-black/40 font-sans">
            REAL REVIEWS. REAL PEOPLE.
          </p>
        </div>

        {/* Mobile Layout: 2 Columns of 2 Cards (100% UNTOUCHED) */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 items-start max-w-2xl mx-auto md:hidden">
          <div className="flex flex-col">
            {REVIEWS_COL_1.map((review) => renderCard(review))}
          </div>
          <div className="flex flex-col">
            {REVIEWS_COL_2.map((review) => renderCard(review))}
          </div>
        </div>

        {/* Desktop Layout: 4 Columns with 1 Unique Card Each (Expanded Uniform Scale) */}
        <div className="hidden md:grid md:grid-cols-4 gap-3.5 lg:gap-4.5 items-start max-w-4xl lg:max-w-5xl mx-auto">
          <div className="flex flex-col">
            {renderCard(REVIEWS_COL_1[0])} {/* Zayd Abdulla */}
          </div>
          <div className="flex flex-col">
            {renderCard(REVIEWS_COL_2[0])} {/* Fidel Shaan */}
          </div>
          <div className="flex flex-col pt-3">
            {renderCard(REVIEWS_COL_1[1])} {/* Farhan Ahammed */}
          </div>
          <div className="flex flex-col pt-1.5">
            {renderCard(REVIEWS_COL_2[1])} {/* Mowfaq Rahman */}
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
                <X size={12} />
              </button>

              <div className="relative w-full aspect-[3/4] bg-neutral-900">
                <Image
                  src={failedImages[activeImageModal.id] ? activeImageModal.fallbackImage : activeImageModal.image}
                  alt={activeImageModal.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div className="p-3 bg-white flex flex-col gap-1">
                <div className="flex items-center gap-0.5">
                  {[...Array(activeImageModal.rating)].map((_, i) => (
                    <Star key={i} size={10} className="fill-black text-black" />
                  ))}
                </div>
                <p className="text-[9px] leading-relaxed text-black/70 font-normal">
                  "{activeImageModal.comment}"
                </p>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-black mt-1">
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
