"use client";

import { X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  totalProducts: number;
  filteredCount: number;
  filterOptions: {
    sizes: { value: string; count: number }[];
    colors: { value: string; count: number }[];
    types: { value: string; count: number }[];
  };
  selectedFilters: {
    sizes: string[];
    colors: string[];
    types: string[];
    availability: string | null;
  };
  onFilterChange: (type: string, value: string) => void;
  onClearAll: () => void;
  onApply: () => void;
  sortOption: string;
  onSortChange: (value: string) => void;
}

const colorMap: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  black: "#000000",
  white: "#ffffff",
  green: "#22c55e",
  yellow: "#eab308",
  brown: "#92400e",
  purple: "#a855f7",
  grey: "#6b7280"
};

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Most relevant", value: "relevance" },
  { label: "Best selling", value: "best-selling" },
  { label: "Alphabetically, A–Z", value: "title-ascending" },
  { label: "Alphabetically, Z–A", value: "title-descending" },
  { label: "Price: low → high", value: "price-ascending" },
  { label: "Price: high → low", value: "price-descending" },
  { label: "Date: old → new", value: "created-ascending" },
  { label: "Date: new → old", value: "created-descending" },
];

export function FilterDrawer({
  isOpen,
  onClose,
  totalProducts,
  filteredCount,
  filterOptions,
  selectedFilters,
  onFilterChange,
  onClearAll,
  onApply,
  sortOption,
  onSortChange,
}: FilterDrawerProps) {
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/5 z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-[60px] h-[calc(100vh-60px)] w-full sm:w-[450px] bg-white/60 backdrop-blur-3xl z-[101] shadow-2xl flex flex-col border-l border-black/5"
          >
            {/* Header */}
            <div className="px-8 py-4 border-b border-black/5 flex justify-between items-center bg-transparent sticky top-0 z-10">
              <div className="flex flex-col">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/90">Filter</h2>
                <p className="text-[8px] font-medium uppercase tracking-widest text-black/40">
                  {filteredCount} of {totalProducts} Products
                </p>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-black/5 rounded-full transition-colors">
                <X size={16} className="text-black/60" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div
              className="flex-1 overflow-y-auto px-8 py-6 space-y-8 pb-32 overscroll-contain"
              onWheel={(e) => e.stopPropagation()}
            >
              {/* Size Filter */}
              <section className="space-y-4">
                <h3 className="text-[9px] font-bold uppercase tracking-widest text-black/80">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.sizes.map(({ value, count }) => {
                    const isSelected = selectedFilters.sizes.includes(value);
                    return (
                      <button
                        key={value}
                        onClick={() => onFilterChange("sizes", value)}
                        className={`px-4 py-2 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all duration-300 border flex items-center gap-2 ${isSelected
                            ? "bg-black text-white border-black"
                            : "bg-black/5 text-black/60 border-transparent hover:bg-black/10"
                          }`}
                      >
                        {value}
                        <span className={`opacity-40 text-[7px] ${isSelected ? "text-white/60" : ""}`}>({count})</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Availability Filter */}
              <section className="space-y-4">
                <h3 className="text-[9px] font-bold uppercase tracking-widest text-black/80">Availability</h3>
                <div className="flex flex-wrap gap-2">
                  {["In stock", "Out of stock"].map((status) => {
                    const isSelected = selectedFilters.availability === status;
                    return (
                      <button
                        key={status}
                        onClick={() => onFilterChange("availability", status)}
                        className={`px-5 py-2 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all duration-300 border ${isSelected
                            ? "bg-black/40 text-white border-transparent"
                            : "bg-black/5 text-black/60 border-transparent hover:bg-black/10"
                          }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Type Filter */}
              <section className="space-y-4">
                <h3 className="text-[9px] font-bold uppercase tracking-widest text-black/80">Type</h3>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.types.map(({ value, count }) => {
                    const isSelected = selectedFilters.types.includes(value);
                    return (
                      <button
                        key={value}
                        onClick={() => onFilterChange("types", value)}
                        className={`px-4 py-2 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all duration-300 border flex items-center gap-2 ${isSelected
                            ? "bg-black/40 text-white border-transparent"
                            : "bg-black/5 text-black/60 border-transparent hover:bg-black/10"
                          }`}
                      >
                        {value}
                        <span className={`opacity-40 text-[7px] ${isSelected ? "text-white/60" : ""}`}>({count})</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Color Filter */}
              <section className="space-y-4">
                <h3 className="text-[9px] font-bold uppercase tracking-widest text-black/80">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.colors.length > 0 ? (
                    filterOptions.colors.map(({ value, count }) => {
                      const isSelected = selectedFilters.colors.includes(value);
                      const swatchColor = colorMap[value.toLowerCase()] || "#6b7280"; // Fallback to grey

                      return (
                        <button
                          key={value}
                          onClick={() => onFilterChange("colors", value)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all duration-300 border ${isSelected
                              ? "bg-black text-white border-black"
                              : "bg-black/5 text-black/60 border-transparent hover:bg-black/10"
                            }`}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-sm"
                            style={{ backgroundColor: swatchColor }}
                          />
                          <span className="flex items-center gap-1">
                            {value}
                            <span className={`opacity-40 text-[7px] ${isSelected ? "text-white/60" : ""}`}>({count})</span>
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-[8px] font-medium uppercase tracking-widest text-black/40 py-2">No colors available</p>
                  )}
                </div>
              </section>

              {/* Sort Section */}
              <section className="space-y-4 pt-4 border-t border-black/5">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="w-full flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-black/80 group"
                >
                  <span className="flex items-center gap-3">
                    Sort by:
                    <span className="text-black/40 font-medium">{sortOptions.find(o => o.value === sortOption)?.label}</span>
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-black/40 transition-transform duration-300 ${isSortOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-1"
                    >
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            onSortChange(option.value);
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-lg text-[8px] uppercase tracking-widest transition-all duration-200 ${sortOption === option.value
                              ? "bg-black/10 font-bold text-black"
                              : "text-black/40 hover:bg-black/5 hover:text-black/60"
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </div>

            {/* Footer Actions */}
            <div className="p-8 border-t border-black/5 bg-transparent grid grid-cols-2 gap-4 sticky bottom-0">
              <button
                onClick={onClearAll}
                className="w-full py-4 rounded-full border border-black/10 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-black/5 transition-all"
              >
                Remove All
              </button>
              <button
                onClick={onApply}
                className="w-full py-4 rounded-full bg-black text-white text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-black/90 transition-all shadow-lg shadow-black/10"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
