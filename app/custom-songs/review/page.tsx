"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CustomSongsShell from "@/components/CustomSongsShell";
import TrackedLink from "@/components/TrackedLink";

type PackageChoice =
  | "song_audio"
  | "song_audio_lyrics"
  | "video"
  | "video_lyrics"
  | "everything_bundle";

type OrderData = {
  packageChoice?: PackageChoice;

  name?: string;
  email?: string;
  phone?: string;

  occasion?: string;
  recipientName?: string;
  relationship?: string;
  mustInclude?: string;
  notes?: string;

  genre?: string;
  vibe?: string;
  tempo?: string;

  photoCount?: string;
  photoNotes?: string;
};

const STORAGE_KEY = "customSongsOrder_v4";
const PAID_KEY = "customSongsPaid_v1";

function loadOrder(): OrderData {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as OrderData;
  } catch {
    return {};
  }
}

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

const PACKAGE_LABELS: Record<PackageChoice, string> = {
  song_audio: "Custom Song (Audio)",
  song_audio_lyrics: "Custom Song + Printable Lyrics Sheet",
  video: "Custom Song + Photo Music Video",
  video_lyrics: "Photo Music Video + Printable Lyrics Sheet",
  everything_bundle: "Everything Bundle",
};

// ✅ Your current pricing (from your screenshot)
const PACKAGE_PRICES: Record<PackageChoice, number> = {
  song_audio: 119,
  song_audio_lyrics: 139,
  video: 239,
  video_lyrics: 259,
  everything_bundle: 299,
};

// ---- PayPal (dynamic amount) ----
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

type PaidState = {
  paid: boolean;
  captureId?: string;
  payerEmail?: string;
  paidAmount?: string;
  paidCurrency?: string;
};

