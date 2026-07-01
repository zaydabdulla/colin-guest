"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface ComingSoonWrapperProps {
  children: React.ReactNode;
}

export function ComingSoonWrapper({ children }: ComingSoonWrapperProps) {
  const [isBypassed, setIsBypassed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if ?preview=true is in URL or localStorage has bypass
    const params = new URLSearchParams(window.location.search);
    if (params.get("preview") === "true" || localStorage.getItem("coming_soon_bypass") === "true") {
      localStorage.setItem("coming_soon_bypass", "true");
      setIsBypassed(true);
    }
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-white/20" size={24} />
      </div>
    );
  }

  const comingSoonEnabled = process.env.NEXT_PUBLIC_COMING_SOON === "true";
  
  if (isBypassed || !comingSoonEnabled) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-black text-[#fcfcfc] flex flex-col items-center justify-center font-sans select-none px-6">
      <div className="text-center space-y-6 flex flex-col items-center">
        {/* Brand logo exactly as it appears in the top bar (inverted for black background) */}
        <div className="relative h-[72px] w-64 invert brightness-200">
          <Image
            src="/logo_cg.png"
            alt="COLIN GUEST"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Minimal divider line */}
        <div className="h-[1px] w-6 bg-white/10 mx-auto" />

        {/* Coming Soon information */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/40">
            COMING SOON
          </h2>
          <p className="text-[10px] text-white/30 uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
            We are currently preparing the unveiling. Access will be granted shortly.
          </p>
        </div>
      </div>
    </div>
  );
}
