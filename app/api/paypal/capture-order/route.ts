import { NextResponse } from "next/server";

async function getAccessToken() {
  const clientId = (process.env.PAYPAL_CLIENT_ID || "").trim();
  const secret = (process.env.PAYPAL_CLIENT_SECRET || "").trim();
  const env = (process.env.PAYPAL_ENV || "live").toLowerCase().trim();

  if (!clientId || !secret) {
    throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET");
  }

  const base =
    env === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";

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
    throw new Error(`PayPal token error ${res.status}: ${JSON.stringify(json)}`);
  }

  return { accessToken: json.access_token as string, base };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderId = (body?.orderId ?? "").toString().trim();

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const { accessToken, base } = await getAccessToken();

    const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { error: `Capture failed (${res.status})`, details: json },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, details: json });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
