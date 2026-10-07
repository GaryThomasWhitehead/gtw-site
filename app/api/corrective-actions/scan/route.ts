import { NextRequest, NextResponse } from "next/server";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";

export const dynamic = "force-dynamic";

type Action = {
  id: string;
  assetTag: string;
  repairNeeded: string;
  urgency: string;
  serviceChannelWo: string;
  sourceReportId: string;
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

function urgencyFor(text: string) {
  if (/e\s*-?\s*stop|emergency|hanging on|go bad very soon|couple days|severely damaged/i.test(text)) return "Immediate";
  if (/leak|jumping|bearing|guard|cage cover|stuck|not working|broken|failed/i.test(text)) return "24–72 hours";
  if (/missing|damage|replace|tracking|loose|noise|tripped/i.test(text)) return "This week";
  return "1–2 weeks";
}

function findingsFromText(text: string, reportId: string): Action[] {
  const starts = [...text.matchAll(/Item\s+\d+\s*\|\s*Unit ID:\s*/gi)];
  const findings: Action[] = [];
  const actionable = /will need|would need|needs?\s+(?:to\s+be\s+)?|need a work order|should\s+(?:be\s+)?|going to go bad|could not|unable to|not working|broken|failed|leak(?:ing)?|damaged?|missing|bad noise|jumping|tripped|excessive movement/i;
  const resolved = /no issues? (?:were )?found|no issues? after|issues? (?:were )?taken care of|repair completed|adjusted and secured|worked fine|replaced all|currently secured/i;
  for (let index = 0; index < starts.length; index += 1) {
    const start = (starts[index].index || 0) + starts[index][0].length;
    const end = starts[index + 1]?.index ?? text.length;
    const block = text.slice(start, end).trim();
    const newline = block.indexOf("\n");
    const assetTag = cleanText(newline >= 0 ? block.slice(0, newline) : block.slice(0, 180)).slice(0, 250) || "Asset not entered";
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
      serviceChannelWo: "",
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
  if (row.data.correctiveScanAt) return NextResponse.json({ ok: true, skipped: true, report: row.data });
  if (!row.data.pdfBase64) return NextResponse.json({ error: "This report has no saved PDF" }, { status: 400 });

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(Buffer.from(row.data.pdfBase64, "base64")) }).promise;
  let text = "";
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const content = await (await pdf.getPage(pageNumber)).getTextContent();
    text += content.items.map((item) => {
      const entry = item as { str?: string; hasEOL?: boolean };
      return `${entry.str || ""}${entry.hasEOL ? "\n" : " "}`;
    }).join("") + "\n";
  }
  const existing: Action[] = Array.isArray(row.data.correctiveActions) ? row.data.correctiveActions : [];
  const found = findingsFromText(text, id).filter((candidate) => !existing.some((action) => action.id === candidate.id));
  const updated = { ...row.data, correctiveActions: [...existing, ...found], correctiveScanAt: new Date().toISOString(), correctiveScanVersion: 1 };
  const updateResponse = await fetch(`${url}/rest/v1/${table}?tracking_number=eq.${recordKey}`, {
    method: "PATCH",
    headers: { ...headers(key), Prefer: "return=minimal" },
    body: JSON.stringify({ data: updated, updated_at: new Date().toISOString() }),
  });
  if (!updateResponse.ok) return NextResponse.json({ error: await updateResponse.text() }, { status: updateResponse.status });
  return NextResponse.json({ ok: true, found: found.length, report: { ...updated, pdfBase64: undefined } });
}
