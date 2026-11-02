const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const table = process.env.FEDEX_TRACKER_TABLE || "fedex_work_orders";
const bucket = process.env.PM_REPORT_PDF_BUCKET || "pm-report-pdfs";
const resendKey = process.env.RESEND_API_KEY || "";
const from = process.env.RESEND_FROM_EMAIL || "";
const recipient = "leo@frontlineworldwide.com";
const since = process.argv[2] || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

if (!url || !key || !resendKey || !from) throw new Error("Supabase and Resend environment variables are required");
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
const clean = (value) => String(value || "").replace(/[<>]/g, "").trim();
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const indexParams = new URLSearchParams({
  select: "tracking_number,technician:data->>technician,reportDate:data->>reportDate",
  order: "updated_at.asc",
  limit: "1000",
});
indexParams.append("tracking_number", "like.PMREPORT:*");
indexParams.append("data->>technician", "ilike.Leo*");
indexParams.append("data->>reportDate", `gte.${since}`);
const indexResponse = await fetch(`${url}/rest/v1/${table}?${indexParams}`, { headers });
if (!indexResponse.ok) throw new Error(`Could not list Leo's reports: ${await indexResponse.text()}`);
const rows = await indexResponse.json();
let sent = 0;
let skipped = 0;
const failed = [];

for (const row of rows) {
  const reportId = String(row.tracking_number || "").replace(/^PMREPORT:/, "");
  const marker = `PMREPORTEMAIL:LEO:${reportId}`;
  const markerParams = new URLSearchParams({ select: "tracking_number", tracking_number: `eq.${marker}`, limit: "1" });
  const markerResponse = await fetch(`${url}/rest/v1/${table}?${markerParams}`, { headers });
  if (markerResponse.ok && (await markerResponse.json()).length) {
    skipped += 1;
    continue;
  }
  try {
    const reportParams = new URLSearchParams({ select: "data", tracking_number: `eq.PMREPORT:${reportId}`, limit: "1" });
    const reportResponse = await fetch(`${url}/rest/v1/${table}?${reportParams}`, { headers });
    if (!reportResponse.ok) throw new Error(await reportResponse.text());
    const [stored] = await reportResponse.json();
    const report = stored?.data || {};
    let pdfBytes;
    if (report.pdfStoragePath) {
      const objectPath = String(report.pdfStoragePath).split("/").map(encodeURIComponent).join("/");
      const objectResponse = await fetch(`${url}/storage/v1/object/${encodeURIComponent(bucket)}/${objectPath}`, { headers });
      if (!objectResponse.ok) throw new Error(`Could not download saved PDF (${objectResponse.status})`);
      pdfBytes = Buffer.from(await objectResponse.arrayBuffer());
    } else if (report.pdfBase64) {
      pdfBytes = Buffer.from(String(report.pdfBase64), "base64");
    } else {
      throw new Error("Saved report has no PDF");
    }
    const facility = clean(report.customerName) || clean(report.facilityId) || "Facility";
    const tracking = clean(report.trackingNumber) || "No tracking number";
    const reportType = clean(report.reportTypeLabel) || "Job Report";
    const filename = (clean(report.filename) || `Frontline_${tracking}.pdf`).replace(/[^a-zA-Z0-9._-]/g, "_");
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [recipient],
        subject: `Your Frontline ${reportType} - ${facility} - ${tracking}`,
        html: `<p>Leo,</p><p>Attached is the PDF copy of your completed Frontline ${reportType} that was saved to the site.</p><p><strong>Facility/Customer:</strong> ${facility}<br><strong>Tracking:</strong> ${tracking}<br><strong>Date:</strong> ${clean(report.reportDate) || "Not entered"}<br><strong>Address:</strong> ${clean(report.facilityAddress) || "Not entered"}<br><strong>Hours on Job:</strong> ${clean(report.hoursOnJob) || "Not entered"}<br><strong>Travel Hours:</strong> ${clean(report.travelHours) || "Not entered"}</p>`,
        attachments: [{ filename, content: pdfBytes.toString("base64") }],
      }),
    });
    const emailResult = await emailResponse.json().catch(() => ({}));
    if (!emailResponse.ok) throw new Error(emailResult?.message || `Resend rejected the email (${emailResponse.status})`);
    const emailedAt = new Date().toISOString();
    const markerResponse = await fetch(`${url}/rest/v1/${table}?on_conflict=tracking_number`, {
      method: "POST",
      headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify([{ tracking_number: marker, data: { recordType: "pm-report-email", reportId, technician: report.technician || "Leo", recipient, providerId: emailResult?.id || "", emailedAt, backfilled: true }, updated_at: emailedAt }]),
    });
    if (!markerResponse.ok) throw new Error("Email sent, but delivery marker could not be saved");
    sent += 1;
    console.log(`SENT ${report.reportDate || ""} ${tracking} ${facility}`);
    await pause(650);
  } catch (error) {
    failed.push({ reportId, error: error instanceof Error ? error.message : String(error) });
    console.error(`FAILED ${reportId}: ${failed.at(-1).error}`);
  }
}

console.log(JSON.stringify({ since, found: rows.length, sent, skipped, failed }, null, 2));
if (failed.length) process.exitCode = 1;
