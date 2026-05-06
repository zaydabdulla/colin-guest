"use client";

import { motion } from "framer-motion";

interface LegalPageProps {
  title: string;
  content: {
    section?: string;
    text: string;
    items?: string[];
  }[];
}

export default function LegalLayout({ title, content }: LegalPageProps) {
  return (
    <main className="w-full bg-white text-black font-sans min-h-screen">
      <div className="max-w-4xl pt-40 pb-80 px-6 md:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-[-0.04em] mb-12 leading-[0.9]">
            {title}
          </h1>

          <div className="space-y-16">
            {content.map((item, index) => (
              <div key={index} className="space-y-6">
                {item.section && (
                  <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-black/90">
                    {item.section}
                  </h2>
                )}
                <p className="text-[13px] md:text-[15px] font-medium leading-[1.7] text-black/60 whitespace-pre-line tracking-tight">
                  {item.text}
                </p>
                {item.items && (
                  <ul className="space-y-3 mt-6">
                    {item.items.map((bullet, i) => (
                      <li key={i} className="flex gap-4 text-[13px] md:text-[15px] font-medium text-black/60 tracking-tight">
                        <span className="text-black/20 font-bold shrink-0">—</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

        </motion.div>
      </div>
    </main>
  );
}
