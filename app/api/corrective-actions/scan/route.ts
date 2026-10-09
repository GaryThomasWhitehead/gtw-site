import { NextRequest, NextResponse } from "next/server";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";
import { downloadReportPdf } from "@/lib/pmReportPdfStorage";

export const dynamic = "force-dynamic";
const CORRECTIVE_SCAN_VERSION = 4;

type Action = {
  id: string;
  assetTag: string;
  repairNeeded: string;
  urgency: string;
  serviceChannelWo: string;
  sourceReportId: string;
  sourceItemId?: string;
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

function cleanText(value: string) {
  return value.replace(/Frontline Reports[^\n]*/gi, " ").replace(/FRONTLINE FACILITY SERVICES/gi, " ").replace(/Preventive Maintenance Report/gi, " ").replace(/Page \d+ of[^\n]*/gi, " ").replace(/\s+/g, " ").trim();
}

function compactAssetTag(value: string) {
  let tag = cleanText(value).replace(/^asset(?:\s*\/\s*tag)?(?:\s*id)?\s*[:#-]?\s*/i, "");
  const codeList = tag.match(/(?:[A-Z]{1,4}\d{0,2}-\d{1,3}(?:\s*,\s*)?){2,}/i)?.[0];
  if (codeList) return codeList.replace(/\s+/g, " ").replace(/,\s*$/, "").slice(0, 80);
  if (/^missing\b/i.test(tag) && /\bon\s+/i.test(tag)) tag = tag.replace(/^missing\s+.+?\bon\s+/i, "");
  tag = tag.split(/\b(?:replaced|broke|broken|failed|damaged|needs?|missing clips?|was on|visual damage|probably due|performed)\b/i)[0].trim();
  const words = tag.split(/\s+/).filter(Boolean);
  return words.slice(0, 7).join(" ").replace(/[.,;:-]+$/, "").slice(0, 80) || "Asset not entered";
}

function urgencyFor(text: string) {
  if (/e\s*-?\s*stop|emergency|hanging on|go bad very soon|couple days|severely damaged/i.test(text)) return "Immediate";
  if (/leak|jumping|bearing|guard|cage cover|stuck|not working|broken|failed/i.test(text)) return "24–72 hours";
  if (/missing|damage|replace|tracking|loose|noise|tripped/i.test(text)) return "This week";
  return "1–2 weeks";
}

function findingsFromText(text: string, reportId: string, trackingNumber: string): Action[] {
  const starts = [...text.matchAll(/Item\s+\d+\s*\|\s*Unit ID:\s*/gi)];
  const findings: Action[] = [];
  const actionable = /will need|would need|needs?\s+(?:to\s+be\s+)?|need a work order|should\s+(?:be\s+)?|going to go bad|could not|unable to|not working|broken|failed|leak(?:ing)?|damaged?|missing|bad noise|jumping|tripped|excessive movement/i;
  const resolved = /no issues? (?:were )?found|no issues? after|issues? (?:were )?taken care of|repair completed|adjusted and secured|worked fine|replaced all|currently secured/i;
  for (let index = 0; index < starts.length; index += 1) {
    const start = (starts[index].index || 0) + starts[index][0].length;
    const end = starts[index + 1]?.index ?? text.length;
    const block = text.slice(start, end).trim();
    const newline = block.indexOf("\n");
    const assetTag = compactAssetTag(newline >= 0 ? block.slice(0, newline) : block.slice(0, 180));
    const description = cleanText(newline >= 0 ? block.slice(newline + 1) : block);
    if (!actionable.test(description)) continue;
    const explicitFutureNeed = /will need|would need|needs?\s+(?:to\s+be\s+)?|need a work order|should\s+(?:be\s+)?|going to go bad|could not|unable to/i.test(description);
    if (resolved.test(description) && !explicitFutureNeed) continue;
    const sentences = description.split(/(?<=[.!?])\s+/).filter((sentence) => actionable.test(sentence));
    const repairNeeded = (sentences.join(" ") || description).slice(0, 1500);
    findings.push({
      id: `${reportId}-${index + 1}`,
      assetTag,
      repairNeeded,
      urgency: urgencyFor(repairNeeded),
      serviceChannelWo: trackingNumber,
      sourceReportId: reportId,
    });
  }
  return findings;
}

export async function POST(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  const id = String((await request.json())?.id || "").trim();
  if (!id) return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
  const recordKey = encodeURIComponent(`PMREPORT:${id}`);
  const currentResponse = await fetch(`${url}/rest/v1/${table}?select=data&tracking_number=eq.${recordKey}&limit=1`, { headers: headers(key), cache: "no-store" });
  if (!currentResponse.ok) return NextResponse.json({ error: await currentResponse.text() }, { status: currentResponse.status });
  const [row] = await currentResponse.json();
  if (!row?.data) return NextResponse.json({ error: "Report not found" }, { status: 404 });
  if (row.data.category !== "pm") return NextResponse.json({ error: "Only PM reports can be scanned" }, { status: 400 });
  if (row.data.correctiveScanAt && Number(row.data.correctiveScanVersion || 0) >= CORRECTIVE_SCAN_VERSION) return NextResponse.json({ ok: true, skipped: true, report: row.data });
  const pdfBytes = row.data.pdfStoragePath
    ? await downloadReportPdf(url, key, String(row.data.pdfStoragePath))
    : row.data.pdfBase64 ? Buffer.from(row.data.pdfBase64, "base64") : null;
  if (!pdfBytes) return NextResponse.json({ error: "This report has no saved PDF" }, { status: 400 });

  const { extractTextItems } = await import("unpdf");
  const extracted = await extractTextItems(new Uint8Array(pdfBytes));
  const text = extracted.items.flatMap((page) => page).map((item) => `${item.str}${item.hasEOL ? "\n" : " "}`).join("");
  const reportTrackingNumber = String(row.data.trackingNumber || "").trim().slice(0, 250);
  const existing: Action[] = (Array.isArray(row.data.correctiveActions) ? row.data.correctiveActions : []).map((action: Action) => ({ ...action, assetTag: compactAssetTag(action.assetTag), serviceChannelWo: reportTrackingNumber }));
  const savedItems = Array.isArray(row.data.items) ? row.data.items : [];
  const flaggedItems: Action[] = savedItems.filter((item: Record<string, unknown>) => item.needsCorrection === true).map((item: Record<string, unknown>, index: number) => {
    const sourceItemId = String(item.id || `item-${index + 1}`);
    const repairNeeded = cleanText(String(item.description || "Repair or correction required")).slice(0, 1500);
    return {
      id: `${id}-flagged-${sourceItemId}`,
      assetTag: compactAssetTag(String(item.unitId || "Asset not entered")),
      repairNeeded,
      urgency: urgencyFor(repairNeeded),
      serviceChannelWo: reportTrackingNumber,
      sourceReportId: id,
      sourceItemId,
    };
  });
  const candidates = savedItems.length ? flaggedItems : findingsFromText(text, id, reportTrackingNumber);
  const found = candidates.filter((candidate) => !existing.some((action) => action.id === candidate.id));
  const updated = { ...row.data, correctiveActions: [...existing, ...found], correctiveScanAt: new Date().toISOString(), correctiveScanVersion: CORRECTIVE_SCAN_VERSION };
  const updateResponse = await fetch(`${url}/rest/v1/${table}?tracking_number=eq.${recordKey}`, {
    method: "PATCH",
    headers: { ...headers(key), Prefer: "return=minimal" },
    body: JSON.stringify({ data: updated, updated_at: new Date().toISOString() }),
  });
  if (!updateResponse.ok) return NextResponse.json({ error: await updateResponse.text() }, { status: updateResponse.status });
  return NextResponse.json({ ok: true, found: found.length, report: { ...updated, pdfBase64: undefined } });
}
