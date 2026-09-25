"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import styles from "./reports.module.css";

type Category = "all" | "regular" | "proposed" | "pm" | "tugger" | "gas";
type TuggerView = "reports" | "history";
type WorkflowStatus = "complete" | "parts" | "return";
type TuggerWorkRecord = {
  itemNumber?: number;
  location?: string;
  facilityId?: string;
  customerName?: string;
  trackingNumber?: string;
  reportDate?: string;
  description?: string;
  tuggerId?: string;
  manufacturer?: string;
  serialNumber?: string;
  legacy?: boolean;
};
type GasCalibrationSheet = {
  manufacturer?: string;
  model?: string;
  serial?: string;
  gas?: string;
  tag?: string;
  range?: string;
  gasStandard?: string;
  notes?: string;
};
type Report = {
  id: string;
  category?: string;
  reportTypeLabel?: string;
  technician?: string;
  reportDate?: string;
  facilityAddress?: string;
  trackingNumber?: string;
  facilityId?: string;
  customerName?: string;
  fedexJob?: boolean;
  itemCount?: number;
  tuggerWorkRecords?: TuggerWorkRecord[];
  workflowStatus?: WorkflowStatus;
  partsNotes?: string;
  workArrangement?: "alone" | "team";
  teamMembers?: string;
  calibrationSheets?: GasCalibrationSheet[];
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  sensorType?: string;
  sensorTag?: string;
  savedAt?: string;
};
type JobHistory = { key: string; latest: Report; reports: Report[]; status: WorkflowStatus };
type ReportAttachment = {
  id: string;
  reportId: string;
  trackingNumber?: string;
  filename?: string;
};
type Technician = { id: string; name: string; active: boolean };

