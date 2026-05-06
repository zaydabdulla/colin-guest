import LegalLayout from "@/components/legal-layout";

export default function TermsPage() {
  const content = [
    {
      text: "Website: www.colinguest.com\n\nWelcome to COLINGUEST. By accessing our website or placing an order, you agree to be bound by the following Terms & Conditions. Please read them carefully before making a purchase."
    },
    {
      section: "1. General",
      text: "These Terms & Conditions govern your use of the COLINGUEST website and apply to all transactions made through our Shopify-powered store. By continuing to browse or purchase, you accept these terms in full."
    },
    {
      section: "2. Eligibility",
      text: "To place an order, you must:",
      items: [
        "Be at least 18 years of age, or have parental/guardian consent",
        "Provide accurate, current, and complete information during checkout",
        "Be located within our serviceable delivery regions in India"
      ]
    },
    {
      section: "3. Products",
      text: "All products listed on our website are subject to availability. We reserve the right to discontinue or modify any product without prior notice. Product images are for illustrative purposes and may vary slightly from the actual item."
    },
    {
      section: "4. Pricing & Payment",
      text: "All prices on our website are listed in Indian Rupees (INR) and are inclusive of applicable GST unless stated otherwise. We accept the following payment methods:",
      items: [
        "Credit/Debit Cards (Visa, MasterCard, RuPay)",
        "UPI (Google Pay, PhonePe, Paytm, etc.)",
        "Net Banking",
        "EMI options (where available)",
        "Cash on Delivery (COD) – select pincodes only"
      ]
    },
    {
      text: "We reserve the right to cancel any order in case of pricing errors or payment failures."
    },
    {
      section: "5. Order Confirmation",
      text: "Once an order is placed, you will receive an order confirmation email. This does not guarantee shipment. Orders may be cancelled if items are out of stock or if we suspect fraudulent activity."
    },
    {
      section: "6. Intellectual Property",
      text: "All content on this website — including text, graphics, logos, and images — is the intellectual property of COLINGUEST and may not be reproduced without express written permission."
    },
    {
      section: "7. Limitation of Liability",
      text: "COLINGUEST shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Our liability is limited to the purchase price of the product in question."
    },
    {
      section: "8. Governing Law",
      text: "These Terms & Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India."
    },
    {
      section: "9. Contact Us",
      text: "For any queries regarding these terms, please contact us at info@colinguest.com"
    }
  ];

  return <LegalLayout title="Terms & Conditions" content={content} />;
}
