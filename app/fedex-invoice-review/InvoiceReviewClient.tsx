"use client";

import { useEffect, useMemo, useState } from "react";

type Receipt = { id: string; visitJob: string; name: string; category: string; amount: number; dataUrl: string };
type Visit = { jobNumber: string; date: string; endTime: string; customer: string; address: string; employee: string; onJobHours: number; travelHours: number; status: string; notes: string; miles: number; receiptTotal: number; receipts: Receipt[]; manualOnJob?: boolean; manualTravel?: boolean };
type ImportRange = { from: string; to: string; importedAt: string };
type Job = { trackingNumber: string; store: string; trade: string; status: string; statusDetail: string; parentJobs: string[]; housecallJobs: string[]; employees: string[]; onJobHours: number; travelHours: number; nte: number; invoiceNumber: string; invoiceDate: string; invoiceAmount: number; problemDescription: string; resolution: string; billingStatus: string; visits: Visit[]; hcpImportRange?: ImportRange };
type CsvRow = Record<string, string>;
type ServiceChannelOrder = { trackingNumber?: string; location?: string; classOfWork?: string; status?: string; statusDetail?: string; cost?: string; jobDescription?: string; notes?: string };

const statuses = ["Needs pricing", "Ready for QBO review", "Approved for export", "Exported", "Invoiced", "Paid", "Hold"];
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const hours = (n: number) => `${n.toFixed(2)} hrs`;

async function compressReceipt(file: File): Promise<string> {
  const source = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = reject;
      element.src = source;
    });
    const scale = Math.min(1, 1400 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.76);
  } finally {
    URL.revokeObjectURL(source);
  }
}

function parseCsv(text: string): CsvRow[] {
  const records: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') { field += '"'; index += 1; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) { row.push(field); field = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field); records.push(row); row = []; field = "";
    } else field += char;
  }
  if (field || row.length) { row.push(field); records.push(row); }
  const headers = (records.shift() || []).map((header) => header.trim().replace(/^\uFEFF/, ""));
  return records.filter((record) => record.some(Boolean)).map((record) => Object.fromEntries(headers.map((header, index) => [header, (record[index] || "").trim()])));
}

function csvValue(row: CsvRow, ...names: string[]) {
  const found = Object.keys(row).find((key) => names.some((name) => key.trim().toLowerCase() === name.toLowerCase()));
  return found ? row[found] : "";
}

function cleanJobNumber(value: string) {
  return value.replace(/^=/, "").replace(/^"|"$/g, "").trim();
}

function rootJobNumber(value: string) {
  return cleanJobNumber(value).replace(/-\d+$/, "");
}

function durationHours(value: string) {
  const text = String(value || "").trim();
  if (!text) return 0;
  const clock = text.match(/^(\d+):(\d{1,2})(?::\d{1,2})?$/);
  if (clock) return Number(clock[1]) + Number(clock[2]) / 60;
  const hoursPart = Number(text.match(/([\d.]+)\s*(?:h|hr|hrs|hour)/i)?.[1] || 0);
  const minutesPart = Number(text.match(/([\d.]+)\s*(?:m|min|mins|minute)/i)?.[1] || 0);
  if (hoursPart || minutesPart) return hoursPart + minutesPart / 60;
  const numeric = Number(text);
  return Number.isFinite(numeric) ? numeric : 0;
}

function currencyNumber(value?: string) {
  return Number(String(value || "").replace(/[^\d.-]/g, "")) || 0;
}

function trackingFromNotes(value: string) {
  return value.match(/\b\d{9}\b/)?.[0] || "";
}

