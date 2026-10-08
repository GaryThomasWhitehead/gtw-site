import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ExportAction = {
  id: string;
  reportId: string;
  facilityId: string;
  trackingNumber: string;
  reportDate: string;
  assetTag: string;
  repairNeeded: string;
  urgency: string;
  serviceChannelWo: string;
};

type Attachment = {
  id: string;
  reportId: string;
  filename: string;
  description: string;
  contentType: string;
  base64: string;
};

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

function safe(value: unknown, max = 1500) {
  return String(value || "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ").trim().slice(0, max);
}

function words(value: string) {
  const ignored = new Set(["about", "after", "also", "been", "from", "have", "into", "item", "needs", "photo", "report", "that", "the", "this", "with", "work"]);
  return new Set(value.toLowerCase().match(/[a-z0-9-]{3,}/g)?.filter((word) => !ignored.has(word)) || []);
}

function matchPhotos(action: ExportAction, attachments: Attachment[]) {
  const targetWords = words(`${action.assetTag} ${action.repairNeeded}`);
  const scored = attachments.map((attachment) => {
    const descriptionWords = words(`${attachment.description} ${attachment.filename}`);
    let score = 0;
    for (const word of descriptionWords) if (targetWords.has(word)) score += word.length > 6 ? 2 : 1;
    if (action.assetTag && attachment.description.toLowerCase().includes(action.assetTag.toLowerCase())) score += 6;
    return { attachment, score };
  }).sort((a, b) => b.score - a.score);
  const matched = scored.filter((item) => item.score > 0).map((item) => item.attachment);
  return (matched.length ? matched : attachments).slice(0, 4);
}

function imageExtension(contentType: string, filename: string): "png" | "jpeg" | "gif" | null {
  const value = `${contentType} ${filename}`.toLowerCase();
  if (value.includes("png")) return "png";
  if (value.includes("jpeg") || value.includes("jpg")) return "jpeg";
  if (value.includes("gif")) return "gif";
  return null;
}

