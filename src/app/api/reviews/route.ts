import { NextResponse } from "next/server";
import { getStoreReviews, submitReviewAction } from "@/lib/judgeme";
import fs from "fs/promises";
import path from "path";

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
    const { name, email, rating, title, body: reviewBody, images = [] } = body;

    const pictureUrls: string[] = [];

    if (Array.isArray(images) && images.length > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "reviews");
      try {
        await fs.mkdir(uploadDir, { recursive: true });
      } catch {}

      const host = req.headers.get("host") || "www.colinguest.com";
      const protocol = host.includes("localhost") ? "http" : "https";

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        if (typeof item === "string" && item.startsWith("data:image/")) {
          try {
            const matches = item.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
            if (matches) {
              const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
              const buffer = Buffer.from(matches[2], "base64");
              const filename = `cg-rev-${Date.now()}-${i}.${ext}`;
              const filePath = path.join(uploadDir, filename);
              await fs.writeFile(filePath, buffer);
              pictureUrls.push(`${protocol}://${host}/uploads/reviews/${filename}`);
            }
          } catch (fileErr) {
            console.error("Error saving review image:", fileErr);
          }
        } else if (typeof item === "string" && item.startsWith("http")) {
          pictureUrls.push(item);
        }
      }
    }

    const result = await submitReviewAction({
      name,
      email,
      rating,
      title,
      body: reviewBody,
      pictureUrls: pictureUrls.length > 0 ? pictureUrls : undefined,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Reviews API POST error:", err);
    return NextResponse.json({ success: false, message: "Error submitting review" }, { status: 500 });
  }
}
