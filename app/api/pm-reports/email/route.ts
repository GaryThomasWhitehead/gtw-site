import { NextRequest, NextResponse } from "next/server";
import { validatePmTechSession } from "@/lib/pmTechAuth";

export const dynamic = "force-dynamic";

const RECIPIENTS = [
  "jacob@frontlineworldwide.com",
  "daniel@frontlineworldwide.com",
  "gary@frontlineworldwide.com",
];

const TECHNICIAN_NOTIFICATION_EMAILS: Record<string, string> = {
  leo: "leo@frontlineworldwide.com",
  leofernandez: "leo@frontlineworldwide.com",
};

function clean(value: unknown) {
  return String(value || "").replace(/[<>]/g, "").trim();
}

export async function POST(request: NextRequest) {
  try {
    const technician = await validatePmTechSession(request);
    if (!technician) return NextResponse.json({ error: "Technician sign-in required" }, { status: 401 });
    const apiKey = process.env.RESEND_API_KEY || "";
    const from = process.env.RESEND_FROM_EMAIL || "";
    if (!apiKey || !from) return NextResponse.json({ error: "Email service is not configured" }, { status: 503 });
    const body = await request.json();
    const report = body?.report || {};
    if (technician.timeEntryRequired) {
      const validDuration = (value: unknown) => {
        const match = String(value || "").trim().match(/^(\d+):([0-5]\d)$/);
        return Boolean(match && (Number(match[1]) * 60 + Number(match[2])) > 0);
      };
      if (!validDuration(report.hoursOnJob) || !validDuration(report.travelHours)) {
        return NextResponse.json({ error: "Hours on Job and Travel Hours are required and must be more than 0:00" }, { status: 400 });
      }
    }
    const facilityId = clean(report.customerName) || clean(report.facilityId) || "Facility";
    const trackingNumber = clean(report.trackingNumber) || "No tracking number";
    const reportType = clean(report.reportTypeLabel) || "Preventive Maintenance Report";
    // Use the authenticated technician identity, not an editable report field,
    // when deciding whether a technician receives a copy of the notice.
    const authenticatedTechnicianName = clean(technician.name);
    const technicianKey = authenticatedTechnicianName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const technicianRecipient = TECHNICIAN_NOTIFICATION_EMAILS[technicianKey];
    const recipients = [...new Set([...RECIPIENTS, ...(technicianRecipient ? [technicianRecipient] : [])])];
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: recipients,
        subject: `Frontline ${reportType} - ${facilityId} - ${trackingNumber}`,
        html: `<p>A Frontline ${reportType} has been completed.</p><p><strong>Facility/Customer:</strong> ${facilityId}<br><strong>Tracking:</strong> ${trackingNumber}<br><strong>Technician:</strong> ${authenticatedTechnicianName || "Not entered"}<br><strong>Date:</strong> ${clean(report.reportDate) || "Not entered"}<br><strong>Address:</strong> ${clean(report.facilityAddress) || "Not entered"}${technician.timeEntryRequired ? `<br><strong>Hours on Job:</strong> ${clean(report.hoursOnJob)}<br><strong>Travel Hours:</strong> ${clean(report.travelHours)}` : ""}</p>`,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json({ error: result?.message || "Email provider rejected the message" }, { status: response.status });
    return NextResponse.json({ ok: true, id: result?.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected email error" }, { status: 500 });
  }
}
