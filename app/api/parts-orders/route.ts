import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";
import { partOrderTracking, validatePartsOrders, type TrackingPartOrders } from "@/lib/partsOrders";

const prefix = "PMPARTORDER:";
const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

function storage() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.FEDEX_TRACKER_TABLE || "fedex_work_orders";
  if (!url || !key) throw new Error("Parts order storage is unavailable.");
  return { endpoint: `${url}/rest/v1/${encodeURIComponent(table)}`, headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" } };
}

async function readRows(params: Record<string, string>) {
  const { endpoint, headers } = storage();
  const response = await fetch(`${endpoint}?${new URLSearchParams(params)}`, { headers, cache: "no-store", signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("Could not load part orders. Please try again.");
  return response.json();
}

export async function GET(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return json({ error: "Unauthorized" }, 401);
  try {
    const raw = request.nextUrl.searchParams.get("tracking");
    if (raw !== null) {
      const trackingNumber = partOrderTracking(raw);
      if (!trackingNumber) return json({ error: "Enter a valid tracking number." }, 400);
      const [saved] = await readRows({ select: "data", tracking_number: `eq.${prefix}${trackingNumber}`, limit: "1" });
      if (saved) return json(saved.data);
      const [job] = await readRows({ select: "data", tracking_number: `eq.${trackingNumber}`, limit: "1" });
      const location = String(job?.data?.facilityId || job?.data?.location || job?.data?.invoiceReview?.store || "").slice(0, 250);
      return json({ trackingNumber, location, partsOrders: [], version: "" });
    }
    const orders: TrackingPartOrders[] = [];
    for (let offset = 0; ; offset += 100) {
      const rows = await readRows({ select: "data", tracking_number: `like.${prefix}*`, order: "tracking_number.asc", limit: "100", offset: String(offset) });
      orders.push(...rows.map((row: { data: TrackingPartOrders }) => row.data));
      if (rows.length < 100) return json(orders);
    }
  } catch (error) { return json({ error: (error as Error).message }, 503); }
}

export async function PUT(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return json({ error: "Unauthorized" }, 401);
  const body = await request.json().catch(() => null);
  const trackingNumber = partOrderTracking(body?.trackingNumber);
  if (!trackingNumber || typeof body?.location !== "string" || body.location.length > 250 || typeof body?.version !== "string" || (body.version && !/^[a-f0-9-]{36}$/i.test(body.version))) {
    return json({ error: "Check the tracking number and location." }, 400);
  }
  let partsOrders;
  try { partsOrders = validatePartsOrders(body.partsOrders); }
  catch (error) { return json({ error: (error as Error).message }, 400); }
  if (!body.version && !partsOrders.length) return json({ error: "Add a part before saving." }, 400);
  try {
    const { endpoint, headers } = storage();
    const data = { recordType: "tracking-part-orders", trackingNumber, location: body.location.trim(), partsOrders, version: randomUUID() };
    const tracking_number = `${prefix}${trackingNumber}`;
    const updated_at = new Date().toISOString();
    const existing = Boolean(body.version);
    const params = new URLSearchParams(existing
      ? { tracking_number: `eq.${tracking_number}`, "data->>version": `eq.${body.version}` }
      : { on_conflict: "tracking_number" });
    const response = await fetch(`${endpoint}?${params}`, {
      method: existing ? "PATCH" : "POST",
      headers: { ...headers, Prefer: existing ? "return=representation" : "resolution=ignore-duplicates,return=representation" },
      body: JSON.stringify(existing ? { data, updated_at } : [{ tracking_number, data, updated_at }]),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("Could not save the part order. Please try again.");
    if (!(await response.json()).length) return json({ error: "Someone updated this tracking number. Open it again before saving." }, 409);
    return json(data);
  } catch (error) { return json({ error: (error as Error).message }, 503); }
}
