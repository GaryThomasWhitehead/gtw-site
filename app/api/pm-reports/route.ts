import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { PDFDocument } from "pdf-lib";
import { expectedFedExTrackerPassword, hasCorrectiveActionViewerAccess, hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";
import { validatePmTechSession } from "@/lib/pmTechAuth";
import { deleteReportPdf, downloadReportPdf, reportPdfPath, uploadReportPdf } from "@/lib/pmReportPdfStorage";

export const dynamic = "force-dynamic";

function config() {
  return {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    table: process.env.FEDEX_TRACKER_TABLE || "fedex_work_orders",
  };
}

function apiHeaders(key: string) {
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

async function fetchWithRetry(input: string, init: RequestInit, attempts = 3) {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await fetch(input, init);
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  throw lastError;
}

export async function POST(request: NextRequest) {
  try {
    const technician = await validatePmTechSession(request);
    if (!hasFedExTrackerAccess(request) && !technician) {
      return NextResponse.json({ error: "Technician or management sign-in required" }, { status: 401 });
    }
    const { url, key, table } = config();
    if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
    const body = await request.json();
    const report = body?.report;
    if (!report?.id || !report?.pdfBase64) return NextResponse.json({ error: "A completed PDF report is required" }, { status: 400 });
    if (report.recoveryImport) {
      const select = [
        "id:data->>id",
        "category:data->>category",
        "reportDate:data->>reportDate",
        "trackingNumber:data->>trackingNumber",
        "facilityId:data->>facilityId",
        "recoveryFingerprint:data->>recoveryFingerprint",
        "tuggerWorkRecords:data->tuggerWorkRecords",
      ].join(",");
      const params = new URLSearchParams({ select });
      params.append("tracking_number", "gte.PMREPORT:");
      params.append("tracking_number", "lt.PMREPORT;");
      const existingResponse = await fetch(`${url}/rest/v1/${table}?${params}`, {
        headers: apiHeaders(key),
        cache: "no-store",
      });
      if (!existingResponse.ok) {
        return NextResponse.json({ error: (await existingResponse.text()) || "Could not compare recovered reports" }, { status: existingResponse.status });
      }
      const normalized = (value: unknown) => String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
      const normalizeWork = (records: unknown) => (Array.isArray(records) ? records : []).map((record: Record<string, unknown>) => ({
        tuggerId: normalized(record?.tuggerId),
        manufacturer: normalized(record?.manufacturer),
        serialNumber: normalized(record?.serialNumber),
        description: normalized(record?.description),
      }));
      const targetWork = JSON.stringify(normalizeWork(report.tuggerWorkRecords));
      const existingRows = await existingResponse.json();
      const exactFingerprint = existingRows.find((row: Record<string, unknown>) => {
        if (report.recoveryFingerprint && row.recoveryFingerprint === report.recoveryFingerprint) return true;
        return false;
      });
      if (exactFingerprint) return NextResponse.json({ ok: true, skipped: true, existingId: exactFingerprint.id });
      const sameHeaderRows = existingRows.filter((row: Record<string, unknown>) => {
        const sameHeader = normalized(row.category) === normalized(report.category)
          && normalized(row.reportDate) === normalized(report.reportDate)
          && normalized(row.trackingNumber) === normalized(report.trackingNumber)
          && normalized(row.facilityId) === normalized(report.facilityId);
        return sameHeader;
      });
      for (const candidate of sameHeaderRows) {
        const candidateTracking = encodeURIComponent(`PMREPORT:${candidate.id}`);
        const fullResponse = await fetch(`${url}/rest/v1/${table}?select=data&tracking_number=eq.${candidateTracking}&limit=1`, {
          headers: apiHeaders(key),
          cache: "no-store",
        });
        if (fullResponse.ok) {
          const [fullRow] = await fullResponse.json();
          const existingBase64 = String(fullRow?.data?.pdfBase64 || "");
          const existingFingerprint = existingBase64
            ? createHash("sha256").update(Buffer.from(existingBase64, "base64")).digest("hex")
            : "";
          if (existingFingerprint && existingFingerprint === report.recoveryFingerprint) {
            return NextResponse.json({ ok: true, skipped: true, existingId: candidate.id });
          }
        }
        if (normalized(report.category) === "tugger"
          && JSON.stringify(normalizeWork(candidate.tuggerWorkRecords)) === targetWork) {
          return NextResponse.json({ ok: true, skipped: true, existingId: candidate.id });
        }
      }
    }
    const { recoveryImport: _recoveryImport, ...storedReport } = report;
    const pdfBytes = Buffer.from(String(storedReport.pdfBase64), "base64");
    const pdfStoragePath = reportPdfPath(String(report.id));
    const storedInObjectStorage = await uploadReportPdf(url, key, pdfStoragePath, pdfBytes);
    const { pdfBase64: _pdfBase64, ...reportMetadata } = storedReport;
    const data = storedInObjectStorage
      ? { ...reportMetadata, pdfStoragePath, recordType: "pm-report" }
      : { ...storedReport, recordType: "pm-report" };
    const response = await fetchWithRetry(`${url}/rest/v1/${table}?on_conflict=tracking_number`, {
      method: "POST",
      headers: { ...apiHeaders(key), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify([{ tracking_number: `PMREPORT:${report.id}`, data, updated_at: new Date().toISOString() }]),
    });
    if (!response.ok) return NextResponse.json({ error: (await response.text()) || `Storage returned ${response.status}` }, { status: response.status });
    return NextResponse.json({ ok: true, id: report.id });
  } catch (error) {
    const cause = error instanceof Error && error.cause && typeof error.cause === "object"
      ? String((error.cause as { code?: string; message?: string }).code || (error.cause as { message?: string }).message || "")
      : "";
    return NextResponse.json({ error: [error instanceof Error ? error.message : "Unexpected archive error", cause].filter(Boolean).join(" — ") }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const managementAccess = hasFedExTrackerAccess(request);
  const correctiveViewerAccess = hasCorrectiveActionViewerAccess(request);
  if (!managementAccess && !correctiveViewerAccess) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    const trackingNumber = encodeURIComponent(`PMREPORT:${id}`);
    const select = "filename:data->>filename,category:data->>category,correctiveActions:data->correctiveActions,pdfStoragePath:data->>pdfStoragePath";
    let response: Response | null = null;
    let storageError = "";
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        response = await fetch(`${url}/rest/v1/${table}?select=${encodeURIComponent(select)}&tracking_number=eq.${trackingNumber}&limit=1`, {
          headers: apiHeaders(key),
          cache: "no-store",
        });
        if (response.ok) break;
        storageError = await response.text();
      } catch (cause) {
        storageError = cause instanceof Error ? cause.message : String(cause);
      }
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
    if (!response?.ok) {
      console.warn("Saved report PDF retrieval failed after retries", storageError.slice(0, 500));
      return NextResponse.json({ error: "The saved PDF storage service is temporarily unavailable. Please try again." }, { status: 503 });
    }
    const [row] = await response.json();
    if (!row) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    const viewerActions = Array.isArray(row.correctiveActions) ? row.correctiveActions : [];
    const isReferencedCorrectivePdf = viewerActions.some((action: { sourceReportId?: string }) => String(action?.sourceReportId || id) === id);
    if (!managementAccess && ((row.category || "pm") !== "pm" || !isReferencedCorrectivePdf)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    let pdf = row.pdfStoragePath ? await downloadReportPdf(url, key, String(row.pdfStoragePath)) : null;
    if (!pdf) {
      const legacySelect = "data";
      let legacyResponse: Response | null = null;
      for (let attempt = 0; attempt < 4; attempt += 1) {
        legacyResponse = await fetch(`${url}/rest/v1/${table}?select=${legacySelect}&tracking_number=eq.${trackingNumber}&limit=1`, { headers: apiHeaders(key), cache: "no-store" }).catch(() => null);
        if (legacyResponse?.ok) break;
        if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      }
      if (!legacyResponse?.ok) return NextResponse.json({ error: "The saved PDF storage service is temporarily unavailable. Please try again." }, { status: 503 });
      const [legacyRow] = await legacyResponse.json();
      const legacyBase64 = String(legacyRow?.data?.pdfBase64 || "");
      if (!legacyBase64) return NextResponse.json({ error: "This report does not contain a saved PDF" }, { status: 404 });
      pdf = Buffer.from(legacyBase64, "base64");
      const path = reportPdfPath(id);
      if (await uploadReportPdf(url, key, path, pdf)) {
        const { pdfBase64: _removed, ...migratedData } = legacyRow.data;
        await fetchWithRetry(`${url}/rest/v1/${table}?tracking_number=eq.${trackingNumber}`, {
          method: "PATCH",
          headers: { ...apiHeaders(key), Prefer: "return=minimal" },
          body: JSON.stringify({ data: { ...migratedData, pdfStoragePath: path }, updated_at: new Date().toISOString() }),
        }).catch(() => null);
      }
    }
    return new NextResponse(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${String(row.filename || "pm-report.pdf").replace(/\"/g, "")}"`, "Cache-Control": "private, max-age=300" } });
  }

  const mode = request.nextUrl.searchParams.get("mode");
  if (mode === "list") {
    // Keep the initial index lookup entirely on the primary-key index. Selecting
    // updated_at and sorting by it made Postgres visit/sort every large legacy
    // report row, which could exceed the gateway's ten-second timeout.
    const params = new URLSearchParams({ select: "tracking_number", order: "tracking_number.asc", limit: "1000" });
    params.append("tracking_number", "gte.PMREPORT:");
    params.append("tracking_number", "lt.PMREPORT;");
    let response: Response | null = null;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      response = await fetch(`${url}/rest/v1/${table}?${params}`, { headers: apiHeaders(key), cache: "no-store" }).catch(() => null);
      if (response?.ok) break;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
    }
    if (!response?.ok) return NextResponse.json({ error: "The completed-report index is temporarily unavailable. Please try again." }, { status: 503 });
    const rows = await response.json();
    return NextResponse.json(rows
      .map((row: { tracking_number?: string }) => ({
        id: String(row.tracking_number || "").replace(/^PMREPORT:/, ""),
      }))
      .filter((row: { id: string }) => row.id && !row.id.startsWith("connection-test-")), {
        headers: { "Cache-Control": "private, max-age=15, stale-while-revalidate=60" },
      });
  }

  if (mode === "corrective") {
    const correctiveSelect = [
      "updated_at",
      "id:data->>id",
      "category:data->>category",
      "technician:data->>technician",
      "reportDate:data->>reportDate",
      "trackingNumber:data->>trackingNumber",
      "facilityId:data->>facilityId",
      "customerName:data->>customerName",
      "correctiveActions:data->correctiveActions",
      "correctiveScanAt:data->>correctiveScanAt",
    ].join(",");
    const params = new URLSearchParams({ select: correctiveSelect, order: "updated_at.desc" });
    params.append("tracking_number", "gte.PMREPORT:");
    params.append("tracking_number", "lt.PMREPORT;");
    const response = await fetch(`${url}/rest/v1/${table}?${params}`, { headers: apiHeaders(key), cache: "no-store" });
    if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
    const rows = await response.json();
    return NextResponse.json(rows.map((row: Record<string, unknown>) => {
      const { updated_at: savedAt, ...metadata } = row;
      return { ...metadata, savedAt };
    }).filter((report: { id?: string; category?: string }) => report.id && !report.id.startsWith("connection-test-") && (report.category || "pm") === "pm"), {
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  // Project only report-list metadata. Pulling every base64 PDF from the JSONB
  // column makes the database scan and response large enough to time out.
  const select = [
    "updated_at",
    "id:data->>id",
    "category:data->>category",
    "reportTypeLabel:data->>reportTypeLabel",
    "technician:data->>technician",
    "reportDate:data->>reportDate",
    "facilityAddress:data->>facilityAddress",
    "trackingNumber:data->>trackingNumber",
    "facilityId:data->>facilityId",
    "customerName:data->>customerName",
    "fedexJob:data->fedexJob",
    "itemCount:data->itemCount",
    "tuggerWorkRecords:data->tuggerWorkRecords",
    "workflowStatus:data->>workflowStatus",
    "partsNotes:data->>partsNotes",
    "workArrangement:data->>workArrangement",
    "teamMembers:data->>teamMembers",
    "manufacturer:data->>manufacturer",
    "model:data->>model",
    "serialNumber:data->>serialNumber",
    "sensorType:data->>sensorType",
    "sensorTag:data->>sensorTag",
    "calibrationSheets:data->calibrationSheets",
    "correctiveActions:data->correctiveActions",
    "correctiveScanAt:data->>correctiveScanAt",
  ].join(",");
  const requestedIds = request.nextUrl.searchParams.get("ids");
  if (requestedIds) {
    const ids = requestedIds.split(",").map((value) => value.trim()).filter(Boolean).slice(0, 5);
    if (!ids.length) return NextResponse.json([]);
    const trackingValues = ids.map((value) => `PMREPORT:${value}`).join(",");
    const params = new URLSearchParams({
      select,
      tracking_number: `in.(${trackingValues})`,
    });
    const response = await fetch(`${url}/rest/v1/${table}?${params}`, {
      headers: apiHeaders(key),
      cache: "no-store",
    });
    if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
    const rows = await response.json();
    const metadata = rows.map((row: Record<string, unknown>) => {
      const { updated_at: savedAt, ...metadata } = row;
      return { ...metadata, savedAt };
    }).filter((report: { category?: string }) => managementAccess || (report.category || "pm") === "pm");
    return NextResponse.json(metadata, { headers: { "Cache-Control": "private, max-age=15, stale-while-revalidate=60" } });
  }
  const params = new URLSearchParams({ select, order: "updated_at.desc" });
  params.append("tracking_number", "gte.PMREPORT:");
  params.append("tracking_number", "lt.PMREPORT;");
  const response = await fetch(`${url}/rest/v1/${table}?${params}`, { headers: apiHeaders(key), cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
  const rows = (await response.json()).filter((row: { id?: string }) =>
    row.id && !String(row.id).startsWith("connection-test-")
  );
  return NextResponse.json(rows.map((row: Record<string, unknown>) => {
    const { updated_at: savedAt, ...metadata } = row;
    return { ...metadata, savedAt };
  }), { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  const body = await request.json();
  const id = String(body?.id || "").trim();
  const workflowStatus = String(body?.workflowStatus || "").trim();
  const trackingNumberUpdate = body?.trackingNumber === undefined ? undefined : String(body.trackingNumber).trim();
  const partsNotesUpdate = body?.partsNotes === undefined ? undefined : String(body.partsNotes).trim();
  const fedexJobUpdate = body?.fedexJob === undefined ? undefined : Boolean(body.fedexJob);
  const customerNameUpdate = body?.customerName === undefined ? undefined : String(body.customerName).trim();
  const correctiveActionsUpdate = body?.correctiveActions === undefined ? undefined : body.correctiveActions;
  const rawDeletePdfPages: unknown[] = Array.isArray(body?.deletePdfPages) ? body.deletePdfPages : [];
  const deletePdfPages: number[] = Array.from(new Set<number>(
    rawDeletePdfPages.map((page) => Number(page)).filter((page) => Number.isInteger(page) && page > 0),
  )).sort((a, b) => a - b);
  if (!id) return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
  if (trackingNumberUpdate === undefined && partsNotesUpdate === undefined && fedexJobUpdate === undefined && customerNameUpdate === undefined && correctiveActionsUpdate === undefined && !deletePdfPages.length && !["complete", "parts", "return"].includes(workflowStatus)) {
    return NextResponse.json({ error: "Invalid report status" }, { status: 400 });
  }
  if (trackingNumberUpdate !== undefined && !trackingNumberUpdate) {
    return NextResponse.json({ error: "Tracking number is required" }, { status: 400 });
  }
  if (partsNotesUpdate !== undefined && partsNotesUpdate.length > 5000) {
    return NextResponse.json({ error: "Parts notes must be 5,000 characters or fewer" }, { status: 400 });
  }
  if (fedexJobUpdate === false && !customerNameUpdate) {
    return NextResponse.json({ error: "Customer name is required for a non-FedEx job" }, { status: 400 });
  }
  if (customerNameUpdate !== undefined && customerNameUpdate.length > 250) {
    return NextResponse.json({ error: "Customer name must be 250 characters or fewer" }, { status: 400 });
  }
  if (correctiveActionsUpdate !== undefined) {
    if (!Array.isArray(correctiveActionsUpdate) || correctiveActionsUpdate.length > 100) {
      return NextResponse.json({ error: "Corrective actions must be a list of no more than 100 items" }, { status: 400 });
    }
    const invalidAction = correctiveActionsUpdate.some((action: unknown) => {
      if (!action || typeof action !== "object") return true;
      const item = action as Record<string, unknown>;
      return String(item.id || "").length > 100
        || String(item.assetTag || "").length > 250
        || String(item.repairNeeded || "").length > 5000
        || String(item.urgency || "").length > 100
        || String(item.serviceChannelWo || "").length > 250;
    });
    if (invalidAction) return NextResponse.json({ error: "A corrective-action field is too long" }, { status: 400 });
  }
  if (deletePdfPages.length) {
    const password = request.headers.get("x-management-password") || "";
    if (!expectedFedExTrackerPassword() || password !== expectedFedExTrackerPassword()) {
      return NextResponse.json({ error: "Incorrect management password" }, { status: 403 });
    }
  }
  const trackingNumber = encodeURIComponent(`PMREPORT:${id}`);
  const currentResponse = await fetch(`${url}/rest/v1/${table}?select=data&tracking_number=eq.${trackingNumber}&limit=1`, {
    headers: apiHeaders(key),
    cache: "no-store",
  });
  if (!currentResponse.ok) return NextResponse.json({ error: await currentResponse.text() }, { status: currentResponse.status });
  const rows = await currentResponse.json();
  if (!rows.length) return NextResponse.json({ error: "Report not found" }, { status: 404 });
  let pdfUpdate: Record<string, unknown> = {};
  if (deletePdfPages.length) {
    const originalBase64 = String(rows[0].data?.pdfBase64 || "");
    const originalPdf = rows[0].data?.pdfStoragePath
      ? await downloadReportPdf(url, key, String(rows[0].data.pdfStoragePath))
      : originalBase64 ? Buffer.from(originalBase64, "base64") : null;
    if (!originalPdf) return NextResponse.json({ error: "This report does not contain a saved PDF" }, { status: 400 });
    try {
      const pdf = await PDFDocument.load(originalPdf);
      const pageCount = pdf.getPageCount();
      const unavailable = deletePdfPages.filter((page) => page > pageCount);
      if (unavailable.length) {
        return NextResponse.json({ error: `This PDF has ${pageCount} page${pageCount === 1 ? "" : "s"}. Page ${unavailable.join(", ")} cannot be deleted.` }, { status: 400 });
      }
      if (deletePdfPages.length >= pageCount) {
        return NextResponse.json({ error: "A report must keep at least one PDF page" }, { status: 400 });
      }
      [...deletePdfPages].sort((a, b) => b - a).forEach((page) => pdf.removePage(page - 1));
      const updatedPdf = await pdf.save();
      const path = String(rows[0].data?.pdfStoragePath || reportPdfPath(id));
      const objectSaved = await uploadReportPdf(url, key, path, updatedPdf);
      pdfUpdate = objectSaved
        ? { pdfBase64: undefined, pdfStoragePath: path, pdfPageCount: pdf.getPageCount(), pdfEditedAt: new Date().toISOString() }
        : { pdfBase64: Buffer.from(updatedPdf).toString("base64"), pdfPageCount: pdf.getPageCount(), pdfEditedAt: new Date().toISOString() };
    } catch (error) {
      return NextResponse.json({ error: `Could not edit this PDF: ${error instanceof Error ? error.message : String(error)}` }, { status: 400 });
    }
  }
  const updatedData = {
    ...rows[0].data,
    ...(workflowStatus ? { workflowStatus } : {}),
    ...(trackingNumberUpdate !== undefined ? { trackingNumber: trackingNumberUpdate } : {}),
    ...(partsNotesUpdate !== undefined ? { partsNotes: partsNotesUpdate } : {}),
    ...(fedexJobUpdate !== undefined ? { fedexJob: fedexJobUpdate } : {}),
    ...(customerNameUpdate !== undefined ? { customerName: customerNameUpdate } : {}),
    ...(correctiveActionsUpdate !== undefined ? { correctiveActions: correctiveActionsUpdate } : {}),
    ...pdfUpdate,
  };
  const updateResponse = await fetchWithRetry(`${url}/rest/v1/${table}?tracking_number=eq.${trackingNumber}`, {
    method: "PATCH",
    headers: { ...apiHeaders(key), Prefer: "return=minimal" },
    body: JSON.stringify({ data: updatedData, updated_at: new Date().toISOString() }),
  });
  if (!updateResponse.ok) return NextResponse.json({ error: await updateResponse.text() }, { status: updateResponse.status });
  return NextResponse.json({ ok: true, id, workflowStatus: updatedData.workflowStatus, trackingNumber: updatedData.trackingNumber, partsNotes: updatedData.partsNotes, fedexJob: updatedData.fedexJob, customerName: updatedData.customerName, correctiveActions: updatedData.correctiveActions, pdfPageCount: updatedData.pdfPageCount });
}

export async function DELETE(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  const id = String(request.nextUrl.searchParams.get("id") || "").trim();
  const password = request.headers.get("x-management-password") || "";
  if (!id) return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
  if (!expectedFedExTrackerPassword() || password !== expectedFedExTrackerPassword()) {
    return NextResponse.json({ error: "Incorrect management password" }, { status: 403 });
  }
  const trackingNumber = encodeURIComponent(`PMREPORT:${id}`);
  const response = await fetchWithRetry(`${url}/rest/v1/${table}?tracking_number=eq.${trackingNumber}`, {
    method: "DELETE",
    headers: { ...apiHeaders(key), Prefer: "return=minimal" },
  });
  if (!response.ok) return NextResponse.json({ error: (await response.text()) || "Could not delete report" }, { status: response.status });
  return NextResponse.json({ ok: true, id });
}
