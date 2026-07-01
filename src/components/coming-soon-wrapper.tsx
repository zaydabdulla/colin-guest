"use client";

import { useState, useEffect } from "react";
import { Loader2, ShieldCheck, ArrowRight, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ComingSoonWrapperProps {
  children: React.ReactNode;
}

export function ComingSoonWrapper({ children }: ComingSoonWrapperProps) {
  const [isBypassed, setIsBypassed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

  useEffect(() => {
    // Check if ?preview=true is in URL or localStorage has bypass
    const params = new URLSearchParams(window.location.search);
    if (params.get("preview") === "true" || localStorage.getItem("coming_soon_bypass") === "true") {
      localStorage.setItem("coming_soon_bypass", "true");
      setIsBypassed(true);
    }
    setChecking(false);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Bypass passwords
    if (password === "colinshow" || password === "colinguest") {
      localStorage.setItem("coming_soon_bypass", "true");
      setIsBypassed(true);
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmittingEmail(true);
    // Simulate database newsletter subscription
    setTimeout(() => {
      setIsSubmittingEmail(false);
      setSubmitted(true);
      setEmail("");
    }, 1200);
  };

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
    <div className="min-h-screen bg-[#050505] text-[#fcfcfc] flex flex-col justify-between font-sans relative overflow-hidden select-none">
      {/* Background Abstract Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full px-8 py-8 flex justify-between items-center z-10 border-b border-white/[0.03]">
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">Colin Guest House</span>
        <button 
          onClick={() => setShowPasswordInput(!showPasswordInput)}
          className="text-white/20 hover:text-white/60 transition-colors p-1"
          title="Enter passcode"
        >
          <Lock size={12} strokeWidth={2} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 z-10 text-center max-w-lg mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Brand Logo */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-serif italic tracking-wide text-white">COLIN GUEST</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">Haute Couture & Streetwear</p>
          </div>

          <div className="h-[1px] w-12 bg-white/10 mx-auto" />

          {/* Status Wording */}
          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-serif italic text-white/90">Collection I — Coming Soon</h2>
            <p className="text-[10px] sm:text-xs text-white/50 leading-relaxed max-w-sm mx-auto uppercase tracking-wider">
              We are currently preparing the unveiling. Access will be granted shortly.
            </p>
          </div>

          {/* Email Subscription / Passcode inputs */}
          <div className="min-h-[100px] pt-4">
            <AnimatePresence mode="wait">
              {showPasswordInput ? (
                <motion.form
                  key="password-form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onSubmit={handlePasswordSubmit}
                  className="w-full max-w-sm mx-auto space-y-3"
                >
                  <label className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/40 block mb-1">Enter House Passcode</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter passcode"
                      className={`w-full bg-white/[0.03] border ${passwordError ? 'border-red-500/50' : 'border-white/10 focus:border-white/30'} py-3 px-4 rounded-full text-xs text-white outline-none transition-all placeholder:text-white/20 text-center font-bold tracking-[0.3em]`}
                    />
                    <button 
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-black p-1.5 rounded-full hover:scale-105 transition-transform"
                    >
                      <ArrowRight size={12} />
                    </button>
                  </div>
                  {passwordError && (
                    <span className="text-[8px] font-bold uppercase tracking-widest text-red-500">Incorrect Passcode</span>
                  )}
                </motion.form>
              ) : (
                <motion.div
                  key="newsletter-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full max-w-sm mx-auto"
                >
                  {submitted ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2 text-center"
                    >
                      <div className="inline-flex p-2 bg-white/5 rounded-full text-white/80 mb-1">
                        <ShieldCheck size={16} />
                      </div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/80">You are on the list</p>
                      <p className="text-[8px] text-white/40 uppercase tracking-widest">We will notify you at unveiling</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleEmailSubmit} className="space-y-3">
                      <label className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/40 block mb-1">Notify me upon unveiling</label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Your email address"
                          className="w-full bg-white/[0.03] border border-white/10 focus:border-white/30 py-3 px-5 rounded-full text-xs text-white outline-none transition-all placeholder:text-white/20 text-center uppercase tracking-widest"
                        />
                        <button
                          type="submit"
                          disabled={isSubmittingEmail}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-black p-1.5 rounded-full hover:scale-105 transition-transform disabled:opacity-50"
                        >
                          {isSubmittingEmail ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <ArrowRight size={12} />
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full px-8 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 z-10 border-t border-white/[0.03] text-white/30">
        <span className="text-[8px] font-bold uppercase tracking-[0.2em]">© {new Date().getFullYear()} COLIN GUEST. ALL RIGHTS RESERVED.</span>
        <div className="flex gap-6 text-[8px] font-bold uppercase tracking-[0.2em]">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
          <span className="text-white/10">|</span>
          <span className="cursor-help font-bold uppercase" title="Append ?preview=true to bypass">Preview Access</span>
        </div>
      </footer>
    </div>
  );
}
