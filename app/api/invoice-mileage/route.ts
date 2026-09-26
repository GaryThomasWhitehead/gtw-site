import { NextRequest, NextResponse } from "next/server";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";

export const dynamic = "force-dynamic";

const SHOP = { address: "3195 Park Road Suite C, Benicia, CA 94510", lat: 38.0652735, lon: -122.1327538 };

function config() {
  return {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    table: process.env.FEDEX_TRACKER_TABLE || "fedex_work_orders",
  };
}

function headers(key: string) {
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

function cleanFacilityId(value: unknown) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 24);
}

async function savedMileage(facilityId: string) {
  const { url, key, table } = config();
  if (!url || !key) return null;
  const recordKey = encodeURIComponent(`INVOICEMILES:${facilityId}`);
  const response = await fetch(`${url}/rest/v1/${table}?select=data&tracking_number=eq.${recordKey}&limit=1`, {
    headers: headers(key), cache: "no-store",
  });
  if (!response.ok) return null;
  const [row] = await response.json();
  const miles = Number(row?.data?.roundTripMiles);
  return Number.isFinite(miles) && miles >= 0 ? row.data : null;
}

async function storeMileage(facilityId: string, address: string, roundTripMiles: number, source: "route" | "manual") {
  const { url, key, table } = config();
  if (!url || !key) throw new Error("Storage is not configured");
  const data = { recordType: "invoice-mileage", facilityId, address, shopAddress: SHOP.address, roundTripMiles, source, updatedAt: new Date().toISOString() };
  const response = await fetch(`${url}/rest/v1/${table}?on_conflict=tracking_number`, {
    method: "POST",
    headers: { ...headers(key), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify([{ tracking_number: `INVOICEMILES:${facilityId}`, data, updated_at: data.updatedAt }]),
  });
  if (!response.ok) throw new Error(await response.text());
  return data;
}

export async function GET(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const facilityId = cleanFacilityId(request.nextUrl.searchParams.get("facilityId"));
  const address = String(request.nextUrl.searchParams.get("address") || "").trim().slice(0, 500);
  if (!facilityId) return NextResponse.json({ error: "Facility ID is required" }, { status: 400 });

  const saved = await savedMileage(facilityId);
  if (saved) return NextResponse.json({ ...saved, cached: true });
  if (!address) return NextResponse.json({ error: "Facility address is required for the first lookup" }, { status: 400 });

  const geocodeParams = new URLSearchParams({ q: address, format: "jsonv2", limit: "1", countrycodes: "us" });
  const geocode = await fetch(`https://nominatim.openstreetmap.org/search?${geocodeParams}`, {
    headers: { "User-Agent": "FrontlineInvoiceCreator/1.0 (garythomaswhitehead.com)", Referer: "https://garythomaswhitehead.com/invoice-creator" },
    signal: AbortSignal.timeout(15000), cache: "no-store",
  });
  if (!geocode.ok) return NextResponse.json({ error: "The location could not be looked up" }, { status: 502 });
  const [destination] = await geocode.json();
  const lat = Number(destination?.lat);
  const lon = Number(destination?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return NextResponse.json({ error: "The address was not found. Enter the round-trip mileage manually." }, { status: 422 });

  const coordinates = `${SHOP.lon},${SHOP.lat};${lon},${lat};${SHOP.lon},${SHOP.lat}`;
  const route = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=false&steps=false`, {
    headers: { "User-Agent": "FrontlineInvoiceCreator/1.0 (garythomaswhitehead.com)" },
    signal: AbortSignal.timeout(20000), cache: "no-store",
  });
  if (!route.ok) return NextResponse.json({ error: "Driving mileage could not be calculated. Enter it manually." }, { status: 502 });
  const routeData = await route.json();
  const meters = Number(routeData?.routes?.[0]?.distance);
  if (!Number.isFinite(meters)) return NextResponse.json({ error: "Driving mileage could not be calculated. Enter it manually." }, { status: 422 });
  const roundTripMiles = Math.round((meters / 1609.344) * 10) / 10;
  const data = await storeMileage(facilityId, address, roundTripMiles, "route");
  return NextResponse.json({ ...data, cached: false });
}

export async function POST(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const facilityId = cleanFacilityId(body?.facilityId);
  const address = String(body?.address || "").trim().slice(0, 500);
  const roundTripMiles = Number(body?.roundTripMiles);
  if (!facilityId || !Number.isFinite(roundTripMiles) || roundTripMiles < 0) {
    return NextResponse.json({ error: "Facility ID and valid round-trip mileage are required" }, { status: 400 });
  }
  return NextResponse.json(await storeMileage(facilityId, address, Math.round(roundTripMiles * 10) / 10, "manual"));
}
