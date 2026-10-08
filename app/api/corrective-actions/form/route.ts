import { NextRequest, NextResponse } from "next/server";
import { hasCorrectiveActionViewerAccess, hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";

export const dynamic = "force-dynamic";
const RECORD_KEY = "CORRECTIVEFORM:parts";

function config() {
  return { url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "", key: process.env.SUPABASE_SERVICE_ROLE_KEY || "", table: process.env.FEDEX_TRACKER_TABLE || "fedex_work_orders" };
}

function headers(key: string) {
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

function cleanParts(value: unknown) {
  return (Array.isArray(value) ? value : []).slice(0, 18).map((part: Record<string, unknown>) => ({
    partNumber: String(part?.partNumber || "").trim().slice(0, 120),
    description: String(part?.description || "").trim().slice(0, 500),
    manufacturer: String(part?.manufacturer || "").trim().slice(0, 120),
    qtyNeeded: String(part?.qtyNeeded || "").trim().slice(0, 40),
    qtyOnHand: String(part?.qtyOnHand || "").trim().slice(0, 40),
    asset: String(part?.asset || "").trim().slice(0, 120),
  }));
}

export async function GET(request: NextRequest) {
  if (!hasFedExTrackerAccess(request) && !hasCorrectiveActionViewerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ parts: [] });
  const response = await fetch(`${url}/rest/v1/${table}?select=data&tracking_number=eq.${encodeURIComponent(RECORD_KEY)}&limit=1`, { headers: headers(key), cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: "Could not load parts" }, { status: response.status });
  const [row] = await response.json();
  return NextResponse.json({ parts: cleanParts(row?.data?.parts) });
}

export async function POST(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  const parts = cleanParts((await request.json())?.parts);
  const response = await fetch(`${url}/rest/v1/${table}?on_conflict=tracking_number`, {
    method: "POST", headers: { ...headers(key), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify([{ tracking_number: RECORD_KEY, data: { recordType: "corrective-form", parts }, updated_at: new Date().toISOString() }]),
  });
  if (!response.ok) return NextResponse.json({ error: "Could not save parts" }, { status: response.status });
  return NextResponse.json({ ok: true, parts });
}
