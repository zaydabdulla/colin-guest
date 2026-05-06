import LegalLayout from "@/components/legal-layout";

export default function PrivacyPage() {
  const content = [
    {
      text: "COLINGUEST (\"we\", \"our\", \"us\") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website or make a purchase."
    },
    {
      section: "1. Information We Collect",
      text: "We collect the following types of information:",
      items: [
        "Personal Identification: Name, email address, phone number, billing and shipping address",
        "Payment Information: Processed securely through Shopify Payments and third-party gateways; we do not store card details",
        "Device & Usage Data: IP address, browser type, pages visited, and time spent on our website (via cookies)",
        "Order History: Products purchased, return/exchange history"
      ]
    },
    {
      section: "2. How We Use Your Information",
      text: "We use the information we collect to:",
      items: [
        "Process and fulfil your orders",
        "Send order confirmations, shipping updates, and support communications",
        "Personalise your shopping experience",
        "Send marketing emails and promotional offers (you may opt out at any time)",
        "Improve our website, products, and customer service",
        "Comply with legal obligations under Indian law"
      ]
    },
    {
      section: "3. Sharing of Information",
      text: "We do not sell or rent your personal data. We may share your information with:",
      items: [
        "Logistics partners (Delhivery, Bluedart, etc.) for order delivery",
        "Payment gateways for transaction processing",
        "Analytics platforms (e.g., Google Analytics) for website improvement",
        "Regulatory authorities if required by law"
      ]
    },
    {
      section: "4. Cookies",
      text: "Our website uses cookies to enhance your browsing experience. You may disable cookies through your browser settings, but this may affect website functionality. By continuing to use our site, you consent to our use of cookies."
    },
    {
      section: "5. Data Security",
      text: "We implement industry-standard security measures including SSL encryption, secure Shopify hosting, and limited data access controls to protect your information from unauthorised access, misuse, or disclosure."
    },
    {
      section: "6. Data Retention",
      text: "We retain your personal data for as long as necessary to fulfil our legal and operational obligations. You may request deletion of your data by contacting us."
    },
    {
      section: "7. Your Rights",
      text: "Under applicable Indian data protection laws, you have the right to:",
      items: [
        "Access the personal data we hold about you",
        "Request correction of inaccurate data",
        "Request deletion of your data",
        "Withdraw consent for marketing communications at any time"
      ]
    },
    {
      text: "To exercise any of these rights, contact us at info@colinguest.com."
    },
    {
      section: "8. Third-Party Links",
      text: "Our website may contain links to third-party websites. We are not responsible for their privacy practices and encourage you to review their policies independently."
    },
    {
      section: "9. Changes to This Policy",
      text: "We may update this Privacy Policy periodically. The revised policy will be posted on this page with an updated effective date. Continued use of our website constitutes acceptance of the revised policy."
    },
    {
      section: "10. Contact Us",
      text: "If you have any questions about this Privacy Policy, please reach out to us:\n\nEmail: info@colinguest.com\nWebsite: www.colinguest.com"
    }
  ];

  return <LegalLayout title="Privacy Policy" content={content} />;
}
