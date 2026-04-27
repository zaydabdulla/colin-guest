"use client";

import { animate } from "framer-motion";

export default function ExploreButton() {
  const handleClick = () => {
    const target = document.getElementById("categories");
    if (target) {
      const targetPosition = target.getBoundingClientRect().top + window.scrollY;

      animate(window.scrollY, targetPosition, {
        duration: 1.4,
        ease: [0.33, 1, 0.68, 1], // Gentle Ease-Out (Smooth & Weighted)
        onUpdate: (latest) => window.scrollTo(0, latest),
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-fit px-12 py-4 border border-black text-black text-[10px] font-bold uppercase tracking-[0.5em] hover:bg-black hover:text-white transition-all duration-300"
    >
      Explore Collection
    </button>
  );
}
