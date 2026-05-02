import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartDrawer } from "@/components/cart-drawer";
import { WishlistPopup } from "@/components/wishlist-popup";
import { Navbar } from "@/components/navbar";
import { MobileNavbar } from "@/components/mobile/mobile-navbar";

import { Footer } from "@/components/footer";
import { MobileFooter } from "@/components/mobile/mobile-footer";

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

import { ScrollToTop } from "@/components/scroll-to-top";

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
      <body className="antialiased overflow-x-hidden max-w-full w-full">
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
            
            {/* Desktop Footer */}
            <div className="hidden md:block">
              <Footer />
            </div>

            {/* Mobile Footer */}
            <div className="block md:hidden">
              <MobileFooter />
            </div>
          </SmoothScroll>

          <CartDrawer />
          <WishlistPopup />
          <SyncManager />
          <ScrollToTop />
        </SessionProvider>
      </body>
    </html>
  );
}
