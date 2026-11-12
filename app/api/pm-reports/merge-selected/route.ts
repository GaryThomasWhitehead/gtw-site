import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";
import { downloadReportPdf, reportPdfPath, uploadReportPdf } from "@/lib/pmReportPdfStorage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

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

export async function POST(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });

  const body = await request.json();
  const ids = [...new Set((Array.isArray(body?.ids) ? body.ids : []).map((id: unknown) => String(id || "").trim()).filter(Boolean))] as string[];
  if (ids.length < 2 || ids.length > 20) return NextResponse.json({ error: "Two to twenty report sections are required" }, { status: 400 });

  const trackingValues = ids.map((id) => `PMREPORT:${id}`).join(",");
  const response = await fetch(`${url}/rest/v1/${table}?select=tracking_number,data&tracking_number=in.(${trackingValues})`, { headers: headers(key), cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
  const rows = await response.json() as Array<{ tracking_number: string; data: any }>;
  const ordered = rows.filter((row) => row.data?.id).sort((a, b) => Number(a.data.reportPart || 0) - Number(b.data.reportPart || 0));
  if (ordered.length !== ids.length) return NextResponse.json({ error: "One or more report sections could not be loaded" }, { status: 409 });

  const baseTracking = String(ordered[0].data.baseTrackingNumber || ordered[0].data.trackingNumber || "").replace(/\s+-\s+[A-Z]+$/i, "").trim();
  if (!baseTracking || ordered.some((row) => String(row.data.baseTrackingNumber || row.data.trackingNumber || "").replace(/\s+-\s+[A-Z]+$/i, "").trim() !== baseTracking)) {
    return NextResponse.json({ error: "All selected sections must belong to the same job report" }, { status: 409 });
  }

  const keep = ordered[0];
  const keepId = String(keep.data.id);
  const mergedPdf = await PDFDocument.create();
  for (const row of ordered) {
    const bytes = row.data.pdfStoragePath
      ? await downloadReportPdf(url, key, String(row.data.pdfStoragePath))
      : row.data.pdfBase64 ? Buffer.from(String(row.data.pdfBase64), "base64") : null;
    if (!bytes) return NextResponse.json({ error: `Report section ${row.data.trackingNumber || row.data.id} has no readable PDF` }, { status: 409 });
    const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await mergedPdf.copyPages(source, source.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  const path = String(keep.data.pdfStoragePath || reportPdfPath(keepId));
  if (!(await uploadReportPdf(url, key, path, await mergedPdf.save()))) {
    return NextResponse.json({ error: "Could not save the combined report PDF" }, { status: 503 });
  }

  const items = ordered.flatMap((row) => Array.isArray(row.data.items) ? row.data.items : []);
  const actionMap = new Map<string, any>();
  for (const row of ordered) for (const action of (Array.isArray(row.data.correctiveActions) ? row.data.correctiveActions : [])) {
    const actionKey = `${String(action.assetTag || "").trim().toLowerCase()}|${String(action.repairNeeded || "").trim().toLowerCase()}`;
    if (!actionMap.has(actionKey)) actionMap.set(actionKey, { ...action, sourceReportId: keepId });
  }

  const allSiblingParams = new URLSearchParams({ select: "tracking_number,data" });
  allSiblingParams.append("tracking_number", "like.PMREPORT:*");
  allSiblingParams.append("data->>baseTrackingNumber", `eq.${baseTracking}`);
  const siblingResponse = await fetch(`${url}/rest/v1/${table}?${allSiblingParams}`, { headers: headers(key), cache: "no-store" });
  const siblings = siblingResponse.ok ? await siblingResponse.json() as Array<{ tracking_number: string; data: any }> : [];
  const selectedKeys = new Set(ordered.map((row) => row.tracking_number));
  const remainingSiblings = siblings.filter((row) => !selectedKeys.has(row.tracking_number));
  const finalPartCount = remainingSiblings.length + 1;
  const totalItemCount = Math.max(...ordered.map((row) => Number(row.data.totalItemCount || 0)), items.length);

  const archivedAt = new Date().toISOString();
  const removed = ordered.slice(1);
  const archiveRows = removed.map((row, index) => ({
    tracking_number: `PMREPORTTRASH:${String(row.data.id)}:${Date.now()}-${index}`,
    data: { ...row.data, recoveryDeletedAt: archivedAt, recoveryReason: "selected-section-merge", recoveryOriginalKey: row.tracking_number },
    updated_at: archivedAt,
  }));
  if (archiveRows.length) {
    const archiveResponse = await fetch(`${url}/rest/v1/${table}?on_conflict=tracking_number`, {
      method: "POST",
      headers: { ...headers(key), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(archiveRows),
    });
    if (!archiveResponse.ok) return NextResponse.json({ error: "Could not create recovery copies before merging" }, { status: 503 });
  }

  const mergedData = {
    ...keep.data,
    itemCount: items.length || ordered.reduce((sum, row) => sum + Number(row.data.itemCount || 0), 0),
    totalItemCount,
    items: items.length ? items : keep.data.items,
    correctiveActions: [...actionMap.values()],
    reportPartCount: finalPartCount,
    pdfStoragePath: path,
    pdfPageCount: mergedPdf.getPageCount(),
  };
  delete mergedData.pdfBase64;
  const updateKeep = await fetch(`${url}/rest/v1/${table}?tracking_number=eq.${encodeURIComponent(keep.tracking_number)}`, {
    method: "PATCH",
    headers: { ...headers(key), Prefer: "return=minimal" },
    body: JSON.stringify({ data: mergedData, updated_at: archivedAt }),
  });
  if (!updateKeep.ok) return NextResponse.json({ error: await updateKeep.text() }, { status: updateKeep.status });

  for (const sibling of remainingSiblings) {
    await fetch(`${url}/rest/v1/${table}?tracking_number=eq.${encodeURIComponent(sibling.tracking_number)}`, {
      method: "PATCH",
      headers: { ...headers(key), Prefer: "return=minimal" },
      body: JSON.stringify({ data: { ...sibling.data, reportPartCount: finalPartCount }, updated_at: archivedAt }),
    });
  }

  for (const old of removed) {
    const attachmentParams = new URLSearchParams({ select: "tracking_number,data" });
    attachmentParams.append("tracking_number", "like.PMATTACH:*");
    attachmentParams.append("data->>reportId", `eq.${String(old.data.id)}`);
    const attachmentResponse = await fetch(`${url}/rest/v1/${table}?${attachmentParams}`, { headers: headers(key), cache: "no-store" });
    if (attachmentResponse.ok) {
      const attachments = await attachmentResponse.json() as Array<{ tracking_number: string; data: any }>;
      await Promise.all(attachments.map((attachment) => fetch(`${url}/rest/v1/${table}?tracking_number=eq.${encodeURIComponent(attachment.tracking_number)}`, {
        method: "PATCH",
        headers: { ...headers(key), Prefer: "return=minimal" },
        body: JSON.stringify({ data: { ...attachment.data, reportId: keepId }, updated_at: archivedAt }),
      })));
    }
  }

  if (removed.length) {
    const removeValues = removed.map((row) => row.tracking_number).join(",");
    const deletion = await fetch(`${url}/rest/v1/${table}?tracking_number=in.(${removeValues})`, { method: "DELETE", headers: { ...headers(key), Prefer: "return=minimal" } });
    if (!deletion.ok) return NextResponse.json({ error: await deletion.text() }, { status: deletion.status });
  }

  return NextResponse.json({ ok: true, keptId: keepId, mergedSections: ordered.length, finalPartCount, itemCount: mergedData.itemCount, pdfPageCount: mergedPdf.getPageCount() });
}
