"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, animate } from "framer-motion";
import { Collection } from "@/lib/data";

interface CollectionsHubClientProps {
  collections: Collection[];
  allProductsImage: string;
}

export function CollectionsHubClient({ collections, allProductsImage }: CollectionsHubClientProps) {
  useEffect(() => {
    // If arriving with #categories hash, perform buttery scroll 
    if (window.location.hash === "#categories") {
      // 1. Immediately prevent the browser's native jump by forcing top
      window.scrollTo(0, 0);
      
      const timer = setTimeout(() => {
        const target = document.getElementById("categories");
        if (target) {
          const targetPosition = target.getBoundingClientRect().top + window.scrollY;
          
          // 2. Clean URL so refresh doesn't trigger it again
          window.history.replaceState(null, "", window.location.pathname);

          animate(window.scrollY, targetPosition, {
            duration: 1.8,
            ease: [0.33, 1, 0.68, 1],
            onUpdate: (latest) => window.scrollTo(0, latest),
          });
        }
      }, 100); // Shorter delay for instant response
      return () => clearTimeout(timer);
    }
  }, []);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 1.5,
        ease: [0.22, 1, 0.36, 1] // Silky smooth exponential out
      } as any
    }
  };

  return (
    <div id="categories" className="py-12 px-8 max-w-[1800px] mx-auto">
      <h3 className="text-xs font-bold tracking-[0.3em] uppercase mb-12 opacity-40">Browse Categories</h3>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div variants={itemVariants}>
          <Link href="/collections/all" className="group">
            <div className="relative w-full aspect-square bg-[#f8f8f8] rounded-2xl overflow-hidden">
              <Image 
                src={allProductsImage} 
                alt="All Products" 
                fill 
                className="object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700" 
              />
            </div>
            <div className="mt-6 flex items-center font-bold text-xs tracking-widest uppercase">
              All Products <span className="ml-3 group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </Link>
        </motion.div>

        {collections.map((collection) => (
          <motion.div key={collection.id} variants={itemVariants}>
            <Link href={`/collections/${collection.handle}`} className="group">
              <div className="relative w-full aspect-square bg-[#f8f8f8] rounded-2xl overflow-hidden">
                <Image 
                  src={collection.image?.url || "/placeholder.jpg"} 
                  alt={collection.title} 
                  fill 
                  className="object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700" 
                />
              </div>
              <div className="mt-6 flex items-center font-bold text-xs tracking-widest uppercase">
                {collection.title} <span className="ml-3 group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
