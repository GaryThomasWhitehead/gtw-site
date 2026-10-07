"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./corrective-actions.module.css";

type Action = { id: string; assetTag: string; repairNeeded: string; urgency: string; serviceChannelWo: string; sourceReportId?: string };
type Report = { id: string; category?: string; facilityId?: string; customerName?: string; trackingNumber?: string; reportDate?: string; technician?: string; correctiveActions?: Action[]; correctiveScanAt?: string };

export default function CorrectiveActionsClient() {
  const [reports, setReports] = useState<Report[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Action[]>>({});
  const [dirtyReportIds, setDirtyReportIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState({ loaded: 0, total: 0, stage: "Loading PM report list…" });
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ done: 0, total: 0, found: 0 });
  const [saving, setSaving] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [recipients, setRecipients] = useState("gary@frontlineworldwide.com");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    setLoadProgress({ loaded: 0, total: 0, stage: "Loading PM report list…" });
    try {
      setLoadProgress({ loaded: 0, total: 1, stage: "Loading corrective-action records" });
      const response = await fetch("/api/pm-reports?mode=corrective", { cache: "no-store" });
      if (!response.ok) throw new Error((await response.text()) || `Could not load reports (${response.status})`);
      const pm: Report[] = await response.json();
      setLoadProgress({ loaded: 1, total: 1, stage: "Corrective-action records ready" });
      setReports(pm);
      setDrafts(Object.fromEntries(pm.map((report) => [report.id, report.correctiveActions || []])));
    } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const groups = useMemo(() => reports.filter((report) => (drafts[report.id] || []).length > 0), [reports, drafts]);
  const totalActions = groups.reduce((total, report) => total + (drafts[report.id] || []).length, 0);
  const unscanned = reports.filter((report) => !report.correctiveScanAt);

  function update(reportId: string, actionId: string, field: keyof Omit<Action, "id" | "sourceReportId">, value: string) {
    setDrafts((current) => ({ ...current, [reportId]: (current[reportId] || []).map((action) => action.id === actionId ? { ...action, [field]: value } : action) }));
    setDirtyReportIds((current) => new Set(current).add(reportId));
  }
  function remove(reportId: string, actionId: string) {
    setDrafts((current) => ({ ...current, [reportId]: (current[reportId] || []).filter((action) => action.id !== actionId) }));
    setDirtyReportIds((current) => new Set(current).add(reportId));
  }
  function add(report: Report) {
    const action: Action = { id: crypto.randomUUID(), assetTag: "", repairNeeded: "", urgency: "This week", serviceChannelWo: "", sourceReportId: report.id };
    setDrafts((current) => ({ ...current, [report.id]: [...(current[report.id] || []), action] }));
    setDirtyReportIds((current) => new Set(current).add(report.id));
  }

  async function saveAll() {
    setSaving(true); setError(""); setMessage("");
    try {
      if (!dirtyReportIds.size) { setMessage("No unsaved changes."); return; }
      for (const report of reports.filter((item) => dirtyReportIds.has(item.id))) {
        const correctiveActions = drafts[report.id] || [];
        const response = await fetch("/api/pm-reports", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: report.id, correctiveActions }) });
        if (!response.ok) throw new Error(await response.text());
      }
      setDirtyReportIds(new Set());
      setMessage("Corrective actions saved.");
    } catch (cause) { setError(`Could not save: ${cause instanceof Error ? cause.message : String(cause)}`); }
    finally { setSaving(false); }
  }

  async function scanReports() {
    if (!unscanned.length) { setMessage("All PM reports have already been scanned."); return; }
    setScanning(true); setError(""); setMessage(""); setScanProgress({ done: 0, total: unscanned.length, found: 0 });
    let found = 0;
    try {
      for (let index = 0; index < unscanned.length; index += 1) {
        const report = unscanned[index];
        const response = await fetch("/api/corrective-actions/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: report.id }) });
        const responseText = await response.text();
        if (!response.ok) throw new Error(responseText || `The scanner returned error ${response.status} for ${report.facilityId || report.trackingNumber || "a PM report"}.`);
        const result = JSON.parse(responseText);
        found += Number(result.found || 0);
        setReports((current) => current.map((item) => item.id === report.id ? { ...item, correctiveActions: result.report.correctiveActions || [], correctiveScanAt: result.report.correctiveScanAt } : item));
        setDrafts((current) => ({ ...current, [report.id]: result.report.correctiveActions || [] }));
        setScanProgress({ done: index + 1, total: unscanned.length, found });
      }
      setMessage(`Scan complete. ${found} new corrective action${found === 1 ? "" : "s"} added for review.`);
    } catch (cause) { setError(`Scan stopped: ${cause instanceof Error ? cause.message : String(cause)}`); }
    finally { setScanning(false); }
  }

  async function emailForm() {
    setEmailing(true); setError(""); setMessage("");
    try {
      for (const report of reports.filter((item) => dirtyReportIds.has(item.id))) {
        const response = await fetch("/api/pm-reports", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: report.id, correctiveActions: drafts[report.id] || [] }) });
        if (!response.ok) throw new Error(`Could not save changes before emailing: ${(await response.text()) || response.status}`);
      }
      setDirtyReportIds(new Set());
      const actions = groups.flatMap((report) => (drafts[report.id] || []).map((action) => ({ ...action, facilityId: report.facilityId || report.customerName || "", trackingNumber: report.trackingNumber || "" })));
      const response = await fetch("/api/corrective-actions/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipients, actions }) });
      if (!response.ok) throw new Error(await response.text());
      setMessage("Corrective-actions PDF and live form link emailed successfully.");
    } catch (cause) { setError(`Could not email form: ${cause instanceof Error ? cause.message : String(cause)}`); }
    finally { setEmailing(false); }
  }

  return <main className={styles.page}>
    <header><div><p>FRONTLINE PRO SERVICES</p><h1>Corrective Actions Needed</h1></div><nav><a href="/pm-reports">Completed Reports</a><a href="/fedex-tracker">Back to Tracker</a></nav></header>
    <section className={styles.content}>
      <div className={styles.toolbar}>
        <div><strong>{totalActions}</strong><span>open action lines</span><small>{unscanned.length} PM reports not yet scanned</small></div>
        <button style={scanning || loading ? { cursor: "not-allowed" } : undefined} disabled={scanning || loading} onClick={() => void scanReports()}>{loading ? "Preparing Reports…" : scanning ? "Scanning…" : "Scan New PM Reports"}</button>
        <button disabled={saving || loading} onClick={() => void saveAll()}>{saving ? "Saving…" : "Save All Changes"}</button>
      </div>
      {loading && <div className={styles.progress} role="status" aria-live="polite"><strong>{loadProgress.stage}{loadProgress.total ? ` — ${loadProgress.loaded} of ${loadProgress.total}` : ""}</strong><progress max={loadProgress.total || 1} value={loadProgress.loaded} /><span>The Scan button will be available when the report list is ready.</span></div>}
      {scanning && <div className={styles.progress}><strong>Scanning PM reports — {scanProgress.done} of {scanProgress.total}</strong><progress max={scanProgress.total || 1} value={scanProgress.done} /><span>{scanProgress.found} new action lines found</span></div>}
      <div className={styles.emailBar}><label>Email to <input value={recipients} onChange={(event) => setRecipients(event.target.value)} placeholder="email@example.com, another@example.com" /></label><button disabled={emailing || !totalActions} onClick={() => void emailForm()}>{emailing ? "Emailing…" : "Email This Form"}</button></div>
      {message && <p className={styles.success}>{message}</p>}{error && <p className={styles.error}>{error}</p>}
      {loading ? <p className={styles.empty}>Loading corrective actions…</p> : groups.length ? groups.map((report) => <section className={styles.group} key={report.id}>
        <div className={styles.groupHeader}><div><h2>{report.facilityId || report.customerName || "Facility"}</h2><p>Tracking #{report.trackingNumber || "not entered"} · {report.reportDate || "No date"}</p></div><button onClick={() => add(report)}>+ Add Line</button></div>
        <div className={styles.tableWrap}><table><thead><tr><th>Asset / Tag</th><th>Repair Needed</th><th>Urgency</th><th>SC WO #</th><th>Job Report</th><th>Delete</th></tr></thead><tbody>{(drafts[report.id] || []).map((action) => <tr key={action.id}>
          <td><input value={action.assetTag} onChange={(event) => update(report.id, action.id, "assetTag", event.target.value)} /></td>
          <td><textarea value={action.repairNeeded} onChange={(event) => update(report.id, action.id, "repairNeeded", event.target.value)} /></td>
          <td><select value={action.urgency} onChange={(event) => update(report.id, action.id, "urgency", event.target.value)}><option>Immediate</option><option>24–72 hours</option><option>This week</option><option>1–2 weeks</option><option>Planned</option></select></td>
          <td><input value={action.serviceChannelWo} onChange={(event) => update(report.id, action.id, "serviceChannelWo", event.target.value)} /></td>
          <td><a target="_blank" rel="noreferrer" href={`/api/pm-reports?id=${encodeURIComponent(action.sourceReportId || report.id)}`}>View PDF</a></td>
          <td><button className={styles.deleteButton} onClick={() => remove(report.id, action.id)}>Delete</button></td>
        </tr>)}</tbody></table></div>
      </section>) : <p className={styles.empty}>No corrective actions have been found yet. Use Scan New PM Reports to review unscanned PM reports.</p>}
    </section>
  </main>;
}
