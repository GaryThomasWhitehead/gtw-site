import { NextRequest, NextResponse } from "next/server";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";
import { validatePmTechSession } from "@/lib/pmTechAuth";
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
  if (!text) return "";
  // Imports normally use "SFOA - SAN FRANCISCO,CA" or "0912 // SOUTH SF".
  // Some out-of-state facilities have IDs longer or shorter than four characters,
  // so keep the complete location prefix instead of silently discarding them.
  const prefixed = text.match(/^(?:FEDEX\s+)?([A-Z0-9]{2,16})(?=\s*(?:-|\/\/|\||,|$))/)?.[1];
  if (prefixed) return prefixed;
  const embedded = text.match(/\b(?:FEDEX\s+)?([A-Z0-9]{4})\b/)?.[1];
  return embedded || "";
}

function firstText(...values: unknown[]) {
  return values.map((value) => String(value || "").trim()).find(Boolean) || "";
}

function locationAddress(value: unknown) {
  return String(value || "")
    .trim()
    .replace(/^(?:FEDEX\s+)?[A-Z0-9]{2,16}\s*(?:-|\/\/|\|)\s*/i, "")
    .replace(/,\s*([A-Z]{2})\s*$/i, ", $1");
}

export async function GET(request: NextRequest) {
  if (!hasFedExTrackerAccess(request) && !await validatePmTechSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ facilities: [] });

  const params = new URLSearchParams({ select: "data", tracking_number: "not.like.PM*" });
  const response = await fetch(`${url}/rest/v1/${table}?${params}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ facilities: [] });

  const rows = await response.json() as StoredRow[];
  const facilities = new Map<string, { id: string; address: string; date: string; fullAddress: boolean }>();

  function addFacility(idValue: unknown, addressValue: unknown, dateValue: unknown, fullAddress = true) {
    const id = facilityId(idValue);
    const address = String(addressValue || "").trim();
    const date = String(dateValue || "");
    if (!id || !address) return;
    const current = facilities.get(id);
    // Never let a newer city/state fallback replace a complete street address.
    if (!current || (fullAddress && !current.fullAddress) || (fullAddress === current.fullAddress && date >= current.date)) {
      facilities.set(id, { id, address, date, fullAddress });
    }
  }

  rows.forEach((row) => {
    const data = row.data || {};
    const directId = facilityId(data.facilityId) || facilityId(data.location) || facilityId(data.store) || facilityId(data.customer);
    const directAddress = firstText(data.facilityAddress, data.address, data.locationAddress, data.siteAddress, data.streetAddress);
    const fallbackAddress = locationAddress(data.location);
    const directDate = firstText(data.reportDate, data.callDate, data.updatedAt);
    addFacility(directId, directAddress || fallbackAddress, directDate, Boolean(directAddress));

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