async function attachmentsForReport(reportId: string) {
  const { url, key, table } = config();
  const params = new URLSearchParams({ select: "data" });
  params.append("tracking_number", "gte.PMATTACH:");
  params.append("tracking_number", "lt.PMATTACH;");
  params.append("data->>reportId", `eq.${reportId}`);
  const response = await fetch(`${url}/rest/v1/${table}?${params}`, { headers: headers(key), cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load report pictures (${response.status}).`);
  const rows: { data?: Attachment }[] = await response.json();
  return rows.map((row) => row.data).filter((item): item is Attachment => Boolean(item?.base64 && imageExtension(item.contentType, item.filename)));
}

export async function POST(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key } = config();
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });

  const body = await request.json();
  const incoming = Array.isArray(body?.actions) ? body.actions.slice(0, 196) : [];
  const actions: ExportAction[] = incoming.map((item: Record<string, unknown>) => ({
    id: safe(item.id, 120),
    reportId: safe(item.reportId, 120),
    facilityId: safe(item.facilityId, 120),
    trackingNumber: safe(item.trackingNumber, 120),
    reportDate: safe(item.reportDate, 80),
    assetTag: safe(item.assetTag, 250),
    repairNeeded: safe(item.repairNeeded, 1500),
    urgency: safe(item.urgency, 80),
    serviceChannelWo: safe(item.serviceChannelWo, 120),
  })).filter((item: ExportAction) => item.reportId && (item.assetTag || item.repairNeeded));
  if (!actions.length) return NextResponse.json({ error: "There are no corrective-action lines to export." }, { status: 400 });

  const reportIds = [...new Set(actions.map((action) => action.reportId))];
  const attachmentsByReport = new Map<string, Attachment[]>();
  for (let offset = 0; offset < reportIds.length; offset += 4) {
    const batch = reportIds.slice(offset, offset + 4);
    const results = await Promise.all(batch.map(async (reportId) => [reportId, await attachmentsForReport(reportId)] as const));
    for (const [reportId, attachments] of results) attachmentsByReport.set(reportId, attachments);
  }

  const templatePath = path.join(process.cwd(), "public", "templates", "FXG Correctives and Parts Runtime.xlsx");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await readFile(templatePath) as never);
  for (const worksheet of [...workbook.worksheets]) {
    if (worksheet.name !== "Correctives & Parts") workbook.removeWorksheet(worksheet.id);
  }
  const sheet = workbook.getWorksheet("Correctives & Parts");
  if (!sheet) return NextResponse.json({ error: "FedEx worksheet template is missing." }, { status: 500 });
  const photosSheet = workbook.addWorksheet("Photos", { properties: { tabColor: { argb: "FF7B219F" } } });
  photosSheet.getColumn("A").width = 105;
  photosSheet.getColumn("B").width = 24;
  photosSheet.getCell("A1").value = "FULL-SIZE CORRECTIVE-ACTION PHOTOS";
  photosSheet.getCell("A1").font = { bold: true, size: 18, color: { argb: "FFFFFFFF" } };
  photosSheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4B148C" } };
  photosSheet.getRow(1).height = 26;

  const dates = actions.map((action) => action.reportDate).filter(Boolean).sort();
  sheet.getCell("B2").value = dates[0] || "";
  sheet.getCell("D2").value = dates.at(-1) || "";
  const workOrders = [...new Set(actions.map((action) => action.serviceChannelWo).filter(Boolean))];
  sheet.getCell("J2").value = workOrders.join(", ");
  sheet.getColumn("L").width = 25;
  sheet.getCell("L5").style = { ...sheet.getCell("K5").style };
  sheet.getCell("L5").value = "Photo";

  const photoLocations = new Map<string, string>();
  let photoRow = 3;
  const ensureFullPhoto = (attachment: Attachment, action: ExportAction) => {
    const existing = photoLocations.get(attachment.id);
    if (existing) return existing;
    const extension = imageExtension(attachment.contentType, attachment.filename);
    if (!extension) return "";
    const address = `A${photoRow}`;
    photosSheet.getCell(address).value = `${action.facilityId || "Facility"} · Tracking #${action.trackingNumber || "not entered"} · ${action.assetTag || "Asset not entered"}`;
    photosSheet.getCell(address).font = { bold: true, size: 13, color: { argb: "FF4B148C" } };
    photosSheet.getCell(`A${photoRow + 1}`).value = attachment.description || attachment.filename || "Report photo";
    photosSheet.getCell(`A${photoRow + 1}`).alignment = { wrapText: true };
    const imageId = workbook.addImage({ base64: attachment.base64, extension });
    photosSheet.addImage(imageId, { tl: { col: 0, row: photoRow + 1 }, ext: { width: 760, height: 520 } });
    for (let row = photoRow + 2; row <= photoRow + 30; row += 1) photosSheet.getRow(row).height = 14;
    photoLocations.set(attachment.id, address);
    photoRow += 32;
    return address;
  };

  actions.forEach((action, index) => {
    const rowNumber = index + 6;
    const row = sheet.getRow(rowNumber);
    row.height = 58;
    sheet.getCell(`L${rowNumber}`).style = { ...sheet.getCell(`K${rowNumber}`).style };
    sheet.getCell(`H${rowNumber}`).value = action.assetTag;
    sheet.getCell(`I${rowNumber}`).value = action.repairNeeded;
    sheet.getCell(`J${rowNumber}`).value = action.urgency;
    sheet.getCell(`K${rowNumber}`).value = action.serviceChannelWo;
    for (const column of ["H", "I", "J", "K", "L"]) sheet.getCell(`${column}${rowNumber}`).alignment = { vertical: "middle", wrapText: true };
    const matched = matchPhotos(action, attachmentsByReport.get(action.reportId) || []);
    if (!matched.length) {
      sheet.getCell(`L${rowNumber}`).value = "No uploaded picture matched";
      return;
    }
    sheet.getCell(`L${rowNumber}`).value = { text: `Open ${matched.length} full-size photo${matched.length === 1 ? "" : "s"}`, hyperlink: `#'Photos'!${ensureFullPhoto(matched[0], action)}` };
    sheet.getCell(`L${rowNumber}`).font = { color: { argb: "FF0563C1" }, underline: true, size: 9 };
    matched.slice(0, 2).forEach((attachment, photoIndex) => {
      const extension = imageExtension(attachment.contentType, attachment.filename);
      const fullAddress = ensureFullPhoto(attachment, action);
      if (!extension || !fullAddress) return;
      const imageId = workbook.addImage({ base64: attachment.base64, extension });
      sheet.addImage(imageId, {
        tl: { col: 11 + photoIndex * 0.5, row: rowNumber - 1 + 0.08 },
        ext: { width: 75, height: 52 },
        hyperlinks: { hyperlink: `#'Photos'!${fullAddress}`, tooltip: "Open full-size photo" },
      });
    });
  });

  sheet.views = [{ state: "frozen", ySplit: 5 }];
  sheet.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 };
  photosSheet.views = [{ state: "frozen", ySplit: 1 }];
  const output = await workbook.xlsx.writeBuffer();
  const filename = `FXG-Correctives-and-Parts-${new Date().toISOString().slice(0, 10)}.xlsx`;
  return new NextResponse(Buffer.from(output), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
