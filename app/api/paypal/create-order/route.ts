import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
    const packageChoice = body?.packageChoice as PackageChoice | undefined;

    if (!packageChoice || !(packageChoice in PACKAGE_PRICES)) {
      return NextResponse.json(
        { ok: false, error: "Invalid or missing packageChoice" },
        { status: 400 }
      );
    }

    const amount = PACKAGE_PRICES[packageChoice];
    const token = await getAccessToken();
    const { base } = getEnv();

    const createRes = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount.toFixed(2),
            },
            description: `Custom Songs - ${packageChoice}`,
          },
        ],
      }),
    });

    const createJson = await createRes.json().catch(() => ({}));

    if (!createRes.ok) {
      return NextResponse.json(
        { ok: false, error: createJson?.message || JSON.stringify(createJson) },
        { status: 500 }
      );
    }

    const id = (createJson?.id ?? "").toString().trim();
    if (!id) {
      return NextResponse.json(
        { ok: false, error: `PayPal did not return order id. Got: ${JSON.stringify(createJson)}` },
        { status: 500 }
      );
    }

    // ✅ IMPORTANT: return { id }
    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
