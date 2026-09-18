"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Mail, ArrowUpRight, Copy, Check } from "lucide-react";

export type SupportAssistanceType = "RETURN" | "REFUND";

interface OrderReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    name: string;
    total: string;
    currency: string;
    items?: Array<{
      title: string;
      quantity: number;
      variantTitle?: string | null;
    }>;
  } | null;
  type: SupportAssistanceType;
}

export default function OrderReturnModal({
  isOpen,
  onClose,
  order,
  type,
}: OrderReturnModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen || !order) return null;

  const orderCleanName = order.name.replace(/^#/, "");
  const isRefund = type === "REFUND";

  const title = isRefund ? "Order Refund Assistance" : "Return & Exchange Assistance";
  const subtitle = `ORDER #${orderCleanName} • COLINGUEST SUPPORT`;

  const itemsSummary = order.items && order.items.length > 0
    ? order.items.map(i => `${i.title}${i.variantTitle ? ` (${i.variantTitle})` : ""} x${i.quantity}`).join(", ")
    : "Purchased Pieces";

  // Pre-filled WhatsApp message
  const whatsappMessage = isRefund
    ? `Hi Colin Guest Support, I would like to request an Order Refund for Order #${orderCleanName} (Amount: ${order.currency} ${parseFloat(order.total).toFixed(2)}). Items: ${itemsSummary}. Could you please assist me with the refund process?`
    : `Hi Colin Guest Support, I would like to request a Return / Exchange for Order #${orderCleanName}. Items: ${itemsSummary}. Could you please assist me with the reverse pickup?`;

  const whatsappUrl = `https://wa.me/917034500072?text=${encodeURIComponent(whatsappMessage)}`;

  // Pre-filled Email Subject & Body
  const emailSubject = isRefund
    ? `Refund Request - Order #${orderCleanName}`
    : `Return / Exchange Request - Order #${orderCleanName}`;

  const emailBody = `Hello Colin Guest Client Support,

I am reaching out regarding my recent purchase:
• Order Number: #${orderCleanName}
• Total Amount: ${order.currency} ${parseFloat(order.total).toFixed(2)}
• Items: ${itemsSummary}

Requested Assistance: ${isRefund ? "Order Refund" : "Return & Exchange"}

Please advise on the next steps for reverse pickup and settlement.

Thank you!`;

  // Gmail web compose link matching profile page with mailto fallback
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=colinguestofficial@gmail.com&su=${encodeURIComponent(
    emailSubject
  )}&body=${encodeURIComponent(emailBody)}`;

  const handleCopySupportEmail = () => {
    navigator.clipboard.writeText("colinguestofficial@gmail.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0 }}
          className="relative w-full max-w-md bg-white rounded-[28px] p-7 shadow-2xl border border-black/5 overflow-hidden z-10 my-auto font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-black/5">
            <div>
              <h3 className="text-lg font-serif italic text-black leading-tight">
                {title}
              </h3>
              <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-black/30 mt-1">
                {subtitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/40 hover:text-black transition-colors"
              aria-label="Close"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>

          {/* Support Options */}
          <div className="py-5 space-y-3">
            {/* WhatsApp Option */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl border border-black/5 bg-[#fbfbfb] hover:bg-black hover:text-white transition-all duration-300 group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 group-hover:bg-white/10 flex items-center justify-center text-[#25D366] group-hover:text-white transition-colors shrink-0">
                  <MessageSquare size={18} strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-black group-hover:text-white transition-colors">
                      WhatsApp Support
                    </p>
                    <span className="text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#25D366]/15 text-[#1fa851] group-hover:bg-white/20 group-hover:text-white transition-colors">
                      Fastest
                    </span>
                  </div>
                  <p className="text-[9px] font-medium text-black/40 group-hover:text-white/60 transition-colors mt-0.5">
                    +91 7034500072 &bull; Instant chat
                  </p>
                </div>
              </div>
              <ArrowUpRight
                size={16}
                className="text-black/20 group-hover:text-white transition-colors group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0"
              />
            </a>

            {/* Email Option */}
            <a
              href={gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl border border-black/5 bg-[#fbfbfb] hover:bg-black hover:text-white transition-all duration-300 group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-black/5 group-hover:bg-white/10 flex items-center justify-center text-black/60 group-hover:text-white transition-colors shrink-0">
                  <Mail size={18} strokeWidth={1.5} />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-black group-hover:text-white transition-colors">
                    Email Inquiries
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] font-medium text-black/40 group-hover:text-white/60 transition-colors truncate">
                      colinguestofficial@gmail.com
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCopySupportEmail();
                      }}
                      type="button"
                      className="p-1 rounded text-black/30 group-hover:text-white/60 hover:!text-white transition-colors active:scale-90 shrink-0"
                      title="Copy email address"
                    >
                      {copiedEmail ? (
                        <Check size={11} className="text-black group-hover:text-white stroke-[2.5]" />
                      ) : (
                        <Copy size={11} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <ArrowUpRight
                size={16}
                className="text-black/20 group-hover:text-white transition-colors group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0"
              />
            </a>
          </div>

          {/* Footer Note */}
          <div className="pt-3 border-t border-black/5 text-center">
            <p className="text-[7.5px] font-bold uppercase tracking-[0.2em] text-black/30">
              Support Hours: Mon &ndash; Sat, 10:00 AM &ndash; 7:00 PM IST
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
