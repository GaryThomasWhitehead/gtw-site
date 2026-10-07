"use client";

import { useState } from "react";

export default function MaintenanceClient() {
  const [status, setStatus] = useState("Ready to move legacy PDFs out of the database.");
  const [running, setRunning] = useState(false);
  const [migrated, setMigrated] = useState(0);
  const [bytesFreed, setBytesFreed] = useState(0);

  const run = async () => {
    setRunning(true);
    setStatus("Starting verified migration…");
    let cursor = "";
    let moved = 0;
    let freed = 0;
    try {
      for (;;) {
        const response = await fetch("/api/pm-reports/migrate-storage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cursor }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Migration stopped");
        if (result.done) break;
        cursor = String(result.cursor || cursor);
        moved += Number(result.migrated || 0);
        freed += Number(result.bytesFreed || 0);
        setMigrated(moved);
        setBytesFreed(freed);
        setStatus(`Verified and moved ${moved} report PDF${moved === 1 ? "" : "s"}.`);
      }
      setStatus(`Complete. ${moved} PDFs were verified in Storage and removed from database records.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Migration stopped");
    } finally {
      setRunning(false);
    }
  };

  return (
    <main style={{ maxWidth: 760, margin: "48px auto", padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1>Report Storage Maintenance</h1>
      <p>{status}</p>
      <p><strong>{migrated}</strong> PDFs moved · <strong>{(bytesFreed / 1024 / 1024).toFixed(1)} MB</strong> removed from report records</p>
      <button onClick={run} disabled={running} style={{ padding: "12px 18px", fontWeight: 700 }}>
        {running ? "Migration in progress…" : "Start verified migration"}
      </button>
    </main>
  );
}
