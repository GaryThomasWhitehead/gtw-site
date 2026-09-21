import { NextResponse } from "next/server";

const MIN_DONATION = 1;
const MAX_DONATION = 5000;

function clean(value: unknown) {
  return String(value ?? "").replace(/[\r\n]/g, "").trim();
}

function paypalConfig() {
  const clientId = clean(process.env.PAYPAL_CLIENT_ID);
  const secret = clean(process.env.PAYPAL_CLIENT_SECRET);
  const env = clean(process.env.PAYPAL_ENV || "live").toLowerCase();
  if (!clientId || !secret) throw new Error("PayPal is not configured");
  return {
    clientId,
    secret,
    base: env === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com",
  };
}

async function getAccessToken() {
  const { clientId, secret, base } = paypalConfig();
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) throw new Error("Could not connect to PayPal");
  return { accessToken: String(data.access_token), base };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const amount = Number(body?.amount);
    if (!Number.isFinite(amount) || amount < MIN_DONATION || amount > MAX_DONATION) {
      return NextResponse.json(
        { error: `Donation must be between $${MIN_DONATION} and $${MAX_DONATION}.` },
        { status: 400 },
      );
    }

    const value = amount.toFixed(2);
    const { accessToken, base } = await getAccessToken();
    const response = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": crypto.randomUUID(),
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          description: "Not for Sale awareness donation",
          custom_id: "not-for-sale-donation",
          amount: { currency_code: "USD", value },
        }],
      }),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.id) {
      return NextResponse.json({ error: "PayPal could not create the donation." }, { status: 502 });
    }
    return NextResponse.json({ id: data.id });
  } catch {
    return NextResponse.json({ error: "PayPal is temporarily unavailable." }, { status: 503 });
  }
}
