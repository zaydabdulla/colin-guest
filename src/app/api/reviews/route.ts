import { NextResponse } from "next/server";
import { getStoreReviews, submitReviewAction } from "@/lib/judgeme";

export async function GET() {
  try {
    const data = await getStoreReviews();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Reviews API GET error:", err);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await submitReviewAction(body);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Reviews API POST error:", err);
    return NextResponse.json({ success: false, message: "Error submitting review" }, { status: 500 });
  }
}
