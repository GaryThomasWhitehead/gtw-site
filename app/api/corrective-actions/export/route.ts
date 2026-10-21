import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";
import { downloadReportAttachment } from "@/lib/pmReportPdfStorage";

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
  candidateReportIds: string[];
  attachmentIds: string[];
};

type ExportReportSection = {
  id: string;
  facilityId: string;
  trackingNumber: string;
  reportDate: string;
  reportPart: number;
};

type Attachment = {
  id: string;
  reportId: string;
  filename: string;
  description: string;
  contentType: string;
  base64?: string;
  storagePath?: string;
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

function wrappedLineCount(value: string, charactersPerLine: number) {
  return Math.max(1, value.split(/\r?\n/).reduce((total, paragraph) => total + Math.max(1, Math.ceil(paragraph.length / charactersPerLine)), 0));
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

function attachmentContentKey(attachment: Attachment) {
  return attachment.base64
    ? createHash("sha256").update(attachment.base64).digest("hex")
    : attachment.id;
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
  const images = rows.map((row) => row.data).filter((item): item is Attachment => Boolean(item && imageExtension(item.contentType, item.filename)));
  const loaded = await Promise.all(images.map(async (item) => {
    if (item.base64) return item as Attachment & { base64: string };
    if (!item.storagePath) return null;
    const bytes = await downloadReportAttachment(url, key, item.storagePath);
    return bytes ? { ...item, base64: bytes.toString("base64") } : null;
  }));
  return loaded.filter((item): item is Attachment & { base64: string } => Boolean(item?.base64));
}

async function attachmentsForIds(ids: string[]) {
  const { url, key, table } = config();
  const loaded = await Promise.all(ids.map(async (id) => {
    const trackingNumber = encodeURIComponent(`PMATTACH:${id}`);
    const response = await fetch(`${url}/rest/v1/${table}?select=data&tracking_number=eq.${trackingNumber}&limit=1`, { headers: headers(key), cache: "no-store" });
    if (!response.ok) return null;
    const [row] = await response.json();
    const item = row?.data as Attachment | undefined;
    if (!item || !imageExtension(item.contentType, item.filename)) return null;
    if (item.base64) return item as Attachment & { base64: string };
    if (!item.storagePath) return null;
    const bytes = await downloadReportAttachment(url, key, item.storagePath);
    return bytes ? { ...item, base64: bytes.toString("base64") } : null;
  }));
  return loaded.filter((item): item is Attachment & { base64: string } => Boolean(item?.base64));
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
    assetTag: compactAssetTag(String(item.assetTag || "")),
    repairNeeded: safe(item.repairNeeded, 1500),
    urgency: safe(item.urgency, 80),
    serviceChannelWo: safe(item.trackingNumber || item.serviceChannelWo, 120),
    candidateReportIds: Array.isArray(item.candidateReportIds)
      ? [...new Set(item.candidateReportIds.map((id) => safe(id, 120)).filter(Boolean))].slice(0, 40)
      : [],
    attachmentIds: Array.isArray(item.attachmentIds)
      ? [...new Set(item.attachmentIds.map((id) => safe(id, 120)).filter(Boolean))].slice(0, 4)
      : [],
  })).filter((item: ExportAction) => item.reportId && (item.assetTag || item.repairNeeded));
  if (!actions.length) return NextResponse.json({ error: "There are no corrective-action lines to export." }, { status: 400 });
  const parts = (Array.isArray(body?.parts) ? body.parts : []).slice(0, actions.length);

  const reportSections: ExportReportSection[] = (Array.isArray(body?.reportSections) ? body.reportSections : []).map((item: Record<string, unknown>) => ({
    id: safe(item.id, 120),
    facilityId: safe(item.facilityId, 120),
    trackingNumber: safe(item.trackingNumber, 120),
    reportDate: safe(item.reportDate, 80),
    reportPart: Math.max(0, Number(item.reportPart || 0)),
  })).filter((item: ExportReportSection) => item.id);
  const reportIds = [...new Set([
    ...reportSections.map((report) => report.id),
    ...actions.flatMap((action) => [action.reportId, ...action.candidateReportIds]),
  ])];
  const attachmentsByReport = new Map<string, Attachment[]>();
  for (let offset = 0; offset < reportIds.length; offset += 4) {
    const batch = reportIds.slice(offset, offset + 4);
    const results = await Promise.all(batch.map(async (reportId) => [reportId, await attachmentsForReport(reportId)] as const));
    for (const [reportId, attachments] of results) attachmentsByReport.set(reportId, attachments);
  }
  const requestedAttachmentIds = [...new Set(actions.flatMap((action) => action.attachmentIds))];
  const explicitAttachments = await attachmentsForIds(requestedAttachmentIds);
  const explicitAttachmentsById = new Map(explicitAttachments.map((attachment) => [attachment.id, attachment]));

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
  // Excel's automatic table striping overrides the FedEx form colors after a
  // download. Use fixed cell fills so the form looks the same in every viewer.
  sheet.removeTable("Table1");
  sheet.removeTable("Table2");
  sheet.getCell("L5").value = "Photo";
  sheet.getCell("L5").alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  const setCellFill = (address: string, fill: ExcelJS.Fill) => {
    const cell = sheet.getCell(address);
    // Cells inherited from the FedEx template can share one style object.
    // Clone it before setting the fill so a later row cannot recolor this one.
    cell.style = { ...cell.style, fill };
  };
  const partsHeaderFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFEBC9E2" } };
  const correctiveHeaderFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFE2C6F4" } };
  for (const column of ["A", "B", "C", "D", "E", "F"]) setCellFill(`${column}5`, partsHeaderFill);
  for (const column of ["H", "I", "J", "K", "L"]) setCellFill(`${column}5`, correctiveHeaderFill);
  for (let rowNumber = 6; rowNumber <= 201; rowNumber += 1) {
    const partsFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: rowNumber % 2 === 0 ? "FFFFFFFF" : "FFF1CFE8" } };
    const correctiveFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: rowNumber % 2 === 0 ? "FFFFFFFF" : "FFEAD3F8" } };
    for (const column of ["A", "B", "C", "D", "E", "F"]) setCellFill(`${column}${rowNumber}`, partsFill);
    for (const column of ["H", "I", "J", "K", "L"]) setCellFill(`${column}${rowNumber}`, correctiveFill);
  }
  const lastFormRow = 5 + Math.max(1, actions.length);
  for (let rowNumber = lastFormRow + 1; rowNumber <= 201; rowNumber += 1) sheet.getRow(rowNumber).hidden = true;
  parts.forEach((part: Record<string, unknown>, index: number) => {
    const rowNumber = index + 6;
    const values = [part.partNumber, part.description, part.manufacturer, part.qtyNeeded, part.qtyOnHand, part.asset];
    ["A", "B", "C", "D", "E", "F"].forEach((column, valueIndex) => {
      sheet.getCell(`${column}${rowNumber}`).value = safe(values[valueIndex], valueIndex === 1 ? 500 : 120);
      sheet.getCell(`${column}${rowNumber}`).alignment = { vertical: "middle", wrapText: true };
    });
  });

  const photoLocations = new Map<string, string>();
  const reportLabels = new Map<string, string>();
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

  const reportsSheet = workbook.addWorksheet("Job Reports", { properties: { tabColor: { argb: "FF1468A5" } } });
  reportsSheet.getColumn("A").width = 24;
  reportsSheet.getColumn("B").width = 26;
  reportsSheet.getColumn("C").width = 22;
  reportsSheet.getColumn("D").width = 24;
  ["Facility", "Tracking / Section", "Report Date", "Report Reference"].forEach((label, index) => {
    const cell = reportsSheet.getCell(1, index + 1);
    cell.value = label;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0C3B62" } };
  });
  reportsSheet.getCell("A2").note = "References are shown as plain text so recipients do not receive Excel external-link security warnings.";
  const listedReports = reportSections.length ? [...reportSections].sort((a, b) => a.reportPart - b.reportPart) : reportIds.map((reportId) => {
    const action = actions.find((item) => item.reportId === reportId || item.candidateReportIds.includes(reportId));
    return { id: reportId, facilityId: action?.facilityId || "", trackingNumber: action?.trackingNumber || "", reportDate: action?.reportDate || "", reportPart: 0 };
  });
  listedReports.forEach((report, reportIndex) => {
    const row = reportIndex + 2;
    const reportLabel = report.trackingNumber || `Job report section ${report.reportPart || reportIndex + 1}`;
    reportsSheet.getCell(`A${row}`).value = report.facilityId || "Facility";
    reportsSheet.getCell(`B${row}`).value = reportLabel;
    reportsSheet.getCell(`C${row}`).value = report.reportDate || "";
    reportsSheet.getCell(`D${row}`).value = `Job report: ${reportLabel}`;
    reportsSheet.getCell(`D${row}`).font = { bold: true };
    reportLabels.set(report.id, reportLabel);
  });
  reportsSheet.views = [{ state: "frozen", ySplit: 1 }];

  actions.forEach((action, index) => {
    const rowNumber = index + 6;
    const row = sheet.getRow(rowNumber);
    const repairHeight = wrappedLineCount(action.repairNeeded, 40) * 17 + 12;
    const assetHeight = wrappedLineCount(action.assetTag, 13) * 17 + 12;
    row.height = Math.max(58, Math.min(390, Math.max(repairHeight, assetHeight)));
    sheet.getCell(`H${rowNumber}`).value = action.assetTag;
    sheet.getCell(`I${rowNumber}`).value = action.repairNeeded;
    sheet.getCell(`J${rowNumber}`).value = action.urgency;
    sheet.getCell(`K${rowNumber}`).value = action.serviceChannelWo;
    // FedEx assigns this value after receiving the workbook. Keep the cell
    // explicitly unlocked without changing the form's normal row banding.
    sheet.getCell(`K${rowNumber}`).protection = { locked: false };
    const rowFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: rowNumber % 2 === 0 ? "FFFFFFFF" : "FFEAD3F8" } };
    for (const column of ["H", "I", "J", "K", "L"]) setCellFill(`${column}${rowNumber}`, rowFill);
    for (const column of ["H", "I", "J", "K", "L"]) sheet.getCell(`${column}${rowNumber}`).alignment = { vertical: "middle", wrapText: true };
    const candidateIds = [...new Set([action.reportId, ...action.candidateReportIds])];
    const candidateAttachments = [...new Map([
      ...action.attachmentIds.map((id) => explicitAttachmentsById.get(id)).filter((item): item is Attachment & { base64: string } => Boolean(item)),
      ...candidateIds.flatMap((reportId) => attachmentsByReport.get(reportId) || []),
    ].map((attachment) => [attachmentContentKey(attachment), attachment] as const)).values()];
    const matched = matchPhotos(action, candidateAttachments);
    if (!matched.length) {
      const reportLabel = reportLabels.get(action.reportId) || candidateIds.map((id) => reportLabels.get(id)).find(Boolean);
      sheet.getCell(`L${rowNumber}`).value = reportLabel ? `See Job Reports sheet\n${reportLabel}` : "Job report unavailable";
      sheet.getCell(`L${rowNumber}`).font = { ...sheet.getCell(`L${rowNumber}`).font, bold: true, size: 9 };
      return;
    }
    ensureFullPhoto(matched[0], action);
    sheet.getCell(`L${rowNumber}`).value = `See Photos sheet\n${matched.length} embedded photo${matched.length === 1 ? "" : "s"}`;
    sheet.getCell(`L${rowNumber}`).font = { bold: true, size: 9 };
    matched.slice(0, 2).forEach((attachment, photoIndex) => {
      const extension = imageExtension(attachment.contentType, attachment.filename);
      const fullAddress = ensureFullPhoto(attachment, action);
      if (!extension || !fullAddress) return;
      const imageId = workbook.addImage({ base64: attachment.base64, extension });
      sheet.addImage(imageId, {
        tl: { col: 11 + photoIndex * 0.5, row: rowNumber - 1 + 0.08 },
        ext: { width: 75, height: 52 },
      });
    });
  });

  sheet.views = [{ state: "frozen", ySplit: 5 }];
  sheet.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9, printArea: `A1:L${lastFormRow}` };
  photosSheet.views = [{ state: "frozen", ySplit: 1 }];

  // Add a true blank margin column to the left of the complete form. ExcelJS
  // does not move merged ranges or drawing anchors when columns are spliced,
  // so preserve and shift both explicitly.
  const mergedRanges = [...(sheet.model.merges || [])];
  for (const range of mergedRanges) sheet.unMergeCells(range);
  sheet.spliceColumns(1, 0, []);
  sheet.getColumn("A").width = 3.5;
  const shiftAddressRight = (address: string) => address.replace(/^([A-Z]+)(\d+)$/, (_, letters: string, row: string) => {
    let column = 0;
    for (const letter of letters) column = column * 26 + letter.charCodeAt(0) - 64;
    column += 1;
    let shifted = "";
    while (column > 0) {
      const remainder = (column - 1) % 26;
      shifted = String.fromCharCode(65 + remainder) + shifted;
      column = Math.floor((column - 1) / 26);
    }
    return `${shifted}${row}`;
  });
  for (const range of mergedRanges) {
    const [start, end = start] = range.split(":");
    sheet.mergeCells(`${shiftAddressRight(start)}:${shiftAddressRight(end)}`);
  }
  for (const image of sheet.getImages()) image.range.tl.nativeCol += 1;

  const frameBorder: Partial<ExcelJS.Border> = { style: "medium", color: { argb: "FF000000" } };
  const frameSection = (leftColumn: number, rightColumn: number, topRow: number, bottomRow: number) => {
    for (let rowNumber = topRow; rowNumber <= bottomRow; rowNumber += 1) {
      const leftCell = sheet.getCell(rowNumber, leftColumn);
      leftCell.border = { ...leftCell.border, left: frameBorder };
      const rightCell = sheet.getCell(rowNumber, rightColumn);
      rightCell.border = { ...rightCell.border, right: frameBorder };
    }
    for (let column = leftColumn; column <= rightColumn; column += 1) {
      const topCell = sheet.getCell(topRow, column);
      topCell.border = { ...topCell.border, top: frameBorder };
      const bottomCell = sheet.getCell(bottomRow, column);
      bottomCell.border = { ...bottomCell.border, bottom: frameBorder };
    }
  };
  frameSection(2, 7, 2, lastFormRow);
  frameSection(9, 13, 2, lastFormRow);
  sheet.pageSetup.printArea = `A1:M${lastFormRow}`;

  const rawOutput = Buffer.from(await workbook.xlsx.writeBuffer());
  const archive = await JSZip.loadAsync(rawOutput);
  for (const [filename, entry] of Object.entries(archive.files)) {
    if (entry.dir) continue;
    if (/^xl\/tables\/table\d+\.xml$/.test(filename)) {
      const xml = await entry.async("string");
      archive.file(filename, xml.replace(/<autoFilter\b[^>]*>[\s\S]*?<\/autoFilter>/g, ""));
    }
    if (/^xl\/drawings\/drawing\d+\.xml$/.test(filename)) {
      const xml = await entry.async("string");
      // ExcelJS copies the template picture's creationId to every generated
      // image. Duplicate drawing IDs make desktop Excel repair the workbook.
      archive.file(filename, xml.replace(/<a:extLst>[\s\S]*?<a16:creationId\b[^>]*\/>[\s\S]*?<\/a:extLst>/g, ""));
    }
  }
  const output = await archive.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  const locationLabel = safe(body?.locationName || actions[0]?.facilityId || "Location", 80);
  const locationSlug = locationLabel.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "Location";
  const filename = `FXG-${locationSlug}-Correctives-and-Parts-${new Date().toISOString().slice(0, 10)}.xlsx`;
  return new NextResponse(Buffer.from(output), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
