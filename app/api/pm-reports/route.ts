import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { expectedFedExTrackerPassword, hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";

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
    if (report.recoveryImport) {
      const select = [
        "id:data->>id",
        "category:data->>category",
        "reportDate:data->>reportDate",
        "trackingNumber:data->>trackingNumber",
        "facilityId:data->>facilityId",
        "recoveryFingerprint:data->>recoveryFingerprint",
        "tuggerWorkRecords:data->tuggerWorkRecords",
      ].join(",");
      const params = new URLSearchParams({ select, tracking_number: "like.PMREPORT:*" });
      const existingResponse = await fetch(`${url}/rest/v1/${table}?${params}`, {
        headers: apiHeaders(key),
        cache: "no-store",
      });
      if (!existingResponse.ok) {
        return NextResponse.json({ error: (await existingResponse.text()) || "Could not compare recovered reports" }, { status: existingResponse.status });
      }
      const normalized = (value: unknown) => String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
      const normalizeWork = (records: unknown) => (Array.isArray(records) ? records : []).map((record: Record<string, unknown>) => ({
        tuggerId: normalized(record?.tuggerId),
        manufacturer: normalized(record?.manufacturer),
        serialNumber: normalized(record?.serialNumber),
        description: normalized(record?.description),
      }));
      const targetWork = JSON.stringify(normalizeWork(report.tuggerWorkRecords));
      const existingRows = await existingResponse.json();
      const exactFingerprint = existingRows.find((row: Record<string, unknown>) => {
        if (report.recoveryFingerprint && row.recoveryFingerprint === report.recoveryFingerprint) return true;
        return false;
      });
      if (exactFingerprint) return NextResponse.json({ ok: true, skipped: true, existingId: exactFingerprint.id });
      const sameHeaderRows = existingRows.filter((row: Record<string, unknown>) => {
        const sameHeader = normalized(row.category) === normalized(report.category)
          && normalized(row.reportDate) === normalized(report.reportDate)
          && normalized(row.trackingNumber) === normalized(report.trackingNumber)
          && normalized(row.facilityId) === normalized(report.facilityId);
        return sameHeader;
      });
      for (const candidate of sameHeaderRows) {
        const candidateTracking = encodeURIComponent(`PMREPORT:${candidate.id}`);
        const fullResponse = await fetch(`${url}/rest/v1/${table}?select=data&tracking_number=eq.${candidateTracking}&limit=1`, {
          headers: apiHeaders(key),
          cache: "no-store",
        });
        if (fullResponse.ok) {
          const [fullRow] = await fullResponse.json();
          const existingBase64 = String(fullRow?.data?.pdfBase64 || "");
          const existingFingerprint = existingBase64
            ? createHash("sha256").update(Buffer.from(existingBase64, "base64")).digest("hex")
            : "";
          if (existingFingerprint && existingFingerprint === report.recoveryFingerprint) {
            return NextResponse.json({ ok: true, skipped: true, existingId: candidate.id });
          }
        }
        if (normalized(report.category) === "tugger"
          && JSON.stringify(normalizeWork(candidate.tuggerWorkRecords)) === targetWork) {
          return NextResponse.json({ ok: true, skipped: true, existingId: candidate.id });
        }
      }
    }
    const { recoveryImport: _recoveryImport, ...storedReport } = report;
    const data = { ...storedReport, recordType: "pm-report" };
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
  if (id) {
    const trackingNumber = encodeURIComponent(`PMREPORT:${id}`);
    const response = await fetch(`${url}/rest/v1/${table}?select=data&tracking_number=eq.${trackingNumber}&limit=1`, {
      headers: apiHeaders(key),
      cache: "no-store",
    });
    if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
    const [row] = await response.json();
    if (!row) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    const pdf = Buffer.from(row.data.pdfBase64, "base64");
    return new NextResponse(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${String(row.data.filename || "pm-report.pdf").replace(/\"/g, "")}"` } });
  }

  const mode = request.nextUrl.searchParams.get("mode");
  if (mode === "list") {
    // This query stays on the small indexed columns and never opens the large
    // JSON/PDF payloads. The browser requests metadata in bounded batches next.
    const params = new URLSearchParams({
      select: "tracking_number,updated_at",
      tracking_number: "like.PMREPORT:*",
      order: "updated_at.desc",
    });
    const response = await fetch(`${url}/rest/v1/${table}?${params}`, {
      headers: apiHeaders(key),
      cache: "no-store",
    });
    if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
    const rows = await response.json();
    return NextResponse.json(rows
      .map((row: { tracking_number?: string; updated_at?: string }) => ({
        id: String(row.tracking_number || "").replace(/^PMREPORT:/, ""),
        savedAt: row.updated_at,
      }))
      .filter((row: { id: string }) => row.id && !row.id.startsWith("connection-test-")), {
        headers: { "Cache-Control": "private, max-age=15, stale-while-revalidate=60" },
      });
  }

  // Project only report-list metadata. Pulling every base64 PDF from the JSONB
  // column makes the database scan and response large enough to time out.
  const select = [
    "updated_at",
    "id:data->>id",
    "category:data->>category",
    "reportTypeLabel:data->>reportTypeLabel",
    "technician:data->>technician",
    "reportDate:data->>reportDate",
    "facilityAddress:data->>facilityAddress",
    "trackingNumber:data->>trackingNumber",
    "facilityId:data->>facilityId",
    "customerName:data->>customerName",
    "fedexJob:data->fedexJob",
    "itemCount:data->itemCount",
    "tuggerWorkRecords:data->tuggerWorkRecords",
    "workflowStatus:data->>workflowStatus",
  ].join(",");
  const requestedIds = request.nextUrl.searchParams.get("ids");
  if (requestedIds) {
    const ids = requestedIds.split(",").map((value) => value.trim()).filter(Boolean).slice(0, 5);
    if (!ids.length) return NextResponse.json([]);
    const trackingValues = ids.map((value) => `PMREPORT:${value}`).join(",");
    const params = new URLSearchParams({
      select,
      tracking_number: `in.(${trackingValues})`,
    });
    const response = await fetch(`${url}/rest/v1/${table}?${params}`, {
      headers: apiHeaders(key),
      cache: "no-store",
    });
    if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
    const rows = await response.json();
    return NextResponse.json(rows.map((row: Record<string, unknown>) => {
      const { updated_at: savedAt, ...metadata } = row;
      return { ...metadata, savedAt };
    }), { headers: { "Cache-Control": "private, max-age=15, stale-while-revalidate=60" } });
  }
  const params = new URLSearchParams({ select, tracking_number: "like.PMREPORT:*", order: "updated_at.desc" });
  const response = await fetch(`${url}/rest/v1/${table}?${params}`, { headers: apiHeaders(key), cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
  const rows = (await response.json()).filter((row: { id?: string }) =>
    row.id && !String(row.id).startsWith("connection-test-")
  );
  return NextResponse.json(rows.map((row: Record<string, unknown>) => {
    const { updated_at: savedAt, ...metadata } = row;
    return { ...metadata, savedAt };
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
  const password = request.headers.get("x-management-password") || "";
  if (!id) return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
  if (!expectedFedExTrackerPassword() || password !== expectedFedExTrackerPassword()) {
    return NextResponse.json({ error: "Incorrect management password" }, { status: 403 });
  }
  const trackingNumber = encodeURIComponent(`PMREPORT:${id}`);
  const response = await fetchWithRetry(`${url}/rest/v1/${table}?tracking_number=eq.${trackingNumber}`, {
    method: "DELETE",
    headers: { ...apiHeaders(key), Prefer: "return=minimal" },
  });
  if (!response.ok) return NextResponse.json({ error: (await response.text()) || "Could not delete report" }, { status: response.status });
  return NextResponse.json({ ok: true, id });
}
