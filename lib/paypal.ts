const base =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export async function getAccessToken() {
  const client = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!client || !secret) throw new Error("Missing PayPal env vars");

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${client}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error(`PayPal token error: ${await res.text()}`);
  const data = await res.json();
  return data.access_token as string;
}

export async function createOrder(amountUSD: string, description: string) {
  const accessToken = await getAccessToken();

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
          description,
          amount: {
            currency_code: "USD",
            value: amountUSD,
          },
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`PayPal create order error: ${await res.text()}`);
  return res.json();
}

export async function captureOrder(orderId: string) {
  const accessToken = await getAccessToken();

  const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error(`PayPal capture error: ${await res.text()}`);
  return res.json();
}
