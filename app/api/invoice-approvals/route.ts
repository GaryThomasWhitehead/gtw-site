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
async function syncApprovedInvoice(record: any, approvedBy = "Management") {
  const tracking = String(record?.invoice?.tracking || "").trim();
  if (!tracking) return false;
  const { url, key, table } = cfg();
  const lookup = await fetch(`${url}/rest/v1/${table}?select=tracking_number,data&tracking_number=eq.${encodeURIComponent(tracking)}`, { headers: headers(key), cache: "no-store" });
  if (!lookup.ok) throw new Error(`Could not update tracker job ${tracking}`);
  const storedRows = await lookup.json();
  if (!storedRows.length) return false;
  const today = new Date().toISOString().slice(0, 10);
  const amount = Number(String(record.invoice?.totals?.grand || "").replace(/[^0-9.-]/g, "")) || 0;
  const rows = storedRows.map((stored: any) => {
    const data = stored.data || {}, prior = data.invoiceReview || {};
    const invoiceReview = { ...prior, trackingNumber: tracking, store: prior.store || data.location || record.invoice.location || "", trade: prior.trade || data.classOfWork || record.invoice.category || "", status: "Completed", statusDetail: "Invoice approved", nte: prior.nte || Number(record.invoice.nte) || 0, invoiceNumber: record.invoice.invoiceNumber || prior.invoiceNumber || "", invoiceDate: today, invoiceAmount: amount, frontlineApprovedAmount: amount, problemDescription: prior.problemDescription || data.jobDescription || "", billingStatus: "Billed - waiting on payment", invoiceSent: true, invoiceSentDate: today, approvedBy, approvedDate: today, frontlineApprovalStatus: "approved" };
    return { tracking_number: stored.tracking_number, data: { ...data, status: "Completed", statusDetail: "Invoice approved", invoiceReview }, updated_at: new Date().toISOString() };
  });
  const response = await fetch(`${url}/rest/v1/${table}?on_conflict=tracking_number`, { method: "POST", headers: { ...headers(key), Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(rows) });
  if (!response.ok) throw new Error(`Could not save approved tracker job ${tracking}`);
  return true;
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
    const records = (await response.json()).map((item: any) => item.data);
    await Promise.all(records.filter((record: any) => record?.status === "approved").map((record: any) => syncApprovedInvoice(record, record.reviewers?.find((reviewer: any) => reviewer.decision === "approved")?.name || "Management").catch(() => false)));
    return NextResponse.json(records.map((record: any) => publicRecord(record)));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load invoices" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    if (body.resendId) {
      const record = await row(String(body.resendId));
      if (!record?.invoice) return NextResponse.json({ error: "Saved invoice was not found" }, { status: 404 });
      if (record.status !== "pending") return NextResponse.json({ error: "Only pending invoices can be resent" }, { status: 409 });
      const rawTokens = REVIEWERS.map(() => randomUUID());
      record.reviewers = REVIEWERS.map((reviewer, index) => ({
        ...reviewer,
        tokenHash: hash(rawTokens[index]),
        decision: "",
        reason: "",
        decidedAt: "",
      }));
      record.updatedAt = new Date().toISOString();
      await save(record);
      await sendForReview(request, record, rawTokens);
      return NextResponse.json(publicRecord(record));
    }
    if (body.copyId) {
      const record = await row(String(body.copyId));
      if (!record?.invoice) return NextResponse.json({ error: "Saved invoice was not found" }, { status: 404 });
      const invoice = record.invoice;
      const ownerLink = `${request.nextUrl.protocol}//${request.nextUrl.host}/invoice-creator?invoice=${encodeURIComponent(record.id)}`;
      await email(OWNER, `Copy: Invoice approval requested - ${invoice.location || "FedEx"} - ${invoice.tracking || "No WO"}`, `<p>Gary,</p><p>This is your copy of the approval request sent to Jacob and Daniel.</p><p><strong>Invoice Number:</strong> ${esc(invoice.invoiceNumber) || "Not entered"}<br><strong>Location:</strong> ${esc(invoice.location)}<br><strong>Tracking:</strong> ${esc(invoice.tracking)}<br><strong>Total:</strong> ${esc(invoice.totals?.grand)}</p><p><a href="${esc(ownerLink)}">View saved invoice</a></p>`);
      return NextResponse.json({ sent: true });
    }
    const invoice = cleanInvoice(body.invoice) as any;
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
    if (decision === "approved") await syncApprovedInvoice(record, reviewer.name);
    const ownerLink = `${request.nextUrl.protocol}//${request.nextUrl.host}/invoice-creator?invoice=${encodeURIComponent(record.id)}`;
    await email(OWNER, `Invoice ${decision} by ${reviewer.name} - ${record.invoice.location} - ${record.invoice.tracking}`, `<p>${esc(reviewer.name)} <strong>${esc(decision)}</strong> the proposed invoice.</p><p><strong>Invoice Number:</strong> ${esc(record.invoice.invoiceNumber) || "Not entered"}<br><strong>Location:</strong> ${esc(record.invoice.location)}<br><strong>Tracking:</strong> ${esc(record.invoice.tracking)}<br><strong>Total:</strong> ${esc(record.invoice.totals?.grand)}</p>${reason ? `<p><strong>Requested changes:</strong><br>${esc(reason)}</p>` : ""}<p><a href="${esc(ownerLink)}">View the invoice</a></p>`);
    return NextResponse.json({ ok: true, status: record.status });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Decision could not be saved" }, { status: 500 }); }
}
