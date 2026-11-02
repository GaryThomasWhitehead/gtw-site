type LeoReport = {
  id?: unknown;
  filename?: unknown;
  reportTypeLabel?: unknown;
  customerName?: unknown;
  facilityId?: unknown;
  trackingNumber?: unknown;
  reportDate?: unknown;
  facilityAddress?: unknown;
  hoursOnJob?: unknown;
  travelHours?: unknown;
};

const LEO_EMAIL = "leo@frontlineworldwide.com";

function clean(value: unknown) {
  return String(value || "").replace(/[<>]/g, "").trim();
}

export async function sendLeoSavedReportPdf(report: LeoReport, pdfBytes: Buffer) {
  const apiKey = process.env.RESEND_API_KEY || "";
  const from = process.env.RESEND_FROM_EMAIL || "";
  if (!apiKey || !from) throw new Error("Email service is not configured");

  const facility = clean(report.customerName) || clean(report.facilityId) || "Facility";
  const tracking = clean(report.trackingNumber) || "No tracking number";
  const reportType = clean(report.reportTypeLabel) || "Job Report";
  const filename = (clean(report.filename) || `Frontline_${tracking}.pdf`).replace(/[^a-zA-Z0-9._-]/g, "_");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [LEO_EMAIL],
      subject: `Your Frontline ${reportType} - ${facility} - ${tracking}`,
      html: `<p>Leo,</p><p>Attached is the PDF copy of your completed Frontline ${reportType} that was saved to the site.</p><p><strong>Facility/Customer:</strong> ${facility}<br><strong>Tracking:</strong> ${tracking}<br><strong>Date:</strong> ${clean(report.reportDate) || "Not entered"}<br><strong>Address:</strong> ${clean(report.facilityAddress) || "Not entered"}<br><strong>Hours on Job:</strong> ${clean(report.hoursOnJob) || "Not entered"}<br><strong>Travel Hours:</strong> ${clean(report.travelHours) || "Not entered"}</p>`,
      attachments: [{ filename, content: pdfBytes.toString("base64") }],
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result?.message || "Email provider rejected Leo's report copy");
  return String(result?.id || "");
}
