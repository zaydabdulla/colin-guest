"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Star,
  CheckCircle,
  X,
  PenLine,
  Loader2,
  Camera,
  ChevronLeft,
  ChevronRight,
  Quote,
} from "lucide-react";
import { ReviewItem } from "@/lib/judgeme";

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: "cg-rev-1",
    name: "Zayd Abdulla",
    rating: 5,
    title: "Exceptional Silhouette",
    comment:
      "Heavyweight cotton with the perfect drop shoulder. The drape and wash feel truly high-end. Highly recommend.",
    verified: true,
    date: "Verified Buyer",
    images: ["/customer1.jpg"],
  },
  {
    id: "cg-rev-2",
    name: "Fidel Shaan",
    rating: 5,
    title: "10/10 Fit & Quality",
    comment:
      "Fit and fabric wash are flawless. Exactly the luxury aesthetic I wanted. Looks even better in person.",
    verified: true,
    date: "Verified Buyer",
    images: ["/customer2.jpg"],
  },
  {
    id: "cg-rev-3",
    name: "Farhan Ahammed",
    rating: 5,
    title: "Unmatched Tailoring",
    comment:
      "Quality is crazy good. Fits true to size, feels sturdy yet comfortable, and styles effortlessly with boots or sneakers.",
    verified: true,
    date: "Verified Buyer",
    images: ["/customer3.jpg"],
  },
  {
    id: "cg-rev-4",
    name: "Mowfaq Rahman",
    rating: 5,
    title: "Wardrobe Essential",
    comment:
      "Easily the best piece in my wardrobe right now. Express delivery was seamless as well.",
    verified: true,
    date: "Verified Buyer",
    images: ["/customer4.jpg"],
  },
  {
    id: "cg-rev-5",
    name: "Faaz Mohammed",
    rating: 5,
    title: "Pure Luxury Feel",
    comment:
      "Unreal drape and fabric feel. Colin Guest never disappoints. Worth every single rupee.",
    verified: true,
    date: "Verified Buyer",
    images: ["/customer5.jpg"],
  },
];

interface StoreReviewsProps {
  initialReviews?: ReviewItem[];
  averageRating?: number;
  totalCount?: number;
  className?: string;
  title?: string;
}

