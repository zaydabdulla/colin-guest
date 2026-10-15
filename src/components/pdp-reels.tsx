"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Volume2,
  VolumeX,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  CheckCircle,
} from "lucide-react";
import { Product } from "@/lib/data";

export interface ReelItem {
  id: string;
  videoUrl: string;
  posterUrl?: string;
  customerHandle: string;
  customerName?: string;
  customerStats?: string;
  caption?: string;
  productTitle?: string;
  productPrice?: string;
  productImage?: string;
  productHandle?: string;
}

interface PdpReelsProps {
  product?: Product;
  className?: string;
  title?: string;
  subtitle?: string;
}

// Curated luxury customer results fallback clips
const DEFAULT_REELS: ReelItem[] = [
  {
    id: "reel-1",
    videoUrl: "/Mobile_video.mp4",
    posterUrl: "/customer1.jpg",
    customerHandle: "@zayd.abdulla",
    customerName: "Zayd Abdulla",
    customerStats: "6'1\" • Size L",
    caption: "The heavyweight drape and drop shoulder silhouette is unmatched.",
  },
  {
    id: "reel-2",
    videoUrl: "/Mobile_video.mp4",
    posterUrl: "/customer2.jpg",
    customerHandle: "@fidel.shaan",
    customerName: "Fidel Shaan",
    customerStats: "5'11\" • Size M",
    caption: "10/10 wash & structure. Looks even crazier in person.",
  },
  {
    id: "reel-3",
    videoUrl: "/Mobile_video.mp4",
    posterUrl: "/customer3.jpg",
    customerHandle: "@farhan.ahammed",
    customerName: "Farhan A.",
    customerStats: "6'0\" • Size L",
    caption: "Subtle distressing with luxury tailoring. Pairs with everything.",
  },
  {
    id: "reel-4",
    videoUrl: "/Mobile_video.mp4",
    posterUrl: "/customer4.jpg",
    customerHandle: "@mowfaq.r",
    customerName: "Mowfaq R.",
    customerStats: "5'10\" • Size M",
    caption: "Essential staple piece. True to size with a clean boxy cut.",
  },
  {
    id: "reel-5",
    videoUrl: "/Mobile_video.mp4",
    posterUrl: "/customer5.jpg",
    customerHandle: "@faaz.mohammed",
    customerName: "Faaz M.",
    customerStats: "6'2\" • Size XL",
    caption: "Heavy fabric weight that actually holds its shape all day.",
  },
];

