import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";
import { validatePmTechSession } from "@/lib/pmTechAuth";
import { downloadReportAttachment, downloadReportPdf, reportAttachmentPath, reportPdfPath, uploadReportAttachment, uploadReportPdf } from "@/lib/pmReportPdfStorage";

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

function wrapText(value: string, maxCharacters = 86) {
  const words = value.split(/\s+/).filter(Boolean), lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (!line) line = word;
    else if (`${line} ${word}`.length <= maxCharacters) line += ` ${word}`;
    else { lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines;
}

async function appendToReportPdf(url: string, key: string, table: string, reportId: string, reportData: any, filename: string, description: string, contentType: string, bytes: Buffer) {
  const original = reportData.pdfStoragePath
    ? await downloadReportPdf(url, key, String(reportData.pdfStoragePath))
    : reportData.pdfBase64 ? Buffer.from(String(reportData.pdfBase64), "base64") : null;
  if (!original) throw new Error("The completed report PDF could not be loaded");

  const reportPdf = await PDFDocument.load(original);
  const lowerName = filename.toLowerCase();
  if (contentType === "application/pdf" || lowerName.endsWith(".pdf")) {
    const uploadedPdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await reportPdf.copyPages(uploadedPdf, uploadedPdf.getPageIndices());
    pages.forEach((page) => reportPdf.addPage(page));
  } else if (contentType === "image/jpeg" || contentType === "image/jpg" || /\.jpe?g$/i.test(filename)) {
    const image = await reportPdf.embedJpg(bytes);
    const page = reportPdf.addPage([612, 792]);
    const scale = Math.min(548 / image.width, 700 / image.height, 1);
    const width = image.width * scale, height = image.height * scale;
    page.drawImage(image, { x: (612 - width) / 2, y: (792 - height) / 2, width, height });
  } else if (contentType === "image/png" || /\.png$/i.test(filename)) {
    const image = await reportPdf.embedPng(bytes);
    const page = reportPdf.addPage([612, 792]);
    const scale = Math.min(548 / image.width, 700 / image.height, 1);
    const width = image.width * scale, height = image.height * scale;
    page.drawImage(image, { x: (612 - width) / 2, y: (792 - height) / 2, width, height });
  } else {
    const page = reportPdf.addPage([612, 792]);
    const regular = await reportPdf.embedFont(StandardFonts.Helvetica);
    const bold = await reportPdf.embedFont(StandardFonts.HelveticaBold);
    page.drawText("JOB REPORT ATTACHMENT", { x: 48, y: 730, size: 18, font: bold, color: rgb(0.06, 0.17, 0.31) });
    page.drawText("The original file is stored with this completed report.", { x: 48, y: 698, size: 11, font: regular });
    const lines = ["File: " + filename, "Type: " + (contentType || "File"), ...(description ? ["Description: " + description] : [])].flatMap((line) => wrapText(line));
    lines.forEach((line, index) => page.drawText(line, { x: 48, y: 660 - index * 18, size: 11, font: index === 0 ? bold : regular }));
  }

  const merged = await reportPdf.save();
  const path = String(reportData.pdfStoragePath || reportPdfPath(reportId));
  if (!(await uploadReportPdf(url, key, path, merged))) throw new Error("The combined job report PDF could not be saved");
  const { pdfBase64: _pdfBase64, ...metadata } = reportData;
  const updatedData = { ...metadata, pdfStoragePath: path, pdfPageCount: reportPdf.getPageCount(), attachmentsIncludedInPdf: true, pdfUpdatedAt: new Date().toISOString() };
  const reportKey = encodeURIComponent(`PMREPORT:${reportId}`);
  const update = await fetch(`${url}/rest/v1/${table}?tracking_number=eq.${reportKey}`, {
    method: "PATCH",
    headers: { ...headers(key), Prefer: "return=minimal" },
    body: JSON.stringify({ data: updatedData, updated_at: new Date().toISOString() }),
  });
  if (!update.ok) throw new Error("The combined job report record could not be updated");
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
  if (!itemId) {
    try {
      await appendToReportPdf(url, key, table, reportId, reportRow.data, filename, description, contentType, bytes);
    } catch (error) {
      return NextResponse.json({ error: `The file could not be added to the job report PDF: ${error instanceof Error ? error.message : String(error)}` }, { status: 400 });
    }
  }
  const data = { id, recordType: "pm-report-attachment", reportId, itemId, trackingNumber, filename, description, contentType, size: file.size, uploadedAt: new Date().toISOString(), ...(storedInObjectStorage ? { storagePath } : { base64: bytes.toString("base64") }) };
  const response = await fetch(`${url}/rest/v1/${table}`, { method: "POST", headers: { ...headers(key), Prefer: "return=minimal" }, body: JSON.stringify([{ tracking_number: `PMATTACH:${id}`, data, updated_at: data.uploadedAt }]) });
  if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
  return NextResponse.json({ id, recordType: data.recordType, reportId, itemId, trackingNumber, filename, description, contentType, size: file.size, uploadedAt: data.uploadedAt });
}
