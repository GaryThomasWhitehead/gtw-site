import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";

const COOKIE_NAME = "frontline_report_tech";

type TechSession = { id: string; name: string; exp: number };

function secret() {
  return process.env.PM_TECH_SESSION_SECRET || process.env.FEDEX_TRACKER_PASSWORD || "";
}

function signature(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function hashTechPin(pin: string) {
  return createHmac("sha256", secret()).update(`pm-tech-pin:${pin}`).digest("hex");
}

export function pmTechCookieName() {
  return COOKIE_NAME;
}

export function createPmTechSession(id: string, name: string) {
  const payload: TechSession = { id, name, exp: Date.now() + 12 * 60 * 60 * 1000 };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signature(encoded)}`;
}

export function readPmTechSession(request: NextRequest): TechSession | null {
  if (!secret()) return null;
  const raw = request.cookies.get(COOKIE_NAME)?.value || "";
  const [encoded, supplied] = raw.split(".");
  if (!encoded || !supplied) return null;
  const expected = signature(encoded);
  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const session = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as TechSession;
    return session.id && session.name && session.exp > Date.now() ? session : null;
  } catch {
    return null;
  }
}

export function hasPmTechAccess(request: NextRequest) {
  return Boolean(readPmTechSession(request));
}

export async function validatePmTechSession(request: NextRequest) {
  const session = readPmTechSession(request);
  if (!session) return null;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const table = process.env.FEDEX_TRACKER_TABLE || "fedex_work_orders";
  if (!url || !key) return null;
  const trackingNumber = encodeURIComponent(`PMTECH:${session.id}`);
  const response = await fetch(`${url}/rest/v1/${table}?select=data&tracking_number=eq.${trackingNumber}&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store",
  });
  if (!response.ok) return null;
  const [row] = await response.json();
  return row?.data?.active !== false && row?.data?.id === session.id ? { ...session, name: String(row.data.name || session.name) } : null;
}
