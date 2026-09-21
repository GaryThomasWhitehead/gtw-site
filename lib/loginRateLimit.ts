import { createHash } from "node:crypto";
import { NextRequest } from "next/server";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const localAttempts = new Map<string, { failures: number; resetAt: number }>();

function config() {
  return {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    table: process.env.FEDEX_TRACKER_TABLE || "fedex_work_orders",
  };
}

function clientKey(request: NextRequest, scope: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  const digest = createHash("sha256").update(ip).digest("hex");
  return `${scope}:${digest}`;
}

function trackingNumber(key: string) {
  return `AUTHRATE:${key}`;
}

function headers(key: string) {
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

async function readAttempt(keyValue: string) {
  const { url, key, table } = config();
  if (!url || !key) return localAttempts.get(keyValue) || null;
  const id = encodeURIComponent(trackingNumber(keyValue));
  const response = await fetch(
    `${url}/rest/v1/${table}?select=data&tracking_number=eq.${id}&limit=1`,
    { headers: headers(key), cache: "no-store" },
  );
  if (!response.ok) return localAttempts.get(keyValue) || null;
  const [row] = await response.json();
  return row?.data || null;
}

export async function checkLoginRateLimit(request: NextRequest, scope: string) {
  const keyValue = clientKey(request, scope);
  const attempt = await readAttempt(keyValue);
  if (!attempt || Number(attempt.resetAt) <= Date.now()) {
    return { allowed: true, retryAfter: 0 };
  }
  const allowed = Number(attempt.failures) < MAX_FAILURES;
  return {
    allowed,
    retryAfter: allowed ? 0 : Math.max(1, Math.ceil((Number(attempt.resetAt) - Date.now()) / 1000)),
  };
}

export async function recordLoginFailure(request: NextRequest, scope: string) {
  const keyValue = clientKey(request, scope);
  const current = await readAttempt(keyValue);
  const now = Date.now();
  const active = current && Number(current.resetAt) > now;
  const data = {
    failures: active ? Number(current.failures || 0) + 1 : 1,
    resetAt: active ? Number(current.resetAt) : now + WINDOW_MS,
  };
  localAttempts.set(keyValue, data);

  const { url, key, table } = config();
  if (!url || !key) return;
  await fetch(`${url}/rest/v1/${table}?on_conflict=tracking_number`, {
    method: "POST",
    headers: { ...headers(key), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify([{
      tracking_number: trackingNumber(keyValue),
      data,
      updated_at: new Date().toISOString(),
    }]),
  });
}

export async function clearLoginFailures(request: NextRequest, scope: string) {
  const keyValue = clientKey(request, scope);
  localAttempts.delete(keyValue);
  const { url, key, table } = config();
  if (!url || !key) return;
  const id = encodeURIComponent(trackingNumber(keyValue));
  await fetch(`${url}/rest/v1/${table}?tracking_number=eq.${id}`, {
    method: "DELETE",
    headers: { ...headers(key), Prefer: "return=minimal" },
  });
}
