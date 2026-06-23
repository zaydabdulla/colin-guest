"use client";

import React, { useState } from 'react';
import { Truck, Check, AlertCircle, Loader2 } from 'lucide-react';
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
      const res = await fetch(`/api/delhivery/serviceability?pincode=${pincode}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError('Verification failed. Try again.');
    } finally {
      setLoading(false);
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
          className="flex-1 bg-black/[0.03] border border-black/5 rounded-md px-3 py-1.5 text-[8px] font-bold tracking-[0.1em] outline-none focus:border-black/20 focus:bg-transparent transition-all placeholder:text-black/20"
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
            className="text-[7.5px] font-bold text-red-500 mt-2 uppercase tracking-wider"
          >
            {error}
          </motion.p>
        )}
        
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-2.5 space-y-1 text-[8px] font-bold text-black/50 tracking-wide uppercase"
          >
            {result.deliverable ? (
              <>
                <div className="flex items-center gap-1 text-green-600 font-extrabold">
                  <Check size={9} strokeWidth={3} /> <span>DELIVERABLE TO {result.district || 'YOUR PINCODE'}</span>
                </div>
                <div className="pl-3.5 space-y-0.5 mt-1 normal-case text-[7.5px] font-medium tracking-normal text-black/40">
                  <p>Estimated Delivery: <strong className="text-black font-semibold">{result.eta}</strong></p>
                  <p>Payment: <strong className="text-black font-semibold">{result.cod ? "COD & Prepaid Available" : "Prepaid Only"}</strong></p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1 text-red-500 font-extrabold">
                <AlertCircle size={9} strokeWidth={3} /> <span>NON-SERVICEABLE PINCODE</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
