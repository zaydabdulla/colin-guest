"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ThumbsUp, CheckCircle2, X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * FEATURE TOGGLE: Set to false to hide this section across the PDP pages
 * until official customer try-on photos are uploaded.
 */
export const SHOW_CUSTOMER_COLLAGE = true;

interface CustomerReview {
  id: string;
  name: string;
  sizeInfo: string;
  rating: number;
  comment: string;
  image: string;
  likes: number;
  verified: boolean;
  date: string;
  productName?: string;
}

const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: "1",
    name: "Aachman",
    sizeInfo: "Wears Size M • True to Size",
    rating: 5,
    comment: "These are the best tank tops out there! I HIGHLY recommend! Will buy more.",
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=800&auto=format&fit=crop",
    likes: 42,
    verified: true,
    date: "2 days ago",
    productName: "Archival Ribbed Tank",
  },
  {
    id: "2",
    name: "Raj Kamal",
    sizeInfo: "Wears Size L • Athletic Fit",
    rating: 5,
    comment: "Bought 6 black, they look insane.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop",
    likes: 38,
    verified: true,
    date: "4 days ago",
    productName: "Monochrome Noir Tank",
  },
  {
    id: "3",
    name: "Devansh S.",
    sizeInfo: "Wears Size L • Oversized Fit",
    rating: 5,
    comment: "Heavyweight fabric is unmatched. Cut sits perfectly on shoulders.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop",
    likes: 29,
    verified: true,
    date: "1 week ago",
    productName: "Heavyweight Studio Tee",
  },
  {
    id: "4",
    name: "Rohan M.",
    sizeInfo: "Wears Size M • Regular Fit",
    rating: 5,
    comment: "The acid wash finish looks even better in person. 10/10 quality.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    likes: 51,
    verified: true,
    date: "2 weeks ago",
    productName: "Acid Wash Hoodie",
  },
];

interface CustomerCollageProps {
  /** Optional override for visibility toggle */
  show?: boolean;
  className?: string;
}

export function CustomerCollage({ show = SHOW_CUSTOMER_COLLAGE, className = "" }: CustomerCollageProps) {
  const [likesState, setLikesState] = useState<Record<string, { count: number; liked: boolean }>>(() => {
    const initial: Record<string, { count: number; liked: boolean }> = {};
    CUSTOMER_REVIEWS.forEach((rev) => {
      initial[rev.id] = { count: rev.likes, liked: false };
    });
    return initial;
  });

  const [activeImageModal, setActiveImageModal] = useState<CustomerReview | null>(null);

  if (!show) {
    return null;
  }

  const handleLikeToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikesState((prev) => {
      const current = prev[id] || { count: 0, liked: false };
      return {
        ...prev,
        [id]: {
          count: current.liked ? current.count - 1 : current.count + 1,
          liked: !current.liked,
        },
      };
    });
  };

  return (
    <section className={`w-full py-12 md:py-16 bg-white relative z-10 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-black uppercase font-sans">
            WHAT OUR CUSTOMERS ARE SAYING
          </h2>
          <p className="mt-2 text-[10px] sm:text-xs font-bold tracking-[0.35em] text-black/50 uppercase">
            REAL REVIEWS. REAL PEOPLE.
          </p>
          <div className="w-12 h-[2px] bg-black/10 mx-auto mt-4 rounded-full" />
        </div>

        {/* Reviews Collage Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {CUSTOMER_REVIEWS.map((review) => {
            const reviewLike = likesState[review.id] || { count: review.likes, liked: false };

            return (
              <div
                key={review.id}
                onClick={() => setActiveImageModal(review)}
                className="group relative bg-[#fcfcfc] border border-black/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Customer Photo / Outfit Try-on Image */}
                <div className="relative w-full aspect-[3/4] bg-neutral-100 overflow-hidden">
                  <Image
                    src={review.image}
                    alt={`${review.name}'s try-on photo`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />

                  {/* Gradient Overlay for Top Badges */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20 pointer-events-none opacity-80" />

                  {/* Verified Buyer Tag */}
                  {review.verified && (
                    <div className="absolute top-2.5 left-2.5 px-2 py-1 bg-black/60 backdrop-blur-md rounded-full flex items-center gap-1 border border-white/10">
                      <CheckCircle2 size={10} className="text-white fill-white/20 shrink-0" />
                      <span className="text-[7.5px] font-bold text-white uppercase tracking-wider">
                        Verified
                      </span>
                    </div>
                  )}

                  {/* Like / Helpful Micro Button */}
                  <button
                    type="button"
                    onClick={(e) => handleLikeToggle(review.id, e)}
                    className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full backdrop-blur-md text-[9px] font-bold flex items-center gap-1.5 transition-all duration-200 shadow-sm border ${
                      reviewLike.liked
                        ? "bg-black text-white border-black scale-105"
                        : "bg-white/85 text-black border-black/10 hover:bg-white"
                    }`}
                  >
                    <Heart
                      size={11}
                      className={`transition-all ${
                        reviewLike.liked ? "fill-white text-white" : "text-black/60"
                      }`}
                    />
                    <span>{reviewLike.count}</span>
                  </button>

                  {/* Zoom hint overlay */}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                    View
                  </div>
                </div>

                {/* Card Bottom Details */}
                <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between bg-white">
                  <div>
                    {/* Star Rating */}
                    <div className="flex items-center gap-0.5 mb-2">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className="fill-black text-black shrink-0"
                        />
                      ))}
                    </div>

                    {/* Review Snippet */}
                    <p className="text-[10.5px] sm:text-xs text-black/85 leading-relaxed font-medium mb-3">
                      "{review.comment}"
                    </p>
                  </div>

                  {/* Customer Info */}
                  <div className="pt-2 border-t border-black/5 mt-auto flex flex-col gap-0.5">
                    <span className="text-xs sm:text-sm font-bold text-black tracking-tight">
                      {review.name}
                    </span>
                    <span className="text-[9px] font-medium text-black/50 tracking-tight truncate">
                      {review.sizeInfo}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Photo Lightbox Modal */}
      <AnimatePresence>
        {activeImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveImageModal(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl relative flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveImageModal(null)}
                className="absolute top-3 right-3 z-10 p-2 bg-black/60 text-white rounded-full hover:bg-black transition-colors backdrop-blur-md"
              >
                <X size={16} />
              </button>

              {/* Modal Image */}
              <div className="relative w-full aspect-[3/4] bg-neutral-900">
                <Image
                  src={activeImageModal.image}
                  alt={activeImageModal.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Modal Content */}
              <div className="p-5 bg-white flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(activeImageModal.rating)].map((_, i) => (
                      <Star key={i} size={14} className="fill-black text-black" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                    {activeImageModal.date}
                  </span>
                </div>

                <p className="text-sm font-semibold text-black leading-snug">
                  "{activeImageModal.comment}"
                </p>

                <div className="mt-2 pt-3 border-t border-black/5 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-black">{activeImageModal.name}</h4>
                    <p className="text-[10px] text-black/50">{activeImageModal.sizeInfo}</p>
                  </div>
                  {activeImageModal.verified && (
                    <span className="px-2.5 py-1 bg-black text-white rounded-full text-[8.5px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 size={10} /> Verified Customer
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
