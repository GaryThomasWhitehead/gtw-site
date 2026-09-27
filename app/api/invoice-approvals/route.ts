import { createHash, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";

export const dynamic = "force-dynamic";

const REVIEWERS = [
  { name: "Jacob", email: "jacob@frontlineworldwide.com" },
  { name: "Daniel", email: "daniel@frontlineworldwide.com" },
];
const OWNER = "gary@frontlineworldwide.com";

function cfg() { return { url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "", key: process.env.SUPABASE_SERVICE_ROLE_KEY || "", table: process.env.FEDEX_TRACKER_TABLE || "fedex_work_orders" }; }
function headers(key: string) { return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" }; }
function hash(value: string) { return createHash("sha256").update(value).digest("hex"); }
function esc(value: unknown) { return String(value || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c)); }
function cleanInvoice(value: unknown) {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return JSON.parse(JSON.stringify(source).slice(0, 100000));
}
async function email(to: string | string[], subject: string, html: string, cc?: string | string[]) {
  const apiKey = process.env.RESEND_API_KEY || "", from = process.env.RESEND_FROM_EMAIL || "";
  if (!apiKey || !from) throw new Error("Email service is not configured");
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: Array.isArray(to) ? to : [to], ...(cc ? { cc: Array.isArray(cc) ? cc : [cc] } : {}), subject, html }) });
  if (!response.ok) throw new Error((await response.json().catch(() => ({})))?.message || "Email could not be sent");
}
async function row(id: string) {
  const { url, key, table } = cfg(); if (!url || !key) throw new Error("Storage is not configured");
  const tracking = encodeURIComponent(`INVOICEAPPROVAL:${id}`);
  const response = await fetch(`${url}/rest/v1/${table}?select=data&tracking_number=eq.${tracking}&limit=1`, { headers: headers(key), cache: "no-store" });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json())?.[0]?.data || null;
}
async function save(record: Record<string, unknown>) {
  const { url, key, table } = cfg(); if (!url || !key) throw new Error("Storage is not configured");
  const response = await fetch(`${url}/rest/v1/${table}?on_conflict=tracking_number`, { method: "POST", headers: { ...headers(key), Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify([{ tracking_number: `INVOICEAPPROVAL:${record.id}`, data: record, updated_at: new Date().toISOString() }]) });
  if (!response.ok) throw new Error(await response.text());
}
function publicRecord(record: any) {
  return { id: record.id, status: record.status, revision: record.revision, invoice: record.invoice, reviewers: (record.reviewers || []).map((r: any) => ({ name: r.name, decision: r.decision, reason: r.reason, decidedAt: r.decidedAt })), createdAt: record.createdAt, updatedAt: record.updatedAt };
}
async function sendForReview(request: NextRequest, record: any, rawTokens: string[]) {
  const root = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
  await Promise.all(REVIEWERS.map((reviewer, index) => {
    const link = `${root}/invoice-approval?token=${encodeURIComponent(`${record.id}.${rawTokens[index]}`)}`;
    return email(reviewer.email, `Invoice approval requested - ${record.invoice.location || "FedEx"} - ${record.invoice.tracking || "No WO"}`, `<p>Hi ${reviewer.name},</p><p>A proposed FedEx invoice is ready for your approval.</p><p><strong>Invoice Number:</strong> ${esc(record.invoice.invoiceNumber) || "Not entered"}<br><strong>Location:</strong> ${esc(record.invoice.location)}<br><strong>Tracking:</strong> ${esc(record.invoice.tracking)}<br><strong>Total:</strong> ${esc(record.invoice.totals?.grand)}</p><p><a href="${esc(link)}" style="background:#1670ad;color:white;padding:12px 18px;text-decoration:none;border-radius:8px">View and approve or deny invoice</a></p>`, OWNER);
  }));
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token") || "";
    if (token) {
      const [id, raw] = token.split("."); const record = id && raw ? await row(id) : null;
      const reviewer = record?.reviewers?.find((r: any) => r.tokenHash === hash(raw || ""));
      if (!record || !reviewer) return NextResponse.json({ error: "This review link is invalid or expired" }, { status: 404 });
      return NextResponse.json({ ...publicRecord(record), reviewer: reviewer.name, alreadyDecided: record.status !== "pending" || Boolean(reviewer.decision) });
    }
    if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { url, key, table } = cfg();
    const response = await fetch(`${url}/rest/v1/${table}?select=data&tracking_number=like.INVOICEAPPROVAL%3A%25&order=updated_at.desc&limit=250`, { headers: headers(key), cache: "no-store" });
    if (!response.ok) throw new Error(await response.text());
    return NextResponse.json((await response.json()).map((item: any) => publicRecord(item.data)));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load invoices" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json(), invoice = cleanInvoice(body.invoice) as any;
    if (!invoice.tracking || !invoice.location) return NextResponse.json({ error: "Location and tracking number are required" }, { status: 400 });
    const existing = body.id ? await row(String(body.id)) : null;
    const id = existing?.id || randomUUID(), rawTokens = REVIEWERS.map(() => randomUUID());
    const now = new Date().toISOString();
    const record = { id, recordType: "invoice-approval", revision: (existing?.revision || 0) + 1, status: "pending", invoice, reviewers: REVIEWERS.map((r, i) => ({ ...r, tokenHash: hash(rawTokens[i]), decision: "", reason: "", decidedAt: "" })), history: [...(existing?.history || []), ...(existing ? [{ revision: existing.revision, status: existing.status, invoice: existing.invoice, reviewers: existing.reviewers, archivedAt: now }] : [])], createdAt: existing?.createdAt || now, updatedAt: now };
    await save(record); await sendForReview(request, record, rawTokens);
    return NextResponse.json(publicRecord(record));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invoice could not be submitted" }, { status: 500 }); }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json(), token = String(body.token || ""), [id, raw] = token.split(".");
    const record = id && raw ? await row(id) : null;
    const reviewer = record?.reviewers?.find((r: any) => r.tokenHash === hash(raw || ""));
    if (!record || !reviewer) return NextResponse.json({ error: "This review link is invalid or expired" }, { status: 404 });
    if (record.status !== "pending" || reviewer.decision) return NextResponse.json({ error: "This invoice revision has already been decided" }, { status: 409 });
    const decision = body.decision === "approved" ? "approved" : body.decision === "denied" ? "denied" : "";
    const reason = String(body.reason || "").trim().slice(0, 3000);
    if (!decision || (decision === "denied" && !reason)) return NextResponse.json({ error: "A reason is required when denying an invoice" }, { status: 400 });
    reviewer.decision = decision; reviewer.reason = reason; reviewer.decidedAt = new Date().toISOString();
    record.status = decision;
    record.updatedAt = new Date().toISOString(); await save(record);
    const ownerLink = `${request.nextUrl.protocol}//${request.nextUrl.host}/invoice-creator?invoice=${encodeURIComponent(record.id)}`;
    await email(OWNER, `Invoice ${decision} by ${reviewer.name} - ${record.invoice.location} - ${record.invoice.tracking}`, `<p>${esc(reviewer.name)} <strong>${esc(decision)}</strong> the proposed invoice.</p><p><strong>Invoice Number:</strong> ${esc(record.invoice.invoiceNumber) || "Not entered"}<br><strong>Location:</strong> ${esc(record.invoice.location)}<br><strong>Tracking:</strong> ${esc(record.invoice.tracking)}<br><strong>Total:</strong> ${esc(record.invoice.totals?.grand)}</p>${reason ? `<p><strong>Requested changes:</strong><br>${esc(reason)}</p>` : ""}<p><a href="${esc(ownerLink)}">View the invoice</a></p>`);
    return NextResponse.json({ ok: true, status: record.status });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Decision could not be saved" }, { status: 500 }); }
}
