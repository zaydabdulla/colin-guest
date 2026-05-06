import LegalLayout from "@/components/legal-layout";

export default function ShippingPage() {
  const content = [
    {
      text: "We at COLINGUEST are committed to delivering your order quickly and safely. Please read our Shipping Policy carefully."
    },
    {
      section: "1. Processing Time",
      text: "All orders are processed within 1–3 business days (Monday to Saturday, excluding public holidays) after payment confirmation. Orders placed on Sundays or national holidays will be processed the next business day."
    },
    {
      section: "2. Shipping Methods & Timelines",
      text: "We ship across India through trusted courier partners (Delhivery, Bluedart, Xpressbees, etc.). Estimated delivery timelines:",
      items: [
        "Metro cities (Mumbai, Delhi, Bengaluru, Chennai, Hyderabad, Kolkata): 3–5 business days",
        "Tier 2 & Tier 3 cities: 5–7 business days",
        "Remote & rural areas: 7–10 business days"
      ]
    },
    {
      text: "These are estimates and may vary due to courier delays, weather, or local disruptions."
    },
    {
      section: "3. Shipping Charges",
      items: [
        "Prepaid Orders: Enjoy FREE shipping on all orders paid online.",
        "Cash on Delivery (COD): A flat shipping fee of ₹100 applies"
      ]
    },
    {
      section: "4. Tracking Your Order",
      text: "Once your order is shipped, you will receive an email/SMS with a tracking number. You can track your shipment directly on our website or on the courier partner's website."
    },
    {
      section: "5. Undeliverable Packages",
      text: "If a package is returned due to an incorrect address, failed delivery attempts, or refusal to accept, we will contact you for resolution. Re-shipping charges may apply."
    },
    {
      section: "6. Lost or Damaged Shipments",
      text: "If your order arrives damaged or goes missing in transit, please contact us within 48 hours of the expected delivery date at info@colinguest.com. We will raise a dispute with the courier and arrange a replacement or refund as applicable."
    },
    {
      section: "7. International Shipping",
      text: "Currently, we only ship within India. International shipping is not available at this time."
    }
  ];

  return <LegalLayout title="Shipping Policy" content={content} />;
}
