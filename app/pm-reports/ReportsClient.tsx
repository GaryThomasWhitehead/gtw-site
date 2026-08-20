"use client";
import { useEffect, useMemo, useState } from "react";
import styles from "./reports.module.css";

type Report = { id: string; technician?: string; reportDate?: string; facilityAddress?: string; trackingNumber?: string; facilityId?: string; itemCount?: number; savedAt?: string };

export default function ReportsClient() {
  const [reports, setReports] = useState<Report[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { fetch("/api/pm-reports", { cache: "no-store" }).then(async r => { if (!r.ok) throw new Error(await r.text()); return r.json(); }).then(setReports).catch(e => setError(String(e))); }, []);
  const shown = useMemo(() => reports.filter(r => JSON.stringify(r).toLowerCase().includes(query.toLowerCase())), [reports, query]);
  return <main className={styles.page}>
    <header className={styles.header}><div><p>FRONTLINE PRO SERVICES</p><h1>Completed PM Reports</h1></div><div className={styles.actions}><a href="/pm-report">New PM Form</a><a href="/fedex-tracker">Back to Tracker</a></div></header>
    <section className={styles.content}>
      <div className={styles.summary}><div><strong>{reports.length}</strong><span>completed reports</span></div><input aria-label="Search reports" placeholder="Search tracking, facility, technician…" value={query} onChange={e => setQuery(e.target.value)} /></div>
      {error && <p className={styles.error}>Could not load reports: {error}</p>}
      <div className={styles.list}>{shown.map(r => <article key={r.id}>
        <div><p className={styles.eyebrow}>{r.facilityId || "Facility"} · {r.trackingNumber || "No tracking number"}</p><h2>{r.facilityAddress || "Address not entered"}</h2><p>{r.technician || "Technician not entered"} · {r.reportDate || "No date"} · {r.itemCount || 0} items</p></div>
        <a target="_blank" rel="noreferrer" href={`/api/pm-reports?id=${encodeURIComponent(r.id)}`}>View PDF</a>
      </article>)}</div>
      {!error && shown.length === 0 && <p className={styles.empty}>No completed reports found.</p>}
    </section>
  </main>;
}
