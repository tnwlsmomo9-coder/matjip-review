import { NextResponse } from "next/server";
import { GeminiApiError, GeminiConfigError, analyzeReviews } from "@/lib/gemini";

interface AnalyzeReviewsBody {
  placeName?: string;
  reviews?: { rating: number; text: string }[];
}

export async function POST(request: Request) {
  let body: AnalyzeReviewsBody;
  try {
    body = (await request.json()) as AnalyzeReviewsBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const placeName = body.placeName?.trim() ?? "";
  const reviews = body.reviews ?? [];

  if (!placeName || reviews.length === 0) {
    return NextResponse.json({ error: "placeName and a non-empty reviews array are required" }, { status: 400 });
  }

  try {
    const analysis = await analyzeReviews(placeName, reviews);
    return NextResponse.json({ analysis });
  } catch (error) {
    if (error instanceof GeminiConfigError) {
      console.error(error);
      return NextResponse.json({ error: "Gemini API is not configured" }, { status: 500 });
    }
    if (error instanceof GeminiApiError) {
      console.error(error);
      return NextResponse.json({ error: "Gemini API request failed" }, { status: 502 });
    }
    console.error(error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
