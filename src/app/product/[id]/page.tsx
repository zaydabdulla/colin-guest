import { Product } from "@/lib/data";
import { getProductById, getProductRecommendations, getAllProducts, getProductByHandle } from "@/lib/shopify";
import ProductClient from "@/components/product-client";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  let product: Product | undefined;
  let suggestedProducts: Product[] = [];

  // If not found in mock data, try Shopify (if ID looks like a Shopify ID or mock failed)
  if (!product) {
    try {
      const decodedId = decodeURIComponent(id);
      const isGid = decodedId.startsWith("gid://shopify/Product/");
      const shopifyProduct = isGid
        ? await getProductById(decodedId)
        : await getProductByHandle(decodedId);
      
      if (shopifyProduct) {
        product = {
          id: shopifyProduct.id,
          handle: shopifyProduct.handle,
          src: shopifyProduct.images[0]?.url || "/placeholder.jpg",
          secondarySrc: shopifyProduct.images[1]?.url,
          srcs: shopifyProduct.images.map((img: any) => img.url),
          title: shopifyProduct.title,
          price: `${shopifyProduct.priceRange.minVariantPrice.currencyCode === 'INR' ? 'RS. ' : '$'}${parseFloat(shopifyProduct.priceRange.minVariantPrice.amount).toLocaleString()}`,
          desc: shopifyProduct.description,
          descriptionHtml: shopifyProduct.descriptionHtml,
          category: shopifyProduct.productType || "Collection",
          details: shopifyProduct.details?.value,
          sizeGuide: shopifyProduct.sizeGuide?.value,
          washcare: shopifyProduct.washcare?.value,
          shipping: shopifyProduct.shipping?.value,
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
          suggestedProducts = recommendations.map((p: any) => ({
            id: p.id,
            src: p.images[0]?.url || "/placeholder.jpg",
            secondarySrc: p.images[1]?.url,
            srcs: p.images.map((img: any) => img.url),
            title: p.title,
            price: `${p.priceRange.minVariantPrice.currencyCode === 'INR' ? 'RS. ' : '$'}${parseFloat(p.priceRange.minVariantPrice.amount).toLocaleString()}`,
            desc: p.description,
            category: p.productType || "Collection",
            amount: parseFloat(p.priceRange.minVariantPrice.amount),
            type: p.productType || "General"
          }));
        } else {
          // Fallback: Fetch general products if no recommendations are found
          const allProducts = await getAllProducts();
          suggestedProducts = allProducts
            .filter((p: any) => p.id !== shopifyProduct.id) // Don't show current product
            .slice(0, 4)
            .map((p: any) => ({
              id: p.id,
              src: p.images[0]?.url || "/placeholder.jpg",
              secondarySrc: p.images[1]?.url,
              srcs: p.images.map((img: any) => img.url),
              title: p.title,
              price: `${p.priceRange.minVariantPrice.currencyCode === 'INR' ? 'RS. ' : '$'}${parseFloat(p.priceRange.minVariantPrice.amount).toLocaleString()}`,
              desc: p.description,
              category: p.productType || "Collection",
              amount: parseFloat(p.priceRange.minVariantPrice.amount),
              type: p.productType || "General"
            }));
        }
      }
    } catch (error) {
      console.error("Error fetching Shopify product:", error);
    }
  }

  // Fetch all products for "Shop the Look" logic
  const allRawProducts = await getAllProducts();
  const allProducts: Product[] = allRawProducts.map((p: any) => ({
    id: p.id,
    src: p.images[0]?.url || "/placeholder.jpg",
    secondarySrc: p.images[1]?.url,
    srcs: p.images.map((img: any) => img.url),
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
  }));

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
    const shopifyProduct = isGid
      ? await getProductById(decodedId)
      : await getProductByHandle(decodedId);

    if (shopifyProduct) {
      const imageUrls = shopifyProduct.images?.edges.map((e: any) => e.node.url) || [];
      return {
        title: `${shopifyProduct.title} | COLIN GUEST`,
        description: shopifyProduct.description?.slice(0, 160) || `Buy ${shopifyProduct.title} online at COLIN GUEST. Premium designer clothing.`,
        openGraph: {
          title: shopifyProduct.title,
          description: shopifyProduct.description || `Buy ${shopifyProduct.title} online at COLIN GUEST.`,
          images: imageUrls.map((url: string) => ({
            url,
            width: 800,
            height: 1000,
            alt: shopifyProduct.title,
          })),
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: shopifyProduct.title,
          description: shopifyProduct.description || `Buy ${shopifyProduct.title} online at COLIN GUEST.`,
          images: imageUrls,
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

