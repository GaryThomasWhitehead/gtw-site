"use client";

import { useState, type FormEvent } from "react";

const blobToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
  reader.onerror = () => reject(reader.error || new Error("The PDF could not be read."));
  reader.readAsDataURL(file);
});

export default function ImportCompletedReportPage() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("Reading PDF…");
    try {
      const form = new FormData(event.currentTarget);
      const file = form.get("pdf") as File;
      if (!file?.size || file.type !== "application/pdf") throw new Error("Choose a PDF report.");
      const pdfBase64 = await blobToBase64(file);
      setMessage("Saving completed report…");
      const id = crypto.randomUUID();
      const report = {
        id,
        category: String(form.get("category") || "regular"),
        reportTypeLabel: String(form.get("reportTypeLabel") || "Regular Job Report"),
        technician: String(form.get("technician") || ""),
        reportDate: String(form.get("reportDate") || ""),
        facilityAddress: String(form.get("facilityAddress") || ""),
        trackingNumber: String(form.get("trackingNumber") || ""),
        facilityId: String(form.get("facilityId") || ""),
        customerName: "",
        fedexJob: true,
        itemCount: Number(form.get("itemCount")) || 1,
        workflowStatus: "complete",
        workArrangement: String(form.get("workArrangement") || "alone"),
        teamMembers: String(form.get("teamMembers") || ""),
        filename: file.name,
        pdfBase64,
        completedAt: new Date().toISOString(),
      };
      const response = await fetch("/api/pm-reports", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ report }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `Server returned ${response.status}`);
      setMessage("Completed report saved successfully.");
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }

  return <main>
    <header><div><p>FRONTLINE PRO SERVICES</p><h1>Import Completed Report</h1></div><nav><a href="/pm-reports">Completed Reports</a><a href="/fedex-tracker">Back to Tracker</a></nav></header>
    <form onSubmit={submit}>
      <h2>Completed PDF details</h2>
      <div className="grid">
        <label>PDF report<input name="pdf" type="file" accept="application/pdf,.pdf" required /></label>
        <label>Tracking number<input name="trackingNumber" required /></label>
        <label>Facility ID<input name="facilityId" required /></label>
        <label>Report date<input name="reportDate" type="date" required /></label>
        <label>Technician<input name="technician" required /></label>
        <label>Facility address<input name="facilityAddress" required /></label>
        <label>Report category<select name="category" defaultValue="regular"><option value="regular">Regular Job</option><option value="proposed">Proposed Work</option><option value="pm">Preventive Maintenance</option><option value="tugger">Tugger</option><option value="gas">Gas Sensor</option></select></label>
        <label>Report title<input name="reportTypeLabel" defaultValue="Regular Job Report" required /></label>
        <label>Number of items<input name="itemCount" type="number" min="1" defaultValue="1" required /></label>
        <label>Work arrangement<select name="workArrangement" defaultValue="alone"><option value="alone">Worked alone</option><option value="team">With team</option></select></label>
        <label className="wide">Other technicians<input name="teamMembers" /></label>
      </div>
      <button disabled={saving}>{saving ? "Saving…" : "Save to Completed Reports"}</button>
      {message && <p className="message" role="status">{message}</p>}
    </form>
    <style jsx>{`
      main{min-height:100vh;background:#f1f5f9;color:#0f2945;font:15px Arial,sans-serif}header{background:#0c3b62;color:white;padding:22px max(20px,calc((100% - 900px)/2));display:flex;justify-content:space-between;align-items:center;gap:18px}header p{margin:0 0 5px;font-size:11px;letter-spacing:2px;font-weight:800;color:#8bd0ff}h1{margin:0}nav{display:flex;gap:10px}nav a{background:white;color:#0c4f83;border-radius:9px;padding:11px 14px;text-decoration:none;font-weight:800}form{max-width:900px;margin:30px auto;padding:24px;background:white;border:1px solid #dbe4ee;border-radius:16px;box-shadow:0 5px 18px #0f29450d}h2{margin:0 0 20px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:15px}.wide{grid-column:1/-1}label{display:grid;gap:6px;font-size:12px;text-transform:uppercase;letter-spacing:.4px;font-weight:800;color:#526a80}input,select{width:100%;box-sizing:border-box;padding:12px;border:1px solid #b8c8d8;border-radius:9px;background:#f8fafc;font:15px Arial;color:#0f2945}form>button{margin-top:20px;border:0;border-radius:9px;padding:13px 18px;background:#1468a5;color:white;font-weight:800;cursor:pointer}.message{padding:13px;background:#eaf4fb;border-radius:9px;color:#0c4f83;font-weight:800}@media(max-width:700px){header,.grid{display:flex;flex-direction:column}.wide{grid-column:auto}nav{flex-wrap:wrap}form{margin:18px 12px}}
    `}</style>
  </main>;
}
