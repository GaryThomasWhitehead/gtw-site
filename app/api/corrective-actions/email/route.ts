import { NextRequest, NextResponse } from "next/server";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export const dynamic = "force-dynamic";

const escapeHtml = (value: unknown) => String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const words = String(text || "—").split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= width) line = candidate;
    else { if (line) lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines.length ? lines : ["—"];
}

async function correctiveActionsPdf(actions: Record<string, unknown>[]) {
  const document = await PDFDocument.create();
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const pageSize: [number, number] = [792, 612];
  const margin = 28;
  const columns = [58, 76, 112, 310, 75, 75];
  const headers = ["Location", "Tracking #", "Asset / Tag", "Repair Needed", "Urgency", "SC WO #"];
  let page: PDFPage;
  let y = 0;

  function addPage() {
    page = document.addPage(pageSize);
    y = pageSize[1] - margin;
    page.drawText("CORRECTIVE ACTIONS NEEDED", { x: margin, y: y - 4, size: 19, font: bold, color: rgb(0.18, 0.08, 0.28) });
    page.drawText(`Generated ${new Date().toLocaleDateString("en-US")}`, { x: pageSize[0] - 150, y: y, size: 8, font: regular, color: rgb(0.35, 0.4, 0.45) });
    y -= 30;
    let x = margin;
    headers.forEach((header, index) => {
      page.drawRectangle({ x, y: y - 21, width: columns[index], height: 24, color: rgb(0.52, 0.15, 0.71) });
      page.drawText(header, { x: x + 4, y: y - 13, size: 8, font: bold, color: rgb(1, 1, 1) });
      x += columns[index];
    });
    y -= 24;
  }

  addPage();
  actions.forEach((action, rowIndex) => {
    const values = [action.facilityId, action.trackingNumber, action.assetTag, action.repairNeeded, action.urgency, action.serviceChannelWo].map((value) => String(value || "—"));
    const lineSets = values.map((value, index) => wrap(value, regular, 8, columns[index] - 8));
    const rowHeight = Math.max(26, Math.max(...lineSets.map((lines) => lines.length)) * 10 + 10);
    if (y - rowHeight < margin) addPage();
    let x = margin;
    const fill = rowIndex % 2 ? rgb(1, 1, 1) : rgb(0.96, 0.91, 0.98);
    lineSets.forEach((lines, index) => {
      page.drawRectangle({ x, y: y - rowHeight, width: columns[index], height: rowHeight, color: fill, borderColor: rgb(0.78, 0.62, 0.85), borderWidth: 0.5 });
      lines.forEach((line, lineIndex) => page.drawText(line, { x: x + 4, y: y - 12 - lineIndex * 10, size: 8, font: regular, color: rgb(0.08, 0.15, 0.22) }));
      x += columns[index];
    });
    y -= rowHeight;
  });
  const pages = document.getPages();
  pages.forEach((currentPage, index) => currentPage.drawText(`Frontline Pro Services  |  Page ${index + 1} of ${pages.length}`, {
    x: margin,
    y: 12,
    size: 7,
    font: regular,
    color: rgb(0.38, 0.43, 0.48),
  }));
  return Buffer.from(await document.save()).toString("base64");
}

export async function POST(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const apiKey = process.env.RESEND_API_KEY || "";
  const from = process.env.RESEND_FROM_EMAIL || "";
  if (!apiKey || !from) return NextResponse.json({ error: "Email service is not configured" }, { status: 503 });
  const body = await request.json();
  const recipients = String(body?.recipients || "").split(",").map((email) => email.trim()).filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  const actions = Array.isArray(body?.actions) ? body.actions : [];
  if (!recipients.length) return NextResponse.json({ error: "Enter at least one valid email address" }, { status: 400 });
  if (!actions.length) return NextResponse.json({ error: "There are no corrective actions to email" }, { status: 400 });
  const liveUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}/corrective-actions`;
  const pdfBase64 = await correctiveActionsPdf(actions);
  const rows = actions.map((action: Record<string, unknown>) => `<tr><td>${escapeHtml(action.facilityId)}</td><td>${escapeHtml(action.trackingNumber)}</td><td>${escapeHtml(action.assetTag)}</td><td>${escapeHtml(action.repairNeeded)}</td><td>${escapeHtml(action.urgency)}</td><td>${escapeHtml(action.serviceChannelWo)}</td></tr>`).join("");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: recipients,
      subject: `Frontline Corrective Actions Needed (${actions.length})`,
      html: `<h2>Corrective Actions Needed</h2><p>A PDF copy is attached. Use the button below to view the current editable form and open the source job-report PDFs.</p><p><a href="${escapeHtml(liveUrl)}" style="display:inline-block;background:#1670ad;color:white;padding:12px 18px;text-decoration:none;border-radius:8px;font-weight:bold">View live corrective-actions form</a></p><table style="border-collapse:collapse;width:100%"><thead><tr><th>Location</th><th>Tracking #</th><th>Asset / Tag</th><th>Repair Needed</th><th>Urgency</th><th>SC WO #</th></tr></thead><tbody>${rows}</tbody></table>`,
      attachments: [{ filename: "Frontline-Corrective-Actions.pdf", content: pdfBase64 }],
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return NextResponse.json({ error: result?.message || "Email provider rejected the message" }, { status: response.status });
  return NextResponse.json({ ok: true, id: result?.id });
}
