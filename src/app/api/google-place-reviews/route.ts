import { NextResponse } from "next/server";
import {
  GooglePlacesApiError,
  GooglePlacesConfigError,
  findNearbyPlaceId,
  getPlaceReviewDetails,
} from "@/lib/google-places";
import type { GooglePlaceReviewResult } from "@/types/google-places";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim() ?? "";
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const lat = latParam ? Number(latParam) : NaN;
  const lng = lngParam ? Number(lngParam) : NaN;

  if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "name, lat, lng are required" }, { status: 400 });
  }

  try {
    const placeId = await findNearbyPlaceId(name, lat, lng);
    if (!placeId) {
      const result: GooglePlaceReviewResult = { found: false };
      return NextResponse.json(result);
    }

    const place = await getPlaceReviewDetails(placeId);
    const result: GooglePlaceReviewResult = { found: true, place };
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof GooglePlacesConfigError) {
      console.error(error);
      return NextResponse.json({ error: "Google Places API is not configured" }, { status: 500 });
    }
    if (error instanceof GooglePlacesApiError) {
      console.error(error);
      return NextResponse.json({ error: "Google Places API request failed" }, { status: 502 });
    }
    console.error(error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
