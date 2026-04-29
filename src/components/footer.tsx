"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Camera, Globe, Video, ArrowRight, Send } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  
  // Only show on About and Collections pages
  const showFooter = pathname === "/about" || pathname.startsWith("/collections");
  
  if (!showFooter) return null;

  const isAboutPage = pathname === "/about";

  const sections = [
    {
      title: "Editorial",
      links: [
        { name: "The Lookbook", href: "/" },
        { name: "Architectural Integrity", href: "/about" },
        { name: "Journal", href: "#" },
        { name: "Archive", href: "#" },
      ],
    },
    {
      title: "Curations",
      links: [
        { name: "New Arrivals", href: "/collections" },
        { name: "All Collections", href: "/collections" },
        { name: "Signature Pieces", href: "/collections" },
      ],
    },
    {
      title: "Assistance",
      links: [
        { name: "Shipping & Delivery", href: "#" },
        { name: "Returns & Exchanges", href: "#" },
        { name: "Order Tracking", href: "#" },
        { name: "Size Guide", href: "#" },
      ],
    },
  ];

  const socialLinks = [
    { icon: <Camera size={18} strokeWidth={1.5} />, href: "#" },
    { icon: <Send size={18} strokeWidth={1.5} />, href: "#" },
    { icon: <Globe size={18} strokeWidth={1.5} />, href: "#" },
  ];

  return (
    <footer className={`relative w-full overflow-hidden ${isAboutPage ? "bg-black" : "bg-white"}`}>
      <div className={`relative w-full rounded-t-[30px] md:rounded-t-[60px] pt-12 pb-8 px-8 md:px-12 overflow-hidden transition-colors duration-1000 ${
        isAboutPage ? "bg-[#0d0d0d] text-white" : "bg-[#f2f2f4] text-black"
      }`}>
        
        {/* LOGO WATERMARK: Positioned behind content to save space */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
          <div className={`relative w-[80%] aspect-[3/1] ${isAboutPage ? "invert brightness-200" : ""}`}>
            <Image 
              src="/logo_cg.png" 
              alt="COLIN GUEST" 
              fill 
              className="object-contain"
            />
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-8">
            
            {/* Left: Newsletter & Socials */}
            <div className="w-full md:w-1/3 space-y-8">
              <div className="space-y-4">
                <h2 className="text-[8px] font-bold uppercase tracking-[0.4em] opacity-40">Inner Circle</h2>
                <div className="relative group max-w-xs">
                  <input 
                    type="email" 
                    placeholder="EMAIL" 
                    className={`w-full bg-transparent border-b py-2 text-[10px] font-bold tracking-[0.1em] outline-none transition-all ${
                      isAboutPage ? "border-white/10 focus:border-white" : "border-black/5 focus:border-black"
                    }`}
                  />
                  <button className="absolute right-0 top-1/2 -translate-y-1/2 p-2 opacity-0 group-focus-within:opacity-100 transition-all">
                    <ArrowRight size={14} strokeWidth={1} />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-6 items-center">
                {socialLinks.map((social, idx) => (
                  <a 
                    key={idx} 
                    href={idx === 0 ? "https://www.instagram.com/colin__guest/" : social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`transition-all duration-500 hover:-translate-y-1 ${isAboutPage ? "opacity-30 hover:opacity-100" : "opacity-20 hover:opacity-100"}`}
                  >
                    {idx === 0 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                      </svg>
                    ) : social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Right: Link Grid */}
            <div className="w-full md:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-8">
              {sections.map((section) => (
                <div key={section.title} className="space-y-4">
                  <h3 className="text-[8px] font-bold uppercase tracking-[0.4em] opacity-20">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link 
                          href={link.href}
                          className="text-[9px] font-bold uppercase tracking-[0.05em] opacity-40 hover:opacity-100 transition-all block"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Footer */}
          <div className="mt-16 pt-6 border-t border-black/[0.03] flex flex-col md:flex-row justify-between items-center gap-4 text-[7px] font-bold uppercase tracking-[0.4em] opacity-20">
            <p>© 2024 COLIN GUEST RETAIL.</p>
            <div className="flex gap-8">
              <Link href="#" className="hover:opacity-100">Privacy</Link>
              <Link href="#" className="hover:opacity-100">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
