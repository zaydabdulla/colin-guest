"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCartStore } from "@/lib/store";
import { Loader2, ArrowLeft } from "lucide-react";
import { signIn as socialSignIn } from "next-auth/react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { login, recoverPassword, isSyncing } = useCartStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [view, setView] = useState<'login' | 'forgot-password'>('login');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const result = await login(email, password);
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Invalid credentials.");
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const result = await recoverPassword(email);
    if (result.success) {
      setMessage("Recovery details sent to your email.");
      setView('login');
    } else {
      setError(result.error || "Failed to send recovery email.");
    }
  };

  return (
    <main className="h-screen bg-[#fcfcfc] flex relative overflow-hidden font-sans">
      
      {/* LEFT SIDE: Immersive Editorial Imagery */}
      <div className="hidden lg:flex flex-1 relative bg-black overflow-hidden pointer-events-auto">
        {/* Back Button - Positioned on Top of the Photo, below Navbar */}
        <Link 
          href="/" 
          className="absolute top-24 left-8 z-50 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/60 hover:text-white transition-all pointer-events-auto"
        >
          <ArrowLeft size={12} /> Back to Store
        </Link>

        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative w-full h-full opacity-80"
        >
          <Image 
            src="/login.jpg" 
            alt="Editorial" 
            fill 
            className="object-cover object-top"
            priority
          />
        </motion.div>
        
        {/* Branding Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-16 pb-24">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5, duration: 0.8 }}
           >
             <h1 className="text-white text-5xl font-serif italic mb-4 tracking-tighter">Architectural Integrity.</h1>
             <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.8em]">COLIN GUEST — Est. 2024</p>
           </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE: The Portal */}
      <div className="w-full lg:w-[480px] flex flex-col justify-center bg-white relative z-10 border-l border-black/5 h-full">
        <div className="max-w-[340px] mx-auto w-full px-8 py-4 max-h-full overflow-y-auto no-scrollbar hide-scrollbar">
          
          <AnimatePresence mode="wait">
            {view === 'login' ? (
              <motion.div
                key="login-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-4">
                   <h2 className="text-xl font-bold tracking-tight text-black/60">Welcome Back</h2>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded text-[9px] mb-4 font-bold uppercase tracking-wider text-center">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="bg-black text-white px-4 py-2 rounded text-[9px] mb-4 font-bold uppercase tracking-wider text-center">
                    {message}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="relative group">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-black/60 group-focus-within:text-black transition-colors block mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border-b border-black/10 py-1.5 text-sm focus:border-black outline-none transition-colors bg-transparent px-0"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="relative group">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-black/60 group-focus-within:text-black transition-colors block">Password</label>
                      <button 
                        type="button"
                        onClick={() => setView('forgot-password')}
                        className="text-[9px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors"
                      >
                        Forgot?
                      </button>
                    </div>
                    <input 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border-b border-black/10 py-1.5 text-sm focus:border-black outline-none transition-colors bg-transparent px-0"
                      placeholder="••••••••"
                    />
                  </div>

                  <button 
                    disabled={isSyncing}
                    className="w-full bg-black text-white py-2.5 rounded-full text-[9px] font-bold uppercase tracking-[0.25em] hover:bg-black/80 transition-all shadow-md flex items-center justify-center gap-2 mt-2"
                  >
                    {isSyncing ? <Loader2 size={13} className="animate-spin" /> : "Authorize"}
                  </button>

                  <div className="flex items-center gap-4 py-0.5">
                    <div className="h-[1px] bg-black/5 flex-1" />
                    <span className="text-[9px] font-bold text-black/20 uppercase tracking-widest">or</span>
                    <div className="h-[1px] bg-black/5 flex-1" />
                  </div>

                  <button 
                    type="button"
                    disabled={isSyncing || isGoogleLoading}
                    onClick={async () => {
                      setIsGoogleLoading(true);
                      try {
                        await socialSignIn('google', { callbackUrl: '/' });
                      } catch (error) {
                        setIsGoogleLoading(false);
                      }
                    }}
                    className="w-full border border-black/10 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-3 hover:bg-black/5 transition-colors text-black/60 disabled:opacity-50"
                  >
                    {isGoogleLoading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335"/>
                        </svg>
                        Sign in with Google
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-center gap-2 text-black/60">
                  <span className="text-[9px] font-bold uppercase tracking-widest">New to the house?</span>
                  <Link href="/signup" className="text-[9px] font-bold uppercase tracking-[0.2em] border-b border-black/60 pb-0.5 hover:text-black transition-all">
                    Create Account
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="recover-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-6">
                   <h2 className="text-xl font-bold tracking-tight mb-1 text-black/60">Recovery</h2>
                   <p className="text-[10px] text-black/40 font-medium tracking-wide uppercase">Requesting access credentials</p>
                </div>

                <form onSubmit={handleRecover} className="space-y-5">
                  <div className="relative group">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-black/60 group-focus-within:text-black transition-colors block mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border-b border-black/10 py-1.5 text-sm focus:border-black outline-none transition-colors bg-transparent px-0"
                    />
                  </div>

                  <button 
                    disabled={isSyncing}
                    className="w-full bg-black text-white py-2.5 rounded-full text-[9px] font-bold uppercase tracking-[0.25em] hover:bg-black/80 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {isSyncing ? <Loader2 size={13} className="animate-spin" /> : "Send Link"}
                  </button>

                  <button 
                    type="button"
                    onClick={() => setView('login')}
                    className="w-full text-[9px] font-bold uppercase tracking-[0.2em] text-black/40 hover:text-black transition-all pt-2 text-center"
                  >
                    Back to Authorize
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </main>
  );
}
