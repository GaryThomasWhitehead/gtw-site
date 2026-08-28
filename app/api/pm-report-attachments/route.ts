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

function headers(key: string) {
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

function safeFilename(value: string) {
  return value.replace(/[\r\n\"]/g, "").trim() || "attachment";
}

export async function GET(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  const id = String(request.nextUrl.searchParams.get("id") || "").trim();
  if (id) {
    const trackingNumber = encodeURIComponent(`PMATTACH:${id}`);
    const response = await fetch(`${url}/rest/v1/${table}?select=data&tracking_number=eq.${trackingNumber}&limit=1`, { headers: headers(key), cache: "no-store" });
    if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
    const [row] = await response.json();
    if (!row?.data?.base64) return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    return new NextResponse(Buffer.from(row.data.base64, "base64"), {
      headers: {
        "Content-Type": row.data.contentType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${safeFilename(String(row.data.filename || "attachment"))}"`,
      },
    });
  }

  const select = ["id:data->>id", "reportId:data->>reportId", "trackingNumber:data->>trackingNumber", "filename:data->>filename", "contentType:data->>contentType", "size:data->size", "uploadedAt:data->>uploadedAt"].join(",");
  const params = new URLSearchParams({ select, tracking_number: "like.PMATTACH:*", order: "updated_at.desc" });
  const response = await fetch(`${url}/rest/v1/${table}?${params}`, { headers: headers(key), cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
  return NextResponse.json(await response.json(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  const form = await request.formData();
  const reportId = String(form.get("reportId") || "").trim();
  const trackingNumber = String(form.get("trackingNumber") || "").trim();
  const file = form.get("file");
  if (!reportId || !trackingNumber || !(file instanceof File)) return NextResponse.json({ error: "Report, tracking number, and file are required" }, { status: 400 });
  if (file.size > 3_750_000) return NextResponse.json({ error: "File is too large. Maximum size is 3.5 MB." }, { status: 413 });

  const reportKey = encodeURIComponent(`PMREPORT:${reportId}`);
  const reportResponse = await fetch(`${url}/rest/v1/${table}?select=data&tracking_number=eq.${reportKey}&limit=1`, { headers: headers(key), cache: "no-store" });
  if (!reportResponse.ok) return NextResponse.json({ error: await reportResponse.text() }, { status: reportResponse.status });
  const [reportRow] = await reportResponse.json();
  if (!reportRow?.data) return NextResponse.json({ error: "Completed report not found" }, { status: 404 });
  const normalize = (value: unknown) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (normalize(reportRow.data.trackingNumber) !== normalize(trackingNumber)) return NextResponse.json({ error: "Tracking number does not match that completed report" }, { status: 400 });

  const id = crypto.randomUUID();
  const data = { id, recordType: "pm-report-attachment", reportId, trackingNumber, filename: safeFilename(file.name), contentType: file.type || "application/octet-stream", size: file.size, uploadedAt: new Date().toISOString(), base64: Buffer.from(await file.arrayBuffer()).toString("base64") };
  const response = await fetch(`${url}/rest/v1/${table}`, { method: "POST", headers: { ...headers(key), Prefer: "return=minimal" }, body: JSON.stringify([{ tracking_number: `PMATTACH:${id}`, data, updated_at: data.uploadedAt }]) });
  if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
  const { base64: _base64, ...metadata } = data;
  return NextResponse.json(metadata);
}
