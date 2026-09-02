// Meta (Facebook/Instagram) Pixel & Conversions API Helper
// Implements dual-tracking with event deduplication (event_id)

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "2614004339033377";

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

/**
 * Generate a unique event ID for deduplicating Browser Pixel and Server CAPI events
 */
export function generateEventId(): string {
  return `cg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

interface MetaEventParams {
  eventName: "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Search";
  eventId?: string;
  customData?: {
    content_name?: string;
    content_category?: string;
    content_ids?: (string | number)[];
    content_type?: string;
    value?: number;
    currency?: string;
    num_items?: number;
    [key: string]: any;
  };
}

/**
 * Triggers dual Meta tracking:
 * 1. Browser Meta Pixel (fbq)
 * 2. Server Conversions API (/api/meta/conversion)
 */
export async function trackMetaEvent({ eventName, eventId, customData }: MetaEventParams) {
  const finalEventId = eventId || generateEventId();

  // 1. Browser Meta Pixel Trigger
  if (typeof window !== "undefined" && window.fbq) {
    try {
      window.fbq("track", eventName, customData || {}, { eventID: finalEventId });
    } catch (err) {
      console.warn("Meta Pixel browser tracking notice:", err);
    }
  }

  // 2. Server-Side Conversions API (CAPI) Trigger
  try {
    fetch("/api/meta/conversion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        eventId: finalEventId,
        customData: customData || {},
        sourceUrl: typeof window !== "undefined" ? window.location.href : "",
      }),
    }).catch(() => {
      // Non-blocking background fetch
    });
  } catch (err) {
    // Non-blocking
  }
}
