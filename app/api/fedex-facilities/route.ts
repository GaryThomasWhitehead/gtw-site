import { NextRequest, NextResponse } from "next/server";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";
import baselineReview from "@/public/fedex-review-data.json";

type StoredRow = { data?: Record<string, unknown> };
type Visit = { customer?: unknown; address?: unknown; date?: unknown };

function config() {
  return {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    table: process.env.FEDEX_TRACKER_TABLE || "fedex_work_orders",
  };
}

function facilityId(value: unknown) {
  const text = String(value || "").toUpperCase().trim();
  return text.match(/(?:FEDEX\s+)?([A-Z0-9]{4})\b/)?.[1] || "";
}

function firstText(...values: unknown[]) {
  return values.map((value) => String(value || "").trim()).find(Boolean) || "";
}

export async function GET(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ facilities: [] });

  const response = await fetch(`${url}/rest/v1/${table}?select=data`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ facilities: [] });

  const rows = await response.json() as StoredRow[];
  const facilities = new Map<string, { id: string; address: string; date: string }>();

  function addFacility(idValue: unknown, addressValue: unknown, dateValue: unknown) {
    const id = facilityId(idValue);
    const address = String(addressValue || "").trim();
    const date = String(dateValue || "");
    if (!id || !address) return;
    const current = facilities.get(id);
    if (!current || date >= current.date) facilities.set(id, { id, address, date });
  }

  rows.forEach((row) => {
    const data = row.data || {};
    const directId = facilityId(data.facilityId) || facilityId(data.location) || facilityId(data.store) || facilityId(data.customer);
    const directAddress = firstText(data.facilityAddress, data.address, data.locationAddress, data.siteAddress, data.streetAddress);
    const directDate = firstText(data.reportDate, data.callDate, data.updatedAt);
    addFacility(directId, directAddress, directDate);

    const review = data.invoiceReview as { store?: unknown; visits?: Visit[] } | undefined;
    (review?.visits || []).forEach((visit) => {
      const id = facilityId(review?.store) || facilityId(visit.customer);
      const address = String(visit.address || "").trim();
      const date = String(visit.date || "");
      addFacility(id, address, date);
    });
  });

  const baselineJobs = (baselineReview as { jobs?: Array<{ store?: unknown; visits?: Visit[] }> }).jobs || [];
  baselineJobs.forEach((job) => {
    (job.visits || []).forEach((visit) => {
      addFacility(facilityId(job.store) || facilityId(visit.customer), visit.address, visit.date);
    });
  });

  return NextResponse.json({
    facilities: [...facilities.values()]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(({ id, address }) => ({ id, address })),
  }, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } });
}
