import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getBlogArticles } from "@/lib/shopify";

export const metadata: Metadata = {
  title: "Journal | Colin Guest",
  description:
    "Stories, design philosophy, and editorials from the Colin Guest atelier. Contemporary men's luxury streetwear.",
  alternates: {
    canonical: "https://www.colinguest.com/blog",
  },
  openGraph: {
    title: "Journal | Colin Guest",
    description:
      "Stories, design philosophy, and editorials from the Colin Guest atelier.",
    url: "https://www.colinguest.com/blog",
    type: "website",
  },
};

export default async function BlogPage() {
  const blog = await getBlogArticles("news", 20);
  const articles = blog?.articles || [];

  return (
    <div className="min-h-screen bg-white text-black pt-28 md:pt-36 pb-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-14 md:mb-20 text-center max-w-2xl mx-auto">
          <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] text-neutral-400 mb-3 block">
            Editorial &amp; Insights
          </span>
          <h1 className="text-3xl md:text-5xl font-serif italic text-neutral-900 tracking-tight mb-4">
            The Journal
          </h1>
          <p className="text-xs md:text-sm text-neutral-500 font-sans leading-relaxed tracking-wide">
            Design narratives, atelier dispatches, and contemporary streetwear culture by Colin Guest.
          </p>
        </div>

        {/* Articles List / Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-20 border border-neutral-100 rounded-2xl bg-neutral-50/50 max-w-xl mx-auto px-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 block mb-2">
              Atelier Notes
            </span>
            <h2 className="text-xl font-serif italic text-neutral-800 mb-3">
              New Dispatches Coming Soon
            </h2>
            <p className="text-xs text-neutral-500 mb-8 leading-relaxed max-w-md mx-auto">
              Our upcoming stories, styling editorials, and collection releases are currently in curation.
            </p>
            <Link
              href="/collections/all"
              className="inline-block px-8 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-[0.25em] rounded-full hover:bg-neutral-800 transition-colors"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {articles.map((article: any) => {
              const formattedDate = article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : null;

              return (
                <article
                  key={article.id || article.handle}
                  className="group flex flex-col bg-white border border-neutral-100 rounded-2xl overflow-hidden hover:border-neutral-300 transition-all duration-300"
                >
                  <Link
                    href={`/blog/${article.handle}`}
                    className="block relative aspect-[16/10] bg-neutral-100 overflow-hidden"
                  >
                    {article.image?.url ? (
                      <Image
                        src={article.image.url}
                        alt={article.image.altText || `${article.title} - Colin Guest`}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-300">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
                          Colin Guest
                        </span>
                      </div>
                    )}
                  </Link>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400 mb-3">
                      {formattedDate && <span>{formattedDate}</span>}
                      {formattedDate && article.authorV2?.name && <span>•</span>}
                      {article.authorV2?.name && (
                        <span>{article.authorV2.name}</span>
                      )}
                    </div>

                    <h2 className="text-lg md:text-xl font-serif italic text-neutral-900 mb-3 leading-snug group-hover:text-neutral-600 transition-colors">
                      <Link href={`/blog/${article.handle}`}>
                        {article.title}
                      </Link>
                    </h2>

                    {article.excerpt && (
                      <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3 mb-6 font-sans">
                        {article.excerpt}
                      </p>
                    )}

                    <div className="mt-auto pt-4 border-t border-neutral-100">
                      <Link
                        href={`/blog/${article.handle}`}
                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-black hover:opacity-60 transition-opacity inline-flex items-center gap-1.5"
                      >
                        Read Article
                        <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
