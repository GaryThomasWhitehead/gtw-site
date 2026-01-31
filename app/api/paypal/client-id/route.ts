import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const clientId = (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "").trim();

  // Prefer NEXT_PUBLIC_* (what the browser will use), but fall back to server env if needed
  const envRaw =
    (process.env.NEXT_PUBLIC_PAYPAL_ENV ??
      process.env.PAYPAL_ENV ??
      "sandbox").trim();

  const env = envRaw.toLowerCase() === "live" ? "live" : "sandbox";

  if (!clientId) {
    return NextResponse.json(
      { ok: false, error: "Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID on server" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, clientId, env });
}
