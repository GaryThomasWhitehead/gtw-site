import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getEnv() {
  const envRaw = (process.env.PAYPAL_ENV ?? process.env.NEXT_PUBLIC_PAYPAL_ENV ?? "sandbox").trim();
  const env = envRaw.toLowerCase() === "live" ? "live" : "sandbox";

  const clientId = (process.env.PAYPAL_CLIENT_ID ?? "").trim();
  const secret = (process.env.PAYPAL_CLIENT_SECRET ?? "").trim();

  if (!clientId) throw new Error("Missing PAYPAL_CLIENT_ID");
  if (!secret) throw new Error("Missing PAYPAL_CLIENT_SECRET");

  const base =
    env === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

  return { env, clientId, secret, base };
}

async function getAccessToken() {
  const { clientId, secret, base } = getEnv();
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`PayPal token error: ${json?.error_description || JSON.stringify(json)}`);
  }

  const token = (json?.access_token ?? "").toString().trim();
  if (!token) throw new Error("PayPal token missing access_token");
  return token;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderId = (body?.orderId ?? "").toString().trim();

    if (!orderId) {
      return NextResponse.json({ ok: false, error: "Missing orderId" }, { status: 400 });
    }

    const token = await getAccessToken();
    const { base } = getEnv();

    const capRes = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const capJson = await capRes.json().catch(() => ({}));

    if (!capRes.ok) {
      return NextResponse.json(
        { ok: false, error: capJson?.message || JSON.stringify(capJson) },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, capture: capJson });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
