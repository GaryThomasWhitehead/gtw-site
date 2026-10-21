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

function partLabel(index: number) {
  let value = index + 1, label = "";
  while (value > 0) {
    value -= 1;
    label = String.fromCharCode(65 + (value % 26)) + label;
    value = Math.floor(value / 26);
  }
  return label;
}

export async function POST(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  const body = await request.json();
  const ids = [...new Set((Array.isArray(body?.ids) ? body.ids : []).map((id: unknown) => String(id || "").trim()).filter(Boolean))] as string[];
  if (ids.length < 2 || ids.length > 40) return NextResponse.json({ error: "Two to forty report sections are required" }, { status: 400 });

  const trackingValues = ids.map((id) => `PMREPORT:${id}`).join(",");
  const response = await fetch(`${url}/rest/v1/${table}?select=tracking_number,data&tracking_number=in.(${trackingValues})`, { headers: headers(key), cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
  const rows: { tracking_number: string; data: any }[] = await response.json();
  const ordered = rows.filter((row) => row.data?.id).sort((a, b) => Number(a.data.reportPart || 0) - Number(b.data.reportPart || 0));
  if (ordered.length !== ids.length) return NextResponse.json({ error: "One or more report sections could not be loaded" }, { status: 409 });
  const totalItems = Math.max(...ordered.map((row) => Number(row.data.totalItemCount || row.data.itemCount || 0)));
  const desiredCount = Math.max(1, Math.ceil(totalItems / 5));
  if (ordered.length <= desiredCount) return NextResponse.json({ ok: true, unchanged: true, sectionCount: ordered.length });

  // A prior consolidation can finish writing the desired A-F PDFs before a
  // later legacy page fails to load. On retry, preserve those completed files
  // and remove only the redundant source-page records.
  const recoveredByPart = new Map<number, { tracking_number: string; data: any }>();
  for (const row of ordered) {
    const part = Number(row.data.reportPart || 0);
    const count = Number(row.data.reportPartCount || 0);
    const itemCount = Number(row.data.itemCount || 0);
    if (count === desiredCount && part >= 1 && part <= desiredCount && itemCount > 0 && itemCount <= 5 && !recoveredByPart.has(part)) {
      recoveredByPart.set(part, row);
    }
  }
  if (recoveredByPart.size === desiredCount) {
    const keepIds = new Set([...recoveredByPart.values()].map((row) => String(row.data.id)));
    for (const old of ordered) {
      const oldId = String(old.data.id);
      if (keepIds.has(oldId)) continue;
      const oldPart = Math.max(1, Number(old.data.reportPart || 1));
      const targetPart = Math.min(desiredCount, Math.floor((oldPart - 1) / 5) + 1);
      const targetId = String(recoveredByPart.get(targetPart)?.data.id || recoveredByPart.get(1)?.data.id || "");
      if (!targetId) continue;
      const attachmentQuery = new URLSearchParams({ select: "tracking_number,data" });
      attachmentQuery.append("tracking_number", "like.PMATTACH:*");
      attachmentQuery.append("data->>reportId", `eq.${oldId}`);
      const attachmentResponse = await fetch(`${url}/rest/v1/${table}?${attachmentQuery}`, { headers: headers(key), cache: "no-store" });
      if (attachmentResponse.ok) {
        const attachmentRows: { tracking_number: string; data: any }[] = await attachmentResponse.json();
        await Promise.all(attachmentRows.map((attachment) => fetch(`${url}/rest/v1/${table}?tracking_number=eq.${encodeURIComponent(attachment.tracking_number)}`, {
          method: "PATCH", headers: { ...headers(key), Prefer: "return=minimal" }, body: JSON.stringify({ data: { ...attachment.data, reportId: targetId }, updated_at: new Date().toISOString() }),
        })));
      }
    }
    const removeIds = ordered.map((row) => String(row.data.id)).filter((id) => !keepIds.has(id));
    const values = removeIds.map((id) => `PMREPORT:${id}`).join(",");
    const deletion = await fetch(`${url}/rest/v1/${table}?tracking_number=in.(${values})`, { method: "DELETE", headers: { ...headers(key), Prefer: "return=minimal" } });
    if (!deletion.ok) return NextResponse.json({ error: await deletion.text() }, { status: deletion.status });
    return NextResponse.json({ ok: true, recovered: true, previousSectionCount: ordered.length, sectionCount: desiredCount });
  }

  const fullItems = ordered.map((row) => Array.isArray(row.data.items) ? row.data.items : []).sort((a, b) => b.length - a.length)[0] || [];
  const uniqueActions = new Map<string, any>();
  for (const row of ordered) for (const action of (Array.isArray(row.data.correctiveActions) ? row.data.correctiveActions : [])) {
    const actionKey = `${String(action.assetTag || "").trim().toLowerCase()}|${String(action.repairNeeded || "").trim().toLowerCase()}`;
    if (!uniqueActions.has(actionKey)) uniqueActions.set(actionKey, action);
  }

  const keptIds: string[] = [];
  for (let groupIndex = 0; groupIndex < desiredCount; groupIndex += 1) {
    const group = ordered.slice(groupIndex * 5, groupIndex * 5 + 5);
    if (!group.length) continue;
    const keep = group[0];
    const keepId = String(keep.data.id);
    keptIds.push(keepId);
    const merged = await PDFDocument.create();
    for (const row of group) {
      const bytes = row.data.pdfStoragePath
        ? await downloadReportPdf(url, key, String(row.data.pdfStoragePath))
        : row.data.pdfBase64 ? Buffer.from(String(row.data.pdfBase64), "base64") : null;
      if (!bytes) continue;
      const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pages = await merged.copyPages(source, source.getPageIndices());
      pages.forEach((page) => merged.addPage(page));
    }
    if (!merged.getPageCount()) return NextResponse.json({ error: `Section ${groupIndex + 1} has no readable PDF pages` }, { status: 409 });
    const label = partLabel(groupIndex);
    const path = String(keep.data.pdfStoragePath || reportPdfPath(keepId));
    if (!(await uploadReportPdf(url, key, path, await merged.save()))) return NextResponse.json({ error: `Could not save consolidated section ${label}` }, { status: 503 });
    const baseTracking = String(keep.data.baseTrackingNumber || keep.data.trackingNumber || "").replace(/\s+-\s+[A-Z]+$/i, "").trim();
    const groupIds = new Set(group.map((row) => String(row.data.id)));
    const actions = [...uniqueActions.values()].filter((action) => groupIndex === 0 || groupIds.has(String(action.sourceReportId || ""))).map((action) => ({ ...action, sourceReportId: keepId }));
    const data = {
      ...keep.data,
      id: keepId,
      trackingNumber: desiredCount > 1 ? `${baseTracking} - ${label}` : baseTracking,
      baseTrackingNumber: baseTracking,
      reportPart: groupIndex + 1,
      reportPartCount: desiredCount,
      itemCount: fullItems.length ? fullItems.slice(groupIndex * 5, groupIndex * 5 + 5).length : Math.min(5, Math.max(0, totalItems - groupIndex * 5)),
      totalItemCount: totalItems,
      items: fullItems.length ? fullItems.slice(groupIndex * 5, groupIndex * 5 + 5) : keep.data.items,
      correctiveActions: actions,
      pdfStoragePath: path,
      pdfPageCount: merged.getPageCount(),
      filename: String(keep.data.filename || "report.pdf").replace(/_[A-Z]+\.pdf$/i, `_${label}.pdf`),
    };
    delete data.pdfBase64;
    const update = await fetch(`${url}/rest/v1/${table}?tracking_number=eq.${encodeURIComponent(`PMREPORT:${keepId}`)}`, {
      method: "PATCH", headers: { ...headers(key), Prefer: "return=minimal" }, body: JSON.stringify({ data, updated_at: new Date().toISOString() }),
    });
    if (!update.ok) return NextResponse.json({ error: await update.text() }, { status: update.status });

    for (const old of group) {
      const oldId = String(old.data.id);
      if (oldId === keepId) continue;
      const attachmentQuery = new URLSearchParams({ select: "tracking_number,data" });
      attachmentQuery.append("tracking_number", "like.PMATTACH:*");
      attachmentQuery.append("data->>reportId", `eq.${oldId}`);
      const attachmentResponse = await fetch(`${url}/rest/v1/${table}?${attachmentQuery}`, { headers: headers(key), cache: "no-store" });
      if (attachmentResponse.ok) {
        const attachmentRows: { tracking_number: string; data: any }[] = await attachmentResponse.json();
        await Promise.all(attachmentRows.map((attachment) => fetch(`${url}/rest/v1/${table}?tracking_number=eq.${encodeURIComponent(attachment.tracking_number)}`, {
          method: "PATCH", headers: { ...headers(key), Prefer: "return=minimal" }, body: JSON.stringify({ data: { ...attachment.data, reportId: keepId }, updated_at: new Date().toISOString() }),
        })));
      }
    }
  }

  const removeIds = ordered.map((row) => String(row.data.id)).filter((id) => !keptIds.includes(id));
  if (removeIds.length) {
    const values = removeIds.map((id) => `PMREPORT:${id}`).join(",");
    const deletion = await fetch(`${url}/rest/v1/${table}?tracking_number=in.(${values})`, { method: "DELETE", headers: { ...headers(key), Prefer: "return=minimal" } });
    if (!deletion.ok) return NextResponse.json({ error: await deletion.text() }, { status: deletion.status });
  }
  return NextResponse.json({ ok: true, previousSectionCount: ordered.length, sectionCount: keptIds.length });
}
