import { NextRequest, NextResponse } from "next/server";
import { hasCorrectiveActionViewerAccess, hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";
import { downloadReportPdf } from "@/lib/pmReportPdfStorage";
import { extractRepresentativeReportPhoto } from "@/lib/reportPhoto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function config() {
  return { url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "", key: process.env.SUPABASE_SERVICE_ROLE_KEY || "", table: process.env.FEDEX_TRACKER_TABLE || "fedex_work_orders" };
}

export async function GET(request: NextRequest) {
  if (!hasFedExTrackerAccess(request) && !hasCorrectiveActionViewerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const reportId = String(request.nextUrl.searchParams.get("reportId") || "").trim();
  if (!reportId) return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  const response = await fetch(`${url}/rest/v1/${table}?select=data&tracking_number=eq.${encodeURIComponent(`PMREPORT:${reportId}`)}&limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: "Could not load the source report" }, { status: response.status });
  const [row] = await response.json();
  if (!row?.data || row.data.category !== "pm" || !Array.isArray(row.data.correctiveActions) || !row.data.correctiveActions.length) return NextResponse.json({ error: "Referenced PM report not found" }, { status: 404 });
  const pdf = row.data.pdfStoragePath ? await downloadReportPdf(url, key, String(row.data.pdfStoragePath)) : row.data.pdfBase64 ? Buffer.from(String(row.data.pdfBase64), "base64") : null;
  if (!pdf) return NextResponse.json({ error: "The source report has no saved PDF" }, { status: 404 });
  const image = await extractRepresentativeReportPhoto(pdf);
  if (!image) return NextResponse.json({ error: "No suitable picture was found in the source report" }, { status: 404 });
  return new NextResponse(new Uint8Array(image), { headers: { "Content-Type": "image/png", "Cache-Control": "private, max-age=3600" } });
}
