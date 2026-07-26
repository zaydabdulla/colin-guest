"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, CheckCircle2, X, Heart } from "lucide-react";
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
  aspectRatio: string; // e.g. "aspect-[3/4.2]" vs "aspect-[3/5]" for organic masonry
  likes: number;
  verified: boolean;
  date: string;
}

const COLUMN_1_REVIEWS: CustomerReview[] = [
  {
    id: "1",
    name: "Aachman",
    sizeInfo: "Wears Size M • True to Size",
    rating: 5,
    comment: "These are the best tank tops out there! I HIGHLY recommend! Will buy more.",
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=800&auto=format&fit=crop",
    aspectRatio: "aspect-[3/3.8]",
    likes: 42,
    verified: true,
    date: "2 days ago",
  },
  {
    id: "3",
    name: "Devansh S.",
    sizeInfo: "Wears Size L • Oversized Fit",
    rating: 5,
    comment: "Heavyweight fabric is unmatched. Cut sits perfectly on shoulders.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop",
    aspectRatio: "aspect-[3/4.5]",
    likes: 29,
    verified: true,
    date: "1 week ago",
  },
  {
    id: "5",
    name: "Karan V.",
    sizeInfo: "Wears Size M • Regular Fit",
    rating: 5,
    comment: "Fit is structural and clean. Quality feels like high-end designer.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
    aspectRatio: "aspect-[3/4]",
    likes: 34,
    verified: true,
    date: "3 weeks ago",
  },
];

const COLUMN_2_REVIEWS: CustomerReview[] = [
  {
    id: "2",
    name: "Raj Kamal",
    sizeInfo: "Wears Size L • Athletic Fit",
    rating: 5,
    comment: "Bought 6 black, they look insane.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop",
    aspectRatio: "aspect-[3/4.8]", // Taller card matching reference screenshot right column
    likes: 38,
    verified: true,
    date: "4 days ago",
  },
  {
    id: "4",
    name: "Rohan M.",
    sizeInfo: "Wears Size M • Regular Fit",
    rating: 5,
    comment: "The wash finish looks even better in person. 10/10 quality.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    aspectRatio: "aspect-[3/4.2]",
    likes: 51,
    verified: true,
    date: "2 weeks ago",
  },
  {
    id: "6",
    name: "Vikram P.",
    sizeInfo: "Wears Size XL • Relaxed Fit",
    rating: 5,
    comment: "Best luxury basic I own. Order arrived in 2 days.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
    aspectRatio: "aspect-[3/4.4]",
    likes: 19,
    verified: true,
    date: "1 month ago",
  },
];

interface CustomerCollageProps {
  /** Optional override for visibility toggle */
  show?: boolean;
  className?: string;
}

