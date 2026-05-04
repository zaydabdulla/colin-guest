import { CheckoutClient } from "@/components/checkout-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Colin Guest",
  description: "Complete your order with Colin Guest. Secure and fast checkout experience.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
