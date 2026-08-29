import { NextRequest, NextResponse } from "next/server";
import { createPmTechSession, hashTechPin, pmTechCookieName, validatePmTechSession } from "@/lib/pmTechAuth";

function config() {
  return {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    table: process.env.FEDEX_TRACKER_TABLE || "fedex_work_orders",
  };
}

const headers = (key: string) => ({ apikey: key, Authorization: `Bearer ${key}` });

export async function GET(request: NextRequest) {
  const session = await validatePmTechSession(request);
  return session
    ? NextResponse.json({ id: session.id, name: session.name })
    : NextResponse.json({ error: "Technician sign-in required" }, { status: 401 });
}

export async function POST(request: NextRequest) {
  const { url, key, table } = config();
  if (!url || !key) return NextResponse.json({ error: "Technician access is not configured" }, { status: 503 });
  const contentType = request.headers.get("content-type") || "";
  const input = contentType.includes("application/json") ? await request.json() : Object.fromEntries(await request.formData());
  const pin = String(input.pin || "").trim();
  const returnTo = String(input.return || "/pm-report");
  const wantsJson = contentType.includes("application/json") || request.headers.get("accept")?.includes("application/json");
  if (!/^\d{4}$/.test(pin)) {
    return wantsJson
      ? NextResponse.json({ error: "Enter a four-digit code" }, { status: 400 })
      : NextResponse.redirect(new URL(`/pm-tech-login?error=1&return=${encodeURIComponent(returnTo)}`, request.url), { status: 303 });
  }
  const params = new URLSearchParams({ select: "data", tracking_number: "like.PMTECH:*" });
  const response = await fetch(`${url}/rest/v1/${table}?${params}`, { headers: headers(key), cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: "Could not check technician access" }, { status: 502 });
  const rows = await response.json() as Array<{ data?: { id?: string; name?: string; pinHash?: string; active?: boolean } }>;
  const pinHash = hashTechPin(pin);
  const tech = rows.map((row) => row.data).find((item) => item?.active !== false && item?.pinHash === pinHash);
  if (!tech?.id || !tech.name) {
    return wantsJson
      ? NextResponse.json({ error: "That technician code is not active" }, { status: 401 })
      : NextResponse.redirect(new URL(`/pm-tech-login?error=1&return=${encodeURIComponent(returnTo)}`, request.url), { status: 303 });
  }
  const result = wantsJson
    ? NextResponse.json({ ok: true, id: tech.id, name: tech.name })
    : NextResponse.redirect(new URL(returnTo.startsWith("/") ? returnTo : "/pm-report", request.url), { status: 303 });
  result.cookies.set(pmTechCookieName(), createPmTechSession(tech.id, tech.name), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12,
  });
  return result;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(pmTechCookieName(), "", { path: "/", maxAge: 0 });
  return response;
}
