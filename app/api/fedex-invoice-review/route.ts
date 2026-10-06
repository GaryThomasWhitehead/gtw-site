import { NextRequest, NextResponse } from "next/server";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";

type StoredRow = { tracking_number: string; data: Record<string, unknown> };
type ApprovedInvoice = { amount: number; invoiceNumber: string; approvedDate: string };

function config() {
  return {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    table: process.env.FEDEX_TRACKER_TABLE || "fedex_work_orders",
  };
}

function authHeaders(key: string) {
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

function amount(value: unknown) {
  return Number(String(value || "").replace(/[^0-9.-]/g, "")) || 0;
}

async function approvedInvoices(url: string, key: string, table: string) {
  const params = new URLSearchParams({
    select: "data,updated_at",
    tracking_number: "like.INVOICEAPPROVAL:*",
    order: "updated_at.desc",
    limit: "250",
  });
  const response = await fetch(`${url}/rest/v1/${table}?${params}`, { headers: authHeaders(key), cache: "no-store" });
  if (!response.ok) throw new Error(await response.text());
  const matches = new Map<string, ApprovedInvoice>();
  for (const row of await response.json()) {
    const record = row?.data;
    const tracking = String(record?.invoice?.tracking || "").trim();
    if (!tracking || record?.status !== "approved" || matches.has(tracking)) continue;
    matches.set(tracking, {
      amount: amount(record.invoice?.totals?.grand),
      invoiceNumber: String(record.invoice?.invoiceNumber || ""),
      approvedDate: String(record.updatedAt || row.updated_at || "").slice(0, 10),
    });
  }
  return matches;
}

function reconcileReview(review: Record<string, unknown>, approved?: ApprovedInvoice) {
  if (!approved) return review;
  return {
    ...review,
    invoiceNumber: approved.invoiceNumber || review.invoiceNumber || "",
    invoiceDate: approved.approvedDate || review.invoiceDate || "",
    invoiceAmount: approved.amount,
    frontlineApprovedAmount: approved.amount,
    frontlineApprovalStatus: "approved",
    billingStatus: "Billed - waiting on payment",
    invoiceSent: true,
    invoiceSentDate: approved.approvedDate || review.invoiceSentDate || "",
  };
}

export async function GET(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  const response = await fetch(`${url}/rest/v1/${table}?select=tracking_number,data&tracking_number=not.like.PMREPORT%3A*&order=tracking_number.asc`, { headers: authHeaders(key), cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
  const rows = (await response.json() as StoredRow[]).filter((row) => !row.tracking_number.startsWith("INVOICEAPPROVAL:"));
  const approved = await approvedInvoices(url, key, table);
  const reviews = rows.flatMap((row) => {
    const prior = row.data?.invoiceReview as Record<string, unknown> | undefined;
    const match = approved.get(row.tracking_number);
    if (!prior && !match) return [];
    return [{ trackingNumber: row.tracking_number, review: reconcileReview(prior || {}, match) }];
  });
  const serviceOrders = rows.map((row) => {
    const data = row.data || {};
    return {
      trackingNumber: String(data.trackingNumber || row.tracking_number),
      location: String(data.location || ""),
      classOfWork: String(data.classOfWork || ""),
      status: String(data.status || ""),
      statusDetail: String(data.statusDetail || ""),
      cost: String(data.cost || ""),
      jobDescription: String(data.jobDescription || ""),
    };
  });
  return NextResponse.json({ reviews, serviceOrders });
}

export async function PUT(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  const body = await request.json();
  const reviews = Array.isArray(body?.reviews) ? body.reviews : [];
  if (!reviews.length) return NextResponse.json({ error: "No reviews supplied" }, { status: 400 });

  const currentResponse = await fetch(`${url}/rest/v1/${table}?select=tracking_number,data&tracking_number=not.like.PMREPORT%3A*`, { headers: authHeaders(key), cache: "no-store" });
  if (!currentResponse.ok) return NextResponse.json({ error: await currentResponse.text() }, { status: currentResponse.status });
  const current = (await currentResponse.json() as StoredRow[]).filter((row) => !row.tracking_number.startsWith("INVOICEAPPROVAL:"));
  const byTracking = new Map(current.map((row) => [row.tracking_number, row.data]));
  const approved = await approvedInvoices(url, key, table);
  const rows = reviews.flatMap((item: { trackingNumber?: string; review?: Record<string, unknown> }) => {
    const tracking = String(item.trackingNumber || "").trim();
    const existing = byTracking.get(tracking);
    if (!tracking) return [];
    const review = reconcileReview(item.review || {}, approved.get(tracking));
    const base = existing || {
      trackingNumber: tracking,
      location: review.store || "",
      classOfWork: review.trade || "",
      status: review.status || "Completed",
      statusDetail: review.statusDetail || "",
      cost: review.nte || "",
      jobDescription: review.problemDescription || "",
    };
    return [{ tracking_number: tracking, data: { ...base, invoiceReview: review }, updated_at: new Date().toISOString() }];
  });
  const saveResponse = await fetch(`${url}/rest/v1/${table}?on_conflict=tracking_number`, {
    method: "POST",
    headers: { ...authHeaders(key), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows),
  });
  if (!saveResponse.ok) return NextResponse.json({ error: await saveResponse.text() }, { status: saveResponse.status });
  return NextResponse.json({ ok: true, saved: rows.length });
}
