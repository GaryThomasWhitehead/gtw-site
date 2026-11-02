"use client";

import { useState } from "react";

type Result = {
  sent?: Array<{ id: string; trackingNumber: string; reportDate: string }>;
  failed?: Array<{ id: string; error: string }>;
  remaining?: number;
  notFound?: string[];
  error?: string;
};

export default function LeoEmailBackfillPage() {
  const [message, setMessage] = useState("Ready to email Leo's saved report PDFs from the last 30 days.");
  const [running, setRunning] = useState(false);
  const [sent, setSent] = useState<Array<{ id: string; trackingNumber: string; reportDate: string }>>([]);
  const [failed, setFailed] = useState<Array<{ id: string; error: string }>>([]);
  const [notFound, setNotFound] = useState<string[]>([]);

  const recoveredLeoTrackingNumbers = [
    "367426130", "364597797", "364841928", "364597581", "364566070", "363900000", "363226092",
    "361475538", "362617263", "362473627", "359489749", "359409934", "361440093",
  ];

  async function run(trackingNumbers: string[] = []) {
    setRunning(true);
    setSent([]);
    setFailed([]);
    setNotFound([]);
    const allSent: Array<{ id: string; trackingNumber: string; reportDate: string }> = [];
    const allFailed: Array<{ id: string; error: string }> = [];
    try {
      for (let batch = 0; batch < 100; batch += 1) {
        setMessage(`Sending batch ${batch + 1}…`);
        const response = await fetch("/api/pm-reports/leo-email-backfill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ since: "2026-10-02", batchSize: 2, ...(trackingNumbers.length ? { trackingNumbers } : {}) }),
        });
        const result = await response.json() as Result;
        if (!response.ok) throw new Error(result.error || "The recovery request failed");
        allSent.push(...(result.sent || []));
        allFailed.push(...(result.failed || []));
        setNotFound(result.notFound || []);
        setSent([...allSent]);
        setFailed([...allFailed]);
        if (allFailed.length || !result.remaining) break;
      }
      setMessage(allFailed.length ? `Stopped with ${allFailed.length} failed report(s).` : `Complete. ${allSent.length} PDF report(s) emailed to Leo.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The recovery request failed");
    } finally {
      setRunning(false);
    }
  }

  return <main style={{ maxWidth: 820, margin: "40px auto", padding: 24, fontFamily: "Arial, sans-serif" }}>
    <h1>Leo Report PDF Recovery</h1>
    <p>{message}</p>
    <button type="button" onClick={() => void run()} disabled={running} style={{ background: "#075985", color: "white", border: 0, borderRadius: 8, padding: "12px 18px", fontWeight: 700 }}>
      {running ? "Sending…" : "Email Leo's Last 30 Days"}
    </button>
    <button type="button" onClick={() => void run(recoveredLeoTrackingNumbers)} disabled={running} style={{ marginLeft: 12, background: "#7c3aed", color: "white", border: 0, borderRadius: 8, padding: "12px 18px", fontWeight: 700 }}>
      {running ? "Sending…" : "Email Leo's Recreated Reports"}
    </button>
    {sent.length > 0 && <section><h2>Sent ({sent.length})</h2><ul>{sent.map((item) => <li key={item.id}>{item.reportDate} · {item.trackingNumber || item.id}</li>)}</ul></section>}
    {failed.length > 0 && <section><h2>Failed ({failed.length})</h2><ul>{failed.map((item) => <li key={item.id}>{item.id}: {item.error}</li>)}</ul></section>}
    {notFound.length > 0 && <section><h2>Not found on site ({notFound.length})</h2><p>{notFound.join(", ")}</p></section>}
    <p style={{ marginTop: 24 }}><a href="/pm-reports">Back to Completed Reports</a></p>
  </main>;
}
