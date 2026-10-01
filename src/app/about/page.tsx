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

  // TEXT ANIMATIONS: Seamless upward glide through the top viewport mask
  // Step 1: COLIN GUEST title fades out and glides slightly up
  const titleY = useTransform(smoothProgress, [0, 0.28], [0, -70]);
  const titleOpacity = useTransform(smoothProgress, [0.05, 0.25], [0.85, 0]);

  // Step 2: Content rises continuously through the viewport as you scroll:
  // Starts below (35vh), arrives in the center (0vh) as title exits, and continues rising upward (-65vh) through the top mask!
  const contentY = useTransform(smoothProgress, [0.18, 0.42, 0.95], ["35vh", "0vh", "-65vh"]);
  const contentOpacity = useTransform(smoothProgress, [0.18, 0.38], [0, 1]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <link rel="preload" href="/about_bg.MP4" as="video" type="video/mp4" />
      <main ref={containerRef} className="relative h-[250vh] bg-transparent">
        
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

        {/* STICKY STAGE WITH TOP MASK (Always pinned to viewport, masking the top 75-170px) */}
        <div className="sticky top-0 h-screen w-full flex items-center justify-center z-30 pointer-events-none [mask-image:linear-gradient(to_bottom,transparent_0px,transparent_75px,black_170px,black_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0px,transparent_75px,black_170px,black_100%)]">
          {/* VIEWPORT 1: LANDING OVERLAY */}
          <motion.div
            style={{ y: titleY, opacity: titleOpacity }}
            className="absolute text-center pointer-events-none"
          >
            <h1 className="text-[10vw] font-serif italic font-bold leading-none mb-6 tracking-tighter text-white uppercase opacity-80">COLIN GUEST</h1>
            <p className="text-[10px] font-bold uppercase tracking-[1.5em] text-white/40">Scroll To Explore</p>
          </motion.div>

          {/* VIEWPORT 2: THE STORY (Rises continuously as you scroll, dissolving line-by-line as each part reaches the top mask) */}
          <motion.div
            style={{ y: contentY, opacity: contentOpacity }}
            className="absolute max-w-[700px] px-8 text-center space-y-8 md:space-y-10 pointer-events-auto"
          >
            <h2 className="text-4xl lg:text-6xl font-serif italic text-white leading-tight">
              Architectural <br /> Integrity.
            </h2>
            <div className="space-y-6">
              <p className="text-[13px] lg:text-[15px] font-medium leading-[1.9] text-white/85 tracking-wide max-w-xl mx-auto font-sans">
                Redefining modern streetwear and casual wear, Colinguest is made for those who move to their own rhythm. Bold cuts, premium fabrics, and unapologetic style—welcome to your new wardrobe staple.
              </p>
              <div className="w-[1px] h-12 bg-white/20 mx-auto" />
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/40">
                Est. 2024 — Master Quality
              </p>
            </div>

            <Link href="/collections#categories" className="inline-block px-12 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-[0.4em] hover:scale-105 transition-transform duration-500">
              Explore The Collections
            </Link>
          </motion.div>
        </div>

        {/* BOTTOM SPACER: Ensures a clean gap before the footer */}
        <div className="h-[20vh]" />
      </main>
    </motion.div>
  );
}