export default function ReviewPage() {
  const [data, setData] = useState<OrderData>({});
  const [paidState, setPaidState] = useState<PaidState>({ paid: false });
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadOrder();
    setData(loaded);

    // restore "paid" state if user refreshes
    try {
      const savedPaid = JSON.parse(localStorage.getItem(PAID_KEY) || "null") as
        | PaidState
        | null;
      if (savedPaid?.paid) setPaidState(savedPaid);
    } catch {
      // ignore
    }
  }, []);

  const selectedPkg = data.packageChoice;
  const amount = selectedPkg ? PACKAGE_PRICES[selectedPkg] : 0;

  const lines = useMemo(() => {
    const d = data;
    const pkg = d.packageChoice ? PACKAGE_LABELS[d.packageChoice] : "";
    const parts: string[] = [];
    parts.push(`Package: ${pkg}`);
    parts.push(`Price: ${amount ? money(amount) : ""}`);
    parts.push(`Name: ${d.name ?? ""}`);
    parts.push(`Email: ${d.email ?? ""}`);
    parts.push(`Phone: ${d.phone ?? ""}`);
    parts.push(`Occasion: ${d.occasion ?? ""}`);
    parts.push(`Recipient: ${d.recipientName ?? ""}`);
    parts.push(`Relationship: ${d.relationship ?? ""}`);
    parts.push(`Genre: ${d.genre ?? ""}`);
    parts.push(`Vibe: ${d.vibe ?? ""}`);
    parts.push(`Tempo: ${d.tempo ?? ""}`);
    parts.push(`Must include: ${d.mustInclude ?? ""}`);
    parts.push(`Story/Notes: ${d.notes ?? ""}`);
    parts.push(`Photo count: ${d.photoCount ?? ""}`);
    parts.push(`Photo notes: ${d.photoNotes ?? ""}`);

    if (paidState.paid) {
      parts.push("");
      parts.push("=== PAYMENT CONFIRMED ===");
      parts.push(`Capture ID: ${paidState.captureId ?? ""}`);
      parts.push(`Payer: ${paidState.payerEmail ?? ""}`);
      parts.push(
        `Paid: ${paidState.paidAmount ?? ""} ${paidState.paidCurrency ?? ""}`.trim()
      );
    }

    return parts;
  }, [data, amount, paidState]);

  const box: React.CSSProperties = {
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.78)",
    padding: 18,
    boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
  };

  const row: React.CSSProperties = {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 16,
  };

  const btn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 16px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#111",
    color: "#fff",
    fontWeight: 900,
    textDecoration: "none",
    cursor: "pointer",
  };

  const btnAlt: React.CSSProperties = { ...btn, background: "#b57b17" };

  const btnDisabled: React.CSSProperties = {
    ...btn,
    opacity: 0.45,
    cursor: "not-allowed",
    pointerEvents: "none",
  };

  const mailto = useMemo(() => {
    const subject = encodeURIComponent("Custom Song Request");
    const body = encodeURIComponent(lines.join("\n"));
    return `mailto:garys_new_music@yahoo.com?subject=${subject}&body=${body}`;
  }, [lines]);

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  const canPay = Boolean(selectedPkg && amount > 0);
  const canContinue = paidState.paid;

  return (
    <CustomSongsShell
      title="Review & Pay"
      subtitle="Confirm your request, then pay securely with PayPal. After payment, you can continue and I’ll receive your details."
      backHref="/custom-songs/order"
      backLabel="← Back to Order"
      badge="REVIEW + PAY"
    >
      {/* Summary */}
      <div style={box}>
        <div style={{ fontWeight: 950, marginBottom: 10 }}>
          Total: <span style={{ color: "#b57b17" }}>{amount ? money(amount) : "—"}</span>
        </div>

        <pre
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            fontSize: 14,
            lineHeight: 1.7,
            fontWeight: 700,
          }}
        >
          {lines.join("\n")}
        </pre>
      </div>

      {/* PayPal */}
      <div style={{ ...box, marginTop: 16 }}>
        <div style={{ fontWeight: 950, marginBottom: 8 }}>Pay securely with PayPal</div>

        {!canPay ? (
          <div style={{ fontWeight: 800, color: "rgba(0,0,0,0.65)" }}>
            Please go back and select a package first.
          </div>
        ) : !paypalClientId ? (
          <div style={{ fontWeight: 850, color: "#b00020", lineHeight: 1.6 }}>
            Missing <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code>. Add it to{" "}
            <code>.env.local</code> and Vercel Environment Variables, then redeploy.
          </div>
        ) : paidState.paid ? (
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "rgba(181,123,23,0.10)",
              fontWeight: 900,
              lineHeight: 1.6,
            }}
          >
            ✅ Payment confirmed.
            <div style={{ fontWeight: 800, color: "rgba(0,0,0,0.70)" }}>
              Capture ID: {paidState.captureId || "—"}
            </div>
          </div>
        ) : (
          <>
            {payError ? (
              <div
                style={{
                  marginBottom: 10,
                  padding: 10,
                  borderRadius: 12,
                  border: "1px solid rgba(176,0,32,0.35)",
                  background: "rgba(176,0,32,0.06)",
                  color: "#b00020",
                  fontWeight: 850,
                }}
              >
                {payError}
              </div>
            ) : null}

            <PayPalScriptProvider
              options={{
                clientId: paypalClientId,
                currency: "USD",
                intent: "capture",
              }}
            >
              <PayPalButtons
                style={{ layout: "vertical", label: "pay" }}
                createOrder={async () => {
                  setPayError(null);

                  const res = await fetch("/api/paypal/create-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      amount: amount.toFixed(2),
                      currency: "USD",
                      description: selectedPkg ? PACKAGE_LABELS[selectedPkg] : "Custom Song",
                      // You can pass order details too if you want the server to store it:
                      orderData: data,
                    }),
                  });

                  if (!res.ok) {
                    const txt = await res.text().catch(() => "");
                    throw new Error(txt || "Create order failed.");
                  }

                  const json = (await res.json()) as { id?: string; error?: string };
                  if (!json.id) throw new Error(json.error || "No order id returned.");
                  return json.id;
                }}
                onApprove={async (approveData) => {
                  setPayError(null);

                  const res = await fetch("/api/paypal/capture-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderID: approveData.orderID }),
                  });

                  if (!res.ok) {
                    const txt = await res.text().catch(() => "");
                    throw new Error(txt || "Capture failed.");
                  }

                  const json = await res.json();

                  // Try to pull capture id + payer email from PayPal response
                  const captureId =
                    json?.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
                    json?.id ||
                    "";
                  const payerEmail = json?.payer?.email_address || "";
                  const paidAmount =
                    json?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ||
                    amount.toFixed(2);
                  const paidCurrency =
                    json?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code ||
                    "USD";

                  const nextPaid: PaidState = {
                    paid: true,
                    captureId,
                    payerEmail,
                    paidAmount,
                    paidCurrency,
                  };

                  setPaidState(nextPaid);
                  try {
                    localStorage.setItem(PAID_KEY, JSON.stringify(nextPaid));
                  } catch {
                    // ignore
                  }
                }}
                onError={(err) => {
                  setPayError(
                    typeof err?.message === "string"
                      ? err.message
                      : "PayPal error occurred. Please try again."
                  );
                }}
              />
            </PayPalScriptProvider>

            <div style={{ marginTop: 10, fontSize: 12, fontWeight: 850, color: "rgba(0,0,0,0.62)" }}>
              You’ll be able to continue only after payment is confirmed.
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div style={row}>
        {/* Only allow “Send Request by Email” after paid */}
        {canContinue ? (
          <TrackedLink href={mailto} style={btnAlt} eventName="CustomSongsSendEmail">
            Send Request by Email →
          </TrackedLink>
        ) : (
          <span style={btnDisabled}>Send Request by Email →</span>
        )}

        <Link href="/custom-songs/order" style={btn}>
          Edit Order
        </Link>

        <Link href="/custom-songs/photos" style={btn}>
          Edit Photos
        </Link>

        {/* Only allow Continue after paid */}
        {canContinue ? (
          <Link href="/custom-songs/thank-you" style={btn}>
            Continue →
          </Link>
        ) : (
          <span style={btnDisabled}>Continue →</span>
        )}
      </div>
    </CustomSongsShell>
  );
}
