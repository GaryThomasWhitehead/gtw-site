import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";
import { hashTechPin } from "@/lib/pmTechAuth";

function config() {
  return {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    table: process.env.FEDEX_TRACKER_TABLE || "fedex_work_orders",
  };
}
const apiHeaders = (key: string) => ({ apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" });

export async function GET(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  const params = new URLSearchParams({ select: "data", tracking_number: "like.PMTECH:*", order: "updated_at.desc" });
  const response = await fetch(`${url}/rest/v1/${table}?${params}`, { headers: apiHeaders(key), cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
  const rows = await response.json() as Array<{ data?: Record<string, unknown> }>;
  return NextResponse.json(rows.map(({ data }) => ({ id: data?.id, name: data?.name, active: data?.active !== false })));
}

export async function POST(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  const body = await request.json();
  const name = String(body.name || "").trim();
  const pin = String(body.pin || "").trim();
  if (!name || !/^\d{4}$/.test(pin)) return NextResponse.json({ error: "Name and a four-digit code are required" }, { status: 400 });
  const existingParams = new URLSearchParams({ select: "data", tracking_number: "like.PMTECH:*" });
  const existingResponse = await fetch(`${url}/rest/v1/${table}?${existingParams}`, { headers: apiHeaders(key), cache: "no-store" });
  const existing = existingResponse.ok ? await existingResponse.json() as Array<{ data?: { pinHash?: string } }> : [];
  const pinHash = hashTechPin(pin);
  if (existing.some((row) => row.data?.pinHash === pinHash)) return NextResponse.json({ error: "That four-digit code is already assigned" }, { status: 409 });
  const id = randomUUID();
  const data = { id, name, pinHash, active: true, recordType: "pm-tech", createdAt: new Date().toISOString() };
  const response = await fetch(`${url}/rest/v1/${table}`, {
    method: "POST", headers: { ...apiHeaders(key), Prefer: "return=minimal" },
    body: JSON.stringify([{ tracking_number: `PMTECH:${id}`, data, updated_at: new Date().toISOString() }]),
  });
  if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
  return NextResponse.json({ id, name, active: true });
}

export async function PATCH(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  const body = await request.json();
  const id = String(body.id || "").trim();
  const currentUrl = `${url}/rest/v1/${table}?select=data&tracking_number=eq.${encodeURIComponent(`PMTECH:${id}`)}&limit=1`;
  const currentResponse = await fetch(currentUrl, { headers: apiHeaders(key), cache: "no-store" });
  const [row] = currentResponse.ok ? await currentResponse.json() : [];
  if (!row?.data) return NextResponse.json({ error: "Technician not found" }, { status: 404 });
  const pin = String(body.pin || "").trim();
  if (pin && !/^\d{4}$/.test(pin)) return NextResponse.json({ error: "Code must be four digits" }, { status: 400 });
  const data = { ...row.data, name: String(body.name || row.data.name).trim(), active: body.active !== false, ...(pin ? { pinHash: hashTechPin(pin) } : {}) };
  const response = await fetch(`${url}/rest/v1/${table}?tracking_number=eq.${encodeURIComponent(`PMTECH:${id}`)}`, {
    method: "PATCH", headers: { ...apiHeaders(key), Prefer: "return=minimal" }, body: JSON.stringify({ data, updated_at: new Date().toISOString() }),
  });
  if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
  return NextResponse.json({ id, name: data.name, active: data.active });
}

export async function DELETE(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  const id = String(request.nextUrl.searchParams.get("id") || "").trim();
  const response = await fetch(`${url}/rest/v1/${table}?tracking_number=eq.${encodeURIComponent(`PMTECH:${id}`)}`, {
    method: "DELETE", headers: { ...apiHeaders(key), Prefer: "return=minimal" },
  });
  if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
  return NextResponse.json({ ok: true });
}
