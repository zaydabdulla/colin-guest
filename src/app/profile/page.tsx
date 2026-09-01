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
  Trash2,
  Package,
  ArrowLeft,
  X,
  Check,
  Loader2,
  Building2
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, logout, updateUser, addAddress, updateAddress, deleteAddress } = useCartStore();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Local Loading States
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isAddingAddressLoading, setIsAddingAddressLoading] = useState(false);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);


  // Address Form State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    address1: "",
    address2: "",
    city: "",
    province: "",
    country: "India",
    zip: "",
    phone: ""
  });

  // Edit Address State
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editAddress, setEditAddress] = useState({
    address1: "",
    address2: "",
    city: "",
    province: "",
    country: "India",
    zip: "",
    phone: ""
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.push("/login");
    }
  }, [isHydrated, isLoggedIn, router]);


  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user]);

  if (!isHydrated) return null;
  if (!isLoggedIn || !user) return null;


  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleUpdateName = async () => {
    setError(null);
    setIsUpdatingName(true);
    const result = await updateUser(firstName, lastName);
    setIsUpdatingName(false);
    if (result.success) {
      setIsEditingName(false);
    } else {
      setError(result.error || "Failed to update name");
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsAddingAddressLoading(true);
    const result = await addAddress(newAddress);
    setIsAddingAddressLoading(false);
    if (result.success) {
      setIsAddingAddress(false);
      setNewAddress({
        address1: "",
        address2: "",
        city: "",
        province: "",
        country: "India",
        zip: "",
        phone: ""
      });
    } else {
      setError(result.error || "Failed to add address");
    }
  };

  const handleStartEdit = (address: any) => {
    setEditingAddressId(address.id);
    setEditAddress({
      address1: address.address1 || "",
      address2: address.address2 || "",
      city: address.city || "",
      province: address.province || "",
      country: address.country || "India",
      zip: address.zip || "",
      phone: address.phone || ""
    });
    setError(null);
  };

  const handleEditAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddressId) return;
    setError(null);
    setIsUpdatingAddress(true);
    const result = await updateAddress(editingAddressId, editAddress);
    setIsUpdatingAddress(false);
    if (result.success) {
      setEditingAddressId(null);
    } else {
      setError(result.error || "Failed to update address");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    setError(null);
    setDeletingAddressId(addressId);
    const result = await deleteAddress(addressId);
    setDeletingAddressId(null);
    if (!result.success) {
      setError(result.error || "Failed to delete address");
    }
  };

  return (
    <main className="min-h-screen bg-[#fcfcfc] pt-24 pb-16 px-8 font-sans">
      <div className="max-w-4xl mx-auto relative">
        
        {/* Top Navigation */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-black/40 hover:text-black transition-all"
          >
            <ArrowLeft size={10} /> Back to Store
          </Link>
        </div>

        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-baseline justify-between gap-4 border-b border-black/5 pb-4"
        >
          <div>
            <h1 className="text-2xl font-serif italic text-black tracking-tight mb-0.5">
              Profile.
            </h1>
            <p className="text-[8px] font-bold uppercase tracking-[0.5em] text-black/20">
              Personal Identity Portal
            </p>
          </div>
          
          <Link 
            href="/orders"
            className="px-4 py-2 rounded-full border border-black/5 bg-white text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-black/5 transition-all text-black shadow-sm"
          >
            <Package size={12} strokeWidth={1.5} /> View Orders
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Main Info Column */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Personal Identity Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[28px] p-8 border border-black/5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[9px] font-bold uppercase tracking-[0.3em] text-black/40">Personal Identity</h2>
                {!isEditingName ? (
                  <button 
                    onClick={() => setIsEditingName(true)}
                    className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors"
                  >
                    <Edit2 size={12} strokeWidth={1.5} />
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsEditingName(false)}
                      className="text-black/40 hover:text-black transition-colors"
                    >
                      <X size={14} strokeWidth={1.5} />
                    </button>
                    <button 
                      onClick={handleUpdateName}
                      disabled={isUpdatingName}
                      className="text-black/40 hover:text-black transition-colors disabled:opacity-30"
                    >
                      {isUpdatingName ? <Loader2 size={14} className="animate-spin" /> : <Check size={16} strokeWidth={2} />}
                    </button>
                  </div>
                )}
              </div>

              {error && !isAddingAddress && (
                <p className="text-[9px] font-bold uppercase tracking-wider text-red-500 mb-4">{error}</p>
              )}

              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {isEditingName ? (
                    <motion.div 
                      key="editing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-black/30">First Name</label>
                        <input 
                          type="text" 
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full border-b border-black/10 py-1 text-sm focus:border-black outline-none transition-colors bg-transparent text-black"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-black/30">Last Name</label>
                        <input 
                          type="text" 
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full border-b border-black/10 py-1 text-sm focus:border-black outline-none transition-colors bg-transparent text-black"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="display"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <label className="text-[8px] font-bold uppercase tracking-widest text-black/30 block mb-0.5">Full Name</label>
                      <p className="text-xl font-serif italic text-black">
                        {user.firstName} {user.lastName}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div>
                  <label className="text-[8px] font-bold uppercase tracking-widest text-black/30 block mb-0.5">Email Address</label>
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-black/40" strokeWidth={1.5} />
                    <p className="text-[12px] font-medium tracking-wide text-black/80">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Address Book Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[28px] p-8 border border-black/5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-black/40" strokeWidth={1.5} />
                  <h2 className="text-[9px] font-bold uppercase tracking-[0.3em] text-black/40">Address Book</h2>
                </div>
                <button 
                  onClick={() => setIsAddingAddress(!isAddingAddress)}
                  className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors group"
                >
                  <Plus size={12} className={`transition-transform duration-300 ${isAddingAddress ? "rotate-45" : "group-hover:rotate-90"}`} />
                  {isAddingAddress ? "Cancel" : "Add Address"}
                </button>
              </div>

              <AnimatePresence>
                {isAddingAddress && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-8"
                  >
                    <form onSubmit={handleAddAddress} className="bg-[#f9f9fa] rounded-[24px] p-6 border border-black/5 space-y-4">
                      {error && isAddingAddress && (
                        <p className="text-[9px] font-bold uppercase tracking-wider text-red-500">{error}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold uppercase tracking-widest text-black/30">Address Line 1</label>
                          <input 
                            required
                            type="text" 
                            value={newAddress.address1}
                            onChange={(e) => setNewAddress({...newAddress, address1: e.target.value})}
                            className="w-full border-b border-black/10 py-1 text-xs focus:border-black outline-none transition-colors bg-transparent text-black"
                            placeholder="Street address, P.O. box"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold uppercase tracking-widest text-black/30">Address Line 2 (Opt)</label>
                          <input 
                            type="text" 
                            value={newAddress.address2}
                            onChange={(e) => setNewAddress({...newAddress, address2: e.target.value})}
                            className="w-full border-b border-black/10 py-1 text-xs focus:border-black outline-none transition-colors bg-transparent text-black"
                            placeholder="Apartment, suite, unit, etc."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold uppercase tracking-widest text-black/30">City</label>
                          <input 
                            required
                            type="text" 
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                            className="w-full border-b border-black/10 py-1 text-xs focus:border-black outline-none transition-colors bg-transparent text-black"
                            placeholder="City"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold uppercase tracking-widest text-black/30">State / Province</label>
                          <input 
                            required
                            type="text" 
                            value={newAddress.province}
                            onChange={(e) => setNewAddress({...newAddress, province: e.target.value})}
                            className="w-full border-b border-black/10 py-1 text-xs focus:border-black outline-none transition-colors bg-transparent text-black"
                            placeholder="State"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold uppercase tracking-widest text-black/30">Zip / Postal Code</label>
                          <input 
                            required
                            type="text" 
                            value={newAddress.zip}
                            onChange={(e) => setNewAddress({...newAddress, zip: e.target.value})}
                            className="w-full border-b border-black/10 py-1 text-xs focus:border-black outline-none transition-colors bg-transparent text-black"
                            placeholder="Zip code"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold uppercase tracking-widest text-black/30">Phone Number</label>
                          <input 
                            type="text" 
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                            className="w-full border-b border-black/10 py-1 text-xs focus:border-black outline-none transition-colors bg-transparent text-black"
                            placeholder="Phone number"
                          />
                        </div>
                      </div>
                      
                      <button 
                        disabled={isAddingAddressLoading}
                        className="w-full bg-black text-white py-3 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-black/80 transition-all shadow-sm"
                      >
                        {isAddingAddressLoading ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
                        Save Address
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                {user.addresses && user.addresses.length > 0 ? (
                  user.addresses.map((address, idx) => (
                    <motion.div 
                      key={address.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-[#f9f9fa] rounded-[20px] p-5 border border-black/5"
                    >
                      <AnimatePresence mode="wait">
                        {editingAddressId === address.id ? (
                          <motion.form
                            key="edit-form"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            onSubmit={handleEditAddress}
                            className="space-y-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-black/40">Edit Address</p>
                              <button
                                type="button"
                                onClick={() => setEditingAddressId(null)}
                                className="text-black/30 hover:text-black transition-colors"
                              >
                                <X size={14} strokeWidth={1.5} />
                              </button>
                            </div>

                            {error && editingAddressId === address.id && (
                              <p className="text-[9px] font-bold uppercase tracking-wider text-red-500">{error}</p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold uppercase tracking-widest text-black/30">Address Line 1</label>
                                <input required type="text" value={editAddress.address1}
                                  onChange={(e) => setEditAddress({...editAddress, address1: e.target.value})}
                                  className="w-full border-b border-black/10 py-1 text-xs focus:border-black outline-none transition-colors bg-transparent text-black"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold uppercase tracking-widest text-black/30">Address Line 2 (Opt)</label>
                                <input type="text" value={editAddress.address2}
                                  onChange={(e) => setEditAddress({...editAddress, address2: e.target.value})}
                                  className="w-full border-b border-black/10 py-1 text-xs focus:border-black outline-none transition-colors bg-transparent text-black"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold uppercase tracking-widest text-black/30">City</label>
                                <input required type="text" value={editAddress.city}
                                  onChange={(e) => setEditAddress({...editAddress, city: e.target.value})}
                                  className="w-full border-b border-black/10 py-1 text-xs focus:border-black outline-none transition-colors bg-transparent text-black"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold uppercase tracking-widest text-black/30">State / Province</label>
                                <input required type="text" value={editAddress.province}
                                  onChange={(e) => setEditAddress({...editAddress, province: e.target.value})}
                                  className="w-full border-b border-black/10 py-1 text-xs focus:border-black outline-none transition-colors bg-transparent text-black"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold uppercase tracking-widest text-black/30">Zip / Postal Code</label>
                                <input required type="text" value={editAddress.zip}
                                  onChange={(e) => setEditAddress({...editAddress, zip: e.target.value})}
                                  className="w-full border-b border-black/10 py-1 text-xs focus:border-black outline-none transition-colors bg-transparent text-black"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold uppercase tracking-widest text-black/30">Phone Number</label>
                                <input type="text" value={editAddress.phone}
                                  onChange={(e) => setEditAddress({...editAddress, phone: e.target.value})}
                                  className="w-full border-b border-black/10 py-1 text-xs focus:border-black outline-none transition-colors bg-transparent text-black"
                                />
                              </div>
                            </div>

                            <button
                              disabled={isUpdatingAddress}
                              className="w-full bg-black text-white py-3 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-black/80 transition-all shadow-sm disabled:opacity-50"
                            >
                              {isUpdatingAddress ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
                              Save Changes
                            </button>
                          </motion.form>
                        ) : (
                          <motion.div
                            key="address-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-start justify-between group"
                          >
                            <div className="flex gap-4">
                              <div className="mt-1">
                                <Building2 size={16} className="text-black/20" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-[11px] font-bold text-black tracking-wide">{address.address1}</p>
                                {address.address2 && <p className="text-[10px] font-medium text-black/60">{address.address2}</p>}
                                <p className="text-[10px] font-medium text-black/60">{address.city}, {address.province} {address.zip}</p>
                                <p className="text-[10px] font-medium text-black/60 uppercase tracking-widest">{address.country}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 opacity-60 md:opacity-40 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleStartEdit(address)}
                                className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-black hover:text-black transition-colors"
                              >
                                <Edit2 size={11} strokeWidth={1.5} />
                                Edit
                              </button>
                              <button
                                disabled={deletingAddressId !== null}
                                onClick={() => handleDeleteAddress(address.id)}
                                className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors disabled:opacity-30"
                              >
                                <Trash2 size={11} strokeWidth={1.5} />
                                Remove
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                ) : (
                  !isAddingAddress && (
                    <div className="bg-[#f9f9fa] rounded-[20px] p-6 border border-black/5 border-dashed flex flex-col items-center justify-center text-center">
                       <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm">
                          <MapPin size={14} className="text-black/10" />
                       </div>
                       <p className="text-[9px] font-bold uppercase tracking-widest text-black/30 mb-0.5">No addresses added</p>
                       <p className="text-[8px] font-medium text-black/10 max-w-[150px]">Provide a shipping destination for swifter checkout.</p>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar / Actions Column */}
          <div className="md:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-[28px] p-6 border border-black/5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] flex flex-col gap-3"
            >
              <h2 className="text-[9px] font-bold uppercase tracking-[0.3em] text-black/40 mb-2 px-2">Account Actions</h2>
              <button 
                onClick={handleLogout}
                className="w-full bg-black text-white py-3 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-black/80 transition-all shadow-sm"
              >
                <LogOut size={12} strokeWidth={1.5} />
                Sign Out
              </button>
              
              <button className="w-full text-center py-2 text-[8px] font-bold uppercase tracking-widest text-black/20 hover:text-black/60 transition-colors">
                Sign out of all devices
              </button>
            </motion.div>

            <div className="px-6 text-center md:text-left">
               <p className="text-[8px] font-medium text-black/20 leading-relaxed uppercase tracking-widest">
                 Requires assistance? <br />
                 <a 
                   href="mailto:colinguestofficial@gmail.com" 
                   className="text-black/40 hover:text-black underline underline-offset-4 transition-colors normal-case tracking-normal"
                 >
                   Contact Support: colinguestofficial@gmail.com
                 </a>
               </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
