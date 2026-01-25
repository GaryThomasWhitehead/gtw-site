"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import CustomSongsShell from "@/components/CustomSongsShell";
import { loadOrder, OrderData } from "@/lib/customSongsStore";

function line(label: string, value?: string) {
  if (!value) return "";
  return `${label}: ${value}\n`;
}

export default function ReviewPage() {
  const [form, setForm] = useState<OrderData>({});

  useEffect(() => {
    setForm(loadOrder());
  }, []);

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

  const block: React.CSSProperties = {
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.88)",
    boxShadow: "0 14px 34px rgba(0,0,0,0.12)",
    padding: 18,
    marginBottom: 14,
    fontWeight: 800,
    lineHeight: 1.8,
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
      badge="CUSTOM SONGS • REVIEW"
      title="Review Your Request"
      subtitle="Quick check before you submit. If anything is missing, that’s fine — we can confirm the details together."
      backHref="/custom-songs/photos"
      backLabel="← Back to Details"
    >
      <div style={block}>
        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>Summary</div>
        <div>Package: <strong>{form.packageChoice || "—"}</strong></div>
        <div>Name: <strong>{form.name || "—"}</strong></div>
        <div>Email: <strong>{form.email || "—"}</strong></div>
        <div>Occasion: <strong>{form.occasion || "—"}</strong></div>
        <div>Recipient: <strong>{form.recipientName || "—"}</strong></div>
        <div>Vibe: <strong>{form.vibe || "—"}</strong></div>
        <div>Genre: <strong>{form.genre || "—"}</strong></div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a
          href={mailto}
          style={btnPrimary}
          onClick={() => track("CustomSongsSubmitMailto")}
        >
          Submit Request →
        </a>

        <Link href="/custom-songs/order" style={btnSecondary}>
          Edit on Order Page
        </Link>

        <Link href="/custom-songs/samples" style={btnSecondary}>
          View Samples
        </Link>

        <Link href="/custom-songs/thank-you" style={btnSecondary}>
          Continue →
        </Link>
      </div>
    </CustomSongsShell>
  );
}
