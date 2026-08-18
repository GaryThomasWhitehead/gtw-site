import { NextRequest, NextResponse } from "next/server";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";

type StoredRow = { tracking_number: string; data: Record<string, unknown> };

function config() {
  return {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    table: process.env.FEDEX_TRACKER_TABLE || "fedex_work_orders",
  };
}

function authHeaders(key: string) {
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

export async function GET(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  const response = await fetch(`${url}/rest/v1/${table}?select=tracking_number,data&order=tracking_number.asc`, { headers: authHeaders(key), cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
  const rows = await response.json() as StoredRow[];
  const reviews = rows.flatMap((row) => row.data?.invoiceReview ? [{ trackingNumber: row.tracking_number, review: row.data.invoiceReview }] : []);
  const serviceOrders = rows.map((row) => {
    const data = row.data || {};
    return {
      trackingNumber: String(data.trackingNumber || row.tracking_number),
      location: String(data.location || ""),
      classOfWork: String(data.classOfWork || ""),
      status: String(data.status || ""),
      statusDetail: String(data.statusDetail || ""),
      cost: String(data.cost || ""),
      jobDescription: String(data.jobDescription || ""),
    };
  });
  return NextResponse.json({ reviews, serviceOrders });
}

export async function PUT(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  const body = await request.json();
  const reviews = Array.isArray(body?.reviews) ? body.reviews : [];
  if (!reviews.length) return NextResponse.json({ error: "No reviews supplied" }, { status: 400 });

  const currentResponse = await fetch(`${url}/rest/v1/${table}?select=tracking_number,data`, { headers: authHeaders(key), cache: "no-store" });
  if (!currentResponse.ok) return NextResponse.json({ error: await currentResponse.text() }, { status: currentResponse.status });
  const current = await currentResponse.json() as StoredRow[];
  const byTracking = new Map(current.map((row) => [row.tracking_number, row.data]));
  const rows = reviews.flatMap((item: { trackingNumber?: string; review?: Record<string, unknown> }) => {
    const tracking = String(item.trackingNumber || "").trim();
    const existing = byTracking.get(tracking);
    if (!tracking) return [];
    const review = item.review || {};
    const base = existing || {
      trackingNumber: tracking,
      location: review.store || "",
      classOfWork: review.trade || "",
      status: review.status || "Completed",
      statusDetail: review.statusDetail || "",
      cost: review.nte || "",
      jobDescription: review.problemDescription || "",
    };
    return [{ tracking_number: tracking, data: { ...base, invoiceReview: review }, updated_at: new Date().toISOString() }];
  });
  const saveResponse = await fetch(`${url}/rest/v1/${table}?on_conflict=tracking_number`, {
    method: "POST",
    headers: { ...authHeaders(key), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows),
  });
  if (!saveResponse.ok) return NextResponse.json({ error: await saveResponse.text() }, { status: saveResponse.status });
  return NextResponse.json({ ok: true, saved: rows.length });
}
