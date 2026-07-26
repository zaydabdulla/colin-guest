"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

/**
 * FEATURE TOGGLE: Set to false to hide the Store section
 */
export const SHOW_OUR_STORE = true;

interface OurStoreProps {
  show?: boolean;
  className?: string;
}

export function OurStore({ show = SHOW_OUR_STORE, className = "" }: OurStoreProps) {
  const [imageError, setImageError] = useState(false);

  if (!show) return null;

  const storeImage = imageError ? "/collections_hero.jpg" : "/store1.jpg";
  const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=Areekode+Malappuram+Kerala";

  return (
    <section className={`w-full py-8 md:py-12 bg-white relative z-10 ${className}`}>
      <div className="max-w-md md:max-w-xl mx-auto px-4 sm:px-6">
        
        {/* Top Pill Tag - Matching Bluorng minimalist style */}
        <div className="mb-4 flex items-center justify-start">
          <span className="px-3.5 py-1 bg-black/5 text-black/60 rounded-full text-[9px] font-bold uppercase tracking-wider border border-black/5">
            FLAGSHIP STORE
          </span>
        </div>

        {/* Minimalist Store Card - Bluorng Style 1:1 */}
        <div className="bg-white border border-neutral-200/90 rounded-3xl p-3 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-3">
          
          {/* Portrait Store Photo */}
          <div className="relative w-full aspect-[4/5] bg-neutral-100 rounded-2xl overflow-hidden">
            <Image
              src={storeImage}
              alt="Colin Guest Areekode Flagship Store"
              fill
              unoptimized
              onError={() => setImageError(true)}
              className="object-cover"
              sizes="(max-width: 768px) 90vw, 50vw"
            />
          </div>

          {/* Minimalist Details Below Photo */}
          <div className="px-1 pt-1 pb-1 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-black tracking-tight font-sans">
                  Areekode
                </h3>
                <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium leading-tight font-sans mt-0.5 max-w-[220px]">
                  Main Road, Areekode, Malappuram, Kerala 673639
                </p>
              </div>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-black underline underline-offset-4 hover:text-black/70 flex items-center gap-0.5 shrink-0 pt-0.5"
              >
                <span>Get Direction</span>
                <ArrowUpRight size={13} className="shrink-0" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