export function CustomerCollage({ show = SHOW_CUSTOMER_COLLAGE, className = "" }: CustomerCollageProps) {
  const allReviews = [...COLUMN_1_REVIEWS, ...COLUMN_2_REVIEWS];

  const [likesState, setLikesState] = useState<Record<string, { count: number; liked: boolean }>>(() => {
    const initial: Record<string, { count: number; liked: boolean }> = {};
    allReviews.forEach((rev) => {
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

  const renderCard = (review: CustomerReview) => {
    const reviewLike = likesState[review.id] || { count: review.likes, liked: false };

    return (
      <div
        key={review.id}
        onClick={() => setActiveImageModal(review)}
        className="group bg-white border border-neutral-200/90 rounded-xl overflow-hidden shadow-[0_3px_15px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer mb-4 sm:mb-6"
      >
        {/* Customer Photo / Outfit Try-on Image */}
        <div className={`relative w-full ${review.aspectRatio} bg-neutral-100 overflow-hidden`}>
          <Image
            src={review.image}
            alt={`${review.name}'s try-on photo`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 50vw, 33vw"
          />

          {/* Top Overlay Badges */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/10 pointer-events-none" />

          {/* Verified Buyer Badge */}
          {review.verified && (
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-full flex items-center gap-1 border border-white/10">
              <CheckCircle2 size={10} className="text-white shrink-0" />
              <span className="text-[7.5px] font-bold text-white uppercase tracking-wider">
                Verified
              </span>
            </div>
          )}

          {/* Like / Helpful Micro Button */}
          <button
            type="button"
            onClick={(e) => handleLikeToggle(review.id, e)}
            className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full backdrop-blur-md text-[9px] font-bold flex items-center gap-1 transition-all duration-200 border ${
              reviewLike.liked
                ? "bg-black text-white border-black scale-105"
                : "bg-white/85 text-black border-black/10 hover:bg-white"
            }`}
          >
            <Heart
              size={10}
              className={`transition-all ${
                reviewLike.liked ? "fill-white text-white" : "text-black/70"
              }`}
            />
            <span>{reviewLike.count}</span>
          </button>
        </div>

        {/* Card Content Area matching reference screenshot */}
        <div className="p-3.5 sm:p-4 flex flex-col flex-1 bg-white justify-between">
          <div>
            {/* 5 Solid Black Stars */}
            <div className="flex items-center gap-0.5 mb-2.5">
              {[...Array(review.rating)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className="fill-black text-black shrink-0"
                />
              ))}
            </div>

            {/* Review Comment Text */}
            <p className="text-[11.5px] sm:text-xs text-neutral-800 font-medium leading-relaxed font-sans mb-5">
              {review.comment}
            </p>
          </div>

          {/* Customer Name at bottom */}
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between mt-auto">
            <span className="text-xs sm:text-sm font-bold text-neutral-900 font-sans tracking-tight">
              {review.name}
            </span>
            <span className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider">
              {review.sizeInfo.split("•")[0]?.trim()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className={`w-full py-12 md:py-16 bg-white relative z-10 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header matching exact wording & style */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-black uppercase font-sans">
            WHAT OUR CUSTOMERS ARE SAYING
          </h2>
          <p className="mt-2 text-[10px] sm:text-xs font-bold tracking-[0.3em] text-neutral-600 uppercase font-sans">
            REAL REVIEWS. REAL PEOPLE.
          </p>
        </div>

        {/* 2-Column Staggered Masonry Collage (Mobile & Desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 items-start">
          {/* Column 1 */}
          <div className="flex flex-col">
            {COLUMN_1_REVIEWS.map((review) => renderCard(review))}
          </div>

          {/* Column 2 */}
          <div className="flex flex-col">
            {COLUMN_2_REVIEWS.map((review) => renderCard(review))}
          </div>

          {/* Column 3 (Desktop Only for wider masonry) */}
          <div className="hidden md:flex flex-col">
            {COLUMN_1_REVIEWS.map((review, i) =>
              renderCard({
                ...COLUMN_2_REVIEWS[i % COLUMN_2_REVIEWS.length],
                id: `desktop-${review.id}`,
              })
            )}
          </div>
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
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl overflow-hidden max-w-md w-full shadow-2xl relative flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveImageModal(null)}
                className="absolute top-3 right-3 z-10 p-2 bg-black/70 text-white rounded-full hover:bg-black transition-colors backdrop-blur-md"
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

              {/* Modal Details */}
              <div className="p-5 bg-white flex flex-col gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(activeImageModal.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-black text-black" />
                  ))}
                </div>

                <p className="text-sm font-semibold text-black leading-snug mt-1">
                  "{activeImageModal.comment}"
                </p>

                <div className="mt-2 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-black">{activeImageModal.name}</h4>
                    <p className="text-[10px] text-neutral-500">{activeImageModal.sizeInfo}</p>
                  </div>
                  {activeImageModal.verified && (
                    <span className="px-2.5 py-1 bg-black text-white rounded-full text-[8.5px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 size={10} /> Verified Buyer
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