export function PdpReels({
  product,
  className = "",
  title = "Styled by You",
  subtitle = "Real fits & silhouettes from our community",
}: PdpReelsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Active full-screen reel lightbox modal
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const activeVideoRef = useRef<HTMLVideoElement>(null);

  // Lock body scroll and hide background navbars when modal is open
  useEffect(() => {
    if (activeReelIndex !== null) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("lightbox-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("lightbox-open");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("lightbox-open");
    };
  }, [activeReelIndex]);

  // Parse reels from product metafield if available, else use curated defaults
  const reels: ReelItem[] = (() => {
    if (!product?.reels) return DEFAULT_REELS;

    try {
      // 1. Try parsing JSON array
      const parsed = JSON.parse(product.reels);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any, idx: number) => ({
          id: item.id || `meta-reel-${idx}`,
          videoUrl: item.videoUrl || item.url || item.src || "/Mobile_video.mp4",
          posterUrl: item.posterUrl || item.poster || product.src,
          customerHandle: item.customerHandle || item.handle || "@clientele",
          customerName: item.customerName || item.name || "Verified Client",
          customerStats: item.customerStats || item.stats || "True to Size",
          caption: item.caption || item.review || "Community styling showcase",
          productTitle: item.productTitle || product.title,
          productPrice: item.productPrice || product.price,
          productImage: item.productImage || product.src,
          productHandle: item.productHandle || product.handle || String(product.id),
        }));
      }
    } catch {
      // 2. Try comma-separated video URLs
      const urls = product.reels
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean);
      if (urls.length > 0) {
        return urls.map((url, idx) => ({
          id: `url-reel-${idx}`,
          videoUrl: url,
          posterUrl: product.src,
          customerHandle: `@clientele.look${idx + 1}`,
          customerName: "Verified Client",
          customerStats: "True to Size",
          caption: `Styling ${product.title}`,
          productTitle: product.title,
          productPrice: product.price,
          productImage: product.src,
          productHandle: product.handle || String(product.id),
        }));
      }
    }

    return DEFAULT_REELS;
  })();

  // Handle horizontal scrolling state
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 20);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 20);
  };

  const scrollByDirection = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = window.innerWidth < 768 ? 220 : 270;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -cardWidth * 2 : cardWidth * 2,
      behavior: "smooth",
    });
  };

  // Lightbox keyboard controls
  useEffect(() => {
    if (activeReelIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveReelIndex(null);
      } else if (e.key === "ArrowLeft") {
        setActiveReelIndex((prev) =>
          prev !== null ? (prev - 1 + reels.length) % reels.length : null
        );
      } else if (e.key === "ArrowRight") {
        setActiveReelIndex((prev) =>
          prev !== null ? (prev + 1) % reels.length : null
        );
      } else if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "m" || e.key === "M") {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeReelIndex, reels.length]);

  // Video progress tracking in lightbox
  const handleTimeUpdate = () => {
    if (!activeVideoRef.current) return;
    const current = activeVideoRef.current.currentTime;
    const duration = activeVideoRef.current.duration;
    if (duration > 0) {
      setProgress((current / duration) * 100);
    }
  };

  const togglePlay = () => {
    if (!activeVideoRef.current) return;
    if (isPlaying) {
      activeVideoRef.current.pause();
      setIsPlaying(false);
    } else {
      activeVideoRef.current.play();
      setIsPlaying(true);
    }
  };

  if (!reels || reels.length === 0) return null;

  // Active reel item and its tagged product info
  const activeReel = activeReelIndex !== null ? reels[activeReelIndex] : null;
  const featuredProduct = activeReel
    ? {
        title: activeReel.productTitle || product?.title || "Colin Guest Archive",
        price: activeReel.productPrice || product?.price || "",
        image: activeReel.productImage || product?.src || "/customer1.jpg",
        handle: activeReel.productHandle || product?.handle || String(product?.id || ""),
      }
    : null;

  return (
    <section className={`w-full py-8 md:py-16 bg-white text-black font-sans ${className}`}>
      <div className="max-w-[1400px] mx-auto px-5 md:px-12">
        {/* HEADER SECTION (EXACT LUXURY EDITORIAL STYLE MATCHING CLIENT FEEDBACK) */}
        <div className="flex items-center justify-between mb-8 md:mb-12 gap-3 sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#1a1a1a] tracking-tight font-sans">
              {title}
            </h2>
            <p className="text-[11px] sm:text-xs text-black/60 font-sans mt-1">
              {subtitle}
            </p>
          </div>

          {/* Desktop-Only Arrow Controls (Matching StoreReviews) */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => scrollByDirection("left")}
              disabled={!canScrollLeft}
              aria-label="Previous looks"
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
              aria-label="Next looks"
              className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full border border-black/10 flex items-center justify-center transition-all ${
                canScrollRight
                  ? "hover:bg-black hover:text-white text-black cursor-pointer shadow-sm active:scale-95"
                  : "opacity-30 cursor-not-allowed text-black/40"
              }`}
            >
              <ChevronRight className="w-4 h-4 lg:w-4.5 lg:h-4.5" />
            </button>
          </div>
        </div>

        {/* REELS CAROUSEL DECK */}
        <div className="relative w-full">
          {/* Subtle Right Fade Gradient on Desktop */}
          {canScrollRight && (
            <div className="hidden md:block pointer-events-none absolute right-0 top-0 bottom-6 w-16 lg:w-24 bg-gradient-to-l from-white to-transparent z-10 transition-opacity duration-300" />
          )}

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-3.5 sm:gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory hide-scrollbar no-scrollbar pb-6 pt-1 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {reels.map((reel, index) => (
              <div
                key={reel.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveReelIndex(index);
                  setIsPlaying(true);
                  setIsMuted(false);
                }}
                className="group relative w-[190px] sm:w-[220px] md:w-[240px] aspect-[9/16] flex-shrink-0 snap-start rounded-3xl overflow-hidden bg-black/5 border border-black/[0.08] hover:border-black/25 transition-all duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] cursor-pointer select-none"
              >
                {/* Looping Muted Preview Video */}
                <video
                  src={reel.videoUrl}
                  poster={reel.posterUrl}
                  muted
                  playsInline
                  loop
                  autoPlay
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Scrim Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />

                {/* Center Hover Glow Icon */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md text-black flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  </div>
                </div>

                {/* Bottom Details */}
                <div className="absolute bottom-0 inset-x-0 p-4 text-white z-10 flex flex-col justify-end">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-xs font-semibold tracking-wide drop-shadow-sm font-sans">
                      {reel.customerHandle}
                    </span>
                    <CheckCircle className="w-3 h-3 text-[#b89759] fill-[#b89759]/20" />
                  </div>

                  {reel.caption && (
                    <p className="text-[11px] text-white/85 leading-snug line-clamp-2 drop-shadow-sm font-normal">
                      "{reel.caption}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 9:16 REEL LIGHTBOX WINDOW (HIGH Z-INDEX & STRICT 9:16 RATIO ON LAPTOP & MOBILE) */}
      {activeReelIndex !== null && reels[activeReelIndex] && (
        <div
          className="fixed inset-0 z-[99999] bg-black/92 backdrop-blur-xl flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setActiveReelIndex(null)}
        >
          {/* Centered 9:16 Floating Window Card (Strict 9:16 on both laptop and mobile) */}
          <div
            className="relative aspect-[9/16] bg-black rounded-[24px] sm:rounded-[32px] overflow-hidden flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-white/20 shrink-0"
            style={{
              height: "min(76vh, 700px)",
              width: "min(90vw, calc(min(76vh, 700px) * 9 / 16))",
              maxHeight: "calc(90vw * 16 / 9)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Reel Progress Bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-white/25 z-30">
              <div
                className="h-full bg-white transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Top In-Video Controls - Clean video with sound toggle & single close button */}
            <div className="absolute top-3.5 right-3.5 flex items-center gap-2 z-30 pointer-events-auto">
              {/* Audio Toggle Button */}
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/75 border border-white/15 transition-all cursor-pointer active:scale-95 shadow-md"
                aria-label={isMuted ? "Unmute audio" : "Mute audio"}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white/85" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>

              {/* Single Close Button on the Reel */}
              <button
                type="button"
                onClick={() => setActiveReelIndex(null)}
                className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/75 border border-white/15 transition-all cursor-pointer active:scale-95 shadow-md"
                aria-label="Close reel viewer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Video Player (Click to Play/Pause) */}
            <div
              className="relative flex-1 w-full h-full bg-black flex items-center justify-center cursor-pointer"
              onClick={togglePlay}
            >
              <video
                ref={activeVideoRef}
                key={reels[activeReelIndex].videoUrl}
                src={reels[activeReelIndex].videoUrl}
                poster={reels[activeReelIndex].posterUrl}
                autoPlay
                playsInline
                loop
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full object-cover"
              />

              {/* Pause/Play Watermark Feedback */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-white/90 text-black flex items-center justify-center shadow-2xl">
                    <Play className="w-5 h-5 fill-black ml-0.5" />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Floating Product Bar with "SHOP THIS PRODUCT" */}
            <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black via-black/85 to-transparent z-30">
              {/* Customer Handle & Caption */}
              <div className="mb-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-semibold tracking-wide drop-shadow-sm font-sans text-white">
                    {reels[activeReelIndex].customerHandle}
                  </span>
                  <CheckCircle className="w-3 h-3 text-[#b89759] fill-[#b89759]/20" />
                </div>
                {reels[activeReelIndex].caption && (
                  <p className="text-[11px] sm:text-xs text-white/95 leading-snug drop-shadow-md font-sans line-clamp-2">
                    "{reels[activeReelIndex].caption}"
                  </p>
                )}
              </div>

              {/* Tagged Product Box */}
              {featuredProduct && (
                <div className="p-2.5 sm:p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between gap-2.5 shadow-2xl">
                  <Link
                    href={`/product/${featuredProduct.handle}`}
                    onClick={() => setActiveReelIndex(null)}
                    className="flex items-center gap-2.5 min-w-0 group/prod cursor-pointer"
                  >
                    <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-black/30 shrink-0 border border-white/15">
                      <Image
                        src={featuredProduct.image}
                        alt={featuredProduct.title}
                        fill
                        className="object-cover group-hover/prod:scale-105 transition-transform"
                        sizes="50px"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[11px] sm:text-xs font-semibold text-white truncate tracking-wide group-hover/prod:underline">
                        {featuredProduct.title}
                      </h4>
                      {featuredProduct.price && (
                        <p className="text-[10px] sm:text-[11px] text-white/75 font-medium mt-0.5">
                          {featuredProduct.price}
                        </p>
                      )}
                    </div>
                  </Link>

                  {/* DIRECT "SHOP THIS PRODUCT" BUTTON -> GOES TO SPECIFIC PDP */}
                  <Link
                    href={`/product/${featuredProduct.handle}`}
                    onClick={() => setActiveReelIndex(null)}
                    className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-white text-black hover:bg-white/90 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-lg whitespace-nowrap"
                  >
                    <span>Shop</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* Previous Reel Arrow (Desktop) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveReelIndex(
                  (activeReelIndex - 1 + reels.length) % reels.length
                );
              }}
              className="hidden sm:flex absolute -left-14 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 items-center justify-center transition-all cursor-pointer"
              aria-label="Previous look"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next Reel Arrow (Desktop) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveReelIndex((activeReelIndex + 1) % reels.length);
              }}
              className="hidden sm:flex absolute -right-14 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 items-center justify-center transition-all cursor-pointer"
              aria-label="Next look"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
