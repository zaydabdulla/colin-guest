"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Camera, Globe, Video, ArrowRight, Send } from "lucide-react";

export function MobileFooter() {
  const pathname = usePathname();
  
  // Show on About, Collections, and Product pages as requested
  const showFooter = pathname === "/about" || pathname.startsWith("/collections") || pathname.startsWith("/product");
  
  if (!showFooter) return null;

  const isAboutPage = pathname === "/about";

  const sections = [
    {
      title: "Editorial",
      links: [
        { name: "The Lookbook", href: "/" },
        { name: "Architectural Integrity", href: "/about" },
        { name: "Journal", href: "#" },
      ],
    },
    {
      title: "Curations",
      links: [
        { name: "New Arrivals", href: "/collections/all" },
        { name: "All Collections", href: "/collections/all" },
      ],
    },
    {
      title: "Assistance",
      links: [
        { name: "Shipping", href: "#" },
        { name: "Returns", href: "#" },
        { name: "Size Guide", href: "#" },
      ],
    },
  ];

  const socialLinks = [
    { 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
      ), 
      href: "https://www.instagram.com/colin__guest/" 
    },
    { 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08c0 4.84-3.87 8.77-8.64 8.77-1.54 0-3.05-.41-4.37-1.21l-4.27 1.12 1.13-4.16c-.86-1.28-1.32-2.78-1.32-4.52C4.54 6.24 8.4 2.31 13.17 2.31c4.77 0 8.83 3.93 8.83 8.77zM17.48 14.19c-.26-.14-1.54-.76-1.78-.85-.24-.09-.42-.14-.59.14-.17.28-.68.85-.83 1.03-.15.19-.3.21-.56.07-.26-.14-1.1-.4-2.1-1.3-.77-.69-1.3-1.53-1.45-1.8-.15-.26-.01-.41.12-.54.12-.13.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.59-1.42-.81-1.95-.21-.51-.43-.44-.59-.45-.15-.01-.32-.01-.49-.01-.17 0-.45.06-.68.32-.24.25-.9.88-.9 2.15s.92 2.5 1.05 2.68c.13.17 1.8 2.76 4.36 3.86.61.26 1.09.42 1.46.54.61.2 1.17.17 1.6.11.49-.07 1.54-.63 1.76-1.24.21-.61.21-1.13.15-1.24-.07-.12-.24-.19-.5-.33z"/>
        </svg>
      ), 
      href: "https://wa.me/yourwhatsappnumber" 
    },
  ];

  return (
    <footer className={`relative w-full overflow-hidden ${isAboutPage ? "bg-black" : "bg-white"}`}>
      <div className={`relative w-full rounded-t-[30px] pt-8 pb-20 px-6 overflow-hidden transition-colors duration-1000 ${
        isAboutPage ? "bg-[#0d0d0d] text-white" : "bg-[#f2f2f4] text-black"
      }`}>
        
        {/* LOGO WATERMARK - Slightly smaller and higher */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
          <div className={`relative w-[80%] aspect-[3/1] ${isAboutPage ? "invert brightness-200" : ""}`}>
            <Image 
              src="/logo_cg.png" 
              alt="COLIN GUEST" 
              fill 
              className="object-contain"
            />
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          {/* Top row: Newsletter & Socials */}
          <div className="flex justify-between items-end gap-4 border-b border-black/[0.03] pb-6">
            <div className="flex-1 space-y-2">
              <h2 className="text-[7px] font-bold uppercase tracking-[0.3em] opacity-40 uppercase">Newsletter</h2>
              <div className="relative group max-w-[160px]">
                <input 
                  type="email" 
                  placeholder="EMAIL" 
                  className={`w-full bg-transparent border-b py-1 text-[9px] font-bold tracking-[0.1em] outline-none transition-all ${
                    isAboutPage ? "border-white/10 focus:border-white" : "border-black/5 focus:border-black"
                  }`}
                />
                <button className="absolute right-0 top-1/2 -translate-y-1/2 p-1">
                  <ArrowRight size={12} strokeWidth={1} />
                </button>
              </div>
            </div>
            
            <div className="flex gap-4 pb-1">
              {socialLinks.map((social, idx) => (
                <a 
                  key={idx} 
                  href={idx === 0 ? "https://www.instagram.com/colin__guest/" : social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-all duration-500 ${isAboutPage ? "opacity-30 hover:opacity-100" : "opacity-20 hover:opacity-100"}`}
                >
                  {idx === 0 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                  ) : social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Grid - 3 Columns for maximum compression */}
          <div className="grid grid-cols-3 gap-2">
            {sections.map((section) => (
              <div key={section.title} className="space-y-3">
                <h3 className="text-[7px] font-bold uppercase tracking-[0.3em] opacity-20">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href}
                        className="text-[8px] font-bold uppercase tracking-[0.05em] opacity-40 hover:opacity-100 transition-all block truncate"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Legal Footer - Compact Row */}
          <div className="pt-4 border-t border-black/[0.03] flex justify-between items-center text-[6.5px] font-bold uppercase tracking-[0.3em] opacity-20">
            <p>© 2024 COLIN GUEST.</p>
            <div className="flex gap-4">
              <Link href="#" className="hover:opacity-100">Privacy</Link>
              <Link href="#" className="hover:opacity-100">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
