import { NextRequest, NextResponse } from "next/server";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";

type WorkOrder = Record<string, unknown> & { trackingNumber?: string; id?: string };

function supabaseConfig() {
  return {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    table: process.env.FEDEX_TRACKER_TABLE || "fedex_work_orders"
  };
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function missingConfig() {
  return NextResponse.json({ error: "Supabase is not configured for the FedEx tracker." }, { status: 503 });
}

function headers(key: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json"
  };
}

export async function GET(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return unauthorized();
  const { url, key, table } = supabaseConfig();
  if (!url || !key) return missingConfig();

  const response = await fetch(`${url}/rest/v1/${table}?select=tracking_number,data&order=tracking_number.asc`, {
    headers: headers(key),
    cache: "no-store"
  });

  if (!response.ok) {
    return NextResponse.json({ error: await response.text() }, { status: response.status });
  }

  const rows = await response.json();
  return NextResponse.json(rows.map((row: { data: WorkOrder }) => row.data));
}

export async function PUT(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return unauthorized();
  const { url, key, table } = supabaseConfig();
  if (!url || !key) return missingConfig();

  const body = await request.json();
  const orders = Array.isArray(body) ? body : body.orders;
  if (!Array.isArray(orders)) {
    return NextResponse.json({ error: "Expected an array of work orders." }, { status: 400 });
  }

  const rows = orders
    .map((order: WorkOrder) => ({
      tracking_number: String(order.trackingNumber || order.id || "").trim(),
      data: order,
      updated_at: new Date().toISOString()
    }))
    .filter((row: { tracking_number: string }) => row.tracking_number);

  for (let index = 0; index < rows.length; index += 75) {
    const response = await fetch(`${url}/rest/v1/${table}?on_conflict=tracking_number`, {
      method: "POST",
      headers: {
        ...headers(key),
        Prefer: "resolution=merge-duplicates,return=minimal"
      },
      body: JSON.stringify(rows.slice(index, index + 75))
    });

    if (!response.ok) {
      return NextResponse.json({ error: await response.text(), savedBeforeError: index }, { status: response.status });
    }
  }

  return NextResponse.json({ ok: true, saved: rows.length });
}