export function StoreReviews({
  initialReviews = DEFAULT_REVIEWS,
  averageRating: initialAvg = 5.0,
  totalCount: initialCount = 5,
  className = "",
  title = "Client Feedback",
}: StoreReviewsProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [averageRating, setAverageRating] = useState<number>(initialAvg);
  const [totalCount, setTotalCount] = useState<number>(initialCount);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // Slider State
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Form State
  const [formRating, setFormRating] = useState(5);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync live reviews from Judge.me API on mount
  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
          if (data.averageRating) setAverageRating(data.averageRating);
          if (data.totalCount) setTotalCount(data.totalCount);
        }
      })
      .catch((err) => console.log("Reviews sync silent fallback:", err));
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 20);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 20);

    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(scrollLeft / maxScroll);
    }
  };

  const scrollByDirection = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = window.innerWidth < 768 ? window.innerWidth * 0.85 : 440;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 3 - formImages.length;
    const filesToRead = Array.from(files).slice(0, remainingSlots);

    filesToRead.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === "string") {
          setFormImages((prev) => [...prev, event.target!.result as string].slice(0, 3));
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (indexToRemove: number) => {
    setFormImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          rating: formRating,
          title: formTitle,
          body: formBody,
          images: formImages,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        setSubmitStatus({ type: "success", message: data.message });
        setTimeout(() => {
          setIsWriteModalOpen(false);
          setSubmitStatus(null);
          setFormName("");
          setFormEmail("");
          setFormTitle("");
          setFormBody("");
          setFormImages([]);
        }, 2200);
      } else {
        setSubmitStatus({
          type: "error",
          message: data.message || "Could not submit review.",
        });
      }
    } catch {
      setIsSubmitting(false);
      setSubmitStatus({
        type: "error",
        message: "Network error submitting review.",
      });
    }
  };

  return (
    <section
      className={`w-full py-10 md:py-20 bg-white text-black font-sans border-t border-black/5 overflow-hidden ${className}`}
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-12">
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between mb-8 md:mb-12 gap-4">
          <div>
            <span className="text-[10px] md:text-[11px] font-medium uppercase tracking-[0.2em] text-[#b89759] block mb-0.5 font-sans italic">
              CLIENTELE FEEDBACK
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#1a1a1a] tracking-tight font-sans">
              {title}
            </h2>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-black/60 font-sans">
              <div className="flex items-center text-black">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 fill-black text-black" />
                ))}
              </div>
              <span className="font-semibold text-black/85">{averageRating.toFixed(1)} / 5.0</span>
              <span className="text-black/30">•</span>
              <span>Verified Reviews</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop-Only Top Arrows */}
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollByDirection("left")}
                disabled={!canScrollLeft}
                aria-label="Previous review"
                className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full border border-black/10 flex items-center justify-center transition-all ${
                  canScrollLeft
                    ? "hover:bg-black hover:text-white text-black cursor-pointer shadow-sm active:scale-95"
                    : "opacity-30 cursor-not-allowed text-black/40"
                }`}
              >
                <ChevronLeft className="w-4 h-4 lg:w-4.5 lg:h-4.5" />
              </button>
              <button
                type="button"
                onClick={() => scrollByDirection("right")}
                disabled={!canScrollRight}
                aria-label="Next review"
                className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full border border-black/10 flex items-center justify-center transition-all ${
                  canScrollRight
                    ? "hover:bg-black hover:text-white text-black cursor-pointer shadow-sm active:scale-95"
                    : "opacity-30 cursor-not-allowed text-black/40"
                }`}
              >
                <ChevronRight className="w-4 h-4 lg:w-4.5 lg:h-4.5" />
              </button>
            </div>

            {/* Write a Review Button - Compact & Perfectly Aligned */}
            <button
              type="button"
              onClick={() => setIsWriteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 rounded-full border border-black/15 hover:border-black text-black text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.15em] font-semibold transition-all duration-300 hover:bg-black hover:text-white shadow-sm flex-shrink-0 cursor-pointer"
            >
              <PenLine className="w-3 h-3 md:w-3.5 md:h-3.5" />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* HORIZONTAL CAROUSEL WITH SMOOTH EDGE FADES AND FLOATING ARROWS (LAPTOP) */}
        <div className="relative w-full group">
          {/* Left Edge Fade on Desktop */}
          {canScrollLeft && (
            <div className="hidden md:block pointer-events-none absolute left-0 top-0 bottom-6 w-24 lg:w-36 bg-gradient-to-r from-white via-white/80 to-transparent z-20 transition-opacity duration-300" />
          )}

          {/* Right Edge Fade on Desktop */}
          {canScrollRight && (
            <div className="hidden md:block pointer-events-none absolute right-0 top-0 bottom-6 w-28 lg:w-44 bg-gradient-to-l from-white via-white/80 to-transparent z-20 transition-opacity duration-300" />
          )}

          {/* Floating Left Arrow (Desktop Only) */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollByDirection("left")}
              aria-label="Previous review"
              className="hidden md:flex absolute left-4 lg:left-6 top-[45%] -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md text-black border border-black/10 items-center justify-center hover:bg-black hover:text-white transition-all shadow-[0_6px_20px_rgba(0,0,0,0.08)] active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Floating Right Arrow (Desktop Only) */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollByDirection("right")}
              aria-label="Next review"
              className="hidden md:flex absolute right-4 lg:right-6 top-[45%] -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md text-black border border-black/10 items-center justify-center hover:bg-black hover:text-white transition-all shadow-[0_6px_20px_rgba(0,0,0,0.08)] active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-6 pt-2 -mx-5 px-5 md:-mx-12 md:px-12 scroll-smooth"
          >
          {reviews.map((review) => (
            <div
              key={review.id}
              className="w-[84vw] max-w-[360px] md:w-[400px] flex-shrink-0 snap-start bg-[#fafafa] hover:bg-white rounded-3xl border border-black/[0.08] hover:border-black/25 p-7 md:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] group min-h-[340px] md:min-h-[360px]"
            >
              <div>
                {/* Top Row: Stars + Verified Badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 fill-black text-black"
                      />
                    ))}
                  </div>

                  {review.verified && (
                    <div className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-black bg-black/[0.06] px-3 py-1 rounded-full font-medium">
                      <CheckCircle className="w-2.5 h-2.5 text-black" />
                      <span>Verified Buyer</span>
                    </div>
                  )}
                </div>

                {/* Review Title */}
                {review.title && (
                  <h4 className="text-sm font-semibold tracking-wide uppercase text-black mb-2.5 line-clamp-1">
                    {review.title}
                  </h4>
                )}

                {/* Review Comment */}
                <p className="text-xs md:text-sm text-black/75 leading-relaxed font-normal mb-6 line-clamp-4">
                  "{review.comment}"
                </p>
              </div>

              <div>
                {/* Attached Customer Photos */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2.5 mb-5 overflow-x-auto hide-scrollbar">
                    {review.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePhoto(img)}
                        className="relative w-14 h-16 md:w-16 md:h-18 rounded-xl bg-black/5 overflow-hidden flex-shrink-0 border border-black/10 hover:border-black hover:scale-105 transition-all shadow-sm"
                      >
                        <Image
                          src={img}
                          alt="Customer Try-on"
                          fill
                          className="object-cover"
                          sizes="70px"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Reviewer Details */}
                <div className="border-t border-black/[0.07] pt-4 flex items-center justify-between text-[11px] text-black/50">
                  <span className="font-semibold text-black/85 tracking-wide">
                    {review.name}
                  </span>
                  <span className="tracking-tight">{review.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

        {/* PROGRESS INDICATOR BAR */}
        <div className="w-full flex justify-center items-center mt-6">
          <div className="w-36 h-1 bg-black/10 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-black rounded-full transition-all duration-150"
              style={{
                width: "40%",
                transform: `translateX(${scrollProgress * 150}%)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* PHOTO LIGHTBOX MODAL */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActivePhoto(null)}
        >
          <div className="relative max-w-lg w-full max-h-[85vh] aspect-[3/4] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <Image
              src={activePhoto}
              alt="Full size customer photo"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 500px"
            />
          </div>
        </div>
      )}

      {/* WRITE A REVIEW MODAL */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-lg p-7 md:p-9 rounded-3xl shadow-2xl border border-black/10 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsWriteModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/60 hover:text-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-2xl font-light uppercase tracking-tight mb-2">
              Write a Review
            </h3>
            <p className="text-xs text-black/50 mb-6">
              Share your honest feedback. Verified reviews appear on Colin Guest.
            </p>

            {submitStatus ? (
              <div
                className={`p-5 rounded-2xl text-xs font-medium text-center ${
                  submitStatus.type === "success"
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                    : "bg-red-50 text-red-900 border border-red-200"
                }`}
              >
                {submitStatus.message}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating Stars Selection */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-black/60 mb-2">
                    Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= formRating
                              ? "fill-black text-black"
                              : "text-black/20"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-black/60 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-black/15 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-black/60 mb-1">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="rahul@example.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-black/15 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>

                {/* Review Title */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-black/60 mb-1">
                    Review Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Exceptional Tailoring & Heavyweight Drape"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-black/15 focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                {/* Review Body */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-black/60 mb-1">
                    Your Review *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us what you loved about the silhouette, quality, and fit..."
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-black/15 focus:outline-none focus:border-black resize-none transition-colors"
                  />
                </div>

                {/* Photo Upload Area */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-black/60">
                      Add Try-on Photos{" "}
                      <span className="font-normal text-black/40">
                        (Optional - Max 3)
                      </span>
                    </label>
                    <span className="text-[10px] text-black/40">
                      {formImages.length}/3
                    </span>
                  </div>

                  {/* Thumbnail Previews */}
                  {formImages.length > 0 && (
                    <div className="flex gap-2.5 mb-3">
                      {formImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative w-16 h-20 rounded-xl bg-black/5 overflow-hidden border border-black/10 group"
                        >
                          <Image
                            src={img}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Trigger */}
                  {formImages.length < 3 && (
                    <>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3.5 px-4 rounded-xl border border-dashed border-black/20 hover:border-black text-black/60 hover:text-black flex items-center justify-center gap-2 text-xs transition-colors bg-[#fafafa]"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Upload photo from your device</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-black text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-black/85 transition-colors flex items-center justify-center gap-2 rounded-full mt-4 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Review</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
