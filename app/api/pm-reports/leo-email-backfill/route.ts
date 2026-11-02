import { NextRequest, NextResponse } from "next/server";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";
import { sendLeoSavedReportPdf } from "@/lib/leoReportEmail";
import { downloadReportPdf } from "@/lib/pmReportPdfStorage";

export const dynamic = "force-dynamic";

function config() {
  return {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    table: process.env.FEDEX_TRACKER_TABLE || "fedex_work_orders",
  };
}

const apiHeaders = (key: string) => ({ apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" });

export async function POST(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Management sign-in required" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const since = /^\d{4}-\d{2}-\d{2}$/.test(String(body?.since || "")) ? String(body.since) : new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const batchSize = Math.min(3, Math.max(1, Number(body?.batchSize) || 2));
  const requestedTrackingNumbers = new Set((Array.isArray(body?.trackingNumbers) ? body.trackingNumbers : [])
    .map((value: unknown) => String(value || "").trim())
    .filter((value: string) => /^\d{6,12}$/.test(value)));

  const reportParams = new URLSearchParams({ select: "tracking_number,technician:data->>technician,reportDate:data->>reportDate,jobTracking:data->>trackingNumber", order: "updated_at.asc", limit: "1000" });
  reportParams.append("tracking_number", "like.PMREPORT:*");
  reportParams.append("data->>reportDate", `gte.${since}`);
  const reportIndexResponse = await fetch(`${url}/rest/v1/${table}?${reportParams}`, { headers: apiHeaders(key), cache: "no-store" });
  if (!reportIndexResponse.ok) return NextResponse.json({ error: "Could not list Leo's saved reports" }, { status: 502 });
  const reportIndex = await reportIndexResponse.json() as Array<{ tracking_number?: string; technician?: string; reportDate?: string; jobTracking?: string }>;

  const markerParams = new URLSearchParams({ select: "tracking_number", limit: "1000" });
  markerParams.append("tracking_number", "like.PMREPORTEMAIL:LEO:*");
  const markerResponse = await fetch(`${url}/rest/v1/${table}?${markerParams}`, { headers: apiHeaders(key), cache: "no-store" });
  if (!markerResponse.ok) return NextResponse.json({ error: "Could not check prior PDF deliveries" }, { status: 502 });
  const markerRows = await markerResponse.json() as Array<{ tracking_number?: string }>;
  const delivered = new Set(markerRows.map((row) => String(row.tracking_number || "").replace(/^PMREPORTEMAIL:LEO:/, "")));
  const candidates = reportIndex
    .filter((row) => requestedTrackingNumbers.size
      ? requestedTrackingNumbers.has(String(row.jobTracking || "").trim())
      : String(row.technician || "").trim().toLowerCase().replace(/[^a-z]/g, "").startsWith("leo"))
    .map((row) => ({ ...row, id: String(row.tracking_number || "").replace(/^PMREPORT:/, "") }))
    .filter((row) => row.id && !delivered.has(row.id));

  const sent: Array<{ id: string; trackingNumber: string; reportDate: string }> = [];
  const failed: Array<{ id: string; error: string }> = [];
  for (const candidate of candidates.slice(0, batchSize)) {
    try {
      const fullParams = new URLSearchParams({ select: "data", tracking_number: `eq.PMREPORT:${candidate.id}`, limit: "1" });
      const fullResponse = await fetch(`${url}/rest/v1/${table}?${fullParams}`, { headers: apiHeaders(key), cache: "no-store" });
      if (!fullResponse.ok) throw new Error("Could not load the saved report");
      const [stored] = await fullResponse.json();
      const report = stored?.data || {};
      const pdfBytes = report.pdfStoragePath ? await downloadReportPdf(url, key, String(report.pdfStoragePath)) : report.pdfBase64 ? Buffer.from(String(report.pdfBase64), "base64") : null;
      if (!pdfBytes) throw new Error("Saved report has no PDF");
      const providerId = await sendLeoSavedReportPdf(report, pdfBytes);
      const emailedAt = new Date().toISOString();
      const saveMarker = await fetch(`${url}/rest/v1/${table}?on_conflict=tracking_number`, {
        method: "POST",
        headers: { ...apiHeaders(key), Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify([{ tracking_number: `PMREPORTEMAIL:LEO:${candidate.id}`, data: { recordType: "pm-report-email", reportId: candidate.id, technician: report.technician || "Leo", recipient: "leo@frontlineworldwide.com", providerId, emailedAt, backfilled: true }, updated_at: emailedAt }]),
      });
      if (!saveMarker.ok) throw new Error("PDF emailed, but delivery record could not be saved");
      sent.push({ id: candidate.id, trackingNumber: String(report.trackingNumber || ""), reportDate: String(report.reportDate || "") });
    } catch (error) {
      failed.push({ id: candidate.id, error: error instanceof Error ? error.message : String(error) });
    }
  }
  return NextResponse.json({ ok: failed.length === 0, since, total: candidates.length, sent, failed, remaining: Math.max(0, candidates.length - sent.length) });
}
