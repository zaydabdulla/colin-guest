import { Product, extractProductMedia } from "@/lib/data";
import { getProductById, getProductRecommendations, getAllProducts, getProductByHandle } from "@/lib/shopify";
import ProductClient from "@/components/product-client";
import { notFound, permanentRedirect } from "next/navigation";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const decodedId = decodeURIComponent(id);
  const isGid = decodedId.startsWith("gid://shopify/Product/");
  const isNumericGid = /^\d+$/.test(decodedId);

  // 301 Permanent Redirect for any old/crawled GID URLs to their clean handle URL
  if (isGid || isNumericGid) {
    try {
      const gidToFetch = isGid ? decodedId : `gid://shopify/Product/${decodedId}`;
      const gidProduct = await getProductById(gidToFetch);
      if (gidProduct?.handle) {
        permanentRedirect(`/product/${gidProduct.handle}`);
      }
    } catch (e: any) {
      // If it's a redirect, Next.js throws NEXT_REDIRECT, which must be re-thrown
      if (e?.message?.includes("NEXT_REDIRECT")) throw e;
      console.error("Error redirecting GID product URL:", e);
    }
  }

  let product: Product | undefined;
  let suggestedProducts: Product[] = [];

  // If not found in mock data, try Shopify (if ID looks like a Shopify ID or mock failed)
  if (!product) {
    try {
      const shopifyProduct = isGid
        ? await getProductById(decodedId)
        : await getProductByHandle(decodedId);
      
      if (shopifyProduct) {
        const rawUrls = shopifyProduct.images?.map((img: any) => img.url) || [];
        const media = extractProductMedia(rawUrls);

        product = {
          id: shopifyProduct.id,
          handle: shopifyProduct.handle,
          src: media.primarySrc,
          secondarySrc: media.secondarySrc,
          srcs: media.showcaseImages,
          sizeChartSrc: media.sizeChartImage || undefined,
          title: shopifyProduct.title,
          price: `${shopifyProduct.priceRange.minVariantPrice.currencyCode === 'INR' ? 'RS. ' : '$'}${parseFloat(shopifyProduct.priceRange.minVariantPrice.amount).toLocaleString()}`,
          desc: shopifyProduct.description,
          descriptionHtml: shopifyProduct.descriptionHtml,
          category: shopifyProduct.productType || "Collection",
          details: shopifyProduct.details?.value,
          sizeGuide: shopifyProduct.sizeGuide?.value,
          washcare: shopifyProduct.washcare?.value,
          shipping: shopifyProduct.shipping?.value,
          reels: shopifyProduct.reels?.value,
          variants: shopifyProduct.variants?.edges.map((e: any) => ({
            id: e.node.id,
            title: e.node.title,
            availableForSale: e.node.availableForSale,
            selectedOptions: e.node.selectedOptions
          })),
          amount: parseFloat(shopifyProduct.priceRange.minVariantPrice.amount),
          type: shopifyProduct.productType || "General"
        };

        // Fetch related products from Shopify
        const recommendations = await getProductRecommendations(shopifyProduct.id);
        if (recommendations && recommendations.length > 0) {
          suggestedProducts = recommendations.map((p: any) => {
            const pMedia = extractProductMedia(p.images?.map((img: any) => img.url) || []);
            return {
              id: p.id,
              handle: p.handle,
              src: pMedia.primarySrc,
              secondarySrc: pMedia.secondarySrc,
              srcs: pMedia.showcaseImages,
              sizeChartSrc: pMedia.sizeChartImage || undefined,
              title: p.title,
              price: `${p.priceRange.minVariantPrice.currencyCode === 'INR' ? 'RS. ' : '$'}${parseFloat(p.priceRange.minVariantPrice.amount).toLocaleString()}`,
              desc: p.description,
              category: p.productType || "Collection",
              amount: parseFloat(p.priceRange.minVariantPrice.amount),
              type: p.productType || "General"
            };
          });
        } else {
          // Fallback: Fetch general products if no recommendations are found
          const allProducts = await getAllProducts();
          suggestedProducts = allProducts
            .filter((p: any) => p.id !== shopifyProduct.id) // Don't show current product
            .slice(0, 4)
            .map((p: any) => {
              const pMedia = extractProductMedia(p.images?.map((img: any) => img.url) || []);
              return {
                id: p.id,
                handle: p.handle,
                src: pMedia.primarySrc,
                secondarySrc: pMedia.secondarySrc,
                srcs: pMedia.showcaseImages,
                sizeChartSrc: pMedia.sizeChartImage || undefined,
                title: p.title,
                price: `${p.priceRange.minVariantPrice.currencyCode === 'INR' ? 'RS. ' : '$'}${parseFloat(p.priceRange.minVariantPrice.amount).toLocaleString()}`,
                desc: p.description,
                category: p.productType || "Collection",
                amount: parseFloat(p.priceRange.minVariantPrice.amount),
                type: p.productType || "General"
              };
            });
        }
      }
    } catch (error) {
      console.error("Error fetching Shopify product:", error);
    }
  }

  // Fetch all products for "Shop the Look" logic
  const allRawProducts = await getAllProducts();
  const allProducts: Product[] = allRawProducts.map((p: any) => {
    const pMedia = extractProductMedia(p.images?.map((img: any) => img.url) || []);
    return {
      id: p.id,
      handle: p.handle,
      src: pMedia.primarySrc,
      secondarySrc: pMedia.secondarySrc,
      srcs: pMedia.showcaseImages,
      sizeChartSrc: pMedia.sizeChartImage || undefined,
      title: p.title,
      price: `${p.priceRange.minVariantPrice.currencyCode === 'INR' ? 'RS. ' : '$'}${parseFloat(p.priceRange.minVariantPrice.amount).toLocaleString()}`,
      desc: p.description,
      category: p.productType || "Collection",
      amount: parseFloat(p.priceRange.minVariantPrice.amount),
      type: p.productType || "General",
      variants: p.variants?.edges.map((e: any) => ({
        id: e.node.id,
        title: e.node.title,
        availableForSale: e.node.availableForSale,
        selectedOptions: e.node.selectedOptions
      }))
    };
  });

  if (!product) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": product.srcs || [product.src],
    "description": product.desc,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": product.amount,
      "availability": product.variants?.some(v => v.availableForSale)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "url": `https://www.colinguest.com/product/${product.handle || product.id}`,
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductClient product={product} suggestedProducts={suggestedProducts} allProducts={allProducts} />
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  try {
    const decodedId = decodeURIComponent(id);
    const isGid = decodedId.startsWith("gid://shopify/Product/");
    const isNumericGid = /^\d+$/.test(decodedId);

    const shopifyProduct = (isGid || isNumericGid)
      ? await getProductById(isGid ? decodedId : `gid://shopify/Product/${decodedId}`)
      : await getProductByHandle(decodedId);

    if (shopifyProduct) {
      // Safe image extraction: works whether it's array of objects or GraphQL edges
      const imageUrls: string[] = Array.isArray(shopifyProduct.images)
        ? shopifyProduct.images.map((img: any) => (typeof img === 'string' ? img : img.url || '')).filter(Boolean)
        : (shopifyProduct.images?.edges?.map((e: any) => e.node?.url).filter(Boolean) || []);

      const productTitle = shopifyProduct.title || "Product";
      const productHandle = shopifyProduct.handle || decodedId;
      const canonicalUrl = `https://www.colinguest.com/product/${productHandle}`;
      const description = shopifyProduct.description?.trim()
        ? shopifyProduct.description.slice(0, 160)
        : `Buy ${productTitle} online at COLIN GUEST. Premium designer clothing.`;

      return {
        title: `${productTitle} | COLIN GUEST`,
        description,
        alternates: {
          canonical: canonicalUrl,
        },
        openGraph: {
          title: `${productTitle} | COLIN GUEST`,
          description,
          url: canonicalUrl,
          images: imageUrls.slice(0, 4).map((url: string) => ({
            url,
            width: 800,
            height: 1000,
            alt: productTitle,
          })),
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: `${productTitle} | COLIN GUEST`,
          description,
          images: imageUrls.slice(0, 1),
        }
      };
    }
  } catch (error) {
    console.error("Error generating product metadata:", error);
  }
  
  return {
    title: "Product | COLIN GUEST",
    description: "Premium clothing at COLIN GUEST",
  };
}

