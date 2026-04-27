import { Product } from "@/lib/data";
import { getProductById, getProductRecommendations, getAllProducts } from "@/lib/shopify";
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
      const shopifyProduct = await getProductById(decodeURIComponent(id));
      
      if (shopifyProduct) {
        product = {
          id: shopifyProduct.id,
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

  if (!product) {
    notFound();
  }

  return <ProductClient product={product} suggestedProducts={suggestedProducts} />;
}

