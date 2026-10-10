"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Ruler } from "lucide-react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
  productTitle?: string;
  fallbackText?: string;
}

export default function SizeGuideModal({
  isOpen,
  onClose,
  imageUrl,
  productTitle,
  fallbackText,
}: SizeGuideModalProps) {
  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          className="relative w-full max-w-md sm:max-w-lg md:max-w-xl max-h-[85vh] bg-white rounded-[22px] sm:rounded-[26px] p-3 sm:p-4 shadow-2xl border border-black/10 overflow-hidden z-10 flex flex-col font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-black/5 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center text-black/70">
                <Ruler size={13} strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-black">
                  Size Guide
                </h3>
                {productTitle && (
                  <p className="text-[8.5px] sm:text-[9.5px] text-black/40 font-medium tracking-wide truncate max-w-[180px] sm:max-w-xs">
                    {productTitle}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 flex items-center justify-center text-black/50 hover:text-black transition-all"
              aria-label="Close size guide"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>

          {/* Body Content - Fits strictly within one screen */}
          <div className="flex-1 overflow-hidden py-2 sm:py-3 flex flex-col items-center justify-center min-h-0">
            {imageUrl ? (
              <div className="w-full h-full flex items-center justify-center bg-[#fafafa] rounded-xl sm:rounded-2xl p-1.5 sm:p-2 border border-black/5 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={productTitle ? `${productTitle} Size Chart` : "Size Guide Chart"}
                  className="max-h-[50vh] sm:max-h-[60vh] w-auto max-w-full object-contain rounded-lg shadow-sm"
                  loading="eager"
                />
              </div>
            ) : (
              <div className="w-full text-center py-8 px-4">
                <p className="text-xs text-black/60 leading-relaxed max-w-md mx-auto">
                  {fallbackText || "Standard fit: This garment is tailored true to size. We recommend selecting your usual size."}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 sm:pt-2.5 border-t border-black/5 flex items-center justify-between text-[8px] sm:text-[9.5px] text-black/40 font-medium shrink-0">
            <span>Measurements in standard sizing</span>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded-full bg-black text-white text-[8.5px] sm:text-[9px] font-bold uppercase tracking-widest hover:bg-black/80 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
