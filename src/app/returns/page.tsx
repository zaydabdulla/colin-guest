import LegalLayout from "@/components/legal-layout";
import Link from "next/link";
import { RotateCcw, ArrowRight, Truck, ShieldCheck } from "lucide-react";

export default function ReturnsPage() {
  const content = [
    {
      text: "At COLINGUEST, we craft pieces designed to endure. If your acquisition does not meet your expectations in sizing or presentation, our straightforward return & exchange process is here to assist."
    },
    {
      section: "1. Eligibility for Returns & Exchanges",
      text: "Items are eligible for return or size exchange under the following conditions:",
      items: [
        "Return request lodged within 7 days of verified delivery",
        "Item is completely unused, unwashed, and in pristine condition",
        "All original designer tags, barcodes, and packaging remain attached",
        "Item is not part of a 'Final Sale' or customized release"
      ]
    },
    {
      section: "2. How to Request an Exchange or Return",
      text: "We provide an automated self-serve return system for your convenience:",
      items: [
        "Go to your Account Orders page at colinguest.com/orders",
        "Select your fulfilled order and click 'Request Return / Exchange'",
        "Choose whether you want a Size Exchange or Full Refund and select your reason",
        "Upon submission, our logistics team coordinates a Delhivery reverse pickup directly from your doorstep within 24–48 hours"
      ]
    },
    {
      section: "3. Reverse Pickup (Delhivery)",
      text: "For all eligible exchanges and authorized returns, Delhivery will assign a courier agent to pick up the parcel from your delivery address. Please have the item neatly folded in its original polybag with all tags intact."
    },
    {
      section: "4. Size Exchanges",
      text: "Size exchanges are processed free of courier charge for the first exchange. Once our fulfillment center inspects the returned item, your new size will be dispatched immediately."
    },
    {
      section: "5. Refunds & Timeline",
      text: "Once the return package is delivered back to our facility and passes quality inspection, approved refunds are initiated immediately to your original payment source:",
      items: [
        "UPI (Google Pay, PhonePe, Paytm, BHIM): 2–4 business days",
        "Credit / Debit Card: 4–7 business days",
        "Net Banking: 3–5 business days",
        "Refunds are processed automatically through our secure Razorpay gateway"
      ]
    },
    {
      section: "6. Defective, Damaged or Incorrect Pieces",
      text: "In the rare event that an item is received with a manufacturing defect or an incorrect size/style was delivered, please initiate a return within 48 hours or contact us at info@colinguest.com with photos. We will arrange prioritized reverse pickup and dispatch a replacement at zero cost."
    }
  ];

  return (
    <LegalLayout title="Return & Refund" content={content}>
      {/* Self-Serve Return Action Card */}
      <div className="p-6 md:p-8 rounded-[24px] bg-[#fafafa] border border-black/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shrink-0">
            <RotateCcw size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-black uppercase tracking-wider mb-1">
              Have an item to return or exchange?
            </h3>
            <p className="text-xs text-black/50 leading-relaxed max-w-md">
              Lodge your return directly through your orders archive. Select your desired size swap or refund and track reverse pickup status.
            </p>
          </div>
        </div>

        <Link
          href="/orders"
          className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-black text-white text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-black/80 transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm"
        >
          Manage Orders & Returns
          <ArrowRight size={13} />
        </Link>
      </div>
    </LegalLayout>
  );
}
