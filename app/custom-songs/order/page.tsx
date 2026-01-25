"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CustomSongsShell from "@/components/CustomSongsShell";

type OrderData = {
  packageChoice?: "song_only" | "song_video";
  name?: string;
  email?: string;
  phone?: string;
  occasion?: string;
  recipientName?: string;
  relationship?: string;
  vibe?: string;
  genre?: string;
  tempo?: string;
  mustInclude?: string;
  notes?: string;
  photoCount?: string;
  photoNotes?: string;
};

const STORAGE_KEY = "customSongsOrder_v3";

function loadOrder(): OrderData {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveOrder(next: OrderData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export default function OrderPage() {
  const [form, setForm] = useState<OrderData>({});

  useEffect(() => setForm(loadOrder()), []);
  useEffect(() => saveOrder(form), [form]);

  const label: React.CSSProperties = { display: "block", fontWeight: 900, marginBottom: 6 };
  const input: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "#fff",
    fontFamily: "inherit",
  };
  const textarea: React.CSSProperties = { ...input, minHeight: 130, resize: "vertical" };
  const row2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };

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

  return (
    <CustomSongsShell
      title="Start Your Song Request"
      subtitle="Fill in what you can. If you’re not sure, leave it blank — I’ll confirm details so it fits your story."
      backHref="/custom-songs"
      badge="ORDER"
    >
      <h3 style={{ margin: "0 0 10px", fontWeight: 900, fontSize: 20 }}>Contact</h3>

      <div style={row2}>
        <div>
          <label style={label}>Your Name *</label>
          <input style={input} value={form.name ?? ""} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        </div>

        <div>
          <label style={label}>Email *</label>
          <input style={input} value={form.email ?? ""} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={label}>Phone (optional)</label>
        <input style={input} value={form.phone ?? ""} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
      </div>

      <h3 style={{ margin: "18px 0 10px", fontWeight: 900, fontSize: 20 }}>Song details</h3>

      <div style={row2}>
        <div>
          <label style={label}>Occasion</label>
          <input style={input} value={form.occasion ?? ""} onChange={(e) => setForm((p) => ({ ...p, occasion: e.target.value }))} />
        </div>

        <div>
          <label style={label}>Recipient Name</label>
          <input style={input} value={form.recipientName ?? ""} onChange={(e) => setForm((p) => ({ ...p, recipientName: e.target.value }))} />
        </div>

        <div>
          <label style={label}>Your relationship</label>
          <input style={input} value={form.relationship ?? ""} onChange={(e) => setForm((p) => ({ ...p, relationship: e.target.value }))} />
        </div>

        <div>
          <label style={label}>Must-include phrases</label>
          <input style={input} value={form.mustInclude ?? ""} onChange={(e) => setForm((p) => ({ ...p, mustInclude: e.target.value }))} />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={label}>Story / notes</label>
        <textarea style={textarea} value={form.notes ?? ""} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
        <Link href="/custom-songs/review" style={btnAlt}>
          Continue to Review →
        </Link>
        <Link href="/custom-songs/photos" style={btn}>
          Add Photo Video Details
        </Link>
      </div>
    </CustomSongsShell>
  );
}
