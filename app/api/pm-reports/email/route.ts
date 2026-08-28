import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const RECIPIENTS = [
  "jacob@frontlineworldwide.com",
  "daniel@frontlineworldwide.com",
  "gary@frontlineworldwide.com",
];

function clean(value: unknown) {
  return String(value || "").replace(/[<>]/g, "").trim();
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY || "";
    const from = process.env.RESEND_FROM_EMAIL || "";
    if (!apiKey || !from) return NextResponse.json({ error: "Email service is not configured" }, { status: 503 });
    const body = await request.json();
    const report = body?.report || {};
    const facilityId = clean(report.customerName) || clean(report.facilityId) || "Facility";
    const trackingNumber = clean(report.trackingNumber) || "No tracking number";
    const reportType = clean(report.reportTypeLabel) || "Preventive Maintenance Report";
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: RECIPIENTS,
        subject: `Frontline ${reportType} - ${facilityId} - ${trackingNumber}`,
        html: `<p>A Frontline ${reportType} has been completed.</p><p><strong>Facility/Customer:</strong> ${facilityId}<br><strong>Tracking:</strong> ${trackingNumber}<br><strong>Technician:</strong> ${clean(report.technician) || "Not entered"}<br><strong>Date:</strong> ${clean(report.reportDate) || "Not entered"}<br><strong>Address:</strong> ${clean(report.facilityAddress) || "Not entered"}</p>`,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json({ error: result?.message || "Email provider rejected the message" }, { status: response.status });
    return NextResponse.json({ ok: true, id: result?.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected email error" }, { status: 500 });
  }
}
