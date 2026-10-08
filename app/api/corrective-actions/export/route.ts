import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getDocumentProxy, renderPageAsImage } from "unpdf";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";
import { downloadReportPdf } from "@/lib/pmReportPdfStorage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

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

function compactAssetTag(value: string) {
  let tag = safe(value, 250).replace(/^asset(?:\s*\/\s*tag)?(?:\s*id)?\s*[:#-]?\s*/i, "");
  const codeList = tag.match(/(?:[A-Z]{1,4}\d{0,2}-\d{1,3}(?:\s*,\s*)?){2,}/i)?.[0];
  if (codeList) return codeList.replace(/\s+/g, " ").replace(/,\s*$/, "").slice(0, 80);
  if (/^missing\b/i.test(tag) && /\bon\s+/i.test(tag)) tag = tag.replace(/^missing\s+.+?\bon\s+/i, "");
  tag = tag.split(/\b(?:replaced|broke|broken|failed|damaged|needs?|missing clips?|was on|visual damage|probably due|performed)\b/i)[0].trim();
  return tag.split(/\s+/).filter(Boolean).slice(0, 7).join(" ").replace(/[.,;:-]+$/, "").slice(0, 80) || "Asset not entered";
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

async function pdfForReport(reportId: string) {
  const { url, key, table } = config();
  const trackingNumber = encodeURIComponent(`PMREPORT:${reportId}`);
  const response = await fetch(`${url}/rest/v1/${table}?select=data&tracking_number=eq.${trackingNumber}&limit=1`, { headers: headers(key), cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load job report ${reportId} (${response.status}).`);
  const [row] = await response.json();
  if (!row?.data) return null;
  if (row.data.pdfStoragePath) return downloadReportPdf(url, key, String(row.data.pdfStoragePath));
  return row.data.pdfBase64 ? Buffer.from(String(row.data.pdfBase64), "base64") : null;
}

export async function POST(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key } = config();
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });

  const body = await request.json();
  const parts = (Array.isArray(body?.parts) ? body.parts : []).slice(0, 18);
  const incoming = Array.isArray(body?.actions) ? body.actions.slice(0, 196) : [];
  const actions: ExportAction[] = incoming.map((item: Record<string, unknown>) => ({
    id: safe(item.id, 120),
    reportId: safe(item.reportId, 120),
    facilityId: safe(item.facilityId, 120),
    trackingNumber: safe(item.trackingNumber, 120),
    reportDate: safe(item.reportDate, 80),
    assetTag: compactAssetTag(String(item.assetTag || "")),
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
  sheet.unprotect();
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
  sheet.unMergeCells("J2:K2");
  sheet.mergeCells("J2:L2");
  sheet.unMergeCells("H3:K3");
  sheet.mergeCells("H3:L3");
  sheet.unMergeCells("H4:K4");
  sheet.mergeCells("H4:L4");
  sheet.getColumn("L").width = 25;
  // Keep Photo inside the FedEx corrective-actions table so Excel applies the
  // exact same header and alternating row colors as the other columns.
  const correctiveTable = sheet.getTable("Table2") as unknown as { table: {
    tableRef: string;
    autoFilterRef: string;
    columns: Array<{ name: string; totalsRowFunction?: string; filterButton?: boolean }>;
  } };
  const correctiveTableModel = correctiveTable.table;
  if (!correctiveTableModel.columns.some((column) => column.name === "Photo")) {
    correctiveTableModel.tableRef = "H5:L201";
    correctiveTableModel.autoFilterRef = "H5:L201";
    correctiveTableModel.columns.push({ name: "Photo", totalsRowFunction: "none", filterButton: true });
  }
  sheet.getCell("L5").value = "Photo";
  sheet.getCell("L5").alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  parts.forEach((part: Record<string, unknown>, index: number) => {
    const rowNumber = index + 6;
    const values = [part.partNumber, part.description, part.manufacturer, part.qtyNeeded, part.qtyOnHand, part.asset];
    ["A", "B", "C", "D", "E", "F"].forEach((column, valueIndex) => {
      sheet.getCell(`${column}${rowNumber}`).value = safe(values[valueIndex], valueIndex === 1 ? 500 : 120);
      sheet.getCell(`${column}${rowNumber}`).alignment = { vertical: "middle", wrapText: true };
    });
  });

  const photoLocations = new Map<string, string>();
  const reportLocations = new Map<string, string>();
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

  const usedReportSheetNames = new Set<string>();
  for (const [reportIndex, reportId] of reportIds.filter((id) => !(attachmentsByReport.get(id) || []).length).entries()) {
    const action = actions.find((item) => item.reportId === reportId);
    const pdf = await pdfForReport(reportId);
    if (!action || !pdf) continue;
    const rawName = `JR ${action.trackingNumber || action.facilityId || reportIndex + 1}`.replace(/[\\/*?:\[\]]/g, " ").trim();
    let reportSheetName = rawName.slice(0, 31) || `Job Report ${reportIndex + 1}`;
    let duplicate = 2;
    while (usedReportSheetNames.has(reportSheetName.toLowerCase())) {
      const suffix = ` ${duplicate++}`;
      reportSheetName = `${rawName.slice(0, 31 - suffix.length)}${suffix}`;
    }
    usedReportSheetNames.add(reportSheetName.toLowerCase());
    const reportSheet = workbook.addWorksheet(reportSheetName, { properties: { tabColor: { argb: "FF1468A5" } } });
    reportLocations.set(reportId, reportSheetName);
    reportSheet.getColumn("A").width = 120;
    reportSheet.getCell("A1").value = `${action.facilityId || "Facility"} · Tracking #${action.trackingNumber || "not entered"} · ${action.reportDate || "No date"}`;
    reportSheet.getCell("A1").font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
    reportSheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0C3B62" } };
    reportSheet.getRow(1).height = 26;
    reportSheet.views = [{ state: "frozen", ySplit: 1 }];
    let reportRow = 2;
    const document = await getDocumentProxy(new Uint8Array(pdf));
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const rendered = Buffer.from(await renderPageAsImage(document, pageNumber, { width: 850, canvasImport: () => import("@napi-rs/canvas") }));
      const width = 850;
      const height = 1100;
      const imageId = workbook.addImage({ base64: rendered.toString("base64"), extension: "png" });
      reportSheet.getCell(`A${reportRow}`).value = `Page ${pageNumber} of ${document.numPages}`;
      reportSheet.getCell(`A${reportRow}`).font = { bold: true, color: { argb: "FF1468A5" } };
      reportSheet.addImage(imageId, { tl: { col: 0, row: reportRow }, ext: { width, height } });
      const occupiedRows = Math.max(8, Math.ceil(height / 18));
      for (let row = reportRow + 1; row < reportRow + 1 + occupiedRows; row += 1) reportSheet.getRow(row).height = 13.5;
      reportRow += occupiedRows + 3;
    }
    await document.cleanup();
  }

  actions.forEach((action, index) => {
    const rowNumber = index + 6;
    const row = sheet.getRow(rowNumber);
    row.height = Math.max(58, Math.min(150, Math.ceil(action.repairNeeded.length / 48) * 15, Math.ceil(action.assetTag.length / 15) * 15));
    sheet.getCell(`H${rowNumber}`).value = action.assetTag;
    sheet.getCell(`I${rowNumber}`).value = action.repairNeeded;
    sheet.getCell(`J${rowNumber}`).value = action.urgency;
    sheet.getCell(`K${rowNumber}`).value = action.serviceChannelWo;
    // FedEx assigns this value after receiving the workbook. Keep the cell
    // explicitly unlocked without changing the form's normal row banding.
    sheet.getCell(`K${rowNumber}`).protection = { locked: false };
    const rowFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: rowNumber % 2 === 0 ? "FFFFFFFF" : "FFEAD3F8" } };
    for (const column of ["H", "I", "J", "K", "L"]) sheet.getCell(`${column}${rowNumber}`).fill = rowFill;
    for (const column of ["H", "I", "J", "K", "L"]) sheet.getCell(`${column}${rowNumber}`).alignment = { vertical: "middle", wrapText: true };
    const matched = matchPhotos(action, attachmentsByReport.get(action.reportId) || []);
    if (!matched.length) {
      const reportSheetName = reportLocations.get(action.reportId);
      sheet.getCell(`L${rowNumber}`).value = reportSheetName
        ? { text: "View Embedded Job Report", hyperlink: `#'${reportSheetName.replace(/'/g, "''")}'!A1`, tooltip: "Open the embedded source job report" }
        : "Job report unavailable";
      sheet.getCell(`L${rowNumber}`).font = { ...sheet.getCell(`L${rowNumber}`).font, color: { argb: "FF0563C1" }, underline: true, bold: true, size: 9 };
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
