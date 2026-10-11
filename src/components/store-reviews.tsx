"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Star, CheckCircle, X, PenLine, Loader2, Camera, UploadCloud, Trash2 } from "lucide-react";
import { ReviewItem } from "@/lib/judgeme";

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: "cg-rev-1",
    name: "Zayd Abdulla",
    rating: 5,
    title: "Exceptional Silhouette",
    comment: "Heavyweight cotton with the perfect drop shoulder. The drape and wash feel truly high-end. Highly recommend.",
    verified: true,
    date: "Verified Buyer",
    images: ["/customer1.jpg"],
  },
  {
    id: "cg-rev-2",
    name: "Fidel Shaan",
    rating: 5,
    title: "10/10 Fit & Quality",
    comment: "Fit and fabric wash are flawless. Exactly the luxury aesthetic I wanted. Looks even better in person.",
    verified: true,
    date: "Verified Buyer",
    images: ["/customer2.jpg"],
  },
  {
    id: "cg-rev-3",
    name: "Farhan Ahammed",
    rating: 5,
    title: "Unmatched Tailoring",
    comment: "Quality is crazy good. Fits true to size, feels sturdy yet comfortable, and styles effortlessly with boots or sneakers.",
    verified: true,
    date: "Verified Buyer",
    images: ["/customer3.jpg"],
  },
  {
    id: "cg-rev-4",
    name: "Mowfaq Rahman",
    rating: 5,
    title: "Wardrobe Essential",
    comment: "Easily the best piece in my wardrobe right now. Express delivery was seamless as well.",
    verified: true,
    date: "Verified Buyer",
    images: ["/customer4.jpg"],
  },
  {
    id: "cg-rev-5",
    name: "Faaz Mohammed",
    rating: 5,
    title: "Pure Luxury Feel",
    comment: "Unreal drape and fabric feel. Colin Guest never disappoints. Worth every single rupee.",
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

  // Form State
  const [formRating, setFormRating] = useState(5);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync live reviews from Judge.me endpoint on client mount
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
        setSubmitStatus({ type: "error", message: data.message || "Could not submit review." });
      }
    } catch {
      setIsSubmitting(false);
      setSubmitStatus({ type: "error", message: "Network error submitting review." });
    }
  };

  return (
    <section className={`w-full py-16 md:py-24 bg-white text-black font-sans border-t border-black/5 ${className}`}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/40">
                Verified Clientele
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
              <div className="flex items-center text-black">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-black text-black" />
                ))}
              </div>
              <span className="text-xs font-semibold text-black/80 ml-1">
                {averageRating.toFixed(1)} / 5.0
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight uppercase">
              {title}
            </h2>
          </div>

          <button
            onClick={() => setIsWriteModalOpen(true)}
            className="self-start md:self-auto inline-flex items-center gap-2.5 px-6 py-3.5 border border-black/15 hover:border-black text-black text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 hover:bg-black hover:text-white"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-[#fafafa] border border-black/5 p-6 md:p-8 flex flex-col justify-between transition-all duration-300 hover:border-black/20 hover:shadow-sm"
            >
              <div>
                {/* Top Row: Stars + Verified Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-black text-black" />
                    ))}
                  </div>

                  {review.verified && (
                    <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-black/60 bg-black/5 px-2 py-0.5 rounded-full font-medium">
                      <CheckCircle className="w-2.5 h-2.5 text-black" />
                      <span>Verified Buyer</span>
                    </div>
                  )}
                </div>

                {/* Review Title */}
                {review.title && (
                  <h4 className="text-sm font-semibold tracking-wide uppercase text-black mb-2">
                    {review.title}
                  </h4>
                )}

                {/* Review Comment */}
                <p className="text-xs md:text-sm text-black/70 leading-relaxed font-normal mb-6">
                  "{review.comment}"
                </p>
              </div>

              <div>
                {/* Attached Customer Photos */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
                    {review.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePhoto(img)}
                        className="relative w-14 h-18 rounded bg-black/5 overflow-hidden flex-shrink-0 border border-black/10 hover:opacity-80 transition-opacity"
                      >
                        <Image
                          src={img}
                          alt="Customer Try-on"
                          fill
                          className="object-cover"
                          sizes="60px"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Reviewer Details */}
                <div className="border-t border-black/5 pt-4 flex items-center justify-between text-[11px] text-black/50">
                  <span className="font-semibold text-black/80">{review.name}</span>
                  <span>{review.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PHOTO LIGHTBOX MODAL */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActivePhoto(null)}
        >
          <div className="relative max-w-lg w-full max-h-[85vh] aspect-[3/4] bg-black rounded overflow-hidden">
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40 transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-lg p-6 md:p-8 rounded shadow-2xl border border-black/10 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsWriteModalOpen(false)}
              className="absolute top-6 right-6 text-black/40 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-light uppercase tracking-tight mb-2">Write a Review</h3>
            <p className="text-xs text-black/50 mb-6">
              Share your honest experience. Verified reviews appear on Colin Guest.
            </p>

            {submitStatus ? (
              <div
                className={`p-4 rounded text-xs font-medium text-center ${
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
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-black/60 mb-1.5">
                    Rating *
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
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
                      className="w-full px-3 py-2 text-xs border border-black/15 rounded-none focus:outline-none focus:border-black"
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
                      className="w-full px-3 py-2 text-xs border border-black/15 rounded-none focus:outline-none focus:border-black"
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
                    placeholder="e.g. Unbelievable Quality & Fit"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-black/15 rounded-none focus:outline-none focus:border-black"
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
                    placeholder="Tell us what you liked about the garment, the silhouette, and the fabric feel..."
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-black/15 rounded-none focus:outline-none focus:border-black resize-none"
                  />
                </div>

                {/* Photos Upload Section */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-black/60">
                      Add Try-on Photos <span className="font-normal text-black/40">(Optional - Max 3)</span>
                    </label>
                    <span className="text-[10px] text-black/40">{formImages.length}/3</span>
                  </div>

                  {/* Thumbnail Previews */}
                  {formImages.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {formImages.map((img, idx) => (
                        <div key={idx} className="relative w-16 h-20 rounded bg-black/5 overflow-hidden border border-black/10 group">
                          <Image src={img} alt="Preview" fill className="object-cover" />
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

                  {/* File Upload Trigger */}
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
                        className="w-full py-3 px-4 border border-dashed border-black/20 hover:border-black text-black/60 hover:text-black flex items-center justify-center gap-2 text-xs transition-colors bg-[#fafafa]"
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
                  className="w-full py-3.5 bg-black text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-black/85 transition-colors flex items-center justify-center gap-2 mt-4"
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
