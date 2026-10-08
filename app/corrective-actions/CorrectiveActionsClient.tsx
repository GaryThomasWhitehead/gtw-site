"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./corrective-actions.module.css";
import fedexStyles from "./fedex-form.module.css";
import controlStyles from "./form-controls.module.css";

type Action = { id: string; assetTag: string; repairNeeded: string; urgency: string; serviceChannelWo: string; sourceReportId?: string };
type Report = { id: string; category?: string; facilityId?: string; customerName?: string; trackingNumber?: string; reportDate?: string; technician?: string; correctiveActions?: Action[]; correctiveScanAt?: string; correctiveScanVersion?: number };
const CORRECTIVE_SCAN_VERSION = 3;
const JOB_PLANS = ["SLIDER BED CONVEYOR", "SLIDER BED CONVEYOR W/ MOTORIZED PULLEY", "WASP 1-STAGE EXTENDO", "WASP 1-STAGE W/ MOTORIZED PULLEY", "SRS/MHS 1-STAGE EXTENDO", "NORTECH 1-STAGE EXTENDO", "SHB 1-STAGE EXTENDO", "SHB 1-STAGE W/ MOTORIZED PULLEY", "LEWCO ROLLERS", "SRS/MHS 3-STAGE EXTENDO", "NORTECH 3-STAGE EXTENDO", "WASP 5-STAGE EXTENDO", "WASP 5-STAGE W/ SWAK", "SRS 5-STAGE EXTENDO", "CALJAN 5-STAGE EXTENDO", "MAXX 5-STAGE EXTENDO", "PLAK STATION", "E-STOP", "INTERROLL POWER CURVE", "PORTEC POWER CURVE", "PSC/FLOTURN POWER CURVE", "TRANSNORM POWER CURVE", "INTRALOX", "POWERED ROLLER CONVEYOR", "RTU/RTI", "GRAVITY CONVEYOR, CHUTES & GATES", "MCP"];
type ReportAttachment = { id: string; reportId: string; filename?: string; description?: string; contentType?: string };
type Part = { partNumber: string; description: string; manufacturer: string; qtyNeeded: string; qtyOnHand: string; asset: string };
const blankPart = (): Part => ({ partNumber: "", description: "", manufacturer: "", qtyNeeded: "", qtyOnHand: "", asset: "" });
const blankParts = (count = 18) => Array.from({ length: count }, blankPart);

function locationName(report: Report) {
  return (report.facilityId || report.customerName || "Facility").trim() || "Facility";
}

function locationKey(report: Report) {
  return locationName(report).toLowerCase().replace(/\s+/g, " ");
}

function searchableWords(value: string) {
  const ignored = new Set(["about", "after", "also", "been", "from", "have", "into", "item", "needs", "photo", "report", "that", "the", "this", "with", "work"]);
  return new Set(value.toLowerCase().match(/[a-z0-9-]{3,}/g)?.filter((word) => !ignored.has(word)) || []);
}

function relatedPictures(action: Action, attachments: ReportAttachment[]) {
  const candidates = attachments.filter((attachment) => attachment.reportId === (action.sourceReportId || "") && String(attachment.contentType || "").startsWith("image/"));
  const target = searchableWords(`${action.assetTag} ${action.repairNeeded}`);
  const scored = candidates.map((attachment) => {
    let score = 0;
    for (const word of searchableWords(`${attachment.description || ""} ${attachment.filename || ""}`)) if (target.has(word)) score += word.length > 6 ? 2 : 1;
    if (action.assetTag && String(attachment.description || "").toLowerCase().includes(action.assetTag.toLowerCase())) score += 6;
    return { attachment, score };
  }).sort((a, b) => b.score - a.score);
  const matched = scored.filter((item) => item.score > 0).map((item) => item.attachment);
  return (matched.length ? matched : candidates).slice(0, 4);
}

