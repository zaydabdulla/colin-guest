"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  MapPin, 
  LogOut, 
  ChevronRight, 
  Plus, 
  Edit2,
  Package,
  ShieldCheck,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useCartStore();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn || !user) return null;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[#fcfcfc] pt-32 pb-24 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 hover:text-black transition-all mb-4"
            >
              <ArrowLeft size={12} /> Back to Store
            </Link>
            <h1 className="text-5xl md:text-6xl font-serif italic text-black tracking-tighter mb-2">
              Profile.
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.8em] text-black/20">
              Personal Identity Portal
            </p>
          </div>
          
          <div className="flex gap-4">
             <Link 
               href="/orders"
               className="px-6 py-3 rounded-full border border-black/5 bg-white text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black/5 transition-all shadow-sm"
             >
               <Package size={14} strokeWidth={1.5} /> View Orders
             </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Personal Info Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Identity Card */}
            <div className="bg-white rounded-[38px] p-10 border border-black/5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <User size={120} strokeWidth={1} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-black/40">Personal Identity</h2>
                  <button className="p-2 rounded-full hover:bg-black/5 transition-colors text-black/40 hover:text-black">
                    <Edit2 size={16} strokeWidth={1.5} />
                  </button>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-black/20 block mb-2">Full Name</label>
                    <p className="text-2xl font-serif italic text-black">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-black/20 block mb-2">Email Address</label>
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-black/40" strokeWidth={1.5} />
                      <p className="text-[13px] font-medium tracking-wide text-black/80">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Book Card */}
            <div className="bg-white rounded-[38px] p-10 border border-black/5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-black/40" strokeWidth={1.5} />
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-black/40">Address Book</h2>
                </div>
                <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/60 hover:text-black transition-colors group">
                  <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                  Add Address
                </button>
              </div>

              {/* Empty State / Address List */}
              <div className="bg-[#f9f9fa] rounded-[28px] p-8 border border-black/5 border-dashed flex flex-col items-center justify-center text-center">
                 <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                    <MapPin size={20} className="text-black/10" />
                 </div>
                 <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mb-1">No addresses added</p>
                 <p className="text-[10px] font-medium text-black/20 max-w-[200px]">Provide a shipping destination for a swifter checkout experience.</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Security & Settings */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Account Status Card */}
            <div className="bg-black rounded-[38px] p-10 text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">
              <div className="mb-10">
                <ShieldCheck size={32} strokeWidth={1} className="text-white/40 mb-4" />
                <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">Account Security</h2>
              </div>
              
              <div className="space-y-6">
                <button className="w-full flex items-center justify-between group">
                  <span className="text-[11px] font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">Change Password</span>
                  <ChevronRight size={14} className="text-white/20" />
                </button>
                <div className="h-[1px] bg-white/5" />
                <button className="w-full flex items-center justify-between group">
                  <span className="text-[11px] font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">Two-Factor Auth</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-full text-white/40">Off</span>
                </button>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-[38px] p-10 border border-black/5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)]">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-black/40 mb-8">Access Control</h2>
              
              <div className="space-y-4">
                <button 
                  onClick={handleLogout}
                  className="w-full bg-red-50 text-red-600 py-4 rounded-[22px] text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all shadow-sm group"
                >
                  <LogOut size={16} strokeWidth={1.5} className="group-hover:-translate-x-1 transition-transform" />
                  Terminate Session
                </button>
                
                <button className="w-full text-center py-2 text-[9px] font-bold uppercase tracking-widest text-black/20 hover:text-black/60 transition-colors">
                  Sign out of all devices
                </button>
              </div>
            </div>

            {/* Support Info */}
            <div className="px-10">
               <p className="text-[9px] font-medium text-black/20 leading-relaxed uppercase tracking-widest">
                 Requires assistance? <br />
                 <Link href="/contact" className="text-black/40 hover:text-black underline underline-offset-4">Contact Architectural Support</Link>
               </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
