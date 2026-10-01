"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";

export default function AboutPage() {
  const containerRef = useRef(null);

  // We use a shorter scroll range for a tight, single-page feel
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // "Liquid Silk" physics: Snappy enough to recover quickly on scroll-up
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    mass: 0.5,
    restDelta: 0.001
  });

  // VIDEO EFFECTS: Unified Dimming Overlay
  const overlayOpacity = useTransform(smoothProgress, [0, 0.4], [0.1, 0.85]);
  const videoScale = useTransform(smoothProgress, [0, 1], [1, 1.05]);
  const videoBlur = useTransform(smoothProgress, [0, 0.5], ["blur(0px)", "blur(2px)"]);

  // TEXT ANIMATIONS: Tight simultaneous cross-fade — one decisive glide
  // Step 1: COLIN GUEST fades out quickly in a tight band
  const titleY = useTransform(smoothProgress, [0, 0.4], [0, -60]);
  const titleOpacity = useTransform(smoothProgress, [0.1, 0.35], [0.85, 0]);

  // Step 2: Content rises in sync — starts close (15vh) and lands exactly as title exits
  const contentY = useTransform(smoothProgress, [0.15, 0.45], ["15vh", "0vh"]);
  const contentOpacity = useTransform(smoothProgress, [0.18, 0.45, 0.75, 0.92], [0, 1, 1, 0]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <link rel="preload" href="/about_bg.MP4" as="video" type="video/mp4" />
      <main ref={containerRef} className="relative h-[240vh] bg-transparent">
        
        {/* FIXED VIDEO BACKGROUND */}
        <div className="fixed inset-0 w-full h-screen z-0 overflow-hidden">
          <motion.div 
            style={{ 
              scale: videoScale,
              filter: videoBlur
            }}
            className="w-full h-full"
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            >
              <source src="/about_bg.MP4" type="video/mp4" />
            </video>
          </motion.div>
          
          {/* DYNAMIC OVERLAY: This dims the video smoothly without artifacts */}
          <motion.div 
            style={{ opacity: overlayOpacity }}
            className="absolute inset-0 z-10 pointer-events-none bg-black" 
          />
        </div>

        {/* VIEWPORT 1: LANDING OVERLAY (Locked to first movement) */}
        <section className="sticky top-0 h-screen flex flex-col items-center justify-center z-20 pointer-events-none">
          <motion.div
            style={{ y: titleY, opacity: titleOpacity }}
            className="text-center"
          >
            <h1 className="text-[10vw] font-serif italic font-bold leading-none mb-6 tracking-tighter text-white uppercase opacity-80">COLIN GUEST</h1>
            <p className="text-[10px] font-bold uppercase tracking-[1.5em] text-white/40">Scroll To Explore</p>
          </motion.div>
        </section>

        {/* VIEWPORT 2: THE STORY (Sticks in optical center with top gradient mask dissolve) */}
        <section className="sticky top-0 h-screen flex items-center justify-center z-30 px-8 pt-20 pb-8 [mask-image:linear-gradient(to_bottom,transparent_0px,transparent_80px,black_160px,black_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0px,transparent_80px,black_160px,black_100%)]">
          <motion.div
            style={{ y: contentY, opacity: contentOpacity }}
            className="max-w-[700px] text-center space-y-6 md:space-y-8"
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif italic text-white leading-tight">
              Architectural <br /> Integrity.
            </h2>
            <div className="space-y-4 md:space-y-6">
              <p className="text-[12px] md:text-[14px] lg:text-[15px] font-medium leading-[1.8] text-white/85 tracking-wide max-w-xl mx-auto font-sans">
                Redefining modern streetwear and casual wear, Colinguest is made for those who move to their own rhythm. Bold cuts, premium fabrics, and unapologetic style—welcome to your new wardrobe staple.
              </p>
              <div className="w-[1px] h-8 md:h-12 bg-white/20 mx-auto" />
              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.5em] text-white/40">
                Est. 2024 — Master Quality
              </p>
            </div>

            <Link href="/collections#categories" className="inline-block px-10 md:px-12 py-3.5 md:py-4 bg-white text-black text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] hover:scale-105 transition-transform duration-500">
              Explore The Collections
            </Link>
          </motion.div>
        </section>

        {/* BOTTOM SPACER: Ensures a clean gap before the footer */}
        <div className="h-[20vh]" />
      </main>
    </motion.div>
  );
}
