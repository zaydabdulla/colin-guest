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
  productTitle: string;
}

const REVIEWS: CustomerReview[] = [
  {
    id: "1",
    name: "Zayd Abdulla",
    rating: 5,
    productTitle: "Acid Wash Heavyweight",
    comment: "The acid wash finish and heavyweight 450gsm drape are absolute perfection. Standing ovation for the cut.",
    image: "/black_acid_wash_hoodies.jpg",
  },
  {
    id: "2",
    name: "Fidel Shaan",
    rating: 5,
    productTitle: "Faded Utility Denim",
    comment: "Distressing and subtle faded noir tone look insane in hand. Ideal structural silhouette.",
    image: "/black_faded_jean.jpg",
  },
  {
    id: "3",
    name: "Farhan Ahammed",
    rating: 5,
    productTitle: "Monochrome Noir Set",
    comment: "The full monochrome set is next-level editorial fashion. Exceptional fabric structure.",
    image: "/blacks_set.jpg",
  },
  {
    id: "4",
    name: "Mowfaq Rahman",
    rating: 5,
    productTitle: "Studio Grey Look",
    comment: "Paired the studio grey hoodie with the washed indigo denim. The proportions are unmatched.",
    image: "/grey_hoodie_washed_jean.jpg",
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
    <section className={`w-full py-4 sm:py-6 bg-white relative z-10 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Header - Exact PDP Typography & Micro Sizing */}
        <div className="text-center mb-4 sm:mb-5">
          <h3 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] text-black/30">
            HEAR FROM OUR CUSTOMERS
          </h3>
          <p className="mt-1 text-[8px] sm:text-[8.5px] font-bold uppercase tracking-[0.2em] text-black/20">
            REAL REVIEWS. REAL PEOPLE.
          </p>
        </div>

        {/* Compact 2-Column Mobile / 4-Column Desktop Micro Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 items-stretch">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              onClick={() => setActiveImageModal(review)}
              className="bg-[#fcfcfc] border border-black/5 rounded-xl overflow-hidden shadow-sm hover:border-black/20 transition-all duration-200 flex flex-col cursor-pointer"
            >
              {/* Ultra-Compact Product Image */}
              <div className="relative w-full aspect-[4/4.2] bg-[#f4f4f4] overflow-hidden">
                <Image
                  src={review.image}
                  alt={`${review.name}'s review photo`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>

              {/* Card Details - Micro PDP Font Sizes */}
              <div className="p-2 sm:p-2.5 flex flex-col flex-1 justify-between bg-white">
                <div>
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 mb-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        size={10}
                        className="fill-black text-black shrink-0"
                      />
                    ))}
                  </div>

                  {/* Product Title Tag */}
                  <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-black/40 block truncate mb-1">
                    {review.productTitle}
                  </span>

                  {/* Review Text - Exact PDP Body Font Size */}
                  <p className="text-[9px] sm:text-[9.5px] leading-relaxed text-black/60 font-medium line-clamp-3 mb-2">
                    "{review.comment}"
                  </p>
                </div>

                {/* Customer Name - Exact PDP Micro Header */}
                <div className="mt-auto pt-1 border-t border-black/5">
                  <span className="text-[9px] sm:text-[9.5px] font-bold tracking-tight text-[#1a1a1a] truncate block">
                    {review.name}
                  </span>
                </div>
              </div>
            </div>
          ))}
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
                <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-black/40">
                  {activeImageModal.productTitle}
                </span>
                <p className="text-[9.5px] leading-relaxed text-black/60 font-medium">
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
