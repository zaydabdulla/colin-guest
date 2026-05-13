"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function ActivateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activateAccount, isSyncing } = useCartStore();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Extract ID and Token from search params or URL segments
  // Shopify URL is usually: /account/activate/ID/TOKEN
  // Our redirected URL will be: /activate?id=ID&token=TOKEN
  const id = searchParams.get("id");
  const token = searchParams.get("token");
  const mode = searchParams.get("mode"); // 'reset' or 'activate'
  const isReset = mode === "reset";

  useEffect(() => {
    if (!id || !token) {
      setError("Invalid activation link. Please request a new one.");
    }
  }, [id, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!id || !token) return;

    // Convert numeric ID to Global ID if necessary
    const gid = id.includes("gid://") ? id : `gid://shopify/Customer/${id}`;

    const result = await activateAccount(gid, token, password);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } else {
      setError(result.error || (isReset ? "Reset failed." : "Activation failed."));
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-8">
          <ShieldCheck className="text-white w-10 h-10" strokeWidth={1} />
        </div>
        <h1 className="text-3xl font-serif italic text-black mb-4">{isReset ? "Password Reset." : "Identity Verified."}</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/40">Redirecting to your dashboard...</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-[340px]">
      <div className="mb-10">
        <h1 className="text-2xl font-serif italic text-black mb-2">{isReset ? "Reset Password." : "Activate Account."}</h1>
        <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-black/30">Set your secure credentials</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded text-[9px] mb-8 font-bold uppercase tracking-wider text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <label className="text-[9px] font-bold uppercase tracking-widest text-black/60 group-focus-within:text-black transition-colors block mb-1">New Password</label>
          <input 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-b border-black/10 py-1.5 text-sm focus:border-black outline-none transition-colors bg-transparent px-0" 
            placeholder="••••••••"
          />
        </div>

        <div className="relative group">
          <label className="text-[9px] font-bold uppercase tracking-widest text-black/60 group-focus-within:text-black transition-colors block mb-1">Confirm Password</label>
          <input 
            type="password" 
            required 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border-b border-black/10 py-1.5 text-sm focus:border-black outline-none transition-colors bg-transparent px-0" 
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          disabled={isSyncing || !id || !token}
          className="w-full bg-black text-white py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-black/90 transition-all active:scale-[0.98] disabled:opacity-50 mt-8"
        >
          {isSyncing ? <Loader2 size={14} className="animate-spin" /> : "Verify Identity"}
          <ArrowRight size={14} />
        </button>
      </form>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <main className="min-h-screen bg-[#fcfcfc] flex">
      {/* Left: Editorial Image */}
      <div className="hidden lg:block flex-1 relative bg-black overflow-hidden">
        <Image 
          src="/login.jpg" 
          alt="Activate Account" 
          fill 
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-20">
          <h2 className="text-white text-4xl font-serif italic mb-2 tracking-tight">Access Restricted.</h2>
          <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.6em]">Verify your presence to proceed.</p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="w-full lg:w-[500px] flex flex-col items-center justify-center p-8 bg-white">
        <Suspense fallback={<Loader2 className="animate-spin text-black/20" />}>
          <ActivateContent />
        </Suspense>
        
        <div className="mt-12 pt-8 border-t border-black/5 w-full max-w-[340px] text-center">
          <Link href="/" className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/30 hover:text-black transition-colors">
            Return to Storefront
          </Link>
        </div>
      </div>
    </main>
  );
}
