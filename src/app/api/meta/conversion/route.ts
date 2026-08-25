import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Hash utility for CAPI user data security (SHA-256)
function hashData(value?: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return undefined;
  return crypto.createHash("sha256").update(trimmed).digest("hex");
}

export async function POST(request: Request) {
  try {
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.META_PIXEL_ID;
    const accessToken = process.env.META_CONVERSIONS_API_ACCESS_TOKEN;

    // If pixel ID or server access token is not configured yet, exit gracefully
    if (!pixelId || !accessToken) {
      return NextResponse.json({ status: "skipped", message: "Meta CAPI credentials pending configuration" });
    }

    const body = await request.json();
    const { eventName, eventId, customData, sourceUrl } = body;

    if (!eventName || !eventId) {
      return NextResponse.json({ error: "Missing eventName or eventId" }, { status: 400 });
    }

    // Extract Client IP and User Agent for Meta Attribution
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
                     request.headers.get("x-real-ip") || 
                     "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "";

    const eventPayload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url: sourceUrl || "",
          action_source: "website",
          user_data: {
            client_ip_address: clientIp,
            client_user_agent: userAgent,
          },
          custom_data: {
            currency: customData?.currency || "INR",
            value: customData?.value || 0,
            content_name: customData?.content_name,
            content_category: customData?.content_category,
            content_ids: customData?.content_ids,
            content_type: customData?.content_type || "product",
            num_items: customData?.num_items,
          },
        },
      ],
      test_event_code: process.env.META_TEST_EVENT_CODE || undefined,
    };

    // Send server-to-server Conversions API request to Meta Graph API v19.0
    const metaResponse = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventPayload),
      }
    );

    const result = await metaResponse.json();

    return NextResponse.json({ success: true, metaResponse: result });
  } catch (error: any) {
    console.error("Meta Conversions API Error:", error?.message || error);
    return NextResponse.json({ error: "Failed to send server event" }, { status: 500 });
  }
}
