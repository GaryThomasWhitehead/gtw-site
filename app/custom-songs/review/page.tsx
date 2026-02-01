"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import CustomSongsShell from "@/components/CustomSongsShell";
import TrackedLink from "@/components/TrackedLink";

import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
  type PayPalButtonsComponentProps,
} from "@paypal/react-paypal-js";

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

const STORAGE_KEY = "customSongsOrder_v5";

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

const PACKAGE_PRICES: Record<PackageChoice, number> = {
  song_audio: 119,
  song_audio_lyrics: 139,
  video: 239,
  video_lyrics: 259,
  everything_bundle: 299,
};

function PayPalBlock({
  packageChoice,
  onPaid,
  setPayError,
}: {
  packageChoice: PackageChoice;
  onPaid: () => void;
  setPayError: (msg: string | null) => void;
}) {
  const [{ isPending, isRejected, isResolved }] = usePayPalScriptReducer();

  const createOrder: PayPalButtonsComponentProps["createOrder"] = async () => {
    setPayError(null);

    const res = await fetch("/api/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageChoice }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(json?.error || `Failed to create order (${res.status})`);
    }

    // Must return order id string
    const id = (json?.id ?? "").toString().trim();
    if (!id) {
      throw new Error(
        `Create-order did not return { id }. Got: ${JSON.stringify(json)}`
      );
    }
    return id;
  };

  // IMPORTANT: onApprove receives (data, actions)
  const onApprove: PayPalButtonsComponentProps["onApprove"] = async (data) => {
    setPayError(null);

    const orderId = (data as any)?.orderID;
    if (!orderId) throw new Error("Missing orderID from PayPal approval.");

    const res = await fetch("/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.error || `Failed to capture order (${res.status})`);
    }

    onPaid();
  };

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.75, marginBottom: 10 }}>
        PayPal SDK status:{" "}
        {isPending ? "loading…" : isRejected ? "failed" : isResolved ? "ready" : "unknown"}
      </div>

      {isPending ? <div style={{ fontWeight: 900, opacity: 0.8 }}>Loading PayPal…</div> : null}

      {isRejected ? (
        <div style={{ fontWeight: 900, color: "#b00020", lineHeight: 1.5 }}>
          PayPal script failed to load.
          <br />
          Common causes:
          <br />• ad blocker / privacy shield
          <br />• corporate firewall
          <br />• PayPal blocked in browser
        </div>
      ) : null}

      {isResolved ? (
        <PayPalButtons
          style={{ layout: "vertical", shape: "pill", label: "pay" }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={(err) => setPayError(String(err))}
        />
      ) : null}
    </div>
  );
}

export default function ReviewPage() {
  const [data, setData] = useState<OrderData>({});
  const [paid, setPaid] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => setData(loadOrder()), []);

  const pkgTitle = data.packageChoice ? PACKAGE_LABELS[data.packageChoice] : "";
  const price = data.packageChoice ? PACKAGE_PRICES[data.packageChoice] : 0;

  const clientId = (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "").trim();
  const clientLoaded = clientId.length > 0;

  const paypalOptions = useMemo(() => {
    if (!clientLoaded) return null;
    return {
      "client-id": clientId,
      currency: "USD",
      intent: "capture",
      components: "buttons",
    } as const;
  }, [clientId, clientLoaded]);

  const lines = useMemo(() => {
    const d = data;
    const parts: string[] = [];
    parts.push(`Total: ${price ? money(price) : "—"}`);
    parts.push(`Package: ${pkgTitle || "—"}`);
    parts.push(`Price: ${price ? money(price) : "—"}`);
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
    return parts;
  }, [data, price, pkgTitle]);

  const mailto = useMemo(() => {
    const subject = encodeURIComponent("Custom Song Request");
    const body = encodeURIComponent(lines.join("\n"));
    return `mailto:garys_new_music@yahoo.com?subject=${subject}&body=${body}`;
  }, [lines]);

  const box: CSSProperties = {
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.78)",
    padding: 18,
    boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
  };

  const row: CSSProperties = {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 16,
  };

  const btn: CSSProperties = {
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

  const btnAlt: CSSProperties = { ...btn, background: "#b57b17" };
  const disabledBtn: CSSProperties = { ...btn, background: "rgba(0,0,0,0.35)" };

  return (
    <CustomSongsShell
      title="Review & Pay"
      subtitle="Confirm your request, then pay securely with PayPal. After payment, you can continue and I’ll receive your details."
      backHref="/custom-songs/order"
      backLabel="← Back to Order"
      badge="REVIEW + PAY"
    >
      <div style={box}>
        <div style={{ fontWeight: 950, marginBottom: 10 }}>
          Total: <span style={{ color: "#b57b17" }}>{price ? money(price) : "—"}</span>
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

      <div style={{ ...box, marginTop: 14 }}>
        <div style={{ fontWeight: 950, marginBottom: 10 }}>Pay securely with PayPal</div>

        {!data.packageChoice ? (
          <div style={{ fontWeight: 900, color: "#b00020" }}>
            Please go back and select a package first.
          </div>
        ) : !clientLoaded ? (
          <div style={{ fontWeight: 900, color: "#b00020" }}>
            Client ID not available in the browser bundle.
          </div>
        ) : paid ? (
          <div style={{ fontWeight: 950, color: "#0b6b2d" }}>✅ Payment received! You can continue.</div>
        ) : (
          <PayPalScriptProvider key={clientId} options={paypalOptions!}>
            <PayPalBlock
              packageChoice={data.packageChoice}
              onPaid={() => setPaid(true)}
              setPayError={setPayError}
            />
          </PayPalScriptProvider>
        )}

        {payError ? (
          <div style={{ marginTop: 10, fontWeight: 900, color: "#b00020" }}>
            PayPal error: {payError}
          </div>
        ) : null}
      </div>

      <div style={row}>
        <TrackedLink href={mailto} style={btnAlt} eventName="CustomSongsSendEmail">
          Send Request by Email →
        </TrackedLink>

        <Link href="/custom-songs/order" style={btn}>
          Edit Order
        </Link>

        <Link href="/custom-songs/photos" style={btn}>
          Edit Photos
        </Link>

        <Link href="/custom-songs/thank-you" style={paid ? btn : disabledBtn} aria-disabled={!paid}>
          Continue →
        </Link>
      </div>
    </CustomSongsShell>
  );
}
