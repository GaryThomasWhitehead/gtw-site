import { NextRequest, NextResponse } from "next/server";
import { hasCorrectiveActionViewerAccess, hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";

export const dynamic = "force-dynamic";
const RECORD_KEY = "CORRECTIVEFORM:parts";
const ARCHIVE_PREFIX = "CORRECTIVEARCHIVE:";

function config() {
  return { url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "", key: process.env.SUPABASE_SERVICE_ROLE_KEY || "", table: process.env.FEDEX_TRACKER_TABLE || "fedex_work_orders" };
}

function headers(key: string) {
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

function cleanParts(value: unknown) {
  return (Array.isArray(value) ? value : []).slice(0, 18).map((part: Record<string, unknown>) => ({
    partNumber: String(part?.partNumber || "").trim().slice(0, 120),
    description: String(part?.description || "").trim().slice(0, 500),
    manufacturer: String(part?.manufacturer || "").trim().slice(0, 120),
    qtyNeeded: String(part?.qtyNeeded || "").trim().slice(0, 40),
    qtyOnHand: String(part?.qtyOnHand || "").trim().slice(0, 40),
    asset: String(part?.asset || "").trim().slice(0, 120),
  }));
}

export async function GET(request: NextRequest) {
  if (!hasFedExTrackerAccess(request) && !hasCorrectiveActionViewerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ parts: [] });
  const response = await fetch(`${url}/rest/v1/${table}?select=data&tracking_number=eq.${encodeURIComponent(RECORD_KEY)}&limit=1`, { headers: headers(key), cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: "Could not load parts" }, { status: response.status });
  const [row] = await response.json();
  return NextResponse.json({ parts: cleanParts(row?.data?.parts) });
}

export async function POST(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  const body = await request.json();
  const parts = cleanParts(body?.parts);
  if (body?.operation === "archive-and-clear") {
    const reportIds = [...new Set((Array.isArray(body?.reportIds) ? body.reportIds : []).map((value: unknown) => String(value || "").trim()).filter(Boolean))].slice(0, 250);
    const actions = (Array.isArray(body?.actions) ? body.actions : []).slice(0, 1000).map((action: Record<string, unknown>) => ({
      id: String(action?.id || "").slice(0, 100),
      reportId: String(action?.reportId || "").slice(0, 100),
      facilityId: String(action?.facilityId || "").slice(0, 250),
      trackingNumber: String(action?.trackingNumber || "").slice(0, 250),
      reportDate: String(action?.reportDate || "").slice(0, 50),
      assetTag: String(action?.assetTag || "").slice(0, 250),
      repairNeeded: String(action?.repairNeeded || "").slice(0, 5000),
      urgency: String(action?.urgency || "").slice(0, 100),
      serviceChannelWo: String(action?.serviceChannelWo || "").slice(0, 250),
    }));
    if (!reportIds.length || !actions.length) return NextResponse.json({ error: "There are no corrective actions to archive" }, { status: 400 });
    const archivedAt = new Date().toISOString();
    const archiveId = `${ARCHIVE_PREFIX}${archivedAt}:${crypto.randomUUID()}`;
    const archiveResponse = await fetch(`${url}/rest/v1/${table}`, {
      method: "POST", headers: { ...headers(key), Prefer: "return=minimal" },
      body: JSON.stringify([{ tracking_number: archiveId, data: { recordType: "corrective-form-archive", archivedAt, actions, parts }, updated_at: archivedAt }]),
    });
    if (!archiveResponse.ok) return NextResponse.json({ error: "Could not create the corrective-actions archive" }, { status: archiveResponse.status });

    for (const id of reportIds) {
      const trackingNumber = encodeURIComponent(`PMREPORT:${id}`);
      const currentResponse = await fetch(`${url}/rest/v1/${table}?select=data&tracking_number=eq.${trackingNumber}&limit=1`, { headers: headers(key), cache: "no-store" });
      if (!currentResponse.ok) return NextResponse.json({ error: `The archive was saved, but report ${id} could not be cleared` }, { status: currentResponse.status });
      const [row] = await currentResponse.json();
      if (!row?.data) continue;
      const updateResponse = await fetch(`${url}/rest/v1/${table}?tracking_number=eq.${trackingNumber}`, {
        method: "PATCH", headers: { ...headers(key), Prefer: "return=minimal" },
        body: JSON.stringify({ data: { ...row.data, correctiveActions: [], correctiveArchivedAt: archivedAt }, updated_at: archivedAt }),
      });
      if (!updateResponse.ok) return NextResponse.json({ error: `The archive was saved, but report ${id} could not be cleared` }, { status: updateResponse.status });
    }
    const clearPartsResponse = await fetch(`${url}/rest/v1/${table}?on_conflict=tracking_number`, {
      method: "POST", headers: { ...headers(key), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify([{ tracking_number: RECORD_KEY, data: { recordType: "corrective-form", parts: [] }, updated_at: archivedAt }]),
    });
    if (!clearPartsResponse.ok) return NextResponse.json({ error: "Actions were archived, but the parts section could not be cleared" }, { status: clearPartsResponse.status });
    return NextResponse.json({ ok: true, archiveId, archivedAt, actionCount: actions.length });
  }
  const response = await fetch(`${url}/rest/v1/${table}?on_conflict=tracking_number`, {
    method: "POST", headers: { ...headers(key), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify([{ tracking_number: RECORD_KEY, data: { recordType: "corrective-form", parts }, updated_at: new Date().toISOString() }]),
  });
  if (!response.ok) return NextResponse.json({ error: "Could not save parts" }, { status: response.status });
  return NextResponse.json({ ok: true, parts });
}
