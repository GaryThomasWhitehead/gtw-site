import { NextResponse } from "next/server";

type PackageChoice =
  | "song_audio"
  | "song_audio_lyrics"
  | "video"
  | "video_lyrics"
  | "everything_bundle";

const PACKAGE_PRICES: Record<PackageChoice, number> = {
  song_audio: 119,
  song_audio_lyrics: 139,
  video: 239,
  video_lyrics: 259,
  everything_bundle: 299,
};

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  const env = (process.env.PAYPAL_ENV || "live").toLowerCase();

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

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`PayPal token error ${res.status}: ${JSON.stringify(json)}`);
  }

  return { accessToken: json.access_token as string, base };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const packageChoice = body?.packageChoice as PackageChoice | undefined;

    if (!packageChoice || !(packageChoice in PACKAGE_PRICES)) {
      return NextResponse.json({ error: "Invalid packageChoice" }, { status: 400 });
    }

    const amount = PACKAGE_PRICES[packageChoice].toFixed(2);

    const { accessToken, base } = await getAccessToken();

    const res = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount,
            },
          },
        ],
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: `Create order failed (${res.status})`, details: json },
        { status: 500 }
      );
    }

    // ✅ IMPORTANT: return { id }
    return NextResponse.json({ id: json.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
