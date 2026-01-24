"use client";

import React, { useEffect, useState } from "react";

type PackageChoice = "song_only" | "song_video";
type OrderData = {
  packageChoice?: PackageChoice;
  name?: string;
  email?: string;
  phone?: string;
  occasion?: string;
  story?: string;
  genre?: string;
  notes?: string;
  photos?: string[];
};

const STORAGE_KEY = "gtw_custom_song_order";

function readOrderData(): OrderData {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as OrderData;
  } catch {
    return {};
  }
}

export default function ReviewPage() {
  const [order, setOrder] = useState<OrderData>({});

  useEffect(() => {
    setOrder(readOrderData());
  }, []);

  const packageChoice = order.packageChoice ?? "song_only";

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "28px 16px" }}>
      <div
        style={{
          borderRadius: 16,
          border: "1px solid rgba(0,0,0,0.08)",
          background: "#fff",
          padding: 20,
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: 0.12, fontWeight: 800, color: "#777" }}>
          REVIEW
        </div>
        <h1 style={{ margin: "6px 0 10px", fontSize: 28, lineHeight: 1.15 }}>
          Confirm your request
        </h1>

        <div style={{ marginTop: 10, lineHeight: 1.7, color: "#333" }}>
          <div>
            <b>Package:</b> {packageChoice === "song_video" ? "Photo Music Video" : "Custom Song"}
          </div>
          {order.name && (
            <div>
              <b>Name:</b> {order.name}
            </div>
          )}
          {order.email && (
            <div>
              <b>Email:</b> {order.email}
            </div>
          )}
          {order.occasion && (
            <div>
              <b>Occasion:</b> {order.occasion}
            </div>
          )}
          {order.genre && (
            <div>
              <b>Genre:</b> {order.genre}
            </div>
          )}
          {order.story && (
            <div>
              <b>Story:</b> {order.story}
            </div>
          )}
          {order.photos?.length ? (
            <div>
              <b>Photos:</b> {order.photos.join(", ")}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
          <a
            href="/custom-songs/order"
            style={{
              display: "inline-block",
              padding: "12px 16px",
              borderRadius: 12,
              background: "#eee",
              color: "#111",
              fontWeight: 900,
              textDecoration: "none",
            }}
          >
            Back
          </a>

          {packageChoice === "song_video" && (
            <a
              href="/custom-songs/photos"
              style={{
                display: "inline-block",
                padding: "12px 16px",
                borderRadius: 12,
                background: "#111",
                color: "#fff",
                fontWeight: 900,
                textDecoration: "none",
                boxShadow: "0 8px 16px rgba(0,0,0,0.10)",
              }}
            >
              Edit Photos
            </a>
          )}

          <a
            href="/custom-songs/thank-you"
            style={{
              display: "inline-block",
              padding: "12px 16px",
              borderRadius: 12,
              background: "#b57b17",
              color: "#fff",
              fontWeight: 900,
              textDecoration: "none",
              boxShadow: "0 8px 16px rgba(0,0,0,0.10)",
            }}
          >
            Submit
          </a>
        </div>
      </div>
    </main>
  );
}
