import LegalLayout from "@/components/legal-layout";

export default function ReturnsPage() {
  const content = [
    {
      text: "At COLINGUEST, we want you to love what you wear. If you are not completely satisfied with your purchase, we're here to help."
    },
    {
      section: "1. Eligibility for Returns",
      text: "Items are eligible for return under the following conditions:",
      items: [
        "Return request raised within 7 days of delivery",
        "Item is unused, unwashed, and in original condition",
        "Original tags are intact and packaging is undamaged",
        "Item is not from the sale/clearance or 'Final Sale' category"
      ]
    },
    {
      text: "The following items are NOT eligible for return:",
      items: [
        "Innerwear, swimwear, and socks (for hygiene reasons)",
        "Customised or personalised products",
        "Items purchased during special sales marked as non-returnable"
      ]
    },
    {
      section: "2. How to Initiate a Return",
      text: "To initiate a return, please follow these steps:",
      items: [
        "Email us at info@colinguest.com with your order number, item name, and reason for return",
        "Attach clear photos of the item if it is damaged or defective",
        "Our team will respond within 48 business hours with return approval and instructions",
        "Ship the item back using a trackable courier service (return shipping charges are borne by the customer unless the item is defective or incorrect)"
      ]
    },
    {
      section: "3. Exchanges",
      text: "We currently offer size exchanges for apparel, subject to availability. If the requested size is unavailable, a refund will be issued. Exchange requests must be raised within 7 days of delivery."
    },
    {
      section: "4. Refunds",
      text: "Once the returned item is received and inspected, we will notify you of the status. Approved refunds will be processed within 5–7 business days via the original payment method:",
      items: [
        "Credit/Debit Card: 5–7 business days",
        "UPI / Net Banking: 3–5 business days",
        "COD orders: Bank transfer (NEFT) within 7 business days",
        "Shipping charges are non-refundable unless the return is due to our error"
      ]
    },
    {
      section: "5. Defective or Wrong Items",
      text: "If you receive a defective, damaged, or incorrect item, please contact us at info@colinguest.com within 48 hours of delivery with photos. We will arrange a free pickup and send a replacement or full refund at no additional cost."
    },
    {
      section: "6. Non-Refundable Scenarios",
      items: [
        "Items returned after the 7-day window",
        "Used, washed, or altered items",
        "Items with missing tags or original packaging",
        "Returns not authorised by our team"
      ]
    }
  ];

  return <LegalLayout title="Return & Refund" content={content} />;
}