export default function CorrectiveActionsClient({ readOnly = false }: { readOnly?: boolean }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Action[]>>({});
  const [attachments, setAttachments] = useState<ReportAttachment[]>([]);
  const [partsByLocation, setPartsByLocation] = useState<Record<string, Part[]>>({});
  const [partsDirty, setPartsDirty] = useState(false);
  const [dirtyReportIds, setDirtyReportIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState({ loaded: 0, total: 0, stage: "Loading PM report list…" });
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ done: 0, total: 0, found: 0 });
  const [saving, setSaving] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [recipients, setRecipients] = useState("gary@frontlineworldwide.com");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    setLoadProgress({ loaded: 0, total: 0, stage: "Loading PM report list…" });
    try {
      const index: { id: string }[] = [];
      let cursor = "";
      let hasMore = true;
      while (hasMore) {
        const indexResponse = await fetch(`/api/pm-reports?mode=list${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`, { cache: "no-store" });
        if (!indexResponse.ok) throw new Error("Could not load the saved report list.");
        const page = await indexResponse.json();
        const items: { id: string }[] = Array.isArray(page) ? page : Array.isArray(page?.items) ? page.items : [];
        index.push(...items);
        hasMore = !Array.isArray(page) && Boolean(page?.hasMore && page?.nextCursor);
        cursor = hasMore ? String(page.nextCursor) : "";
      }
      setLoadProgress({ loaded: 0, total: index.length, stage: "Loading saved corrective actions" });
      const loaded: Report[] = [];
      let completed = 0;
      for (let offset = 0; offset < index.length; offset += 3) {
        const batch = index.slice(offset, offset + 3);
        const ids = batch.map((item) => item.id).join(",");
        let rows: Report[] = [];
        const response = await fetch(`/api/pm-reports?ids=${encodeURIComponent(ids)}`, { cache: "no-store" });
        if (response.ok) rows = await response.json();
        else {
          for (const item of batch) {
            const retry = await fetch(`/api/pm-reports?ids=${encodeURIComponent(item.id)}`, { cache: "no-store" });
            if (retry.ok) rows.push(...await retry.json());
          }
        }
        loaded.push(...rows);
        completed += batch.length;
        setLoadProgress({ loaded: Math.min(completed, index.length), total: index.length, stage: "Loading saved corrective actions" });
      }
      const pm = loaded.filter((report) => (report.category || "pm") === "pm");
      setReports(pm);
      setDrafts(Object.fromEntries(pm.map((report) => [report.id, report.correctiveActions || []])));
      const attachmentResponse = await fetch("/api/pm-report-attachments", { cache: "no-store" });
      if (attachmentResponse.ok) setAttachments(await attachmentResponse.json());
      const formResponse = await fetch("/api/corrective-actions/form", { cache: "no-store" });
      if (formResponse.ok) {
        const saved = await formResponse.json();
        const savedByLocation = saved?.partsByLocation && typeof saved.partsByLocation === "object" ? saved.partsByLocation as Record<string, Part[]> : {};
        const nextParts = Object.fromEntries(Object.entries(savedByLocation).map(([key, value]) => {
          return [key, Array.isArray(value) ? value.slice(0, 196) : []];
        }));
        const legacyParts = Array.isArray(saved?.parts) ? saved.parts.slice(0, 196) : [];
        if (legacyParts.some((part: Part) => Object.values(part).some(Boolean))) {
          const firstReport = pm.find((report) => (report.correctiveActions || []).length);
          if (firstReport && !nextParts[locationKey(firstReport)]) nextParts[locationKey(firstReport)] = legacyParts;
        }
        setPartsByLocation(nextParts);
        setPartsDirty(false);
      }
    } catch (cause) { setError(`Could not load saved corrective actions. Please try refreshing the page. ${cause instanceof Error ? cause.message : String(cause)}`); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const groups = useMemo(() => reports.filter((report) => (drafts[report.id] || []).length > 0), [reports, drafts]);
  const locationGroups = useMemo(() => {
    const grouped = new Map<string, { key: string; name: string; reports: Report[] }>();
    for (const report of groups) {
      const key = locationKey(report);
      const current = grouped.get(key) || { key, name: locationName(report), reports: [] };
      current.reports.push(report);
      grouped.set(key, current);
    }
    return [...grouped.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [groups]);
  const totalActions = groups.reduce((total, report) => total + (drafts[report.id] || []).length, 0);
  const unscanned = reports.filter((report) => !report.correctiveScanAt || Number(report.correctiveScanVersion || 0) < CORRECTIVE_SCAN_VERSION);

  function partsForLocation(key: string, count = 18) {
    const current = (partsByLocation[key] || []).slice(0, count);
    return [...current, ...blankParts(Math.max(0, count - current.length))];
  }

  function updatePart(key: string, index: number, field: keyof Part, value: string) {
    setPartsByLocation((current) => {
      const existing = current[key] || [];
      const rows = [...existing, ...blankParts(Math.max(0, index + 1 - existing.length))];
      return { ...current, [key]: rows.map((part, partIndex) => partIndex === index ? { ...part, [field]: value } : part) };
    });
    setPartsDirty(true);
  }

  async function savePartsIfNeeded() {
    if (!partsDirty) return;
    const response = await fetch("/api/corrective-actions/form", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ partsByLocation }) });
    if (!response.ok) throw new Error(await response.text());
    setPartsDirty(false);
  }

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
      if (!dirtyReportIds.size && !partsDirty) { setMessage("No unsaved changes."); return; }
      for (const report of reports.filter((item) => dirtyReportIds.has(item.id))) {
        const correctiveActions = drafts[report.id] || [];
        const response = await fetch("/api/pm-reports", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: report.id, correctiveActions }) });
        if (!response.ok) throw new Error(await response.text());
      }
      await savePartsIfNeeded();
      setDirtyReportIds(new Set());
      setMessage("Corrective actions and parts saved.");
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
        setReports((current) => current.map((item) => item.id === report.id ? { ...item, correctiveActions: result.report.correctiveActions || [], correctiveScanAt: result.report.correctiveScanAt, correctiveScanVersion: result.report.correctiveScanVersion } : item));
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
      await savePartsIfNeeded();
      setDirtyReportIds(new Set());
      const actions = groups.flatMap((report) => (drafts[report.id] || []).map((action) => ({ ...action, facilityId: report.facilityId || report.customerName || "", trackingNumber: report.trackingNumber || "" })));
      const response = await fetch("/api/corrective-actions/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipients, actions, parts: Object.values(partsByLocation).flat() }) });
      if (!response.ok) throw new Error(await response.text());
      setMessage("Corrective-actions PDF and live form link emailed successfully.");
    } catch (cause) { setError(`Could not email form: ${cause instanceof Error ? cause.message : String(cause)}`); }
    finally { setEmailing(false); }
  }

  async function downloadFedexForm(location: { key: string; name: string; reports: Report[] }) {
    setExporting(true); setError(""); setMessage("");
    try {
      for (const report of reports.filter((item) => dirtyReportIds.has(item.id))) {
        const response = await fetch("/api/pm-reports", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: report.id, correctiveActions: drafts[report.id] || [] }) });
        if (!response.ok) throw new Error(`Could not save changes before exporting: ${(await response.text()) || response.status}`);
      }
      await savePartsIfNeeded();
      setDirtyReportIds(new Set());
      const actions = location.reports.flatMap((report) => (drafts[report.id] || []).map((action) => ({
        ...action,
        reportId: action.sourceReportId || report.id,
        facilityId: report.facilityId || report.customerName || "",
        trackingNumber: report.trackingNumber || "",
        reportDate: report.reportDate || "",
      })));
      const response = await fetch("/api/corrective-actions/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actions, parts: partsForLocation(location.key, actions.length), locationName: location.name }) });
      if (!response.ok) throw new Error(await response.text());
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const filename = disposition.match(/filename="([^"]+)"/)?.[1] || "FXG-Correctives-and-Parts.xlsx";
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
      setMessage(`${location.name} FedEx Correctives & Parts workbook downloaded with linked report pictures.`);
    } catch (cause) { setError(`Could not create FedEx workbook: ${cause instanceof Error ? cause.message : String(cause)}`); }
    finally { setExporting(false); }
  }

  async function archiveAndClear(location: { key: string; name: string; reports: Report[] }) {
    const locationActionCount = location.reports.reduce((total, report) => total + (drafts[report.id] || []).length, 0);
    if (!locationActionCount) return;
    const confirmed = window.confirm(`Archive ${locationActionCount} corrective-action line${locationActionCount === 1 ? "" : "s"} for ${location.name} and clear only this location?\n\nOnly continue after this workbook has been uploaded to ServiceChannel. Other locations will remain on the live form.`);
    if (!confirmed) return;
    setArchiving(true); setError(""); setMessage("");
    try {
      await savePartsIfNeeded();
      const actions = location.reports.flatMap((report) => (drafts[report.id] || []).map((action) => ({
        ...action,
        reportId: action.sourceReportId || report.id,
        facilityId: report.facilityId || report.customerName || "",
        trackingNumber: report.trackingNumber || "",
        reportDate: report.reportDate || "",
      })));
      const response = await fetch("/api/corrective-actions/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "archive-and-clear", locationKey: location.key, reportIds: location.reports.map((report) => report.id), actions, parts: partsForLocation(location.key, locationActionCount) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Could not archive and clear the form.");
      setReports((current) => current.map((report) => location.reports.some((group) => group.id === report.id) ? { ...report, correctiveActions: [] } : report));
      setDrafts((current) => ({ ...current, ...Object.fromEntries(location.reports.map((report) => [report.id, []])) }));
      setPartsByLocation((current) => ({ ...current, [location.key]: blankParts() }));
      setPartsDirty(false);
      setDirtyReportIds((current) => new Set([...current].filter((id) => !location.reports.some((report) => report.id === id))));
      setMessage(`${result.actionCount || locationActionCount} ${location.name} corrective-action line${Number(result.actionCount || locationActionCount) === 1 ? "" : "s"} archived. Other locations remain available.`);
    } catch (cause) { setError(`Could not archive and clear: ${cause instanceof Error ? cause.message : String(cause)}`); }
    finally { setArchiving(false); }
  }

  return <main className={styles.page}>
    <header><div><p>FRONTLINE PRO SERVICES</p><h1>Corrective Actions Needed</h1></div>{readOnly ? <span>Read-only access</span> : <nav><a href="/pm-reports">Completed Reports</a><a href="/fedex-tracker">Back to Tracker</a></nav>}</header>
    <section className={styles.content}>
      <div className={styles.toolbar}>
        <div><strong>{totalActions}</strong><span>open action lines</span>{!readOnly && <small>{unscanned.length} PM reports not yet scanned</small>}</div>
        {!readOnly && <button style={scanning || loading ? { cursor: "not-allowed" } : undefined} disabled={scanning || loading} onClick={() => void scanReports()}>{loading ? "Preparing Reports…" : scanning ? "Scanning…" : "Scan New PM Reports"}</button>}
        {!readOnly && <button disabled={saving || loading} onClick={() => void saveAll()}>{saving ? "Saving…" : "Save All Changes"}</button>}
      </div>
      {loading && <div className={styles.progress} role="status" aria-live="polite"><strong>{loadProgress.stage}{loadProgress.total ? ` — ${loadProgress.loaded} of ${loadProgress.total}` : ""}</strong><progress max={loadProgress.total || 1} value={loadProgress.loaded} /><span>The Scan button will be available when the report list is ready.</span></div>}
      {scanning && <div className={styles.progress}><strong>Scanning PM reports — {scanProgress.done} of {scanProgress.total}</strong><progress max={scanProgress.total || 1} value={scanProgress.done} /><span>{scanProgress.found} new action lines found</span></div>}
      {!readOnly && <div className={styles.emailBar}><label>Email to <input value={recipients} onChange={(event) => setRecipients(event.target.value)} placeholder="email@example.com, another@example.com" /></label><button disabled={emailing || !totalActions} onClick={() => void emailForm()}>{emailing ? "Emailing…" : "Email This Form"}</button></div>}
      {message && <p className={styles.success}>{message}</p>}{error && <p className={styles.error}>{error}</p>}
      {loading ? <p className={styles.empty}>Loading corrective actions…</p> : locationGroups.length ? <div className={styles.locationForms}>{locationGroups.map((location) => {
        const locationDates = location.reports.map((report) => report.reportDate || "").filter(Boolean).sort();
        const locationServiceChannelNumbers = [...new Set(location.reports.flatMap((report) => (drafts[report.id] || []).map((action) => action.serviceChannelWo).filter(Boolean)))];
        const locationActionCount = location.reports.reduce((total, report) => total + (drafts[report.id] || []).length, 0);
        const locationParts = partsForLocation(location.key, Math.max(1, locationActionCount));
        return <section className={fedexStyles.fedexForm} key={location.key}>
        <div className={styles.locationHeader}><div><h2>{location.name}</h2><span>{locationActionCount} open action line{locationActionCount === 1 ? "" : "s"}</span></div>{!readOnly && <div><button disabled={exporting} onClick={() => void downloadFedexForm(location)}>{exporting ? "Building…" : `Download ${location.name} Form`}</button><button className={styles.archiveButton} disabled={archiving} onClick={() => void archiveAndClear(location)}>{archiving ? "Archiving…" : "Uploaded / Archive / Clear"}</button></div>}</div>
        <div className={fedexStyles.jobPlans}>{JOB_PLANS.map((plan) => <div key={plan}>{plan}<span>JOB PLAN</span></div>)}<div className={fedexStyles.instructions}>INSTRUCTIONS</div></div>
        <div className={fedexStyles.formMeta}>
          <div><strong>PM Start Date:</strong><span>{locationDates[0] || "—"}</span></div>
          <div><strong>PM End Date:</strong><span>{locationDates.at(-1) || "—"}</span></div>
          <div><strong>ServiceChannel WO#:</strong><span>{locationServiceChannelNumbers.join(", ") || "—"}</span></div>
        </div>
        <div className={fedexStyles.sheetGrid}><section><div className={fedexStyles.formTitle}>PARTS NEEDED FOR CORRECTIVES</div><div className={styles.tableWrap}><table className={fedexStyles.partsTable}><thead><tr><th>Part Number</th><th>Description</th><th>Manufacturer</th><th>Qty Needed</th><th>Qty On-hand</th><th>Asset</th></tr></thead><tbody>{locationParts.map((part, index) => <tr key={index}>{(Object.keys(part) as (keyof Part)[]).map((field) => <td key={field}><input className={controlStyles.partsInput} disabled={readOnly} value={part[field]} onChange={(event) => updatePart(location.key, index, field, event.target.value)} aria-label={`${location.name} ${field} row ${index + 1}`} /></td>)}</tr>)}</tbody></table></div></section><section><div className={fedexStyles.formTitle}>CORRECTIVE ACTIONS NEEDED</div>
        <div className={styles.tableWrap}><table className={fedexStyles.fedexTable}><thead><tr><th>Asset / Tag ID</th><th>Repair Needed</th><th>Urgency</th><th>SC WO #</th><th>Pictures / Job Report</th>{!readOnly && <th>Delete</th>}</tr></thead><tbody>{location.reports.flatMap((report) => [
          <tr className={fedexStyles.sourceRow} key={`${report.id}-source`}><td colSpan={readOnly ? 5 : 6}><strong>{report.facilityId || report.customerName || "Facility"}</strong> · Tracking #{report.trackingNumber || "not entered"} · {report.reportDate || "No date"}{!readOnly && <button onClick={() => add(report)}>+ Add Line</button>}</td></tr>,
          ...(drafts[report.id] || []).map((action) => {
            const pictures = relatedPictures({ ...action, sourceReportId: action.sourceReportId || report.id }, attachments);
            const reportId = action.sourceReportId || report.id;
            return <tr key={action.id}>
              <td><input disabled={readOnly} value={action.assetTag} onChange={(event) => update(report.id, action.id, "assetTag", event.target.value)} /></td>
              <td><textarea disabled={readOnly} value={action.repairNeeded} onChange={(event) => update(report.id, action.id, "repairNeeded", event.target.value)} /></td>
              <td><select disabled={readOnly} value={action.urgency} onChange={(event) => update(report.id, action.id, "urgency", event.target.value)}><option>Immediate</option><option>24–72 hours</option><option>This week</option><option>1–2 weeks</option><option>Planned</option></select></td>
              <td><input disabled={readOnly} value={action.serviceChannelWo} onChange={(event) => update(report.id, action.id, "serviceChannelWo", event.target.value)} /></td>
              <td><div className={fedexStyles.photoCell}>{pictures.length ? <>{pictures.map((picture) => <a key={picture.id} target="_blank" rel="noreferrer" title={picture.description || picture.filename || "Open full-size picture"} href={`/api/pm-report-attachments?id=${encodeURIComponent(picture.id)}`}><img src={`/api/pm-report-attachments?id=${encodeURIComponent(picture.id)}`} alt={picture.description || picture.filename || "Corrective action picture"} /></a>)}<a className={fedexStyles.pdfButton} target="_blank" rel="noreferrer" href={`/api/pm-reports?id=${encodeURIComponent(reportId)}`}>View PDF</a></> : <a className={controlStyles.reportThumb} target="_blank" rel="noreferrer" title="Open source job report" href={`/api/pm-reports?id=${encodeURIComponent(reportId)}`}><strong>PDF</strong>JOB REPORT</a>}</div></td>
              {!readOnly && <td><button className={styles.deleteButton} onClick={() => remove(report.id, action.id)}>Delete</button></td>}
            </tr>;
          }),
        ])}</tbody></table></div></section></div>
      </section>;
      })}</div> : <p className={styles.empty}>{readOnly ? "No corrective actions are currently listed." : "No corrective actions have been found yet. Use Scan New PM Reports to review unscanned PM reports."}</p>}
    </section>
  </main>;
}
