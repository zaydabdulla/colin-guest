"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  MapPin, 
  LogOut, 
  Plus, 
  Edit2,
  Package,
  ArrowLeft,
  X,
  Check,
  Loader2
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, logout, updateUser, isSyncing } = useCartStore();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user]);

  if (!isLoggedIn || !user) return null;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleUpdateName = async () => {
    setError(null);
    const result = await updateUser(firstName, lastName);
    if (result.success) {
      setIsEditingName(false);
    } else {
      setError(result.error || "Failed to update name");
    }
  };

  return (
    <main className="min-h-screen bg-[#fcfcfc] pt-24 pb-16 px-6 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section - Tightened */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-black/40 hover:text-black transition-all mb-2"
            >
              <ArrowLeft size={10} /> Back to Store
            </Link>
            <h1 className="text-4xl md:text-5xl font-serif italic text-black tracking-tighter leading-none mb-1">
              Profile.
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.6em] text-black/20">
              Personal Identity Portal
            </p>
          </div>
          
          <div className="flex gap-3">
             <Link 
               href="/orders"
               className="px-5 py-2.5 rounded-full border border-black/5 bg-white text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black/5 transition-all shadow-sm text-black"
             >
               <Package size={13} strokeWidth={1.5} /> View Orders
             </Link>
          </div>
        </motion.div>

        <div className="space-y-6">
          
          {/* Personal Info Card - Tightened */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[32px] p-8 border border-black/5 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.05)] relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/60">Personal Identity</h2>
                {!isEditingName ? (
                  <button 
                    onClick={() => setIsEditingName(true)}
                    className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors"
                  >
                    <Edit2 size={13} strokeWidth={1.5} />
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsEditingName(false)}
                      className="text-black/40 hover:text-black transition-colors"
                    >
                      <X size={16} strokeWidth={1.5} />
                    </button>
                    <button 
                      onClick={handleUpdateName}
                      disabled={isSyncing}
                      className="text-black/40 hover:text-black transition-colors disabled:opacity-30"
                    >
                      {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} strokeWidth={2} />}
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <p className="text-[9px] font-bold uppercase tracking-wider text-red-500 mb-4">{error}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="wait">
                  {isEditingName ? (
                    <motion.div 
                      key="editing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-black/30 block">First Name</label>
                        <input 
                          type="text" 
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full border-b border-black/10 py-1 text-sm focus:border-black outline-none transition-colors bg-transparent text-black"
                          placeholder="First Name"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-black/30 block">Last Name</label>
                        <input 
                          type="text" 
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full border-b border-black/10 py-1 text-sm focus:border-black outline-none transition-colors bg-transparent text-black"
                          placeholder="Last Name"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="display"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="md:col-span-2"
                    >
                      <label className="text-[9px] font-bold uppercase tracking-widest text-black/30 block mb-1">Full Identity</label>
                      <p className="text-2xl font-serif italic text-black">
                        {user.firstName} {user.lastName}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="md:col-span-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-black/30 block mb-1">Email Address</label>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-black/40" strokeWidth={1.5} />
                    <p className="text-[12px] font-medium tracking-wide text-black/80">
                      {user.email}
                    </p>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-black/20 ml-2">(Locked)</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Address Book Card - Tightened */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[32px] p-8 border border-black/5 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.05)]"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <MapPin size={16} className="text-black/40" strokeWidth={1.5} />
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/60">Address Book</h2>
              </div>
              <button className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors group">
                <Plus size={12} className="group-hover:rotate-90 transition-transform duration-300" />
                Add
              </button>
            </div>

            {/* Empty State - Tighter */}
            <div className="bg-[#f9f9fa] rounded-[24px] p-6 border border-black/5 border-dashed flex flex-col items-center justify-center text-center">
               <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm">
                  <MapPin size={16} className="text-black/10" />
               </div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-0.5">No addresses added</p>
               <p className="text-[9px] font-medium text-black/20 max-w-[180px]">Provide a shipping destination for swifter checkout.</p>
            </div>
          </motion.div>

          {/* Access Control - Tighter */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-between gap-4 px-4"
          >
            <button 
              onClick={handleLogout}
              className="w-full md:w-auto bg-black text-white px-8 py-3 rounded-full text-[9px] font-bold uppercase tracking-[0.25em] hover:bg-black/80 transition-all shadow-md flex items-center justify-center gap-3 group"
            >
              <LogOut size={14} strokeWidth={1.5} className="group-hover:-translate-x-1 transition-transform" />
              Terminate Session
            </button>
            
            <button className="text-[9px] font-bold uppercase tracking-widest text-black/20 hover:text-black/60 transition-colors">
              Sign out of all devices
            </button>
          </motion.div>

          {/* Support Info - Tighter */}
          <div className="text-center pt-4">
             <p className="text-[9px] font-medium text-black/20 leading-relaxed uppercase tracking-widest">
               Requires assistance? <Link href="/contact" className="text-black/40 hover:text-black underline underline-offset-4">Contact Architectural Support</Link>
             </p>
          </div>
        </div>
      </div>
    </main>
  );
}
