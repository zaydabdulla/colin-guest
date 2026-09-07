"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  RefreshCw,
  HelpCircle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getCustomerOrders } from "@/app/actions/shopify";
import ReturnRequestModal from "@/components/return-request-modal";

interface OrderItem {
  id?: string;
  title: string;
  quantity: number;
  variantTitle?: string | null;
  image: string | null;
  handle: string | null;
}

interface FulfillmentInfo {
  company: string;
  number: string;
  url: string | null;
}

interface Order {
  id: string;
  name: string;
  date: string;
  total: string;
  currency: string;
  status: string;
  tags?: string[];
  returnStatus?: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | null;
  returnType?: 'EXCHANGE' | 'REFUND' | null;
  fulfillments?: FulfillmentInfo[];
  items: OrderItem[];
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useCartStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [copiedAwb, setCopiedAwb] = useState<string | null>(null);
  
  // Return Modal State
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<Order | null>(null);

  const handleCopyAwb = (awb: string) => {
    navigator.clipboard.writeText(awb);
    setCopiedAwb(awb);
    setTimeout(() => setCopiedAwb(null), 2000);
  };

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.push("/login");
    }
  }, [isHydrated, isLoggedIn, router]);

  const fetchOrders = useCallback(async () => {
    if (user?.email) {
      const result = await getCustomerOrders(user.email);
      if (result.success && result.orders) {
        setOrders(result.orders);
      }
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (isLoggedIn && user?.email) {
      fetchOrders();
    }
  }, [isLoggedIn, user?.email, fetchOrders]);

  if (!isHydrated) return null;
  if (!isLoggedIn || !user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'FULFILLED':
        return <CheckCircle2 size={12} className="text-black" />;
      case 'IN_PROGRESS':
        return <Truck size={12} className="text-black/60" />;
      default:
        return <Clock size={12} className="text-black/40" />;
    }
  };

  return (
    <main className="min-h-screen bg-[#fcfcfc] pt-24 pb-16 px-4 sm:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            href="/profile" 
            className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-black/40 hover:text-black transition-all"
          >
            <ArrowLeft size={10} /> Back to Profile
          </Link>

          <Link
            href="/returns"
            className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-black/40 hover:text-black transition-all"
          >
            <HelpCircle size={11} /> Return Policy
          </Link>
        </div>

        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-baseline justify-between gap-4 border-b border-black/5 pb-4"
        >
          <div>
            <h1 className="text-2xl font-serif italic text-black tracking-tight mb-0.5">
              Orders.
            </h1>
            <p className="text-[8px] font-bold uppercase tracking-[0.5em] text-black/20">
              Transaction Archive
            </p>
          </div>
          
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
            {orders.length} total acquisitions
          </div>
        </motion.div>

        {/* Orders List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 size={24} className="animate-spin text-black/20" />
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-black/20">Synchronizing with Shopify Archive...</p>
            </div>
          ) : orders.length > 0 ? (
            orders.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[28px] border border-black/5 overflow-hidden shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_40px_-20px_rgba(0,0,0,0.08)] transition-all group"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-black/5 flex flex-wrap items-center justify-between gap-4 bg-[#fcfcfc]/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                      <Package size={16} className="text-black/40" />
                    </div>
                    <div>
                      <h3 className="text-[11px] font-bold text-black uppercase tracking-widest">{order.name}</h3>
                      <p className="text-[10px] font-medium text-black/40">{formatDate(order.date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[8px] font-bold uppercase tracking-widest text-black/30 mb-0.5">Total Amount</p>
                      <p className="text-[12px] font-bold text-black">{order.currency} {parseFloat(order.total).toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5">
                      {getStatusIcon(order.status)}
                      <span className="text-[8px] font-bold uppercase tracking-widest text-black/60">
                        {order.status || 'Received'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-14 h-16 bg-[#f9f9f9] rounded-xl overflow-hidden border border-black/5">
                            {item.image ? (
                              <Image 
                                src={item.image} 
                                alt={item.title} 
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag size={14} className="text-black/10" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-[11px] font-bold text-black leading-tight mb-1">{item.title}</h4>
                            <div className="flex items-center gap-2 text-[9px] font-medium text-black/40 uppercase tracking-widest">
                              <span>Qty: {item.quantity}</span>
                              {item.variantTitle && (
                                <>
                                  <span>•</span>
                                  <span>{item.variantTitle}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {item.handle && (
                          <Link 
                            href={`/product/${item.handle}`}
                            className="p-2 rounded-full hover:bg-black/5 transition-colors group/link"
                          >
                            <ChevronRight size={14} className="text-black/20 group-hover/link:text-black transition-colors" />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Return & Exchange Action / Status Bar */}
                <div className="px-6 py-3.5 bg-[#f8f8f8] border-t border-black/5 flex flex-wrap items-center justify-between gap-3">
                  {order.returnStatus === 'PENDING_REVIEW' ? (
                    <div className="flex items-center gap-2 text-amber-900 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20">
                      <Clock size={12} className="shrink-0" />
                      <span className="text-[8.5px] font-bold uppercase tracking-wider">
                        {order.returnType === 'EXCHANGE' ? 'Exchange Request' : 'Return Request'}: Under Review (Delhivery Pickup Scheduling)
                      </span>
                    </div>
                  ) : order.returnStatus === 'APPROVED' ? (
                    <div className="flex items-center gap-2 text-emerald-900 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 size={12} className="shrink-0" />
                      <span className="text-[8.5px] font-bold uppercase tracking-wider">
                        Return Approved • Delhivery Reverse Pickup Assigned
                      </span>
                    </div>
                  ) : order.returnStatus === 'COMPLETED' ? (
                    <div className="flex items-center gap-2 text-black/60 bg-black/5 px-3.5 py-1.5 rounded-full">
                      <CheckCircle2 size={12} className="shrink-0" />
                      <span className="text-[8.5px] font-bold uppercase tracking-wider">
                        Return Completed & Settled
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedReturnOrder(order)}
                        className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-black/70 hover:text-black px-3.5 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 transition-all shadow-xs"
                      >
                        <RotateCcw size={11} strokeWidth={2} />
                        Request Return / Exchange
                      </button>
                      <span className="hidden sm:inline-block text-[8px] uppercase tracking-wider text-black/30">
                        (Eligible within 7 days of delivery)
                      </span>
                    </div>
                  )}

                  <span className="text-[8px] font-medium text-black/30">
                    Compliant with 7-day Colin Guest Quality Guarantee
                  </span>
                </div>

                {/* Shipping & Delhivery Tracking Card */}
                {order.fulfillments && order.fulfillments.length > 0 && order.fulfillments[0].number ? (
                  <div className="px-6 py-4 bg-[#fbfbfb] border-t border-black/5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center text-black/70 shrink-0">
                        <Truck size={18} strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-black/40">
                            Courier Partner: {order.fulfillments[0].company || "Delhivery Express"}
                          </span>
                          <span className="text-[7.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black text-white">
                            {order.status || "Fulfilled"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-mono font-bold tracking-wider text-black">
                            AWB: {order.fulfillments[0].number}
                          </span>
                          <button
                            onClick={() => handleCopyAwb(order.fulfillments![0].number)}
                            type="button"
                            className="p-1 rounded-md bg-black/5 hover:bg-black/10 text-black/50 hover:text-black transition-colors"
                            title="Copy AWB Number"
                          >
                            {copiedAwb === order.fulfillments[0].number ? (
                              <Check size={11} className="text-black stroke-[2.5]" />
                            ) : (
                              <Copy size={11} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <a
                      href={`https://www.delhivery.com/track/package/${order.fulfillments[0].number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-black text-white text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-black/80 transition-all flex items-center gap-2 shadow-sm shrink-0"
                    >
                      <Truck size={12} strokeWidth={1.5} />
                      Track on Delhivery
                      <ExternalLink size={11} strokeWidth={1.5} />
                    </a>
                  </div>
                ) : (
                  <div className="px-6 py-3.5 bg-[#fbfbfb]/50 border-t border-black/5 flex items-center justify-between text-black/40 text-[9px] font-medium uppercase tracking-widest">
                    <span className="flex items-center gap-2">
                      <Clock size={12} strokeWidth={1.5} />
                      Preparing for Dispatch
                    </span>
                    <span>Tracking number will appear once manifested</span>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-[32px] p-24 border border-black/5 border-dashed flex flex-col items-center justify-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mb-6">
                <ShoppingBag size={24} className="text-black/10" />
              </div>
              <h2 className="text-lg font-serif italic text-black mb-2">The archive is silent.</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/20 max-w-[240px] leading-relaxed">
                You have not yet acquired any pieces from our collection.
              </p>
              <Link 
                href="/collections/all" 
                className="mt-8 px-8 py-3 bg-black text-white rounded-full text-[9px] font-bold uppercase tracking-[0.2em] hover:scale-105 transition-transform"
              >
                Browse Collection
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      {/* Return Request Modal */}
      {selectedReturnOrder && (
        <ReturnRequestModal
          isOpen={!!selectedReturnOrder}
          onClose={() => setSelectedReturnOrder(null)}
          orderId={selectedReturnOrder.id}
          orderName={selectedReturnOrder.name}
          customerEmail={user.email}
          customerName={`${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined}
          items={selectedReturnOrder.items}
          onSuccess={() => {
            fetchOrders();
          }}
        />
      )}
    </main>
  );
}
