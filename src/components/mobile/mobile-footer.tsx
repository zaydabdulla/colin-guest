"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Camera, Globe, Video, ArrowRight } from "lucide-react";

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
    { icon: <Camera size={16} />, href: "#" },
    { icon: <Video size={16} />, href: "#" },
    { icon: <Globe size={16} />, href: "#" },
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
                <Link 
                  key={idx} 
                  href={social.href}
                  className={`transition-all duration-500 ${isAboutPage ? "opacity-30 hover:opacity-100" : "opacity-20 hover:opacity-100"}`}
                >
                  {social.icon}
                </Link>
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
