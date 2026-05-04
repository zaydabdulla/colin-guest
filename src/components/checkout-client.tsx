"use client";

import { useCartStore, type CartItem } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  ChevronDown, 
  Plus, 
  Minus, 
  X, 
  CreditCard, 
  Wallet, 
  Truck, 
  Info, 
  ArrowRight, 
  User, 
  ArrowLeft,
  ShieldCheck,
  Package,
  ShoppingBag,
  CreditCard as PaymentIcon
} from "lucide-react";

export function CheckoutClient() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, isLoggedIn, user } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    company: "",
    country: "India",
    address: "",
    apartment: "",
    city: "",
    state: "Kerala",
    pinCode: "",
    phone: "",
    email: user?.email || "",
    createAccount: false,
    shipDifferent: false,
    orderNotes: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("cashfree");

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  const parsePrice = (priceStr: string) => {
    if (!priceStr) return 0;
    return parseInt(priceStr.replace(/[^0-9]/g, ''));
  };

  const subtotal = items.reduce((sum: number, item: CartItem) => sum + (parsePrice(item.product.price) * item.quantity), 0);
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  const formattedPrice = (amount: number) => {
    return "₹" + amount.toLocaleString();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  if (!isHydrated) return null;

  if (items.length === 0) {
    return (
      <main className="min-h-[80vh] flex flex-col items-center justify-center px-4 pt-32 pb-20 bg-[#fcfcfc]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 bg-white rounded-[24px] border border-black/5 shadow-sm flex items-center justify-center mb-8"
        >
          <ShoppingBag className="w-8 h-8 text-black/10" strokeWidth={1} />
        </motion.div>
        <h2 className="text-2xl font-serif italic text-black mb-4">Your bag is empty.</h2>
        <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-black/20 mb-10 text-center max-w-xs leading-relaxed">
          The curated selection awaits its next acquisition.
        </p>
        <Link 
          href="/collections/all"
          className="bg-black text-white px-10 py-4 rounded-full text-[9px] font-bold uppercase tracking-[0.3em] hover:scale-105 transition-transform shadow-lg"
        >
          Continue Curation
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcfcfc] pt-24 pb-20 px-4 md:px-8 font-sans">
      <div className="max-w-6xl mx-auto relative">
        
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
          className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-black/5 pb-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-serif italic text-black tracking-tight mb-0.5">
              Checkout.
            </h1>
            <p className="text-[8px] font-bold uppercase tracking-[0.5em] text-black/40">
              Acquisition Interface
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] text-black/60">
            <span className="text-black">01 Details</span>
            <span className="opacity-40">—</span>
            <span className="opacity-40">02 Confirmation</span>
          </div>
        </motion.div>

        {/* Login Bar */}
        {!isLoggedIn && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 md:mb-10 bg-white rounded-[24px] p-4 md:p-5 border border-black/5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#f9f9fa] flex items-center justify-center border border-black/5 shrink-0">
                <User size={16} className="text-black/40" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-black tracking-wide">Returning customer?</p>
                <p className="text-[9px] font-medium text-black/60 uppercase tracking-widest">Access your saved identity for swifter checkout.</p>
              </div>
            </div>
            <Link 
              href="/login" 
              className="w-full sm:w-auto text-center px-6 py-2.5 rounded-full bg-black text-white text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-black/80 transition-all shadow-sm"
            >
              Log In
            </Link>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          
          {/* Section A: Your Bag (Items + Totals) - Order 1 on mobile */}
          <div className="lg:col-span-5 lg:col-start-8 order-1 lg:order-none lg:h-fit lg:sticky lg:top-32 space-y-6 lg:space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-[24px] md:rounded-[28px] p-5 md:p-8 border border-black/5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]"
            >
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h2 className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-black/60 flex items-center gap-2">
                  <Package size={13} className="opacity-70" strokeWidth={1.5} />
                  Your Bag
                </h2>
                <span className="text-[9px] md:text-[10px] font-bold text-black/40 uppercase tracking-widest">({items.length} items)</span>
              </div>
              
              <div className="space-y-6 mb-10 max-h-[320px] overflow-y-auto no-scrollbar pr-2 border-b border-black/5 pb-8">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 group items-center">
                    <div className="relative w-16 h-16 rounded-[18px] overflow-hidden bg-[#f9f9fa] border border-black/[0.03] flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Image src={item.product.src} alt={item.product.title} fill className="object-contain p-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest leading-tight truncate text-black/80">{item.product.title}</h4>
                      <p className="text-[8px] md:text-[9px] font-bold text-black/50 uppercase tracking-widest mt-1">Size: {item.size}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateQuantity(item.id, -1)} className="text-black/40 hover:text-black transition-colors"><Minus size={10} /></button>
                          <span className="text-[9px] md:text-[10px] font-bold tabular-nums text-black/60">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="text-black/40 hover:text-black transition-colors"><Plus size={10} /></button>
                        </div>
                        <span className="text-[10px] md:text-[11px] font-bold tracking-tight text-black">{formattedPrice(parsePrice(item.product.price) * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black/50">Subtotal</span>
                  <span className="text-[11px] font-bold tracking-tight text-black/80">{formattedPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black/50">Shipping</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-green-600">Complimentary</span>
                </div>
                <div className="flex justify-between items-center pt-3 md:pt-4 border-t border-black/5 mt-1 md:mt-2">
                  <span className="text-[12px] md:text-[13px] font-serif italic text-black">Total Amount.</span>
                  <span className="text-[18px] md:text-[20px] font-black tracking-tighter text-black">{formattedPrice(total)}</span>
                </div>
              </div>
            </motion.div>

            {/* Desktop-only: Show payment protocol within the sticky column */}
            <div className="hidden lg:block">
              <PaymentProtocolCard 
                paymentMethod={paymentMethod} 
                setPaymentMethod={setPaymentMethod} 
                loading={loading} 
                total={total} 
              />
            </div>
          </div>

          {/* Section B: Billing Details (Profile Style) - Order 2 on mobile */}
          <div className="lg:col-span-7 order-2 lg:order-none lg:row-start-1">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[24px] md:rounded-[28px] p-5 md:p-10 border border-black/5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]"
            >
              <h2 className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-black/60 mb-6 md:mb-8 flex items-center gap-2">
                <User size={13} className="opacity-70" strokeWidth={1.5} />
                Billing Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-bold uppercase tracking-[0.4em] text-black/50 ml-1">First Name</label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full border-b border-black/10 py-1.5 md:py-2 text-[12px] md:text-[13px] focus:border-black outline-none transition-colors bg-transparent text-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-bold uppercase tracking-[0.4em] text-black/30 ml-1">Last Name</label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full border-b border-black/10 py-1.5 md:py-2 text-[12px] md:text-[13px] focus:border-black outline-none transition-colors bg-transparent text-black"
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5 pt-2">
                  <label className="text-[8px] font-bold uppercase tracking-[0.4em] text-black/30 ml-1">Company Name (Optional)</label>
                  <input 
                    type="text" 
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full border-b border-black/10 py-1.5 md:py-2 text-[12px] md:text-[13px] focus:border-black outline-none transition-colors bg-transparent text-black"
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5 pt-2">
                  <label className="text-[8px] font-bold uppercase tracking-[0.4em] text-black/30 ml-1">Country / Region</label>
                  <div className="relative">
                    <select 
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full border-b border-black/10 py-1.5 md:py-2 text-[12px] md:text-[13px] focus:border-black outline-none appearance-none bg-transparent text-black"
                    >
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="UAE">UAE</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-bold uppercase tracking-[0.4em] text-black/30 ml-1">Street Address</label>
                    <input 
                      type="text" 
                      name="address"
                      placeholder="House number and street name"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full border-b border-black/10 py-1.5 md:py-2 text-[12px] md:text-[13px] focus:border-black outline-none transition-colors bg-transparent text-black"
                    />
                  </div>
                  <input 
                    type="text" 
                    name="apartment"
                    placeholder="Apartment, suite, unit, etc. (optional)"
                    value={formData.apartment}
                    onChange={handleInputChange}
                    className="w-full border-b border-black/10 py-1.5 md:py-2 text-[12px] md:text-[13px] focus:border-black outline-none transition-colors bg-transparent text-black"
                  />
                </div>
                <div className="space-y-1.5 pt-2">
                  <label className="text-[8px] font-bold uppercase tracking-[0.4em] text-black/30 ml-1">Town / City</label>
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full border-b border-black/10 py-1.5 md:py-2 text-[12px] md:text-[13px] focus:border-black outline-none transition-colors bg-transparent text-black"
                  />
                </div>
                <div className="space-y-1.5 pt-2">
                  <label className="text-[8px] font-bold uppercase tracking-[0.4em] text-black/30 ml-1">State</label>
                  <div className="relative">
                    <select 
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full border-b border-black/10 py-1.5 md:py-2 text-[12px] md:text-[13px] focus:border-black outline-none appearance-none bg-transparent text-black"
                    >
                      <option value="Kerala">Kerala</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Maharashtra">Maharashtra</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                  </div>
                </div>
                <div className="space-y-1.5 pt-2">
                  <label className="text-[8px] font-bold uppercase tracking-[0.4em] text-black/30 ml-1">PIN Code</label>
                  <input 
                    type="text" 
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleInputChange}
                    className="w-full border-b border-black/10 py-1.5 md:py-2 text-[12px] md:text-[13px] focus:border-black outline-none transition-colors bg-transparent text-black"
                  />
                </div>
                <div className="space-y-1.5 pt-2">
                  <label className="text-[8px] font-bold uppercase tracking-[0.4em] text-black/30 ml-1">Phone</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border-b border-black/10 py-1.5 md:py-2 text-[12px] md:text-[13px] focus:border-black outline-none transition-colors bg-transparent text-black"
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5 pt-2">
                  <label className="text-[8px] font-bold uppercase tracking-[0.4em] text-black/30 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border-b border-black/10 py-1.5 md:py-2 text-[12px] md:text-[13px] focus:border-black outline-none transition-colors bg-transparent text-black"
                  />
                </div>
              </div>

              <div className="mt-12 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      name="createAccount"
                      checked={formData.createAccount}
                      onChange={handleInputChange}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-black/5 rounded-md transition-all peer-checked:bg-black peer-checked:border-black group-hover:border-black/20"></div>
                    <svg className="absolute w-3 h-3 text-white scale-0 peer-checked:scale-100 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-black/60 group-hover:text-black transition-colors">Create an account for swifter access</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      name="shipDifferent"
                      checked={formData.shipDifferent}
                      onChange={handleInputChange}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-black/5 rounded-md transition-all peer-checked:bg-black peer-checked:border-black group-hover:border-black/20"></div>
                    <svg className="absolute w-3 h-3 text-white scale-0 peer-checked:scale-100 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-black/60 group-hover:text-black transition-colors">Specify alternative shipping destination</span>
                </label>
              </div>

              <div className="mt-10 space-y-3">
                <label className="text-[8px] font-bold uppercase tracking-[0.4em] text-black/50 ml-1">Acquisition Notes (Optional)</label>
                <textarea 
                  name="orderNotes"
                  value={formData.orderNotes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Special instructions or archive notes..."
                  className="w-full bg-[#f9f9fa] border border-black/5 rounded-[20px] px-6 py-4 text-[13px] outline-none focus:border-black/10 transition-all resize-none placeholder:text-black/40"
                />
              </div>
            </motion.div>
          </div>

          {/* Section C: Payment (Methods + Button) - Order 3 on mobile */}
          <div className="lg:hidden order-3">
            <PaymentProtocolCard 
              paymentMethod={paymentMethod} 
              setPaymentMethod={setPaymentMethod} 
              loading={loading} 
              total={total} 
            />
          </div>

        </div>
      </div>
    </main>
  );
}

// Extracted Payment Component for Reordering
function PaymentProtocolCard({ paymentMethod, setPaymentMethod, loading, total }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-[24px] md:rounded-[28px] p-5 md:p-8 border border-black/5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]"
    >
      <div className="space-y-4 mb-8">
        <h3 className="text-[9px] font-bold uppercase tracking-[0.4em] text-black/60 px-2">Payment Protocol</h3>
        
        <div 
          onClick={() => setPaymentMethod("cashfree")}
          className={`p-4 rounded-[20px] border transition-all cursor-pointer flex items-center justify-between group ${paymentMethod === "cashfree" ? "bg-black text-white border-black shadow-lg" : "bg-[#f9f9fa] border-black/5 hover:border-black/10"}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "cashfree" ? "border-white" : "border-black/20"}`}>
              {paymentMethod === "cashfree" && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-[0.1em] ${paymentMethod === "cashfree" ? "text-white" : "text-black/70"}`}>UPI/Debit/Credit</span>
          </div>
          <CreditCard size={14} className={paymentMethod === "cashfree" ? "text-white/40" : "text-black/40"} />
        </div>

        <div 
          onClick={() => setPaymentMethod("cod")}
          className={`p-4 rounded-[20px] border transition-all cursor-pointer flex items-center justify-between group ${paymentMethod === "cod" ? "bg-black text-white border-black shadow-lg" : "bg-[#f9f9fa] border-black/5 hover:border-black/10"}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "cod" ? "border-white" : "border-black/20"}`}>
              {paymentMethod === "cod" && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-[0.1em] ${paymentMethod === "cod" ? "text-white" : "text-black/70"}`}>Cash on delivery</span>
          </div>
          <Truck size={14} className={paymentMethod === "cod" ? "text-white/40" : "text-black/40"} />
        </div>
      </div>

      <div className="text-center px-4 mb-8">
        <p className="text-[8px] font-medium text-black/50 leading-relaxed uppercase tracking-[0.2em]">
          Secure transactions via architectural encryption. <br />
          View <Link href="/privacy" className="text-black/70 underline underline-offset-4">Privacy Terms</Link>.
        </p>
      </div>

      <button 
        disabled={loading}
        className="w-full bg-black text-white py-5 rounded-full text-[11px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-black/90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl"
      >
        {loading ? "Authorizing..." : "PAY NOW"}
        <ArrowRight size={14} />
      </button>
    </motion.div>
  );
}
