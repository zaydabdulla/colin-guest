"use client";

import React, { useState } from 'react';
import { Truck, Check, AlertCircle, Loader2, ClipboardList, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PincodeChecker() {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setError('Enter a valid 6-digit pincode');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/delhivery/serviceability?pincode=${pincode}&t=${Date.now()}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Verification failed. Try again.');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to format date with ordinals (e.g. "Jun 23rd")
  const formatDateWithOrdinal = (date: Date) => {
    const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
    // JS getMonth returns 0-11. Let's map it correctly using standard names:
    const standardMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const d = date.getDate();
    const m = standardMonths[date.getMonth()];
    
    let suffix = "th";
    if (d < 11 || d > 13) {
      switch (d % 10) {
        case 1: suffix = "st"; break;
        case 2: suffix = "nd"; break;
        case 3: suffix = "rd"; break;
      }
    }
    return `${m} ${d}${suffix}`;
  };

  // Helper to format date range (e.g. "Jun 24th - 25th" or "Jun 24th - Jul 1st")
  const formatDateRange = (startDays: number, endDays: number) => {
    const start = new Date();
    start.setDate(start.getDate() + startDays);
    const end = new Date();
    end.setDate(end.getDate() + endDays);

    const startStr = formatDateWithOrdinal(start);
    const endStr = formatDateWithOrdinal(end);

    const startParts = startStr.split(' ');
    const endParts = endStr.split(' ');

    if (startParts[0] === endParts[0]) {
      return `${startParts[0]} ${startParts[1]} - ${endParts[1]}`;
    }
    return `${startStr} - ${endStr}`;
  };

  // Animation variants
  const timelineVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: "auto",
      transition: { 
        height: { duration: 0.3 },
        opacity: { duration: 0.4, delay: 0.1 },
        staggerChildren: 0.15
      }
    },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2 } }
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { type: "spring" as const, stiffness: 150, damping: 15 } 
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 0 0 0px rgba(0, 0, 0, 0.1)",
        "0 0 0 6px rgba(0, 0, 0, 0.05)",
        "0 0 0 0px rgba(0, 0, 0, 0)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  return (
    <div className="w-full mt-4 font-sans pt-4 border-t border-black/5">
      <h4 className="text-[7px] font-bold uppercase tracking-[0.25em] text-black/30 mb-2.5 flex items-center gap-1">
        <Truck size={9} strokeWidth={2.5} /> Check Delivery Details
      </h4>
      <form onSubmit={handleCheck} className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
          placeholder="ENTER PINCODE"
          className="flex-1 bg-black/[0.03] border border-black/5 rounded-md px-3 py-1.5 text-[8px] font-bold tracking-[0.1em] outline-none focus:border-black/20 focus:bg-transparent transition-all placeholder:text-black/20 text-black font-semibold"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-1.5 rounded-md text-[8px] font-bold tracking-[0.15em] hover:bg-black/80 transition-colors uppercase disabled:opacity-50 flex items-center justify-center min-w-[60px]"
        >
          {loading ? <Loader2 size={8} className="animate-spin" /> : 'CHECK'}
        </button>
      </form>
      
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            className="text-[7.5px] font-bold text-red-500 mt-2 uppercase tracking-wider flex items-center gap-1"
          >
            <AlertCircle size={8} /> {error}
          </motion.p>
        )}
        
        {result && (
          <motion.div
            variants={timelineVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden"
          >
            {result.deliverable ? (
              <div className="mt-5 pt-4 border-t border-black/5">
                {/* Header Status */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-1 text-green-600 font-extrabold text-[8px] uppercase tracking-wider">
                    <Check size={9} strokeWidth={3} /> 
                    <span>Deliverable to {result.district || 'Your Pincode'}</span>
                  </div>
                  <div className="text-[7px] font-bold text-black/50 uppercase tracking-widest bg-black/[0.03] px-2 py-0.5 rounded-md border border-black/5">
                    {result.cod ? "COD & Prepaid Available" : "Prepaid Only"}
                  </div>
                </div>

                {/* Horizontal Timeline Graphic */}
                <div className="relative flex justify-between items-start px-1 py-2 mb-2">
                  {/* Connecting Line */}
                  <div className="absolute top-[17px] left-[12%] right-[12%] h-[1.5px] bg-black/10 z-0" />
                  
                  {/* Step 1: Ordered */}
                  <motion.div variants={stepVariants} className="flex flex-col items-center text-center w-[30%] z-10">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white mb-2 border border-black/10 shadow-sm">
                      <ClipboardList size={11} strokeWidth={2.2} />
                    </div>
                    <span className="text-[7.5px] font-bold text-black uppercase tracking-wider">Ordered</span>
                    <span className="text-[7px] text-black/40 font-semibold mt-0.5 whitespace-nowrap">
                      {formatDateWithOrdinal(new Date())}
                    </span>
                  </motion.div>

                  {/* Step 2: Dispatch */}
                  <motion.div variants={stepVariants} className="flex flex-col items-center text-center w-[30%] z-10">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white mb-2 border border-black/10 shadow-sm">
                      <Truck size={11} strokeWidth={2.2} />
                    </div>
                    <span className="text-[7.5px] font-bold text-black uppercase tracking-wider">Ready to Ship</span>
                    <span className="text-[7px] text-black/40 font-semibold mt-0.5 whitespace-nowrap">
                      {formatDateRange(1, 2)}
                    </span>
                  </motion.div>

                  {/* Step 3: Delivered */}
                  <motion.div variants={stepVariants} className="flex flex-col items-center text-center w-[30%] z-10">
                    <motion.div 
                      variants={pulseVariants}
                      animate="pulse"
                      className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white mb-2 border border-black/10 shadow-sm relative"
                    >
                      <Package size={11} strokeWidth={2.2} />
                    </motion.div>
                    <span className="text-[7.5px] font-bold text-black uppercase tracking-wider">Delivered</span>
                    <span className="text-[7px] text-black font-bold mt-0.5 whitespace-nowrap">
                      {formatDateRange(result.minDays || 3, result.maxDays || 5)}
                    </span>
                  </motion.div>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1 text-red-500 font-extrabold text-[8px] uppercase tracking-wider mt-3"
              >
                <AlertCircle size={9} strokeWidth={3} /> <span>NON-SERVICEABLE PINCODE</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
