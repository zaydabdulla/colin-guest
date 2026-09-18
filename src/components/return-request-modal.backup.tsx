"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Truck, 
  ShieldCheck, 
  PackageCheck,
  CreditCard,
  RefreshCw,
  ShoppingBag
} from "lucide-react";
import Image from "next/image";
import { requestOrderReturnAction, ReturnRequestItem } from "@/app/actions/shopify";

interface OrderItem {
  id?: string;
  title: string;
  quantity: number;
  variantTitle?: string | null;
  image: string | null;
  handle: string | null;
}

interface ReturnRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderName: string;
  customerEmail: string;
  customerName?: string;
  items: OrderItem[];
  onSuccess: () => void;
}

const RETURN_REASONS = [
  "Size too small / tight fit",
  "Size too large / loose fit",
  "Defective piece or stitching issue",
  "Received wrong item or size",
  "Color or fabric differs from expectations",
  "Changed mind / style preference",
  "Other"
];

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];

export default function ReturnRequestModal({
  isOpen,
  onClose,
  orderId,
  orderName,
  customerEmail,
  customerName,
  items,
  onSuccess
}: ReturnRequestModalProps) {
  const [returnType, setReturnType] = useState<"EXCHANGE" | "REFUND">("EXCHANGE");
  const [selectedItemIndices, setSelectedItemIndices] = useState<number[]>([0]);
  const [reason, setReason] = useState<string>(RETURN_REASONS[0]);
  const [exchangeSize, setExchangeSize] = useState<string>("M");
  const [customNotes, setCustomNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const toggleItemSelection = (index: number) => {
    if (selectedItemIndices.includes(index)) {
      if (selectedItemIndices.length > 1) {
        setSelectedItemIndices(selectedItemIndices.filter(i => i !== index));
      }
    } else {
      setSelectedItemIndices([...selectedItemIndices, index]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedItemIndices.length === 0) {
      setErrorMessage("Please select at least one item to return or exchange.");
      return;
    }

    const returnItems: ReturnRequestItem[] = selectedItemIndices.map(idx => ({
      title: `${items[idx].title}${items[idx].variantTitle ? ` (${items[idx].variantTitle})` : ""}`,
      quantity: items[idx].quantity,
      image: items[idx].image
    }));

    setIsSubmitting(true);

    try {
      const res = await requestOrderReturnAction({
        orderId,
        orderName,
        customerEmail,
        customerName,
        returnType,
        reason,
        exchangeSize: returnType === "EXCHANGE" ? exchangeSize : undefined,
        notes: customNotes,
        items: returnItems
      });

      if (res.success) {
        setIsSuccess(true);
        onSuccess();
      } else {
        setErrorMessage(res.error || "Unable to submit return request. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-xl bg-white rounded-[28px] border border-black/10 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-7 py-5 border-b border-black/5 flex items-center justify-between bg-[#fcfcfc] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-black/5 flex items-center justify-center text-black">
                <RotateCcw size={16} strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-black uppercase tracking-wider">
                  {orderName} • Return / Exchange
                </h3>
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-black/30">
                  7-Day Quality Guarantee
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/50 hover:text-black transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-7 overflow-y-auto space-y-6">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-6 text-center space-y-5"
              >
                <div className="w-16 h-16 rounded-full bg-black/5 text-black flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} strokeWidth={1.5} />
                </div>

                <div>
                  <h4 className="text-xl font-serif italic text-black tracking-tight mb-1">
                    Request Lodged Successfully
                  </h4>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/40 max-w-sm mx-auto">
                    Your request for {orderName} has been submitted for review.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#fafafa] border border-black/5 text-left space-y-3.5">
                  <div className="flex items-start gap-3">
                    <Truck size={16} className="text-black shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                      <p className="text-[10.5px] font-bold text-black">Delhivery Reverse Pickup</p>
                      <p className="text-[9.5px] text-black/50 leading-relaxed">
                        Our courier partner will arrive at your address within 24–48 business hours to collect the packaged garment.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <PackageCheck size={16} className="text-black shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                      <p className="text-[10.5px] font-bold text-black">Original Condition Required</p>
                      <p className="text-[9.5px] text-black/50 leading-relaxed">
                        Ensure all original brand tags, labels, and packaging remain intact and unwashed.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CreditCard size={16} className="text-black shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                      <p className="text-[10.5px] font-bold text-black">
                        {returnType === "EXCHANGE" ? "Exchange Dispatch" : "Refund Processing"}
                      </p>
                      <p className="text-[9.5px] text-black/50 leading-relaxed">
                        {returnType === "EXCHANGE" 
                          ? `Replacement size (${exchangeSize}) will be dispatched immediately following quality verification.` 
                          : "Approved refunds will automatically reverse to your original payment method (UPI / Card) within 3–5 business days."}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-3.5 rounded-2xl bg-black text-white text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-black/85 transition-all"
                >
                  Close & View Order Status
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-700 text-[10px] font-medium flex items-center gap-2.5">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Return Action Mode Selector */}
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.25em] text-black/40 mb-2.5">
                    1. Select Action Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setReturnType("EXCHANGE")}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        returnType === "EXCHANGE"
                          ? "border-black bg-black text-white shadow-sm"
                          : "border-black/10 bg-[#fafafa] text-black hover:border-black/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Size Exchange</span>
                        <RefreshCw size={13} className={returnType === "EXCHANGE" ? "text-white" : "text-black/40"} />
                      </div>
                      <p className={`text-[9px] ${returnType === "EXCHANGE" ? "text-white/60" : "text-black/40"}`}>
                        Swap for a different size of the same piece
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReturnType("REFUND")}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        returnType === "REFUND"
                          ? "border-black bg-black text-white shadow-sm"
                          : "border-black/10 bg-[#fafafa] text-black hover:border-black/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Return & Refund</span>
                        <RotateCcw size={13} className={returnType === "REFUND" ? "text-white" : "text-black/40"} />
                      </div>
                      <p className={`text-[9px] ${returnType === "REFUND" ? "text-white/60" : "text-black/40"}`}>
                        Return piece and receive money back to UPI/Card
                      </p>
                    </button>
                  </div>
                </div>

                {/* Items to Return */}
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.25em] text-black/40 mb-2.5">
                    2. Select Item(s) to Return
                  </label>
                  <div className="space-y-2.5">
                    {items.map((item, idx) => {
                      const isSelected = selectedItemIndices.includes(idx);
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleItemSelection(idx)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3.5 ${
                            isSelected 
                              ? "border-black bg-[#fafafa]" 
                              : "border-black/10 bg-white hover:border-black/20"
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="relative w-12 h-14 bg-black/5 rounded-xl overflow-hidden border border-black/5 shrink-0">
                              {item.image ? (
                                <Image 
                                  src={item.image} 
                                  alt={item.title} 
                                  fill 
                                  className="object-cover" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ShoppingBag size={14} className="text-black/20" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-black leading-snug">{item.title}</p>
                              {item.variantTitle && (
                                <p className="text-[9px] font-medium text-black/50">Size/Variant: {item.variantTitle}</p>
                              )}
                              <p className="text-[8.5px] font-bold uppercase tracking-wider text-black/30 mt-0.5">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isSelected ? "bg-black border-black text-white" : "border-black/20 bg-white"
                          }`}>
                            {isSelected && <CheckCircle2 size={12} strokeWidth={2.5} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Exchange Desired Size */}
                {returnType === "EXCHANGE" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-[9px] font-bold uppercase tracking-[0.25em] text-black/40 mb-2">
                      3. Desired Replacement Size
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_SIZES.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setExchangeSize(s)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                            exchangeSize === s
                              ? "bg-black text-white border-black"
                              : "bg-[#fafafa] text-black/70 border-black/10 hover:border-black/30"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Reason Selection */}
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.25em] text-black/40 mb-2">
                    {returnType === "EXCHANGE" ? "4. Reason for Exchange" : "3. Reason for Return"}
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#fafafa] border border-black/10 text-[11px] text-black font-medium focus:outline-none focus:border-black transition-colors"
                  >
                    {RETURN_REASONS.map((r, idx) => (
                      <option key={idx} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.25em] text-black/40 mb-2">
                    Additional Comments (Optional)
                  </label>
                  <textarea
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    rows={2}
                    placeholder="Tell us what went wrong so we can refine our pieces..."
                    className="w-full px-4 py-3 rounded-2xl bg-[#fafafa] border border-black/10 text-[11px] text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-colors resize-none"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-black text-white text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-black/85 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Submitting Request...
                      </>
                    ) : (
                      <>
                        Submit {returnType === "EXCHANGE" ? "Exchange" : "Return"} Request
                        <ArrowRight size={12} />
                      </>
                    )}
                  </button>
                  <p className="text-center text-[8.5px] text-black/35 mt-2.5">
                    Reverse pickup by Delhivery arranged upon review. Subject to Colin Guest return terms.
                  </p>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
