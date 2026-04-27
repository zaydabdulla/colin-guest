"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, Bookmark, User, Loader2 } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/lib/store";

export default function SignupPage() {
  const router = useRouter();
  const { items, signup, isSyncing } = useCartStore();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = await signup(formData);
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Failed to create account. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-[#fcfcfc] text-black font-sans relative">
      {/* Navigation Layer */}
      <nav className="w-full bg-white border-b border-black/5 z-50">
        <div className="flex items-center justify-between px-8 py-6">
          <Link href="/" className="text-xl font-bold tracking-widest uppercase">COLIN GUEST</Link>
          <div className="hidden md:flex gap-12 text-[10px] tracking-[0.2em] uppercase font-bold">
            <button className="hover:text-black/60 transition-colors">Runway</button>
            <Link href="/" className="hover:text-black/60 transition-colors">The Lookbook</Link>
            <Link href="/collections" className="hover:text-black/60 transition-colors">Collections</Link>
          </div>
          <div className="flex items-center gap-6 text-xs font-semibold tracking-widest uppercase mb-1">
            <Search size={18} />
            <Link href="/login" className="cursor-pointer hover:scale-110 transition-transform block">
              <User size={18} strokeWidth={1.5} className="fill-black" />
            </Link>
            <Link href="/wishlist" className="cursor-pointer hover:scale-110 transition-transform block">
              <Bookmark size={18} strokeWidth={1.5} />
            </Link>
            <div className="flex items-center gap-2 cursor-pointer hover:text-black/60 transition-colors">
              <ShoppingBag size={18} />
              <span>Cart ({items.length})</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Signup Form Block */}
      <div className="w-full max-w-[1200px] mx-auto px-8 pt-24 pb-24 flex flex-col md:flex-row justify-between gap-24">
         
         <div className="flex-1 w-full max-w-[550px]">
            <div className="mb-8">
               <h1 className="text-xl font-bold tracking-tight text-black/60">Create Account</h1>
               <p className="text-[10px] text-black/40 font-medium tracking-wide uppercase">Register for the house</p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded text-[9px] mb-6 font-bold uppercase tracking-wider text-center">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSignup} className="flex flex-col gap-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-black/60 group-focus-within:text-black transition-colors block mb-1">First Name</label>
                    <input 
                      type="text" 
                      name="firstName"
                      required 
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John" 
                      className="w-full border-b border-black/10 py-1.5 text-sm focus:border-black outline-none transition-colors bg-transparent px-0" 
                    />
                  </div>
                  <div className="relative group">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-black/60 group-focus-within:text-black transition-colors block mb-1">Last Name</label>
                    <input 
                      type="text" 
                      name="lastName"
                      required 
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe" 
                      className="w-full border-b border-black/10 py-1.5 text-sm focus:border-black outline-none transition-colors bg-transparent px-0" 
                    />
                  </div>
               </div>

               <div className="relative group">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-black/60 group-focus-within:text-black transition-colors block mb-1">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    required 
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com" 
                    className="w-full border-b border-black/10 py-1.5 text-sm focus:border-black outline-none transition-colors bg-transparent px-0" 
                  />
               </div>
               
                <div className="relative group">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-black/60 group-focus-within:text-black transition-colors block mb-1">Password</label>
                  <input 
                    type="password" 
                    name="password"
                    required 
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••" 
                    className="w-full border-b border-black/10 py-1.5 text-sm focus:border-black outline-none transition-colors bg-transparent px-0" 
                  />
                  <p className="text-[9px] text-black/30 font-bold uppercase tracking-widest mt-1">Must be at least 8 characters long.</p>
               </div>

               <button 
                type="submit" 
                disabled={isSyncing}
                className="w-full bg-black text-white py-2.5 rounded-full text-[9px] font-bold uppercase tracking-[0.25em] hover:bg-black/80 transition-all shadow-md flex items-center justify-center gap-2 mt-2"
               >
                  {isSyncing ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Authorize Account"
                  )}
               </button>

               <p className="text-center text-[9px] text-black/40 font-bold uppercase tracking-widest mt-4 leading-loose">
                  By creating an account, you agree to our <span className="text-black border-b border-black/20 cursor-pointer">Terms & Conditions</span> and <span className="text-black border-b border-black/20 cursor-pointer">Privacy Policy</span>.
               </p>
            </form>
         </div>

         {/* Right Div: Login Prompt */}
         <div className="flex-1 w-full max-w-[400px] pt-4 border-t md:border-t-0 md:border-l border-black/5 md:pl-24 flex flex-col justify-center">
            <h2 className="text-xl font-bold tracking-tight text-black/60 mb-4">Already registered?</h2>
            <p className="text-[10px] text-black/40 font-medium tracking-wide uppercase mb-8 leading-relaxed">
               Log in to access your saved items and manage your account.
            </p>
            <Link 
              href="/login"
              className="w-full max-w-[200px] border border-black/10 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-3 hover:bg-black/5 transition-colors text-black/60"
            >
               Sign In
            </Link>
         </div>
         
      </div>
    </main>
  );
}
