import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartDrawer } from "@/components/cart-drawer";
import { WishlistDrawer } from "@/components/mobile/mobile-wishlist-drawer";
import { WishlistPopup } from "@/components/wishlist-popup";
import { Navbar } from "@/components/navbar";
import { MobileNavbar } from "@/components/mobile/mobile-navbar";

import { Footer } from "@/components/footer";

import { SmoothScroll } from "@/components/smooth-scroll";
import { SyncManager } from "@/components/sync-manager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Colin Guest",
  description: "Discover the exclusive world of Colin Guest, where heritage meets haute couture. Explore timeless elegance and modern craftsmanship in every stitch.",
};

import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <SessionProvider>
          {/* Desktop Navbar - Strict Isolation */}
          <div className="hidden md:block">
            <Navbar />
          </div>
          
          {/* Mobile Navbar - Strict Isolation */}
          <div className="block md:hidden">
            <MobileNavbar />
          </div>

          <SmoothScroll>
            {children}
            
            {/* Footer Isolation if needed, but for now wrap the desktop footer */}
            <div className="hidden md:block">
              <Footer />
            </div>
          </SmoothScroll>

          <CartDrawer />
          <div className="block md:hidden">
            <WishlistDrawer />
          </div>
          <WishlistPopup />
          <SyncManager />
        </SessionProvider>
      </body>
    </html>
  );
}
