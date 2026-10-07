import { NextRequest, NextResponse } from "next/server";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";

export const dynamic = "force-dynamic";

const escapeHtml = (value: unknown) => String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function POST(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const apiKey = process.env.RESEND_API_KEY || "";
  const from = process.env.RESEND_FROM_EMAIL || "";
  if (!apiKey || !from) return NextResponse.json({ error: "Email service is not configured" }, { status: 503 });
  const body = await request.json();
  const recipients = String(body?.recipients || "").split(",").map((email) => email.trim()).filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  const actions = Array.isArray(body?.actions) ? body.actions : [];
  if (!recipients.length) return NextResponse.json({ error: "Enter at least one valid email address" }, { status: 400 });
  if (!actions.length) return NextResponse.json({ error: "There are no corrective actions to email" }, { status: 400 });
  const rows = actions.map((action: Record<string, unknown>) => `<tr><td>${escapeHtml(action.facilityId)}</td><td>${escapeHtml(action.trackingNumber)}</td><td>${escapeHtml(action.assetTag)}</td><td>${escapeHtml(action.repairNeeded)}</td><td>${escapeHtml(action.urgency)}</td><td>${escapeHtml(action.serviceChannelWo)}</td></tr>`).join("");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: recipients,
      subject: `Frontline Corrective Actions Needed (${actions.length})`,
      html: `<h2>Corrective Actions Needed</h2><table style="border-collapse:collapse;width:100%"><thead><tr><th>Location</th><th>Tracking #</th><th>Asset / Tag</th><th>Repair Needed</th><th>Urgency</th><th>SC WO #</th></tr></thead><tbody>${rows}</tbody></table>`,
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return NextResponse.json({ error: result?.message || "Email provider rejected the message" }, { status: response.status });
  return NextResponse.json({ ok: true, id: result?.id });
}