const TABS: { key: Category; label: string }[] = [
  { key: "all", label: "All Reports" },
  { key: "regular", label: "Regular Jobs" },
  { key: "proposed", label: "Proposed Work" },
  { key: "pm", label: "Preventive Maintenance" },
  { key: "tugger", label: "Tugger" },
  { key: "gas", label: "Gas Sensor" },
];
const categoryOf = (report: Report) => report.category || "pm";
const statusOf = (report: Report): WorkflowStatus => report.workflowStatus || "complete";
const STATUS_TABS: { key: WorkflowStatus; label: string }[] = [
  { key: "complete", label: "Job Complete" },
  { key: "parts", label: "Need Parts" },
  { key: "return", label: "Need to Return" },
];
const normalizedSearch = (value: unknown) =>
  String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const technicianIdentity = (value: unknown) => {
  const parts = String(value || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "technician-not-entered";
  const firstName = normalizedSearch(parts[0]);
  // Historical reports contain two name variations for each of these techs.
  // Keep their reports together without rewriting the original PDFs.
  if (firstName === "jose") return "technician-jose-fonseca";
  if (firstName === "dennis") return "technician-dennis-white";
  if (parts.length === 1) return normalizedSearch(parts[0]);
  return `${normalizedSearch(parts[0])}-${normalizedSearch(parts.at(-1))}`;
};
const preferredTechnicianLabel = (key: string, entered: string) => {
  if (key === "technician-jose-fonseca") return "Jose Fonseca";
  if (key === "technician-dennis-white") return "Dennis White";
  return entered;
};
const reportMatches = (report: Report, query: string) => {
  const terms = [
    report.technician,
    report.trackingNumber,
    report.facilityId,
    report.customerName,
    report.facilityAddress,
    report.reportDate,
    report.reportTypeLabel,
  ];
  const plainQuery = query.trim().toLowerCase();
  const compactQuery = normalizedSearch(query);
  if (!plainQuery) return true;
  return terms.some((term) => {
    const value = String(term || "");
    return value.toLowerCase().includes(plainQuery) ||
      (compactQuery && normalizedSearch(value).includes(compactQuery));
  });
};
const trackingIdentity = (report: Report) => {
  const tracking = normalizedSearch(report.trackingNumber);
  return tracking ? `tracking-${tracking}` : `report-${report.id}`;
};
const reportTime = (report: Report) => {
  const reportDate = Date.parse(String(report.reportDate || ""));
  const savedAt = Date.parse(String(report.savedAt || ""));
  return { reportDate: Number.isNaN(reportDate) ? 0 : reportDate, savedAt: Number.isNaN(savedAt) ? 0 : savedAt };
};
const newestFirst = (left: Report, right: Report) => {
  const leftTime = reportTime(left);
  const rightTime = reportTime(right);
  // A report completed later should appear first, even when both reports use
  // the same job date. Fall back to the entered report date for recovered
  // historical reports that do not have a saved timestamp.
  return rightTime.savedAt - leftTime.savedAt || rightTime.reportDate - leftTime.reportDate;
};

export default function ReportsClient() {
  const [reports, setReports] = useState<Report[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Category>("all");
  const [statusTab, setStatusTab] = useState<WorkflowStatus>("complete");
  const [tuggerView, setTuggerView] = useState<TuggerView>("reports");
  const [gasView, setGasView] = useState<TuggerView>("reports");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [editingPdfId, setEditingPdfId] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [savingNoteId, setSavingNoteId] = useState("");
  const [partsNoteDrafts, setPartsNoteDrafts] = useState<Record<string, string>>({});
  const [editingCustomerId, setEditingCustomerId] = useState("");
  const [savingCustomerId, setSavingCustomerId] = useState("");
  const [customerDrafts, setCustomerDrafts] = useState<Record<string, { fedexJob: boolean; customerName: string }>>({});
  const [attachments, setAttachments] = useState<ReportAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{ report: Report; trackingNumber: string } | null>(null);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadProgress, setLoadProgress] = useState({ loaded: 0, total: 0 });
  const [showTechAccess, setShowTechAccess] = useState(false);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [techName, setTechName] = useState("");
  const [techPin, setTechPin] = useState("");
  const [savingTech, setSavingTech] = useState(false);

  const loadReports = useCallback(async () => {
    setLoadingReports(true);
    setError("");
    setReports([]);
    setLoadProgress({ loaded: 0, total: 0 });
    try {
      const listResponse = await fetch("/api/pm-reports?mode=list", { cache: "no-store" });
      if (!listResponse.ok) throw new Error(await listResponse.text());
      const index: { id: string }[] = await listResponse.json();
      setLoadProgress({ loaded: 0, total: index.length });
      const chunks: string[][] = [];
      for (let offset = 0; offset < index.length; offset += 3) {
        chunks.push(index.slice(offset, offset + 3).map((item) => item.id));
      }
      const failedIds: string[] = [];
      const fetchChunk = async (ids: string[], attempts = 3): Promise<Report[] | null> => {
        for (let attempt = 0; attempt < attempts; attempt += 1) {
          try {
            const response = await fetch(`/api/pm-reports?ids=${encodeURIComponent(ids.join(","))}`, { cache: "no-store" });
            if (response.ok) return await response.json();
          } catch (_) {}
          if (attempt < attempts - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
          }
        }
        return null;
      };
      const addRows = (rows: Report[]) => {
        setReports((current) => {
          const existing = new Set(current.map((report) => report.id));
          return [...current, ...rows.filter((report) => !existing.has(report.id))];
        });
        setLoadProgress((current) => ({ ...current, loaded: current.loaded + rows.length }));
      };
      let nextChunk = 0;
      const workers = Array.from({ length: Math.min(2, chunks.length) }, async () => {
        while (nextChunk < chunks.length) {
          const chunk = chunks[nextChunk++];
          const rows = await fetchChunk(chunk);
          if (rows) {
            addRows(rows);
            const received = new Set(rows.map((report) => report.id));
            const missing = chunk.filter((id) => !received.has(id));
            for (const reportId of missing) {
              const recovered = await fetchChunk([reportId]);
              if (recovered?.length) addRows(recovered);
              else failedIds.push(reportId);
            }
            continue;
          }
          // A single unusually large report should not prevent the rest of
          // the archive from loading. Retry every report separately and keep
          // processing later batches even if one remains temporarily slow.
          for (const reportId of chunk) {
            const recovered = await fetchChunk([reportId]);
            if (recovered?.length) addRows(recovered);
            else failedIds.push(reportId);
          }
        }
      });
      await Promise.all(workers);
      if (failedIds.length) {
        setError(`${failedIds.length} report${failedIds.length === 1 ? " is" : "s are"} temporarily unavailable.`);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoadingReports(false);
    }
  }, []);

  useEffect(() => { void loadReports(); }, [loadReports]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("category") === "gas") setTab("gas");
    if (params.get("category") === "gas" && params.get("view") === "history") setGasView("history");
  }, []);

  useEffect(() => {
    fetch("/api/pm-report-attachments", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text());
        return response.json();
      })
      .then(setAttachments)
      .catch((cause) => setError(String(cause)));
  }, []);

  const loadTechnicians = useCallback(async () => {
    const response = await fetch("/api/pm-techs", { cache: "no-store" });
    if (!response.ok) throw new Error(await response.text());
    setTechnicians(await response.json());
  }, []);

  async function openTechAccess() {
    setShowTechAccess(true);
    setError("");
    try { await loadTechnicians(); } catch (cause) { setError(String(cause)); }
  }

  async function addTechnician(event: FormEvent) {
    event.preventDefault();
    setSavingTech(true);
    setError("");
    try {
      const response = await fetch("/api/pm-techs", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: techName, pin: techPin }),
      });
      if (!response.ok) throw new Error(await response.text());
      setTechName(""); setTechPin(""); await loadTechnicians();
    } catch (cause) { setError(`Could not add technician: ${cause instanceof Error ? cause.message : String(cause)}`); }
    finally { setSavingTech(false); }
  }

  async function setTechnicianActive(tech: Technician, active: boolean) {
    const response = await fetch("/api/pm-techs", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: tech.id, active }),
    });
    if (!response.ok) { setError(await response.text()); return; }
    await loadTechnicians();
  }

  async function deleteTechnician(tech: Technician) {
    if (!confirm(`Delete report access for ${tech.name}?`)) return;
    const response = await fetch(`/api/pm-techs?id=${encodeURIComponent(tech.id)}`, { method: "DELETE" });
    if (!response.ok) { setError(await response.text()); return; }
    await loadTechnicians();
  }

  const allJobHistories = useMemo(() => {
    const groups = new Map<string, Report[]>();
    reports.forEach((report) => {
      const key = trackingIdentity(report);
      groups.set(key, [...(groups.get(key) || []), report]);
    });
    return Array.from(groups.entries()).map(([key, groupedReports]) => {
      const sorted = [...groupedReports].sort(newestFirst);
      return { key, latest: sorted[0], reports: sorted, status: statusOf(sorted[0]) } satisfies JobHistory;
    });
  }, [reports]);

  // Determine a tracking number's current status from its complete history
  // before applying category tabs. That keeps an old Need Parts/Return visit
  // from lingering in those tabs after a later report completes the job.
  const jobHistories = useMemo(() => allJobHistories.filter((history) =>
    tab === "all" || history.reports.some((report) => categoryOf(report) === tab)
  ), [allJobHistories, tab]);

  const searchingAllReports = tab === "all" && Boolean(query.trim());
  const shown = useMemo(() => jobHistories.filter((history) =>
    (searchingAllReports || history.status === statusTab) &&
    history.reports.some((report) => reportMatches(report, query))
  ), [jobHistories, query, searchingAllReports, statusTab]);

  const technicianGroups = useMemo(() => {
    const groups = new Map<string, { label: string; histories: JobHistory[]; reportCount: number }>();
    shown.forEach((history) => {
      const technician = history.latest.technician?.trim() || "Technician not entered";
      const key = technicianIdentity(technician);
      const current = groups.get(key);
      groups.set(key, {
        label: preferredTechnicianLabel(key, current && current.label.length <= technician.length ? current.label : technician),
        histories: [...(current?.histories || []), history].sort((left, right) => newestFirst(left.latest, right.latest)),
        reportCount: (current?.reportCount || 0) + history.reports.length,
      });
    });
    return Array.from(groups.entries()).sort(([, left], [, right]) =>
      left.label.localeCompare(right.label, undefined, { sensitivity: "base" }),
    );
  }, [shown]);

  const tuggerHistory = useMemo(
    () =>
      jobHistories
        .filter((history) => categoryOf(history.latest) === "tugger" && history.status === statusTab)
        .flatMap((history) => history.reports)
        .flatMap((report) => {
          if (report.tuggerWorkRecords?.length) {
            return report.tuggerWorkRecords.map((item) => ({ item, report }));
          }
          return Array.from({ length: Math.max(1, report.itemCount || 1) }, (_, index) => ({
            report,
            item: {
              itemNumber: index + 1,
              location: report.facilityAddress,
              facilityId: report.facilityId,
              trackingNumber: report.trackingNumber,
              reportDate: report.reportDate,
              description: "Legacy completed report — view the PDF for the original tugger details.",
              legacy: true,
            } satisfies TuggerWorkRecord,
          }));
        })
        .filter(({ item, report }) => {
          if (reportMatches(report, query)) return true;
          const plainQuery = query.trim().toLowerCase();
          const compactQuery = normalizedSearch(query);
          return [item.tuggerId, item.manufacturer, item.serialNumber, item.description]
            .some((term) => {
              const value = String(term || "");
              return value.toLowerCase().includes(plainQuery) ||
                (compactQuery && normalizedSearch(value).includes(compactQuery));
            });
        }),
    [jobHistories, query, statusTab],
  );
  const gasHistory = useMemo(
    () =>
      jobHistories
        .filter((history) => categoryOf(history.latest) === "gas" && history.status === statusTab)
        .flatMap((history) => history.reports)
        .flatMap((report) => {
          const sheets = report.calibrationSheets?.length
            ? report.calibrationSheets
            : [{ manufacturer: "", model: "", serial: "", gas: "", tag: "", gasStandard: "", notes: "" }];
          return sheets.map((sheet, index) => ({ sheet, report, index }));
        })
        .filter(({ sheet, report }) => {
          if (reportMatches(report, query)) return true;
          const plainQuery = query.trim().toLowerCase();
          const compactQuery = normalizedSearch(query);
          return [sheet.tag, sheet.manufacturer, sheet.model, sheet.serial, sheet.gas, sheet.gasStandard, sheet.notes]
            .some((term) => {
              const value = String(term || "");
              return value.toLowerCase().includes(plainQuery) ||
                (compactQuery && normalizedSearch(value).includes(compactQuery));
            });
        })
        .sort((left, right) => newestFirst(left.report, right.report)),
    [jobHistories, query, statusTab],
  );
  const tuggerHistoryMode = tab === "tugger" && tuggerView === "history";
  const gasHistoryMode = tab === "gas" && gasView === "history";

  async function deleteReport(report: Report) {
    const label = report.trackingNumber || report.facilityId || "this report";
    if (!confirm(`Permanently delete ${label}? This cannot be undone.`)) return;
    const password = prompt("Enter the management password to delete this completed report:");
    if (!password) return;
    setDeletingId(report.id);
    setError("");
    try {
      const response = await fetch(
        `/api/pm-reports?id=${encodeURIComponent(report.id)}`,
        { method: "DELETE", headers: { "x-management-password": password } },
      );
      if (!response.ok) throw new Error(await response.text());
      setReports((current) => current.filter((item) => item.id !== report.id));
    } catch (cause) {
      setError(
        `Could not delete report: ${cause instanceof Error ? cause.message : String(cause)}`,
      );
    } finally {
      setDeletingId("");
    }
  }

  async function deletePdfPages(report: Report) {
    const entered = prompt("Enter the PDF page number(s) to delete. Use commas or a range, for example: 2,4 or 2-4");
    if (!entered) return;
    const pages = new Set<number>();
    for (const token of entered.split(/[\s,]+/).filter(Boolean)) {
      const range = token.match(/^(\d+)-(\d+)$/);
      if (range) {
        const start = Number(range[1]);
        const end = Number(range[2]);
        if (start < 1 || end < start || end - start > 100) {
          setError("Enter valid page numbers, such as 2,4 or 2-4.");
          return;
        }
        for (let page = start; page <= end; page += 1) pages.add(page);
      } else if (/^\d+$/.test(token) && Number(token) > 0) {
        pages.add(Number(token));
      } else {
        setError("Enter valid page numbers, such as 2,4 or 2-4.");
        return;
      }
    }
    const selectedPages = Array.from(pages).sort((a, b) => a - b);
    if (!selectedPages.length) return;
    if (!confirm(`Delete PDF page${selectedPages.length === 1 ? "" : "s"} ${selectedPages.join(", ")} from ${report.trackingNumber || "this report"}? This cannot be undone.`)) return;
    const password = prompt("Enter the management password to edit this completed PDF:");
    if (!password) return;
    setEditingPdfId(report.id);
    setError("");
    try {
      const response = await fetch("/api/pm-reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-management-password": password },
        body: JSON.stringify({ id: report.id, deletePdfPages: selectedPages }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Could not edit PDF");
      alert(`PDF updated. ${result.pdfPageCount} page${result.pdfPageCount === 1 ? " remains" : "s remain"}.`);
    } catch (cause) {
      setError(`Could not delete PDF page: ${cause instanceof Error ? cause.message : String(cause)}`);
    } finally {
      setEditingPdfId("");
    }
  }

  function startAttachmentUpload() {
    const entered = prompt("Enter the completed report tracking number:");
    if (!entered) return;
    const normalize = (value: unknown) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const report = reports.find((item) => normalize(item.trackingNumber) === normalize(entered));
    if (!report) {
      setError(`No saved completed report was found for tracking number ${entered}.`);
      return;
    }
    setError("");
    setPendingUpload({ report, trackingNumber: entered });
  }

  async function prepareUploadFile(file: File) {
    if (!file.type.startsWith("image/") || file.size <= 2_500_000) return file;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    bitmap.close();
    return blob ? new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" }) : file;
  }

  async function uploadAttachment(file: File) {
    if (!pendingUpload) return;
    setUploading(true);
    setError("");
    try {
      const prepared = await prepareUploadFile(file);
      const form = new FormData();
      form.set("reportId", pendingUpload.report.id);
      form.set("trackingNumber", pendingUpload.trackingNumber);
      form.set("file", prepared);
      const response = await fetch("/api/pm-report-attachments", { method: "POST", body: form });
      if (!response.ok) throw new Error(await response.text());
      const attachment = await response.json();
      setAttachments((current) => [attachment, ...current]);
    } catch (cause) {
      setError(`Could not upload attachment: ${cause instanceof Error ? cause.message : String(cause)}`);
    } finally {
      setUploading(false);
      setPendingUpload(null);
    }
  }

  async function updateWorkflowStatus(report: Report, workflowStatus: WorkflowStatus) {
    if (statusOf(report) === workflowStatus) return;
    const previousStatus = statusOf(report);
    setUpdatingId(report.id);
    setError("");
    setReports((current) => current.map((item) => item.id === report.id ? { ...item, workflowStatus } : item));
    try {
      const response = await fetch("/api/pm-reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: report.id, workflowStatus }),
      });
      if (!response.ok) throw new Error(await response.text());
    } catch (cause) {
      setReports((current) => current.map((item) => item.id === report.id ? { ...item, workflowStatus: previousStatus } : item));
      setError(`Could not update report status: ${cause instanceof Error ? cause.message : String(cause)}`);
    } finally {
      setUpdatingId("");
    }
  }

  async function savePartsNotes(report: Report) {
    const partsNotes = (partsNoteDrafts[report.id] ?? report.partsNotes ?? "").trim();
    setSavingNoteId(report.id);
    setError("");
    try {
      const response = await fetch("/api/pm-reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: report.id, partsNotes }),
      });
      if (!response.ok) throw new Error(await response.text());
      setReports((current) => current.map((item) => item.id === report.id ? { ...item, partsNotes } : item));
      setPartsNoteDrafts((current) => ({ ...current, [report.id]: partsNotes }));
    } catch (cause) {
      setError(`Could not save parts notes: ${cause instanceof Error ? cause.message : String(cause)}`);
    } finally {
      setSavingNoteId("");
    }
  }

  async function editFedExTrackingNumber(report: Report) {
    if (report.fedexJob === false) return;
    const trackingNumber = prompt("Enter the correct FedEx tracking number:", report.trackingNumber || "")?.trim();
    if (!trackingNumber || trackingNumber === report.trackingNumber) return;
    setUpdatingId(report.id);
    setError("");
    try {
      const response = await fetch("/api/pm-reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: report.id, trackingNumber }),
      });
      if (!response.ok) throw new Error(await response.text());
      setReports((current) => current.map((item) => item.id === report.id ? { ...item, trackingNumber } : item));
    } catch (cause) {
      setError(`Could not update the FedEx tracking number: ${cause instanceof Error ? cause.message : String(cause)}`);
    } finally {
      setUpdatingId("");
    }
  }

  function editCustomer(report: Report) {
    setCustomerDrafts((current) => ({
      ...current,
      [report.id]: { fedexJob: report.fedexJob !== false, customerName: report.customerName || "" },
    }));
    setEditingCustomerId(report.id);
  }

  async function saveCustomer(report: Report) {
    const draft = customerDrafts[report.id] || { fedexJob: report.fedexJob !== false, customerName: report.customerName || "" };
    const customerName = draft.fedexJob ? "" : draft.customerName.trim();
    if (!draft.fedexJob && !customerName) {
      setError("Enter a customer name before saving a non-FedEx report.");
      return;
    }
    setSavingCustomerId(report.id);
    setError("");
    try {
      const response = await fetch("/api/pm-reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: report.id, fedexJob: draft.fedexJob, customerName }),
      });
      if (!response.ok) throw new Error(await response.text());
      setReports((current) => current.map((item) => item.id === report.id ? { ...item, fedexJob: draft.fedexJob, customerName } : item));
      setEditingCustomerId("");
    } catch (cause) {
      setError(`Could not update the report customer: ${cause instanceof Error ? cause.message : String(cause)}`);
    } finally {
      setSavingCustomerId("");
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p>FRONTLINE PRO SERVICES</p>
          <h1>Completed Reports</h1>
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={() => void openTechAccess()}>Manage Tech Access</button>
          <button type="button" onClick={startAttachmentUpload} disabled={uploading}>
            {uploading ? "Uploading…" : "Upload to Report"}
          </button>
          <a href="/pm-report">New Report</a>
          <a href="/fedex-tracker">Back to Tracker</a>
        </div>
      </header>
      <section className={styles.content}>
        {pendingUpload && (
          <section className={styles.uploadPanel}>
            <div>
              <h2>Add to completed report</h2>
              <p>
                Tracking #{pendingUpload.report.trackingNumber || pendingUpload.trackingNumber}
                {pendingUpload.report.facilityId ? ` · ${pendingUpload.report.facilityId}` : ""}
              </p>
            </div>
            <div className={styles.uploadPanelActions}>
              <label className={styles.chooseFileButton}>
                {uploading ? "Uploading…" : "Choose Photo or File"}
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  disabled={uploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadAttachment(file);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
              <button type="button" disabled={uploading} onClick={() => setPendingUpload(null)}>Cancel</button>
            </div>
          </section>
        )}
        {showTechAccess && (
          <section className={styles.techManager}>
            <div className={styles.techManagerHeader}>
              <div><h2>Technician Report Access</h2><p>Add a technician and assign a unique four-digit code.</p></div>
              <button type="button" onClick={() => setShowTechAccess(false)}>Close</button>
            </div>
            <form onSubmit={addTechnician}>
              <input aria-label="Technician name" placeholder="Technician full name" value={techName} onChange={(event) => setTechName(event.target.value)} required />
              <input aria-label="Four-digit code" placeholder="4-digit code" type="password" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} value={techPin} onChange={(event) => setTechPin(event.target.value.replace(/\D/g, ""))} required />
              <button disabled={savingTech}>{savingTech ? "Adding…" : "Add Technician"}</button>
            </form>
            <div className={styles.techList}>
              {technicians.map((tech) => (
                <div key={tech.id}>
                  <strong>{tech.name}</strong>
                  <label><input type="checkbox" checked={tech.active} onChange={(event) => void setTechnicianActive(tech, event.target.checked)} /> Access active</label>
                  <button type="button" onClick={() => void deleteTechnician(tech)}>Delete</button>
                </div>
              ))}
              {!technicians.length && <p>No technician access codes have been added yet.</p>}
            </div>
          </section>
        )}
        <div className={styles.tabs}>
          {TABS.map((item) => (
            <button
              key={item.key}
              className={tab === item.key ? styles.activeTab : ""}
              onClick={() => setTab(item.key)}
            >
              {item.label}
              <span>
                {item.key === "all"
                  ? allJobHistories.length
                  : allJobHistories.filter((history) =>
                    history.reports.some((report) => categoryOf(report) === item.key)
                  ).length}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.statusTabs} aria-label="Report workflow status">
          {STATUS_TABS.map((item) => {
            const count = jobHistories.filter((history) => history.status === item.key).length;
            return <button key={item.key} className={statusTab === item.key ? styles.activeStatusTab : ""} onClick={() => setStatusTab(item.key)}>{item.label}<span>{count}</span></button>;
          })}
        </div>

        {tab === "tugger" && (
          <div className={styles.subtabs}>
            <button
              className={tuggerView === "reports" ? styles.activeSubtab : ""}
              onClick={() => setTuggerView("reports")}
            >
              Completed Tugger Reports
            </button>
            <button
              className={tuggerView === "history" ? styles.activeSubtab : ""}
              onClick={() => setTuggerView("history")}
            >
              Tugger Work History
            </button>
          </div>
        )}
        {tab === "gas" && (
          <div className={styles.subtabs}>
            <button className={gasView === "reports" ? styles.activeSubtab : ""} onClick={() => setGasView("reports")}>
              Completed Gas Sensor Reports
            </button>
            <button className={gasView === "history" ? styles.activeSubtab : ""} onClick={() => setGasView("history")}>
              Gas Sensor Work History
            </button>
          </div>
        )}

        <div className={styles.summary}>
          <div>
            <strong>{tuggerHistoryMode ? tuggerHistory.length : gasHistoryMode ? gasHistory.length : shown.length}</strong>
            <span>
              {tuggerHistoryMode
                ? "tuggers worked on"
                : gasHistoryMode
                  ? "sensor service records"
                : tab === "all"
                  ? "completed jobs"
                  : TABS.find((item) => item.key === tab)?.label}
            </span>
          </div>
          <input
            aria-label="Search reports"
            placeholder={
              tuggerHistoryMode
                ? "Search technician, tracking, tugger, serial…"
                : gasHistoryMode
                  ? "Search location ID, sensor tag, serial…"
                : "Search technician or tracking number…"
            }
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        {searchingAllReports && (
          <p className={styles.searchScope}>Searching Job Complete, Need Parts, and Need to Return</p>
        )}

        {loadingReports && (
          <p className={styles.empty}>
            Loading completed reports{loadProgress.total ? ` — ${loadProgress.loaded} of ${loadProgress.total}` : "…"}
          </p>
        )}
        {error && (
          <p className={styles.error}>
            Could not load all reports. <button type="button" onClick={() => void loadReports()}>Try again</button>
          </p>
        )}

        {gasHistoryMode ? (
          <div className={styles.gasHistoryWrap}>
            <table className={styles.gasHistoryTable}>
              <thead><tr><th>Date</th><th>Location ID</th><th>Address</th><th>Sensor Location / Tag</th><th>Manufacturer</th><th>Model</th><th>Serial #</th><th>Target Gas</th><th>Gas Standard</th><th>Technician</th><th>Tracking #</th><th>Notes</th><th>Report</th></tr></thead>
              <tbody>
                {gasHistory.map(({ sheet, report, index }) => (
                  <tr key={`${report.id}-sensor-${index}`}>
                    <td>{report.reportDate || "—"}</td>
                    <td><strong>{report.facilityId || report.customerName || "—"}</strong></td>
                    <td>{report.facilityAddress || "—"}</td>
                    <td>{sheet.tag || report.sensorTag || "See PDF"}</td>
                    <td>{sheet.manufacturer || report.manufacturer || "See PDF"}</td>
                    <td>{sheet.model || report.model || "See PDF"}</td>
                    <td>{sheet.serial || report.serialNumber || "See PDF"}</td>
                    <td>{sheet.gas || report.sensorType || "See PDF"}</td>
                    <td>{sheet.gasStandard || "See PDF"}</td>
                    <td>{report.technician || "—"}</td>
                    <td>{report.trackingNumber || "—"}</td>
                    <td className={styles.description}>{sheet.notes || "—"}</td>
                    <td><a target="_blank" rel="noreferrer" href={`/api/pm-reports?id=${encodeURIComponent(report.id)}`}>View PDF</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : tuggerHistoryMode ? (
          <div className={styles.historyWrap}>
            <table className={styles.historyTable}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Technician</th>
                  <th>Location</th>
                  <th>Tracking #</th>
                  <th>Tugger #</th>
                  <th>Manufacturer</th>
                  <th>Serial #</th>
                  <th>Description of Work</th>
                  <th>Report</th>
                </tr>
              </thead>
              <tbody>
                {tuggerHistory.map(({ item, report }, index) => (
                  <tr key={`${report.id}-${item.itemNumber || index}`}>
                    <td>{item.reportDate || report.reportDate || "—"}</td>
                    <td>{report.technician || "—"}</td>
                    <td>
                      <strong>{item.facilityId || report.facilityId || "—"}</strong>
                      <span>{item.location || report.facilityAddress || ""}</span>
                    </td>
                    <td>{item.trackingNumber || report.trackingNumber || "—"}</td>
                    <td>{item.tuggerId || (item.legacy ? "See PDF" : "—")}</td>
                    <td>{item.manufacturer || (item.legacy ? "See PDF" : "—")}</td>
                    <td>{item.serialNumber || (item.legacy ? "See PDF" : "—")}</td>
                    <td className={styles.description}>{item.description || "—"}</td>
                    <td>
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={`/api/pm-reports?id=${encodeURIComponent(report.id)}`}
                      >
                        View PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.list}>
            {technicianGroups.map(([technicianKey, group]) => (
              <details className={styles.technicianGroup} key={technicianKey} open={query.trim() ? true : undefined}>
                <summary>
                  <span>{group.label}</span>
                  <strong>{group.histories.length} {group.histories.length === 1 ? "job" : "jobs"} · {group.reportCount} {group.reportCount === 1 ? "report" : "reports"}</strong>
                </summary>
                <div className={styles.technicianReports}>
                  {group.histories.map((history) => (
                    <details className={styles.jobHistory} key={history.key} open={query.trim() ? true : undefined}>
                      <summary>
                        <span>
                          <strong>{history.latest.customerName || history.latest.facilityId || "Customer"}</strong>
                          <small>Tracking #{history.latest.trackingNumber || "not entered"}</small>
                        </span>
                        <b>{history.reports.length} {history.reports.length === 1 ? "report" : "reports"}</b>
                      </summary>
                      {history.status === "parts" && (
                        <section className={styles.partsNotesEditor}>
                          <label htmlFor={`parts-notes-${history.latest.id}`}>Parts Notes</label>
                          <p>Record parts ordered, order dates, expected arrival, and follow-up details.</p>
                          <textarea
                            id={`parts-notes-${history.latest.id}`}
                            maxLength={5000}
                            placeholder="Example: Ordered replacement control board on 9/1. Expected delivery 9/6."
                            value={partsNoteDrafts[history.latest.id] ?? history.latest.partsNotes ?? ""}
                            onChange={(event) => setPartsNoteDrafts((current) => ({ ...current, [history.latest.id]: event.target.value }))}
                          />
                          <button type="button" disabled={savingNoteId === history.latest.id} onClick={() => void savePartsNotes(history.latest)}>
                            {savingNoteId === history.latest.id ? "Saving…" : "Save Parts Notes"}
                          </button>
                        </section>
                      )}
                      <div className={styles.jobHistoryReports}>
                  {history.reports.map((report, reportIndex) => (
                    <article key={report.id}>
                      <div>
                        <p className={styles.eyebrow}>
                          {report.reportTypeLabel || "Preventive Maintenance Report"}
                        </p>
                        <h2>
                          {report.customerName || report.facilityId || "Customer"} ·{" "}
                          {report.trackingNumber || "No tracking number"}
                        </h2>
                        <p>{report.facilityAddress || "Address not entered"}</p>
                        <p>
                          {report.technician || "Technician not entered"} ·{" "}
                          {report.reportDate || "No date"} · {report.itemCount || 0} items
                        </p>
                        {report.workArrangement && <p>{report.workArrangement === "team" ? `With team: ${report.teamMembers || "Names not entered"}` : "Worked alone"}</p>}
                        {editingCustomerId === report.id && <section className={styles.customerEditor}>
                          <label className={styles.fedexJobCheck}><input type="checkbox" checked={(customerDrafts[report.id]?.fedexJob ?? report.fedexJob) !== false} onChange={(event) => setCustomerDrafts((current) => ({ ...current, [report.id]: { fedexJob: event.target.checked, customerName: current[report.id]?.customerName ?? report.customerName ?? "" } }))} /><span>FedEx Job</span></label>
                          {(customerDrafts[report.id]?.fedexJob ?? report.fedexJob) === false && <label>Customer name<input autoFocus maxLength={250} value={customerDrafts[report.id]?.customerName ?? report.customerName ?? ""} onChange={(event) => setCustomerDrafts((current) => ({ ...current, [report.id]: { fedexJob: false, customerName: event.target.value } }))} placeholder="Enter customer name" /></label>}
                          <div><button type="button" disabled={savingCustomerId === report.id} onClick={() => void saveCustomer(report)}>{savingCustomerId === report.id ? "Saving…" : "Save Customer"}</button><button type="button" className={styles.cancelCustomerButton} onClick={() => setEditingCustomerId("")}>Cancel</button></div>
                        </section>}
                        {reportIndex > 0 && <p className={styles.priorReport}>Prior visit · {STATUS_TABS.find((item) => item.key === statusOf(report))?.label}</p>}
                        {report.partsNotes && <div className={styles.savedPartsNotes}><strong>Parts Notes</strong><span>{report.partsNotes}</span></div>}
                        {attachments.some((attachment) => attachment.reportId === report.id) && (
                          <div className={styles.attachments}>
                            <strong>Attachments</strong>
                            {attachments.filter((attachment) => attachment.reportId === report.id).map((attachment) => (
                              <a key={attachment.id} target="_blank" rel="noreferrer" href={`/api/pm-report-attachments?id=${encodeURIComponent(attachment.id)}`}>
                                {attachment.filename || "Open attachment"}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={styles.reportActions}>
                        <div className={styles.statusChecks} aria-label="Report status">
                          {STATUS_TABS.map((item) => (
                            <label key={item.key}>
                              <input
                                type="checkbox"
                                checked={statusOf(report) === item.key}
                                disabled={updatingId === report.id}
                                onChange={() => updateWorkflowStatus(report, item.key)}
                              />
                              <span>{item.label}</span>
                            </label>
                          ))}
                        </div>
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={`/api/pm-reports?id=${encodeURIComponent(report.id)}`}
                        >
                          View PDF
                        </a>
                        <button type="button" className={styles.editPdfButton} disabled={editingPdfId === report.id} onClick={() => void deletePdfPages(report)}>
                          {editingPdfId === report.id ? "Updating PDF…" : "Delete PDF Page"}
                        </button>
                        {report.fedexJob !== false && (
                          <button type="button" className={styles.editCustomerButton} disabled={updatingId === report.id} onClick={() => void editFedExTrackingNumber(report)}>
                            Edit Tracking #
                          </button>
                        )}
                        <button type="button" className={styles.editCustomerButton} onClick={() => editCustomer(report)}>Edit Customer</button>
                        <button
                          type="button"
                          onClick={() => deleteReport(report)}
                          disabled={deletingId === report.id}
                        >
                          {deletingId === report.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </article>
                  ))}
                      </div>
                    </details>
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}

        {!loadingReports && !error && (tuggerHistoryMode ? tuggerHistory.length === 0 : gasHistoryMode ? gasHistory.length === 0 : shown.length === 0) && (
          <p className={styles.empty}>
            {tuggerHistoryMode
              ? "No Tugger work-history records yet. New completed Tugger reports will be added automatically."
              : gasHistoryMode
                ? "No Gas Sensor work-history records found for this location or search."
              : "No completed reports found in this category."}
          </p>
        )}
      </section>
    </main>
  );
}