function parseHcpDate(value: string) {
  const match = value.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})|^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
  if (!match) return null;
  const year = Number(match[1] || match[6]);
  const month = Number(match[2] || match[4]);
  const day = Number(match[3] || match[5]);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isoDay(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function displayDay(value: string) {
  const date = parseHcpDate(value);
  return date ? `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}` : value;
}

function followingDay(value: string) {
  const date = parseHcpDate(value);
  if (!date) return "";
  date.setDate(date.getDate() + 1);
  return displayDay(isoDay(date));
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All billing statuses");
  const [onlyIssues, setOnlyIssues] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);
  const [receiptVisit, setReceiptVisit] = useState("");
  const [receiptCategory, setReceiptCategory] = useState("Materials");
  const [receiptAmount, setReceiptAmount] = useState("");
  const [saveState, setSaveState] = useState("Loading shared data…");
  const [hcpImportRange, setHcpImportRange] = useState<ImportRange | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/fedex-review-data.json").then((r) => r.json()),
      fetch("/api/fedex-invoice-review").then((r) => r.ok ? r.json() : []),
    ]).then(([payload, shared]) => {
      const sharedMap = new Map((shared as { trackingNumber: string; review: Partial<Job> }[]).map((item) => [item.trackingNumber, item.review]));
      const base: Job[] = payload.jobs.map((item: Job) => {
        const stored = sharedMap.get(item.trackingNumber);
        return stored ? { ...item, ...stored } : item;
      });
      setJobs(base);
      setSelected(base[0]?.trackingNumber || "");
      setReceiptVisit(base[0]?.visits[0]?.jobNumber || "");
      setHcpImportRange(base.find((item) => item.hcpImportRange)?.hcpImportRange || null);
      setSaveState("Shared data loaded");
    }).catch(() => setSaveState("Could not load shared edits"));
  }, []);

  async function saveShared() {
    setSaveState("Saving…");
    const response = await fetch("/api/fedex-invoice-review", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reviews: jobs.map((item) => ({ trackingNumber: item.trackingNumber, review: item })) }) });
    setSaveState(response.ok ? "All changes saved" : "Save failed");
  }

  async function updateFromHousecall(file?: File) {
    if (!file) return;
    setSaveState("Merging Housecall Pro data...");
    try {
      const [rows, serviceResponse] = await Promise.all([
        file.text().then(parseCsv),
        fetch("/api/fedex-work-orders"),
      ]);
      if (!serviceResponse.ok) throw new Error("Could not load ServiceChannel work orders");
      const serviceOrders = await serviceResponse.json() as ServiceChannelOrder[];
      const importDates = rows.map((row) => parseHcpDate(csvValue(row, "Date"))).filter((date): date is Date => Boolean(date)).sort((a, b) => a.getTime() - b.getTime());
      if (!importDates.length) throw new Error("No valid job dates were found in this Housecall Pro CSV");
      const importRange: ImportRange = { from: isoDay(importDates[0]), to: isoDay(importDates[importDates.length - 1]), importedAt: new Date().toISOString() };
      const serviceByTracking = new Map(serviceOrders.map((order) => [String(order.trackingNumber || "").trim(), order]));
      const rootTracking = new Map<string, string>();
      rows.forEach((row) => {
        const jobNumber = cleanJobNumber(csvValue(row, "Job #", "Job Number"));
        const tracking = trackingFromNotes(csvValue(row, "Notes"));
        if (jobNumber && tracking) rootTracking.set(rootJobNumber(jobNumber), tracking);
      });
      const grouped = new Map<string, CsvRow[]>();
      rows.forEach((row) => {
        const jobNumber = cleanJobNumber(csvValue(row, "Job #", "Job Number"));
        const tracking = trackingFromNotes(csvValue(row, "Notes")) || rootTracking.get(rootJobNumber(jobNumber)) || "";
        const serviceOrder = serviceByTracking.get(tracking);
        if (!tracking || !serviceOrder || !String(serviceOrder.status || "").toLowerCase().includes("complete")) return;
        grouped.set(tracking, [...(grouped.get(tracking) || []), row]);
      });

      let added = 0;
      let updated = 0;
      const byTracking = new Map(jobs.map((item) => [item.trackingNumber, item]));
      grouped.forEach((hcpRows, trackingNumber) => {
          const prior = byTracking.get(trackingNumber);
          const service = serviceByTracking.get(trackingNumber)!;
          const priorVisits = new Map((prior?.visits || []).map((visit) => [visit.jobNumber, visit]));
          const visits = hcpRows.map((row) => {
            const jobNumber = cleanJobNumber(csvValue(row, "Job #", "Job Number"));
            const saved = priorVisits.get(jobNumber);
            return {
              jobNumber,
              date: csvValue(row, "Date"),
              endTime: csvValue(row, "End Time"),
              customer: csvValue(row, "Customer"),
              address: csvValue(row, "Address"),
              employee: csvValue(row, "Employee"),
              onJobHours: saved?.manualOnJob ? saved.onJobHours : durationHours(csvValue(row, "On Job Duration")),
              travelHours: saved?.manualTravel ? saved.travelHours : durationHours(csvValue(row, "Travel Duration")),
              status: csvValue(row, "Job Status"),
              notes: csvValue(row, "Notes"),
              miles: saved?.miles || 0,
              receiptTotal: saved?.receiptTotal || 0,
              receipts: saved?.receipts || [],
              manualOnJob: saved?.manualOnJob || false,
              manualTravel: saved?.manualTravel || false,
            };
          });
          const employees = [...new Set(visits.map((visit) => visit.employee).filter(Boolean))];
          const latestResolution = hcpRows.map((row) => csvValue(row, "Description")).filter(Boolean).at(-1) || "";
          const updatedJob: Job = {
            trackingNumber,
            store: String(service.location || prior?.store || ""),
            trade: String(service.classOfWork || prior?.trade || ""),
            status: String(service.status || prior?.status || "Completed"),
            statusDetail: String(service.statusDetail || prior?.statusDetail || ""),
            parentJobs: prior?.parentJobs || [],
            housecallJobs: visits.map((visit) => visit.jobNumber),
            employees,
            onJobHours: Number(visits.reduce((sum, visit) => sum + visit.onJobHours, 0).toFixed(2)),
            travelHours: Number(visits.reduce((sum, visit) => sum + visit.travelHours, 0).toFixed(2)),
            nte: currencyNumber(service.cost) || prior?.nte || 0,
            invoiceNumber: prior?.invoiceNumber || "",
            invoiceDate: prior?.invoiceDate || "",
            invoiceAmount: prior?.invoiceAmount || 0,
            problemDescription: String(service.jobDescription || prior?.problemDescription || ""),
            resolution: latestResolution || prior?.resolution || "",
            billingStatus: prior?.billingStatus || "Needs pricing",
            visits,
            hcpImportRange: importRange,
          };
          byTracking.set(trackingNumber, updatedJob);
          if (prior) updated += 1; else added += 1;
      });
      setJobs([...byTracking.values()].map((item) => ({ ...item, hcpImportRange: importRange })).sort((a, b) => a.trackingNumber.localeCompare(b.trackingNumber)));
      setHcpImportRange(importRange);
      setSaveState(`${updated} jobs updated, ${added} added — click Save Changes`);
    } catch (error) {
      setSaveState(error instanceof Error ? error.message : "Housecall Pro update failed");
    }
  }

  const filtered = useMemo(() => jobs.filter((job) => {
    const text = `${job.trackingNumber} ${job.store} ${job.trade} ${job.housecallJobs.join(" ")} ${job.employees.join(" ")}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (statusFilter === "All billing statuses" || job.billingStatus === statusFilter) && (!onlyIssues || job.billingStatus === "Needs pricing" || job.visits.some((visit) => !visit.employee || !visit.onJobHours));
  }), [jobs, query, statusFilter, onlyIssues]);

  const job = jobs.find((item) => item.trackingNumber === selected) || filtered[0];
  const totals = useMemo(() => ({
    visits: jobs.reduce((sum, item) => sum + item.visits.length, 0),
    labor: jobs.reduce((sum, item) => sum + item.onJobHours, 0),
    miles: jobs.reduce((sum, item) => sum + item.visits.reduce((n, visit) => n + (visit.miles || 0), 0), 0),
    receipts: jobs.reduce((sum, item) => sum + item.visits.reduce((n, visit) => n + (visit.receipts || []).reduce((x, receipt) => x + receipt.amount, 0), 0), 0),
    receivables: jobs.reduce((sum, item) => sum + (Number(item.invoiceAmount) || 0), 0),
    ready: jobs.filter((item) => ["Ready for QBO review", "Approved for export"].includes(item.billingStatus)).length,
  }), [jobs]);

  function updateJob(tracking: string, patch: Partial<Job>) {
    setSaveState("Unsaved changes");
    setJobs((items) => items.map((item) => item.trackingNumber === tracking ? { ...item, ...patch } : item));
  }

  function updateVisit(tracking: string, jobNumber: string, patch: Partial<Visit>) {
    setSaveState("Unsaved changes");
    setJobs((items) => items.map((item) => {
      if (item.trackingNumber !== tracking) return item;
      const visits = item.visits.map((visit) => visit.jobNumber === jobNumber ? { ...visit, ...patch } : visit);
      return {
        ...item,
        visits,
        onJobHours: Number(visits.reduce((sum, visit) => sum + (Number(visit.onJobHours) || 0), 0).toFixed(2)),
        travelHours: Number(visits.reduce((sum, visit) => sum + (Number(visit.travelHours) || 0), 0).toFixed(2)),
      };
    }));
  }

  async function addReceipt(file?: File) {
    if (!job || !file || !receiptVisit) return;
    setSaveState("Preparing receipt image...");
    const dataUrl = await compressReceipt(file);
    const receipt: Receipt = { id: crypto.randomUUID(), visitJob: receiptVisit, name: file.name, category: receiptCategory, amount: Number(receiptAmount) || 0, dataUrl };
    const visit = job.visits.find((item) => item.jobNumber === receiptVisit);
    if (visit) updateVisit(job.trackingNumber, receiptVisit, { receipts: [...(visit.receipts || []), receipt] });
    setReceiptAmount("");
  }

  function removeReceipt(jobNumber: string, receiptId: string) {
    if (!job) return;
    const visit = job.visits.find((item) => item.jobNumber === jobNumber);
    if (visit) updateVisit(job.trackingNumber, jobNumber, { receipts: (visit.receipts || []).filter((receipt) => receipt.id !== receiptId) });
  }

  function exportQbo() {
    const selectedJobs = jobs.filter((item) => checked.includes(item.trackingNumber) && item.invoiceAmount > 0);
    const header = ["Invoice Number", "Customer", "Invoice Date", "Due Date", "Product/Service", "Description", "Quantity", "Rate", "Item Amount"];
    const lines = selectedJobs.map((item) => [item.invoiceNumber || item.trackingNumber, `FedEx - ${item.store}`, item.invoiceDate, "", "ServiceChannel Work Order", `${item.trackingNumber} - ${item.trade} - ${item.problemDescription}`, 1, item.invoiceAmount.toFixed(2), item.invoiceAmount.toFixed(2)]);
    const csv = [header, ...lines].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "quickbooks-review-export.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function resetLocal() {
    if (!confirm("Discard unsaved changes and reload the latest shared data?")) return;
    setJobs([]);
    location.reload();
  }

  if (!job) return <main className="loading">Loading matched work orders…</main>;

  const jobMiles = job.visits.reduce((sum, visit) => sum + (visit.miles || 0), 0);
  const receiptTotal = job.visits.reduce((sum, visit) => sum + (visit.receipts || []).reduce((n, receipt) => n + receipt.amount, 0), 0);

  return (
    <><link rel="stylesheet" href="/fedex-invoice-review.css" /><main className="shell">
      <header className="topbar">
        <div className="brandmark">FP</div>
        <div><p className="eyebrow">FRONTLINE PRO SERVICES</p><h1>Completed Work Review</h1></div>
        <div className="testbadge"><span /> Live shared tracker</div>
        <a className="helpButton" href="/fedex-invoice-review/instructions">HCP Export Instructions</a>
        <a className="backButton" href="/fedex-tracker">← Back to Work Orders</a>
        <button className="saveButton" onClick={saveShared}>Save Changes</button>
        <button className="ghost" onClick={resetLocal}>Reload Shared Data</button>
      </header>

      <section className="hero">
        <div><p className="eyebrow pale">SERVICECHANNEL + HOUSECALL PRO</p><h2>From field work to invoice-ready.</h2><p>Review matched visits, mileage, receipts, and billing details before anything reaches QuickBooks. <strong>{saveState}</strong></p>{hcpImportRange ? <div className="hcpRange"><span>HCP jobs uploaded</span><strong>{displayDay(hcpImportRange.from)} – {displayDay(hcpImportRange.to)}</strong><small>Next update should begin {followingDay(hcpImportRange.to)}</small></div> : <div className="hcpRange empty"><span>HCP jobs uploaded</span><strong>No date range recorded yet</strong><small>Import the next Housecall Pro jobs CSV to begin tracking coverage.</small></div>}</div>
        <div className="heroActions"><label className="mergeButton">Update from Housecall Pro<input type="file" accept=".csv,text/csv" onChange={(event) => { updateFromHousecall(event.target.files?.[0]); event.target.value = ""; }} /></label><button className="primary" onClick={exportQbo} disabled={!checked.length}>Export {checked.length || "selected"} to QBO CSV</button></div>
      </section>

      <section className="kpis">
        <Kpi label="Matched jobs" value={String(jobs.length)} hint={`${totals.visits} combined visits`} />
        <Kpi label="On-job time" value={hours(totals.labor)} hint="ServiceChannel-completed work" />
        <Kpi label="Mileage entered" value={`${totals.miles.toFixed(1)} mi`} hint="Editable by visit" />
        <Kpi label="Receipt expenses" value={money.format(totals.receipts)} hint="Saved with shared tracker" />
        <Kpi label="Total receivables" value={money.format(totals.receivables)} hint="Combined invoice totals" />
        <Kpi label="Ready for review" value={String(totals.ready)} hint="Before QBO export" accent />
      </section>

      <section className="toolbar">
        <label className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tracking, location, trade, tech…" /></label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option>All billing statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
        <label className="toggle"><input type="checkbox" checked={onlyIssues} onChange={(e) => setOnlyIssues(e.target.checked)} /> Needs attention only</label>
        <span className="resultcount">{filtered.length} jobs</span>
      </section>

      <section className="workspace">
        <aside className="joblist">
          {filtered.map((item) => {
            const miles = item.visits.reduce((sum, visit) => sum + (visit.miles || 0), 0);
            const selectedRow = item.trackingNumber === job.trackingNumber;
            return <article key={item.trackingNumber} className={`jobrow ${selectedRow ? "selected" : ""}`} onClick={() => { setSelected(item.trackingNumber); setReceiptVisit(item.visits[0]?.jobNumber || ""); }}>
              <input aria-label={`Select ${item.trackingNumber} for export`} type="checkbox" checked={checked.includes(item.trackingNumber)} onClick={(e) => e.stopPropagation()} onChange={(e) => setChecked((list) => e.target.checked ? [...list, item.trackingNumber] : list.filter((id) => id !== item.trackingNumber))} />
              <div className="jobrowmain"><div><strong>{item.store}</strong><span className={`pill ${item.billingStatus === "Needs pricing" ? "warn" : "ok"}`}>{item.billingStatus}</span></div><p>{item.trackingNumber} · {item.trade}</p><small>{item.visits.length} visit{item.visits.length === 1 ? "" : "s"} · {hours(item.onJobHours)} · {miles.toFixed(1)} mi</small></div>
              <b>{item.invoiceAmount ? money.format(item.invoiceAmount) : "—"}</b>
            </article>;
          })}
        </aside>

        <section className="detail">
          <div className="detailhead">
            <div><p className="eyebrow">SERVICECHANNEL {job.trackingNumber}</p><h3>{job.store}</h3><p>{job.trade} · {job.statusDetail}</p></div>
            <select className="statusSelect" value={job.billingStatus} onChange={(e) => updateJob(job.trackingNumber, { billingStatus: e.target.value })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
          </div>

          <div className="detailgrid">
            <section className="panel overview">
              <div className="paneltitle"><h4>Work order overview</h4><span>{job.housecallJobs.length} HCP record{job.housecallJobs.length === 1 ? "" : "s"}</span></div>
              <p className="description">{job.problemDescription}</p>
              <dl><div><dt>Housecall jobs</dt><dd>{job.housecallJobs.join(", ")}</dd></div><div><dt>Technicians</dt><dd>{job.employees.join(", ") || "Not recorded"}</dd></div><div><dt>Resolution</dt><dd>{job.resolution || "No resolution imported"}</dd></div></dl>
            </section>

            <section className="panel financial">
              <div className="paneltitle"><h4>Billing review</h4><span>NTE {money.format(job.nte)}</span></div>
              <div className="formgrid"><label>Invoice #<input value={job.invoiceNumber} onChange={(e) => updateJob(job.trackingNumber, { invoiceNumber: e.target.value })} /></label><label>Invoice date<input value={job.invoiceDate} onChange={(e) => updateJob(job.trackingNumber, { invoiceDate: e.target.value })} /></label><label>Invoice amount<input type="number" value={job.invoiceAmount || ""} onChange={(e) => updateJob(job.trackingNumber, { invoiceAmount: Number(e.target.value) })} /></label><label>Expense total<input value={money.format(receiptTotal)} readOnly /></label></div>
              <div className="financefoot"><span>Total field cost entered</span><strong>{money.format(receiptTotal)}</strong></div>
            </section>
          </div>

          <section className="panel visits">
            <div className="paneltitle"><div><h4>Visits, mileage & receipts</h4><p>{hours(job.onJobHours)} on job · {hours(job.travelHours)} travel · {jobMiles.toFixed(1)} miles</p></div><span>{job.visits.length} visit{job.visits.length === 1 ? "" : "s"}</span></div>
            <div className="visitscroll">{job.visits.map((visit, index) => <article className="visit" key={`${visit.jobNumber}-${index}`}>
              <div className="visitnum">{index + 1}</div><div className="visitwho"><strong>HCP {visit.jobNumber}</strong><span>{visit.employee || "Technician missing"}</span><small>{visit.date || "Date missing"}</small></div>
              <label className="timeInput">On job hrs<input aria-label={`On job hours for HCP ${visit.jobNumber}`} type="number" min="0" step="0.25" value={visit.onJobHours || ""} onChange={(e) => updateVisit(job.trackingNumber, visit.jobNumber, { onJobHours: Number(e.target.value), manualOnJob: true })} /></label><label className="timeInput">Travel hrs<input aria-label={`Travel hours for HCP ${visit.jobNumber}`} type="number" min="0" step="0.25" value={visit.travelHours || ""} onChange={(e) => updateVisit(job.trackingNumber, visit.jobNumber, { travelHours: Number(e.target.value), manualTravel: true })} /></label>
              <label className="miles">Miles<input type="number" min="0" step="0.1" value={visit.miles || ""} onChange={(e) => updateVisit(job.trackingNumber, visit.jobNumber, { miles: Number(e.target.value) })} /></label>
              <div className="receiptcount"><span>Receipts</span><b>{visit.receipts?.length || 0} · {money.format((visit.receipts || []).reduce((sum, receipt) => sum + receipt.amount, 0))}</b></div>
              {(visit.receipts || []).length > 0 && <div className="receiptstrip">{visit.receipts.map((receipt) => <div className="receiptthumb" key={receipt.id}><a href={receipt.dataUrl} target="_blank"><img src={receipt.dataUrl} alt={receipt.name} /></a><span>{receipt.category}<b>{money.format(receipt.amount)}</b></span><button onClick={() => removeReceipt(visit.jobNumber, receipt.id)}>×</button></div>)}</div>}
            </article>)}</div>

            <div className="uploader"><div><strong>Add receipt image</strong><span>Saved with the shared tracker when you click Save Changes</span></div><select value={receiptVisit} onChange={(e) => setReceiptVisit(e.target.value)}>{job.visits.map((visit) => <option value={visit.jobNumber} key={visit.jobNumber}>HCP {visit.jobNumber}</option>)}</select><select value={receiptCategory} onChange={(e) => setReceiptCategory(e.target.value)}><option>Materials</option><option>Fuel</option><option>Parking</option><option>Toll</option><option>Other</option></select><input aria-label="Receipt amount" type="number" placeholder="Amount" value={receiptAmount} onChange={(e) => setReceiptAmount(e.target.value)} /><label className="uploadButton">Choose image<input type="file" accept="image/*" onChange={(e) => addReceipt(e.target.files?.[0])} /></label></div>
          </section>
        </section>
      </section>
    </main></>
  );
}

function Kpi({ label, value, hint, accent = false }: { label: string; value: string; hint: string; accent?: boolean }) {
  return <article className={`kpi ${accent ? "accent" : ""}`}><span>{label}</span><strong>{value}</strong><small>{hint}</small></article>;
}
