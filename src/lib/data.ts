export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions?: { name: string; value: string }[];
};

export type Product = {
  id: string | number;
  src: string;
  secondarySrc?: string;
  srcs?: string[];
  sizeChartSrc?: string;
  title: string;
  price: string;
  amount: number;
  desc: string;
  descriptionHtml?: string;
  category: string;
  type: string;
  details?: string;
  sizeGuide?: string;
  washcare?: string;
  shipping?: string;
  reels?: string;
  variants?: any[];
  options?: { name: string; values: string[] }[];
  createdAt?: string;
  salesCount?: number;
  shopifyCategory?: string;
  colorMetafield?: string;
  metafieldKeys?: string;
  tags?: string[];
  handle?: string;
};

export type Collection = {
  id: string;
  title: string;
  handle: string;
  image?: {
    url: string;
    altText?: string;
  };
};

export const models: Product[] = [
  { id: 1, src: "/black_acid_wash_hoodies.jpg", title: "Acid Wash Heavyweight", price: "$850", amount: 850, desc: "Premium heavyweight cotton with a deep acid wash finish for a vintage editorial silhouette.", category: "Hoodies", type: "Hoodie" },
  { id: 2, src: "/black_faded_jean.jpg", title: "Faded Utility Denim", price: "$720", amount: 720, desc: "Relaxed fit luxury denim with custom distressing and a faded noir wash.", category: "Jeans", type: "Jeans" },
  { id: 3, src: "/blacks_set.jpg", title: "Monochrome Noir Set", price: "$1,450", amount: 1450, desc: "A complete monochrome silhouette featuring coordinated textures for a deep, layered aesthetic.", category: "Outfits", type: "Set" },
  { id: 4, src: "/grey_hoodie_washed_jean.jpg", title: "Studio Grey Look", price: "$980", amount: 980, desc: "The signature studio grey hoodie paired with our heritage washed indigo denim.", category: "Hoodies", type: "Hoodie" },
  { id: 5, src: "/printed_shirt_and_jeans.jpg", title: "Printed Editorial Duo", price: "$1,100", amount: 1100, desc: "Bold printed graphics on luxury textiles, paired with architectural denim lines.", category: "Sets", type: "Set" },
  { id: 6, src: "/6_trans.png", title: "Textured Wool", price: "$1,450", amount: 1450, desc: "Heavy oversized textured wool coat paired with wide-leg trousers for a bold structural statement.", category: "Jeans", type: "Jeans" },
  { id: 7, src: "/7_trans.png", title: "Metallic Orbit", price: "$2,600", amount: 2600, desc: "Striking metallic silver outfit constructed for futuristic, sharp aesthetics and deep reflections.", category: "Jeans", type: "Jeans" },
  { id: 8, src: "/8_trans.png", title: "Noir Leather", price: "$3,100", amount: 3100, desc: "Sleek tailored black leather trench coat. The pinnacle of moody, intense evening wear.", category: "Jeans", type: "Jeans" },
];

/**
 * Extracts and separates product images from the size chart.
 * In Colin Guest Shopify, the LAST image uploaded for any product is the Size Chart.
 * This helper guarantees the size chart is NEVER included in showcase galleries or cards,
 * and is strictly reserved for the Size Guide.
 */
export function extractProductMedia(rawUrls: (string | undefined | null)[]) {
  const validUrls = (rawUrls || []).filter((u): u is string => Boolean(u && typeof u === "string"));

  if (validUrls.length === 0) {
    return {
      showcaseImages: ["/placeholder.jpg"],
      sizeChartImage: null,
      primarySrc: "/placeholder.jpg",
      secondarySrc: undefined,
    };
  }

  // If 2 or more images, the last one is the size chart
  if (validUrls.length > 1) {
    const sizeChartImage = validUrls[validUrls.length - 1];
    const showcaseImages = validUrls.slice(0, -1);
    const primarySrc = showcaseImages[0] || "/placeholder.jpg";
    // secondarySrc is only a real garment photo if showcaseImages has at least 2 images (validUrls >= 3)
    const secondarySrc = showcaseImages.length > 1 ? showcaseImages[1] : undefined;
    return {
      showcaseImages,
      sizeChartImage,
      primarySrc,
      secondarySrc,
    };
  }

  // Only 1 image total (no size chart uploaded yet)
  return {
    showcaseImages: validUrls,
    sizeChartImage: null,
    primarySrc: validUrls[0],
    secondarySrc: undefined,
  };
}
