import { NextRequest, NextResponse } from "next/server";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type WorkOrder = Record<string, unknown> & { trackingNumber?: string; id?: string };

function hasImportValue(value: unknown) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function mergeDuplicateOrders(previous: WorkOrder, current: WorkOrder) {
  const merged: WorkOrder = { ...previous };

  for (const [field, value] of Object.entries(current)) {
    // ServiceChannel exports can repeat a tracking number. Let the later row
    // update populated values without erasing useful data with blank cells.
    if (hasImportValue(value)) merged[field] = value;
  }

  return merged;
}

function isEmptyUnclassifiedOrder(order: WorkOrder) {
  const classification = String(order.classOfWork || "").trim();
  const location = String(order.location || "").trim();
  const address = String(order.address || "").trim();
  const unclassified = !classification || /^unclassified$/i.test(classification);
  const missingLocation = !location || /^unassigned location$/i.test(location);
  return unclassified && missingLocation && !address;
}

function isInvalidNtsOrder(order: WorkOrder) {
  if (String(order.status || "").trim().toUpperCase() !== "NTS") return false;
  const trackingNumber = String(order.trackingNumber || "").trim();
  const location = String(order.location || "").trim();
  const classification = String(order.classOfWork || "").trim();
  const description = String(order.jobDescription || "").trim();
  const hasRealTrackingNumber = /^\d{6,12}$/.test(trackingNumber);
  const hasLocation = Boolean(location) && !/^unassigned location$/i.test(location);
  const hasJobDetails = (Boolean(classification) && !/^unclassified$/i.test(classification)) || description.length >= 10;
  return !hasRealTrackingNumber || !hasLocation || !hasJobDetails;
}

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

  const response = await fetch(`${url}/rest/v1/${table}?select=tracking_number,data&tracking_number=not.like.PMREPORT%3A*&order=tracking_number.asc`, {
    headers: headers(key),
    cache: "no-store"
  });

  if (!response.ok) {
    return NextResponse.json({ error: await response.text() }, { status: response.status });
  }

  const rows = await response.json();
  return NextResponse.json(rows.map((row: { data: WorkOrder }) => row.data).filter((data: WorkOrder) => data?.recordType !== "pm-report"), { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } });
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

  const ordersByTrackingNumber = new Map<string, WorkOrder>();
  let ordersWithTrackingNumbers = 0;

  for (const order of orders as WorkOrder[]) {
    if (isEmptyUnclassifiedOrder(order) || isInvalidNtsOrder(order)) continue;
    const trackingNumber = String(order.trackingNumber || order.id || "").trim();
    if (!trackingNumber) continue;

    ordersWithTrackingNumbers += 1;
    const previous = ordersByTrackingNumber.get(trackingNumber);
    ordersByTrackingNumber.set(
      trackingNumber,
      previous ? mergeDuplicateOrders(previous, order) : order
    );
  }

  const updatedAt = new Date().toISOString();
  const rows = Array.from(ordersByTrackingNumber, ([tracking_number, data]) => ({
    tracking_number,
    data,
    updated_at: updatedAt
  }));

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

  return NextResponse.json({
    ok: true,
    saved: rows.length,
    duplicatesCombined: ordersWithTrackingNumbers - rows.length
  });
}

export async function PATCH(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return unauthorized();
  const { url, key, table } = supabaseConfig();
  if (!url || !key) return missingConfig();

  const body = await request.json().catch(() => ({}));
  const alerts = Array.isArray(body?.noActivityAlerts) ? body.noActivityAlerts : [];
  if (!alerts.length) {
    return NextResponse.json({ error: "Expected no-activity alert records." }, { status: 400 });
  }

  const allowedFields = ["location", "classOfWork", "jobDescription", "callDate", "dueDate"];
  const updatedAt = new Date().toISOString();
  const rows: Array<{ tracking_number: string; data: WorkOrder; updated_at: string }> = [];
  let matched = 0;
  let created = 0;

  for (const alert of alerts as WorkOrder[]) {
    const trackingNumber = String(alert.trackingNumber || "").trim();
    if (!trackingNumber) continue;

    const lookup = await fetch(
      `${url}/rest/v1/${table}?select=data&tracking_number=eq.${encodeURIComponent(trackingNumber)}&limit=1`,
      { headers: headers(key), cache: "no-store" }
    );
    if (!lookup.ok) {
      return NextResponse.json({ error: await lookup.text() }, { status: lookup.status });
    }
    const existingRows = await lookup.json() as Array<{ data?: WorkOrder }>;
    const existing = existingRows[0]?.data || {};
    if (existingRows.length) matched += 1;
    else created += 1;

    const data: WorkOrder = { ...existing };
    data.id = data.id || crypto.randomUUID();
    data.trackingNumber = trackingNumber;
    for (const field of allowedFields) {
      if (!hasImportValue(data[field]) && hasImportValue(alert[field])) data[field] = alert[field];
    }
    if (!hasImportValue(data.status) || String(data.status).toUpperCase() === "NTS") data.status = "Scheduled";
    data.priority = "High";
    data.noActivityAlert = true;
    data.noActivityDays = alert.noActivityDays;
    data.urgentReason = "Listed on the ServiceChannel No Activity Alert report";
    data.nextStep = alert.nextStep || "URGENT: Follow up now.";

    const alertNote = String(alert.alertNote || "").trim();
    const currentNotes = String(data.notes || "").trim();
    if (alertNote && !currentNotes.includes(alertNote)) {
      data.notes = [currentNotes, alertNote].filter(Boolean).join("\n");
    }
    rows.push({ tracking_number: trackingNumber, data, updated_at: updatedAt });
  }

  for (let index = 0; index < rows.length; index += 75) {
    const response = await fetch(`${url}/rest/v1/${table}?on_conflict=tracking_number`, {
      method: "POST",
      headers: { ...headers(key), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(rows.slice(index, index + 75))
    });
    if (!response.ok) {
      return NextResponse.json({ error: await response.text(), savedBeforeError: index }, { status: response.status });
    }
  }

  return NextResponse.json({ ok: true, updated: rows.length, matched, created });
}

export async function DELETE(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return unauthorized();
  const { url, key, table } = supabaseConfig();
  if (!url || !key) return missingConfig();

  const body = await request.json().catch(() => ({}));
  const trackingNumbers: string[] = Array.isArray(body?.trackingNumbers)
    ? Array.from(new Set<string>(body.trackingNumbers.map((value: unknown) => String(value || "").trim()).filter(Boolean)))
    : [];

  if (!trackingNumbers.length) {
    return NextResponse.json({ error: "Expected tracking numbers to delete." }, { status: 400 });
  }

  let deleted = 0;
  for (let index = 0; index < trackingNumbers.length; index += 75) {
    const batch = trackingNumbers.slice(index, index + 75);
    const values = batch.map((value) => `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`).join(",");
    const response = await fetch(`${url}/rest/v1/${table}?tracking_number=in.(${encodeURIComponent(values)})`, {
      method: "DELETE",
      headers: {
        ...headers(key),
        Prefer: "return=minimal"
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: await response.text(), deletedBeforeError: deleted }, { status: response.status });
    }
    deleted += batch.length;
  }

  return NextResponse.json({ ok: true, deleted });
}
