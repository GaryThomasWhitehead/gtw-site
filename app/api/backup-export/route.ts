import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStore = { "Cache-Control": "no-store, no-cache, must-revalidate" };

function authorized(request: NextRequest) {
  const expected = process.env.FRONTLINE_BACKUP_TOKEN || "";
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!expected || !supplied) return false;
  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function config() {
  return {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    table: process.env.FEDEX_TRACKER_TABLE || "fedex_work_orders",
  };
}

function headers(key: string) {
  return { apikey: key, Authorization: `Bearer ${key}` };
}

function safeInteger(value: string | null, fallback: number, max: number) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(parsed, max)) : fallback;
}

function encodePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStore });
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ error: "Backup storage is not configured." }, { status: 503, headers: noStore });

  const kind = request.nextUrl.searchParams.get("kind") || "database";

  if (kind === "database") {
    const offset = safeInteger(request.nextUrl.searchParams.get("offset"), 0, 10_000_000);
    const limit = safeInteger(request.nextUrl.searchParams.get("limit"), 500, 1000) || 500;
    const response = await fetch(
      `${url}/rest/v1/${encodeURIComponent(table)}?select=tracking_number,data,updated_at&order=tracking_number.asc&offset=${offset}&limit=${limit}`,
      { headers: { ...headers(key), Prefer: "count=exact" }, cache: "no-store" },
    );
    if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status, headers: noStore });
    const rows = await response.json();
    return NextResponse.json({ rows, offset, limit, count: rows.length }, { headers: noStore });
  }

  if (kind === "buckets") {
    const response = await fetch(`${url}/storage/v1/bucket`, { headers: headers(key), cache: "no-store" });
    if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status, headers: noStore });
    return NextResponse.json({ buckets: await response.json() }, { headers: noStore });
  }

  if (kind === "objects") {
    const bucket = request.nextUrl.searchParams.get("bucket") || "";
    const prefix = request.nextUrl.searchParams.get("prefix") || "";
    const offset = safeInteger(request.nextUrl.searchParams.get("offset"), 0, 10_000_000);
    const limit = safeInteger(request.nextUrl.searchParams.get("limit"), 500, 1000) || 500;
    if (!bucket) return NextResponse.json({ error: "Bucket is required." }, { status: 400, headers: noStore });
    const response = await fetch(`${url}/storage/v1/object/list/${encodeURIComponent(bucket)}`, {
      method: "POST",
      headers: { ...headers(key), "Content-Type": "application/json" },
      body: JSON.stringify({ prefix, limit, offset, sortBy: { column: "name", order: "asc" } }),
      cache: "no-store",
    });
    if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status, headers: noStore });
    const objects = await response.json();
    return NextResponse.json({ objects, bucket, prefix, offset, limit, count: objects.length }, { headers: noStore });
  }

  if (kind === "object") {
    const bucket = request.nextUrl.searchParams.get("bucket") || "";
    const path = request.nextUrl.searchParams.get("path") || "";
    if (!bucket || !path) return NextResponse.json({ error: "Bucket and path are required." }, { status: 400, headers: noStore });
    const response = await fetch(`${url}/storage/v1/object/${encodeURIComponent(bucket)}/${encodePath(path)}`, {
      headers: headers(key), cache: "no-store",
    });
    if (!response.ok || !response.body) return NextResponse.json({ error: await response.text() }, { status: response.status, headers: noStore });
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        ...noStore,
        "Content-Type": response.headers.get("content-type") || "application/octet-stream",
        "Content-Length": response.headers.get("content-length") || "",
      },
    });
  }

  return NextResponse.json({ error: "Unknown backup export type." }, { status: 400, headers: noStore });
}


