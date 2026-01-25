"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import CustomSongsShell from "@/components/CustomSongsShell";
import { loadOrder, saveOrder, OrderData } from "@/lib/customSongsStore";

function line(label: string, value?: string) {
  if (!value) return "";
  return `${label}: ${value}\n`;
}

export default function OrderPage() {
  const [form, setForm] = useState<OrderData>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setForm(loadOrder());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    saveOrder(form);
  }, [form, mounted]);

  const update = (k: keyof OrderData, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const mailto = useMemo(() => {
    const subject = "Custom Song Request";
    const body =
      "CUSTOM SONG REQUEST\n\n" +
      line("Package", form.packageChoice) +
      "\nCONTACT\n" +
      line("Name", form.name) +
      line("Email", form.email) +
      line("Phone", form.phone) +
      "\nSONG DETAILS\n" +
      line("Occasion", form.occasion) +
      line("Recipient", form.recipientName) +
      line("Relationship", form.relationship) +
      line("Vibe / Mood", form.vibe) +
      line("Genre", form.genre) +
      line("Tempo", form.tempo) +
      line("Must-Include", form.mustInclude) +
      "\nSTORY / NOTES\n" +
      (form.notes || "") +
      "\n\nPHOTO VIDEO\n" +
      line("Photo Count", form.photoCount) +
      line("Photo Notes", form.photoNotes);

    return `mailto:garys_new_music@yahoo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [form]);

  const label: React.CSSProperties = { display: "block", fontWeight: 900, marginBottom: 6 };
  const input: React.CSSProperties = {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.16)",
    background: "#fff",
    fontWeight: 800,
    fontFamily: "inherit",
  };
  const textarea: React.CSSProperties = { ...input, minHeight: 130, resize: "vertical" };

  const panel: React.CSSProperties = {
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.88)",
    boxShadow: "0 14px 34px rgba(0,0,0,0.12)",
    padding: 18,
  };

  const btnPrimary: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.10)",
    background: "#b57b17",
    color: "#fff",
    fontWeight: 900,
    textDecoration: "none",
    boxShadow: "0 10px 22px rgba(0,0,0,0.12)",
  };

  const btnSecondary: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.14)",
    background: "rgba(255,255,255,0.90)",
    color: "#111",
    fontWeight: 900,
    textDecoration: "none",
  };

  return (
    <CustomSongsShell
      badge="CUSTOM SONGS • ORDER"
      title="Song Request Form"
      subtitle="Fill out what you can. If anything is missing, that’s okay — I’ll confirm details with you."
      backHref="/custom-songs"
      backLabel="← Back to Custom Songs"
    >
      <div style={panel}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={label}>Your Name</label>
            <input style={input} value={form.name ?? ""} onChange={(e) => update("name", e.target.value)} autoComplete="off" />
          </div>
          <div>
            <label style={label}>Email</label>
            <input style={input} value={form.email ?? ""} onChange={(e) => update("email", e.target.value)} autoComplete="off" />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={label}>Story / notes</label>
          <textarea style={textarea} value={form.notes ?? ""} onChange={(e) => update("notes", e.target.value)} />
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
          <a href={mailto} style={btnPrimary} onClick={() => track("CustomSongsSubmitMailtoFromOrder")}>
            Submit Request →
          </a>
          <Link href="/custom-songs/review" style={btnSecondary}>
            Review Page
          </Link>
          <Link href="/custom-songs/thank-you" style={btnSecondary}>
            After Submit →
          </Link>
        </div>
      </div>
    </CustomSongsShell>
  );
}
