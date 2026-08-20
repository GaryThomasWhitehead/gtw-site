import { NextRequest, NextResponse } from "next/server";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";

type StoredRow = { tracking_number: string; data: Record<string, unknown> };

export async function GET(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const table = process.env.FEDEX_TRACKER_TABLE || "fedex_work_orders";
  if (!url || !key) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  const response = await fetch(`${url}/rest/v1/${table}?select=tracking_number,data&tracking_number=not.like.PMREPORT%3A*&order=tracking_number.asc`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
  const rows = await response.json() as StoredRow[];
  const completed = rows.flatMap((row) => {
    const data = row.data || {};
    if (!String(data.status || "").toLowerCase().includes("complete")) return [];
    return [{
      trackingNumber: String(data.trackingNumber || row.tracking_number),
      location: String(data.location || ""),
      classOfWork: String(data.classOfWork || ""),
      status: String(data.status || ""),
      statusDetail: String(data.statusDetail || ""),
      cost: String(data.cost || ""),
      jobDescription: String(data.jobDescription || ""),
    }];
  });
  return NextResponse.json(completed);
}
