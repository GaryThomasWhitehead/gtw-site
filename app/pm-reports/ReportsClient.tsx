"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./reports.module.css";

type Category = "all" | "regular" | "proposed" | "pm" | "tugger";
type TuggerView = "reports" | "history";
type TuggerWorkRecord = {
  itemNumber?: number;
  location?: string;
  facilityId?: string;
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
  itemCount?: number;
  tuggerWorkRecords?: TuggerWorkRecord[];
};

const TABS: { key: Category; label: string }[] = [
  { key: "all", label: "All Reports" },
  { key: "regular", label: "Regular Jobs" },
  { key: "proposed", label: "Proposed Work" },
  { key: "pm", label: "Preventive Maintenance" },
  { key: "tugger", label: "Tugger" },
];
const categoryOf = (report: Report) => report.category || "pm";
const normalizedSearch = (value: unknown) =>
  String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const reportMatches = (report: Report, query: string) => {
  const terms = [
    report.technician,
    report.trackingNumber,
    report.facilityId,
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
  const [tuggerView, setTuggerView] = useState<TuggerView>("reports");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    fetch("/api/pm-reports", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text());
        return response.json();
      })
      .then(setReports)
      .catch((cause) => setError(String(cause)));
  }, []);

  const shown = useMemo(
    () =>
      reports.filter(
        (report) =>
          (tab === "all" || categoryOf(report) === tab) &&
          reportMatches(report, query),
      ),
    [reports, query, tab],
  );

  const tuggerHistory = useMemo(
    () =>
      reports
        .filter((report) => categoryOf(report) === "tugger")
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
    [reports, query],
  );
  const historyMode = tab === "tugger" && tuggerView === "history";

  async function deleteReport(report: Report) {
    const label = report.trackingNumber || report.facilityId || "this report";
    if (!confirm(`Permanently delete ${label}? This cannot be undone.`)) return;
    setDeletingId(report.id);
    setError("");
    try {
      const response = await fetch(
        `/api/pm-reports?id=${encodeURIComponent(report.id)}`,
        { method: "DELETE" },
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

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p>FRONTLINE PRO SERVICES</p>
          <h1>Completed Reports</h1>
        </div>
        <div className={styles.actions}>
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
            {shown.map((report) => (
              <article key={report.id}>
                <div>
                  <p className={styles.eyebrow}>
                    {report.reportTypeLabel || "Preventive Maintenance Report"}
                  </p>
                  <h2>
                    {report.facilityId || "Facility"} ·{" "}
                    {report.trackingNumber || "No tracking number"}
                  </h2>
                  <p>{report.facilityAddress || "Address not entered"}</p>
                  <p>
                    {report.technician || "Technician not entered"} ·{" "}
                    {report.reportDate || "No date"} · {report.itemCount || 0} items
                  </p>
                </div>
                <div className={styles.reportActions}>
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
