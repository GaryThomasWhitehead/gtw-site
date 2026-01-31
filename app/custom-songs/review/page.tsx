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
const STORAGE_KEY_OLD = "customSongsOrder_v4";

function safeParse(json: string | null): any {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function migrateStorageIfNeeded() {
  if (typeof window === "undefined") return;

  const v5 = localStorage.getItem(STORAGE_KEY);
  if (v5 && v5.trim().length > 0) return;

  const v4 = localStorage.getItem(STORAGE_KEY_OLD);
  if (!v4 || v4.trim().length === 0) return;

  localStorage.setItem(STORAGE_KEY, v4);
}

function loadOrder(): OrderData {
  if (typeof window === "undefined") return {};
  try {
    migrateStorageIfNeeded();
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = safeParse(raw);
    return (parsed ?? {}) as OrderData;
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

    const json = await res.json().catch(() => ({} as any));
    if (!res.ok) throw new Error(json?.error || `Failed to create order (${res.status})`);
    return json.id as string;
  };

  const onApprove: PayPalButtonsComponentProps["onApprove"] = async (details) => {
    setPayError(null);

    const res = await fetch("/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: details.orderID }),
    });

    const json = await res.json().catch(() => ({} as any));
    if (!res.ok) throw new Error(json?.error || `Failed to capture order (${res.status})`);

    onPaid();
  };

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.75, marginBottom: 10 }}>
        PayPal SDK status:{" "}
        {isPending ? "loading…" : isRejected ? "failed" : isResolved ? "ready" : "unknown"}
      </div>

      {isPending ? (
        <div style={{ fontWeight: 900, opacity: 0.8 }}>Loading PayPal…</div>
      ) : null}

      {isRejected ? (
        <div style={{ fontWeight: 900, color: "#b00020", lineHeight: 1.5 }}>
          PayPal script failed to load.
          <br />
          Common causes:
          <br />• ad blocker / privacy shield
          <br />• corporate firewall
          <br />• PayPal blocked in browser
          <br />• invalid PayPal client-id (PayPal returns 400)
          <br />
          <br />
          Open DevTools → Network and click the <b>paypal.com/sdk/js</b> request.
          <br />
          If it’s <b>400</b>, the response usually says why (often “client-id not recognized”).
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

  // PayPal config loaded from your API route (NOT build-time env)
  const [ppClientId, setPpClientId] = useState<string>("");
  const [ppEnv, setPpEnv] = useState<"sandbox" | "live">("sandbox");
  const [ppConfigError, setPpConfigError] = useState<string | null>(null);

  useEffect(() => {
    setData(loadOrder());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPayPalConfig() {
      setPpConfigError(null);
      try {
        const res = await fetch("/api/paypal/client-id", { cache: "no-store" });
        const json = await res.json().catch(() => ({} as any));
        if (!res.ok) throw new Error(json?.error || `Failed to load PayPal config (${res.status})`);

        const clientId = String(json?.clientId ?? "").trim();
        const env = String(json?.env ?? "sandbox").toLowerCase() === "live" ? "live" : "sandbox";

        if (!clientId) throw new Error("Missing clientId from /api/paypal/client-id");

        if (!cancelled) {
          setPpClientId(clientId);
          setPpEnv(env);
        }
      } catch (e: any) {
        if (!cancelled) setPpConfigError(String(e?.message || e));
      }
    }

    loadPayPalConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  const pkgTitle = data.packageChoice ? PACKAGE_LABELS[data.packageChoice] : "";
  const price = data.packageChoice ? PACKAGE_PRICES[data.packageChoice] : 0;

  const paypalOptions = useMemo(() => {
    if (!ppClientId) return null;

    // "client-id" is the correct PayPal SDK option key.
    // Casting keeps TS happy across versions.
    return {
      "client-id": ppClientId,
      currency: "USD",
      intent: "capture",
      components: "buttons",
      // Helps debugging in PayPal dashboards/logs
      "data-sdk-integration-source": "gtw-custom-songs",
    } as any;
  }, [ppClientId]);

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
        <div style={{ fontWeight: 950, marginBottom: 10 }}>
          Pay securely with PayPal{" "}
          <span style={{ fontSize: 12, opacity: 0.65, fontWeight: 900 }}>
            (env: {ppEnv})
          </span>
        </div>

        {!data.packageChoice ? (
          <div style={{ fontWeight: 900, color: "#b00020" }}>
            Please go back and select a package first.
          </div>
        ) : ppConfigError ? (
          <div style={{ fontWeight: 900, color: "#b00020", lineHeight: 1.5 }}>
            Could not load PayPal configuration.
            <br />
            {ppConfigError}
          </div>
        ) : !paypalOptions ? (
          <div style={{ fontWeight: 900, opacity: 0.8 }}>Loading PayPal configuration…</div>
        ) : paid ? (
          <div style={{ fontWeight: 950, color: "#0b6b2d" }}>✅ Payment received! You can continue.</div>
        ) : (
          <PayPalScriptProvider
            key={`${ppClientId}:${ppEnv}`} // force reload when config changes
            options={paypalOptions}
          >
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
