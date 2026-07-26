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
  aspectRatio: string; // Staggered height matching reference screenshot
}

const REVIEWS: CustomerReview[] = [
  {
    id: "1",
    name: "Aachman",
    rating: 5,
    comment: "These are the best tank tops out there! I HIGHLY recommend! Will buy more.",
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=800&auto=format&fit=crop",
    aspectRatio: "aspect-[3/4]",
  },
  {
    id: "2",
    name: "Raj Kamal",
    rating: 5,
    comment: "Bought 6 black, they look insane.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop",
    aspectRatio: "aspect-[3/5]", // Taller right card matching reference screenshot
  },
  {
    id: "3",
    name: "Devansh",
    rating: 5,
    comment: "Heavyweight fabric is unmatched. Cut sits perfectly on shoulders.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop",
    aspectRatio: "aspect-[3/4.2]",
  },
  {
    id: "4",
    name: "Rohan",
    rating: 5,
    comment: "The wash finish looks even better in person. 10/10 quality.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    aspectRatio: "aspect-[3/3.8]",
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
    <section className={`w-full py-12 md:py-16 bg-white relative z-10 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header - Exact SuperSaint Typography & Spacing */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-black uppercase font-sans">
            WHAT OUR CUSTOMERS ARE SAYING
          </h2>
          <p className="mt-2 text-[10.5px] sm:text-xs font-bold tracking-[0.25em] text-neutral-800 uppercase font-sans">
            REAL REVIEWS. REAL PEOPLE.
          </p>
        </div>

        {/* 2-Column Mobile / 4-Column Desktop Grid matching exact SuperSaint design */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 items-start">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              onClick={() => setActiveImageModal(review)}
              className="bg-white border border-neutral-200/80 rounded-xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow duration-300 flex flex-col cursor-pointer"
            >
              {/* Customer Photo - Raw, Unadorned, Crisp Aspect Ratio */}
              <div className={`relative w-full ${review.aspectRatio} bg-neutral-100 overflow-hidden`}>
                <Image
                  src={review.image}
                  alt={`${review.name}'s review photo`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>

              {/* Card Bottom Section */}
              <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-white min-h-[160px] sm:min-h-[180px]">
                <div>
                  {/* 5 Solid Black Stars */}
                  <div className="flex items-center gap-0.5 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        size={15}
                        className="fill-black text-black shrink-0"
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-[12px] sm:text-[13px] text-black font-medium leading-snug font-sans mb-4">
                    {review.comment}
                  </p>
                </div>

                {/* Customer Name at Bottom */}
                <div className="mt-auto pt-2">
                  <span className="text-sm sm:text-base font-semibold text-neutral-900 font-sans tracking-tight block">
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
                    <Star key={i} size={15} className="fill-black text-black" />
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
