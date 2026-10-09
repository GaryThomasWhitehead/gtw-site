import { NextRequest, NextResponse } from "next/server";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";
import { validatePmTechSession } from "@/lib/pmTechAuth";
import { downloadReportAttachment, reportAttachmentPath, uploadReportAttachment } from "@/lib/pmReportPdfStorage";

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
  if (!hasFedExTrackerAccess(request) && !(await validatePmTechSession(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  const id = String(request.nextUrl.searchParams.get("id") || "").trim();
  if (id) {
    const trackingNumber = encodeURIComponent(`PMATTACH:${id}`);
    const response = await fetch(`${url}/rest/v1/${table}?select=data&tracking_number=eq.${trackingNumber}&limit=1`, { headers: headers(key), cache: "no-store" });
    if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
    const [row] = await response.json();
    const attachment = row?.data;
    const bytes = attachment?.storagePath
      ? await downloadReportAttachment(url, key, String(attachment.storagePath))
      : attachment?.base64 ? Buffer.from(attachment.base64, "base64") : null;
    if (!bytes) return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": attachment.contentType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${safeFilename(String(attachment.filename || "attachment"))}"`,
      },
    });
  }

  const select = ["id:data->>id", "reportId:data->>reportId", "itemId:data->>itemId", "trackingNumber:data->>trackingNumber", "filename:data->>filename", "description:data->>description", "contentType:data->>contentType", "size:data->size", "uploadedAt:data->>uploadedAt"].join(",");
  const params = new URLSearchParams({ select, order: "updated_at.desc" });
  params.append("tracking_number", "gte.PMATTACH:");
  params.append("tracking_number", "lt.PMATTACH;");
  let lastError = "";
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(`${url}/rest/v1/${table}?${params}`, { headers: headers(key), cache: "no-store" });
    if (response.ok) return NextResponse.json(await response.json(), { headers: { "Cache-Control": "no-store" } });
    lastError = await response.text();
    if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
  }
  // Attachments are supplemental to the completed-report archive. If their
  // metadata query is temporarily slow, return an empty list so an older
  // cached browser bundle cannot replace the archive status with a raw 57014.
  console.warn("PM attachment metadata was temporarily unavailable", lastError);
  return NextResponse.json([], { headers: { "Cache-Control": "no-store", "X-Attachments-Partial": "true" } });
}

export async function POST(request: NextRequest) {
  if (!hasFedExTrackerAccess(request) && !(await validatePmTechSession(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  const form = await request.formData();
  const reportId = String(form.get("reportId") || "").trim();
  const trackingNumber = String(form.get("trackingNumber") || "").trim();
  const file = form.get("file");
  const description = String(form.get("description") || "").trim().slice(0, 500);
  const itemId = String(form.get("itemId") || "").trim().slice(0, 200);
  if (!reportId || !trackingNumber || !(file instanceof File)) return NextResponse.json({ error: "Report, tracking number, and file are required" }, { status: 400 });
  if (file.size > 4_000_000) return NextResponse.json({ error: "File is too large. Maximum size is 4 MB." }, { status: 413 });

  const reportKey = encodeURIComponent(`PMREPORT:${reportId}`);
  const reportResponse = await fetch(`${url}/rest/v1/${table}?select=data&tracking_number=eq.${reportKey}&limit=1`, { headers: headers(key), cache: "no-store" });
  if (!reportResponse.ok) return NextResponse.json({ error: await reportResponse.text() }, { status: reportResponse.status });
  const [reportRow] = await reportResponse.json();
  if (!reportRow?.data) return NextResponse.json({ error: "Completed report not found" }, { status: 404 });
  const normalize = (value: unknown) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (normalize(reportRow.data.trackingNumber) !== normalize(trackingNumber)) return NextResponse.json({ error: "Tracking number does not match that completed report" }, { status: 400 });

  const id = crypto.randomUUID();
  const filename = safeFilename(file.name);
  const contentType = file.type || "application/octet-stream";
  const bytes = Buffer.from(await file.arrayBuffer());
  const useObjectStorage = file.size > 3_750_000 || !contentType.startsWith("image/");
  const storagePath = useObjectStorage ? reportAttachmentPath(reportId, id, filename) : "";
  const storedInObjectStorage = storagePath ? await uploadReportAttachment(url, key, storagePath, contentType, bytes) : false;
  if (useObjectStorage && !storedInObjectStorage) return NextResponse.json({ error: "The attachment storage service could not save this file. Please try again." }, { status: 503 });
  const data = { id, recordType: "pm-report-attachment", reportId, itemId, trackingNumber, filename, description, contentType, size: file.size, uploadedAt: new Date().toISOString(), ...(storedInObjectStorage ? { storagePath } : { base64: bytes.toString("base64") }) };
  const response = await fetch(`${url}/rest/v1/${table}`, { method: "POST", headers: { ...headers(key), Prefer: "return=minimal" }, body: JSON.stringify([{ tracking_number: `PMATTACH:${id}`, data, updated_at: data.uploadedAt }]) });
  if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
  return NextResponse.json({ id, recordType: data.recordType, reportId, itemId, trackingNumber, filename, description, contentType, size: file.size, uploadedAt: data.uploadedAt });
}
