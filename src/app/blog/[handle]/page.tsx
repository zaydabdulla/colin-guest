import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getBlogArticleByHandle, getBlogArticles } from "@/lib/shopify";

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const article = await getBlogArticleByHandle("news", handle);

  if (!article) {
    return {
      title: "Article Not Found | Colin Guest",
    };
  }

  const title = article.seo?.title || `${article.title} | Colin Guest`;
  const description =
    article.seo?.description ||
    article.excerpt ||
    "Explore the latest editorial dispatch from Colin Guest.";

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `https://www.colinguest.com/blog/${article.handle}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.publishedAt,
      url: `https://www.colinguest.com/blog/${article.handle}`,
      images: article.image?.url
        ? [
            {
              url: article.image.url,
              alt: article.image.altText || article.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.image?.url ? [article.image.url] : undefined,
    },
  };
}

export async function generateStaticParams() {
  try {
    const blog = await getBlogArticles("news", 50);
    return (blog?.articles || []).map((article: any) => ({
      handle: article.handle,
    }));
  } catch {
    return [];
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { handle } = await params;
  const article = await getBlogArticleByHandle("news", handle);

  if (!article) {
    notFound();
  }

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // Article JSON-LD Schema
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.seo?.description || article.excerpt || article.title,
    image: article.image?.url ? [article.image.url] : undefined,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      "@type": "Person",
      name: article.authorV2?.name || "Colin Guest",
    },
    publisher: {
      "@type": "Organization",
      name: "Colin Guest",
      logo: {
        "@type": "ImageObject",
        url: "https://www.colinguest.com/logo_cg.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.colinguest.com/blog/${article.handle}`,
    },
  };

  // Breadcrumb Schema
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.colinguest.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Journal",
        item: "https://www.colinguest.com/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `https://www.colinguest.com/blog/${article.handle}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article className="min-h-screen bg-white text-black pt-28 md:pt-36 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Back Navigation */}
          <div className="mb-10">
            <Link
              href="/blog"
              className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400 hover:text-black transition-colors inline-flex items-center gap-2"
            >
              <span aria-hidden="true">&larr;</span> Back to Journal
            </Link>
          </div>

          {/* Article Header */}
          <header className="mb-10 text-center space-y-4">
            <div className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400">
              {formattedDate && <time dateTime={article.publishedAt}>{formattedDate}</time>}
              {formattedDate && article.authorV2?.name && <span>•</span>}
              {article.authorV2?.name && <span>By {article.authorV2.name}</span>}
            </div>

            {/* Exactly one H1 for this page */}
            <h1 className="text-3xl md:text-5xl font-serif italic text-neutral-900 leading-tight tracking-tight">
              {article.title}
            </h1>

            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {article.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-[9px] uppercase font-bold tracking-[0.2em] px-3 py-1 bg-neutral-100 rounded-full text-neutral-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Featured Image */}
          {article.image?.url && (
            <div className="relative aspect-[16/10] md:aspect-[16/9] w-full rounded-2xl overflow-hidden mb-12 bg-neutral-100">
              <Image
                src={article.image.url}
                alt={article.image.altText || `${article.title} - Colin Guest`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
          )}

          {/* Article Content */}
          <div
            className="text-neutral-800 font-sans text-sm md:text-base leading-[1.8] md:leading-[2.0] tracking-wide 
              [&>p]:mb-6 
              [&>h2]:text-2xl [&>h2]:md:text-3xl [&>h2]:font-serif [&>h2]:italic [&>h2]:text-neutral-900 [&>h2]:mt-10 [&>h2]:mb-4 
              [&>h3]:text-xl [&>h3]:font-serif [&>h3]:italic [&>h3]:text-neutral-900 [&>h3]:mt-8 [&>h3]:mb-3 
              [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul]:space-y-2
              [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol]:space-y-2
              [&>blockquote]:border-l-2 [&>blockquote]:border-black [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:my-8 [&>blockquote]:text-neutral-600
              [&>img]:rounded-xl [&>img]:my-8 [&>img]:w-full
              [&>a]:underline [&>a]:underline-offset-4 [&>a]:font-medium hover:[&>a]:opacity-70"
            dangerouslySetInnerHTML={{
              __html: article.contentHtml || article.content || "",
            }}
          />

          {/* Footer Navigation */}
          <div className="mt-16 pt-8 border-t border-neutral-100 flex justify-between items-center">
            <Link
              href="/blog"
              className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400 hover:text-black transition-colors"
            >
              &larr; More Articles
            </Link>
            <Link
              href="/collections/all"
              className="text-[10px] font-bold uppercase tracking-[0.25em] px-6 py-2.5 bg-black text-white rounded-full hover:bg-neutral-800 transition-colors"
            >
              Shop All
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
