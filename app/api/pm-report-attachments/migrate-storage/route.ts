import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";
import { downloadReportAttachment, reportAttachmentPath, uploadReportAttachment } from "@/lib/pmReportPdfStorage";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const headers = (key: string) => ({
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
});

export async function POST(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Management sign-in required" }, { status: 401 });

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const table = process.env.FEDEX_TRACKER_TABLE || "fedex_work_orders";
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const cursor = String(body?.cursor || "");
  const params = new URLSearchParams({ select: "tracking_number", order: "tracking_number.asc", limit: "5" });
  params.append("tracking_number", "like.PMATTACH:*");
  if (cursor) params.append("tracking_number", `gt.${cursor}`);

  const sourceResponse = await fetch(`${url}/rest/v1/${table}?${params}`, {
    headers: headers(key), cache: "no-store", signal: AbortSignal.timeout(15000),
  }).catch(() => null);
  if (!sourceResponse?.ok) return NextResponse.json({ error: "Could not read the next legacy attachment" }, { status: 503 });

  const candidates = await sourceResponse.json() as Array<{ tracking_number: string }>;
  if (!candidates.length) return NextResponse.json({ done: true, migrated: 0, bytesFreed: 0 });

  let row: { tracking_number: string; data: Record<string, unknown> } | undefined;
  for (const candidate of candidates) {
    const exactParams = new URLSearchParams({ select: "tracking_number,data", tracking_number: `eq.${candidate.tracking_number}`, limit: "1" });
    const exactResponse = await fetch(`${url}/rest/v1/${table}?${exactParams}`, {
      headers: headers(key), cache: "no-store", signal: AbortSignal.timeout(20000),
    }).catch(() => null);
    if (!exactResponse?.ok) return NextResponse.json({ error: `Could not read attachment ${candidate.tracking_number.replace(/^PMATTACH:/, "")}` }, { status: 503 });
    const [exactRow] = await exactResponse.json() as Array<{ tracking_number: string; data: Record<string, unknown> }>;
    if (exactRow?.data?.base64) { row = exactRow; break; }
  }

  if (!row) return NextResponse.json({ done: false, cursor: candidates.at(-1)?.tracking_number || cursor, migrated: 0, bytesFreed: 0 });

  const id = String(row.data.id || row.tracking_number.replace(/^PMATTACH:/, ""));
  const reportId = String(row.data.reportId || "unknown-report");
  const filename = String(row.data.filename || "attachment");
  const contentType = String(row.data.contentType || "application/octet-stream");
  const base64 = String(row.data.base64 || "");
  const bytes = Buffer.from(base64, "base64");
  const path = String(row.data.storagePath || reportAttachmentPath(reportId, id, filename));
  if (!(await uploadReportAttachment(url, key, path, contentType, bytes))) return NextResponse.json({ error: `Could not store attachment ${id}` }, { status: 503 });

  const stored = await downloadReportAttachment(url, key, path);
  const originalHash = createHash("sha256").update(bytes).digest("hex");
  const storedHash = stored ? createHash("sha256").update(stored).digest("hex") : "";
  if (!stored || stored.length !== bytes.length || storedHash !== originalHash) return NextResponse.json({ error: `Stored copy verification failed for attachment ${id}` }, { status: 500 });

  const { base64: _removed, ...metadata } = row.data;
  const patchResponse = await fetch(`${url}/rest/v1/${table}?tracking_number=eq.${encodeURIComponent(row.tracking_number)}`, {
    method: "PATCH", headers: { ...headers(key), Prefer: "return=minimal" }, body: JSON.stringify({ data: { ...metadata, storagePath: path } }),
  }).catch(() => null);
  if (!patchResponse?.ok) return NextResponse.json({ error: `Could not finish migrating attachment ${id}` }, { status: 503 });

  return NextResponse.json({ done: false, cursor: row.tracking_number, migrated: 1, bytesFreed: Buffer.byteLength(base64, "utf8") });
}
