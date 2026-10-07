import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";
import { downloadReportPdf, reportPdfPath, uploadReportPdf } from "@/lib/pmReportPdfStorage";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const headers = (key: string) => ({
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
});

export async function POST(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) {
    return NextResponse.json({ error: "Management sign-in required" }, { status: 401 });
  }

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const table = process.env.FEDEX_TRACKER_TABLE || "fedex_work_orders";
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const cursor = String(body?.cursor || "");
  const params = new URLSearchParams({ select: "tracking_number,data", order: "tracking_number.asc", limit: "1" });
  params.append("tracking_number", "like.PMREPORT:*");
  if (cursor) params.append("tracking_number", `gt.${cursor}`);
  params.append("data->>pdfBase64", "not.is.null");

  const sourceResponse = await fetch(`${url}/rest/v1/${table}?${params}`, {
    headers: headers(key),
    cache: "no-store",
  }).catch(() => null);
  if (!sourceResponse?.ok) {
    return NextResponse.json({ error: "Could not read the next legacy report" }, { status: 503 });
  }

  const [row] = await sourceResponse.json() as Array<{ tracking_number: string; data: Record<string, unknown> }>;
  if (!row) return NextResponse.json({ done: true, migrated: 0, bytesFreed: 0 });

  const id = String(row.tracking_number).replace(/^PMREPORT:/, "");
  const pdfBase64 = String(row.data?.pdfBase64 || "");
  if (!pdfBase64) return NextResponse.json({ done: false, cursor: row.tracking_number, migrated: 0, bytesFreed: 0 });

  const pdf = Buffer.from(pdfBase64, "base64");
  const path = String(row.data?.pdfStoragePath || reportPdfPath(id));
  if (!(await uploadReportPdf(url, key, path, pdf))) {
    return NextResponse.json({ error: `Could not store report ${id}` }, { status: 503 });
  }

  const stored = await downloadReportPdf(url, key, path);
  const originalHash = createHash("sha256").update(pdf).digest("hex");
  const storedHash = stored ? createHash("sha256").update(stored).digest("hex") : "";
  if (!stored || stored.length !== pdf.length || storedHash !== originalHash) {
    return NextResponse.json({ error: `Stored copy verification failed for report ${id}` }, { status: 500 });
  }

  const { pdfBase64: _removed, ...metadata } = row.data;
  const patchResponse = await fetch(`${url}/rest/v1/${table}?tracking_number=eq.${encodeURIComponent(row.tracking_number)}`, {
    method: "PATCH",
    headers: { ...headers(key), Prefer: "return=minimal" },
    body: JSON.stringify({ data: { ...metadata, pdfStoragePath: path } }),
  }).catch(() => null);
  if (!patchResponse?.ok) {
    return NextResponse.json({ error: `Could not finish migrating report ${id}` }, { status: 503 });
  }

  return NextResponse.json({
    done: false,
    cursor: row.tracking_number,
    migrated: 1,
    bytesFreed: Buffer.byteLength(pdfBase64, "utf8"),
  });
}
