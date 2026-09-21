"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";

declare global {
  interface Window {
    paypal?: {
      FUNDING: { PAYPAL: string };
      Buttons: (options: Record<string, unknown>) => {
        render: (element: HTMLElement) => Promise<void>;
        close?: () => Promise<void>;
      };
    };
  }
}

const PRESETS = [10, 25, 50, 100];

export default function PayPalDonation() {
  const [amount, setAmount] = useState("25");
  const [clientId, setClientId] = useState("");
  const [environment, setEnvironment] = useState("sandbox");
  const [message, setMessage] = useState("");
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/paypal/client-id", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok && data.ok && data.clientId) {
          setClientId(String(data.clientId));
          setEnvironment(data.env === "live" ? "live" : "sandbox");
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!clientId || !buttonRef.current) return;
    const container = buttonRef.current;
    container.innerHTML = "";
    const scriptId = "paypal-donation-sdk";

    const renderButtons = () => {
      if (!window.paypal || !container.isConnected) return;
      container.innerHTML = "";
      const buttons = window.paypal.Buttons({
        fundingSource: window.paypal.FUNDING.PAYPAL,
        style: { layout: "vertical", shape: "rect", label: "donate", height: 45 },
        createOrder: async () => {
          setMessage("");
          const donation = Number(amount);
          if (!Number.isFinite(donation) || donation < 1 || donation > 5000) {
            setMessage("Enter an amount between $1 and $5,000.");
            throw new Error("Invalid donation amount");
          }
          const response = await fetch("/api/paypal/create-donation-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: donation }),
          });
          const data = await response.json();
          if (!response.ok || !data.id) {
            setMessage(data.error || "PayPal could not start the donation.");
            throw new Error(data.error || "PayPal order failed");
          }
          track("DonateClick", { campaign: "NotForSale", provider: "PayPal", amount: donation });
          return data.id;
        },
        onApprove: async (data: { orderID?: string }) => {
          const response = await fetch("/api/paypal/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderID }),
          });
          const result = await response.json();
          if (!response.ok || !result.ok) {
            setMessage(result.error || "PayPal could not complete the donation.");
            return;
          }
          setMessage("Thank you. Your PayPal donation was completed.");
          track("DonationComplete", { campaign: "NotForSale", provider: "PayPal" });
        },
        onCancel: () => setMessage("PayPal checkout was canceled."),
        onError: () => setMessage("PayPal checkout could not be completed. Please try again."),
      });
      void buttons.render(container);
    };

    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing && window.paypal) {
      renderButtons();
      return;
    }
    if (existing) {
      existing.addEventListener("load", renderButtons, { once: true });
      return () => existing.removeEventListener("load", renderButtons);
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture&components=buttons`;
    script.async = true;
    script.onload = renderButtons;
    document.head.appendChild(script);
  }, [amount, clientId]);

  if (!clientId) return null;

  return (
    <div style={{ width: "min(100%, 360px)" }}>
      <p style={{ margin: "0 0 8px", fontWeight: 700 }}>Choose a PayPal donation amount</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        {PRESETS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setAmount(String(value))}
            style={{
              border: amount === String(value) ? "2px solid #0070ba" : "1px solid #bbb",
              background: "#fff",
              borderRadius: 8,
              padding: "8px 12px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            ${value}
          </button>
        ))}
      </div>
      <label style={{ display: "block", marginBottom: 12 }}>
        <span style={{ display: "block", fontSize: 14, marginBottom: 4 }}>Other amount (USD)</span>
        <input
          aria-label="PayPal donation amount"
          type="number"
          min="1"
          max="5000"
          step="1"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid #aaa", borderRadius: 8, fontSize: 16 }}
        />
      </label>
      <div ref={buttonRef} />
      {environment === "sandbox" ? <p style={{ color: "#8a5200", fontSize: 13 }}>PayPal test mode</p> : null}
      {message ? <p role="status" style={{ margin: "8px 0 0", fontWeight: 700 }}>{message}</p> : null}
    </div>
  );
}
