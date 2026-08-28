"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./reports.module.css";

type Category = "all" | "regular" | "proposed" | "pm" | "tugger";
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
};
type ReportAttachment = {
  id: string;
  reportId: string;
  trackingNumber?: string;
  filename?: string;
};

const TABS: { key: Category; label: string }[] = [
  { key: "all", label: "All Reports" },
  { key: "regular", label: "Regular Jobs" },
  { key: "proposed", label: "Proposed Work" },
  { key: "pm", label: "Preventive Maintenance" },
  { key: "tugger", label: "Tugger" },
];
const categoryOf = (report: Report) => report.category || "pm";
const statusOf = (report: Report): WorkflowStatus => report.workflowStatus || "complete";
const STATUS_TABS: { key: WorkflowStatus; label: string }[] = [
  { key: "complete", label: "Job Complete" },
  { key: "parts", label: "Need Parts" },
  { key: "return", label: "Need to Return" },
];
const normalizedSearch = (value: unknown) =>
  String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const technicianIdentity = (value: unknown) => {
  const parts = String(value || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "technician-not-entered";
  if (parts.length === 1) return normalizedSearch(parts[0]);
  return `${normalizedSearch(parts[0])}-${normalizedSearch(parts.at(-1))}`;
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

export default function ReportsClient() {
  const [reports, setReports] = useState<Report[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Category>("all");
  const [statusTab, setStatusTab] = useState<WorkflowStatus>("complete");
  const [tuggerView, setTuggerView] = useState<TuggerView>("reports");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [attachments, setAttachments] = useState<ReportAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{ report: Report; trackingNumber: string } | null>(null);

  useEffect(() => {
    fetch("/api/pm-reports", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text());
        return response.json();
      })
      .then(setReports)
      .catch((cause) => setError(String(cause)));
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

  const shown = useMemo(
    () =>
      reports.filter(
        (report) =>
          (tab === "all" || categoryOf(report) === tab) &&
          statusOf(report) === statusTab &&
          reportMatches(report, query),
      ),
    [reports, query, tab, statusTab],
  );

  const technicianGroups = useMemo(() => {
    const groups = new Map<string, { label: string; reports: Report[] }>();
    shown.forEach((report) => {
      const technician = report.technician?.trim() || "Technician not entered";
      const key = technicianIdentity(technician);
      const current = groups.get(key);
      groups.set(key, {
        label: current && current.label.length <= technician.length ? current.label : technician,
        reports: [...(current?.reports || []), report],
      });
    });
    return Array.from(groups.entries()).sort(([, left], [, right]) =>
      left.label.localeCompare(right.label, undefined, { sensitivity: "base" }),
    );
  }, [shown]);

  const tuggerHistory = useMemo(
    () =>
      reports
        .filter((report) => categoryOf(report) === "tugger")
        .filter((report) => statusOf(report) === statusTab)
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
    [reports, query, statusTab],
  );
  const historyMode = tab === "tugger" && tuggerView === "history";

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
    document.getElementById("report-attachment-input")?.click();
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

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p>FRONTLINE PRO SERVICES</p>
          <h1>Completed Reports</h1>
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={startAttachmentUpload} disabled={uploading}>
            {uploading ? "Uploading…" : "Upload to Report"}
          </button>
          <input
            id="report-attachment-input"
            className={styles.hiddenFileInput}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadAttachment(file);
              event.currentTarget.value = "";
            }}
          />
          <a href="/pm-report">New Report</a>
          <a href="/fedex-tracker">Back to Tracker</a>
        </div>
      </header>
      <section className={styles.content}>
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
                  ? reports.length
                  : reports.filter((report) => categoryOf(report) === item.key).length}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.statusTabs} aria-label="Report workflow status">
          {STATUS_TABS.map((item) => {
            const count = reports.filter((report) =>
              (tab === "all" || categoryOf(report) === tab) && statusOf(report) === item.key
            ).length;
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

        <div className={styles.summary}>
          <div>
            <strong>{historyMode ? tuggerHistory.length : shown.length}</strong>
            <span>
              {historyMode
                ? "tuggers worked on"
                : tab === "all"
                  ? "completed reports"
                  : TABS.find((item) => item.key === tab)?.label}
            </span>
          </div>
          <input
            aria-label="Search reports"
            placeholder={
              historyMode
                ? "Search technician, tracking, tugger, serial…"
                : "Search technician or tracking number…"
            }
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {error && <p className={styles.error}>Could not load reports: {error}</p>}

        {historyMode ? (
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
                  <strong>{group.reports.length} {group.reports.length === 1 ? "report" : "reports"}</strong>
                </summary>
                <div className={styles.technicianReports}>
                  {group.reports.map((report) => (
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
        )}

        {!error && (historyMode ? tuggerHistory.length === 0 : shown.length === 0) && (
          <p className={styles.empty}>
            {historyMode
              ? "No Tugger work-history records yet. New completed Tugger reports will be added automatically."
              : "No completed reports found in this category."}
          </p>
        )}
      </section>
    </main>
  );
}
