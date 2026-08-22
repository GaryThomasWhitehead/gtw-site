import { NextRequest, NextResponse } from "next/server";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";

export const dynamic = "force-dynamic";

function config() {
  return {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    table: process.env.FEDEX_TRACKER_TABLE || "fedex_work_orders",
  };
}

function apiHeaders(key: string) {
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

async function fetchWithRetry(input: string, init: RequestInit, attempts = 3) {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await fetch(input, init);
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  throw lastError;
}

export async function POST(request: NextRequest) {
  try {
    const { url, key, table } = config();
    if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
    const body = await request.json();
    const report = body?.report;
    if (!report?.id || !report?.pdfBase64) return NextResponse.json({ error: "A completed PDF report is required" }, { status: 400 });
    const data = { ...report, recordType: "pm-report" };
    const response = await fetchWithRetry(`${url}/rest/v1/${table}?on_conflict=tracking_number`, {
      method: "POST",
      headers: { ...apiHeaders(key), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify([{ tracking_number: `PMREPORT:${report.id}`, data, updated_at: new Date().toISOString() }]),
    });
    if (!response.ok) return NextResponse.json({ error: (await response.text()) || `Storage returned ${response.status}` }, { status: response.status });
    return NextResponse.json({ ok: true, id: report.id });
  } catch (error) {
    const cause = error instanceof Error && error.cause && typeof error.cause === "object"
      ? String((error.cause as { code?: string; message?: string }).code || (error.cause as { message?: string }).message || "")
      : "";
    return NextResponse.json({ error: [error instanceof Error ? error.message : "Unexpected archive error", cause].filter(Boolean).join(" — ") }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  const id = request.nextUrl.searchParams.get("id");
  const response = await fetch(`${url}/rest/v1/${table}?select=tracking_number,data,updated_at&tracking_number=like.PMREPORT%3A*&order=updated_at.desc`, { headers: apiHeaders(key), cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
  const rows = (await response.json()).filter((row: { data?: { recordType?: string; id?: string } }) =>
    row.data?.recordType === "pm-report" && !String(row.data?.id || "").startsWith("connection-test-")
  );
  if (id) {
    const row = rows.find((entry: { data: { id?: string } }) => entry.data.id === id);
    if (!row) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    const pdf = Buffer.from(row.data.pdfBase64, "base64");
    return new NextResponse(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${String(row.data.filename || "pm-report.pdf").replace(/\"/g, "")}"` } });
  }
  return NextResponse.json(rows.map((row: { data: Record<string, unknown>; updated_at: string }) => {
    const { pdfBase64: _pdf, ...metadata } = row.data;
    return { ...metadata, savedAt: row.updated_at };
  }), { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  const body = await request.json();
  const id = String(body?.id || "").trim();
  const workflowStatus = String(body?.workflowStatus || "").trim();
  if (!id) return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
  if (!["complete", "parts", "return"].includes(workflowStatus)) {
    return NextResponse.json({ error: "Invalid report status" }, { status: 400 });
  }
  const trackingNumber = encodeURIComponent(`PMREPORT:${id}`);
  const currentResponse = await fetch(`${url}/rest/v1/${table}?select=data&tracking_number=eq.${trackingNumber}&limit=1`, {
    headers: apiHeaders(key),
    cache: "no-store",
  });
  if (!currentResponse.ok) return NextResponse.json({ error: await currentResponse.text() }, { status: currentResponse.status });
  const rows = await currentResponse.json();
  if (!rows.length) return NextResponse.json({ error: "Report not found" }, { status: 404 });
  const updatedData = { ...rows[0].data, workflowStatus };
  const updateResponse = await fetchWithRetry(`${url}/rest/v1/${table}?tracking_number=eq.${trackingNumber}`, {
    method: "PATCH",
    headers: { ...apiHeaders(key), Prefer: "return=minimal" },
    body: JSON.stringify({ data: updatedData, updated_at: new Date().toISOString() }),
  });
  if (!updateResponse.ok) return NextResponse.json({ error: await updateResponse.text() }, { status: updateResponse.status });
  return NextResponse.json({ ok: true, id, workflowStatus });
}

export async function DELETE(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  const id = String(request.nextUrl.searchParams.get("id") || "").trim();
  if (!id) return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
  const trackingNumber = encodeURIComponent(`PMREPORT:${id}`);
  const response = await fetchWithRetry(`${url}/rest/v1/${table}?tracking_number=eq.${trackingNumber}`, {
    method: "DELETE",
    headers: { ...apiHeaders(key), Prefer: "return=minimal" },
  });
  if (!response.ok) return NextResponse.json({ error: (await response.text()) || "Could not delete report" }, { status: response.status });
  return NextResponse.json({ ok: true, id });
}
