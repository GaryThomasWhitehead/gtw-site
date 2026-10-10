"use client";
import { useEffect, useState } from "react";
import "./style.css";

function formatNte(value: unknown) {
  const amount = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(amount) && String(value ?? "").trim()
    ? amount.toLocaleString("en-US", { style: "currency", currency: "USD" })
    : "Not entered";
}

export default function InvoiceApprovalPage() {
  const [data, setData] = useState<any>(null), [error, setError] = useState(""), [reason, setReason] = useState(""), [sent, setSent] = useState("");
  const token = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("token") || "";
  useEffect(() => { if (token) fetch(`/api/invoice-approvals?token=${encodeURIComponent(token)}`).then(async r => { const j = await r.json(); if (!r.ok) throw new Error(j.error); setData(j); }).catch(e => setError(e.message)); }, [token]);
  async function decide(decision: "approved" | "denied") { setError(""); const response = await fetch("/api/invoice-approvals", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, decision, reason }) }); const result = await response.json(); if (!response.ok) return setError(result.error); setSent(decision); }
  if (error && !data) return <main className="review"><div className="panel error">{error}</div></main>;
  if (!data) return <main className="review"><div className="panel">Loading invoice…</div></main>;
  const i = data.invoice, t = i.totals || {};
  return <main className="review"><div className="panel"><p className="eyebrow">FRONTLINE PRO SERVICES</p><h1>FedEx Invoice Approval</h1><p className="sub">Review for {data.reviewer} · Revision {data.revision}</p>{sent ? <div className="success">Your decision was saved and Gary was notified.</div> : <><section className="facts"><p><b>Invoice Number</b>{i.invoiceNumber || "Not entered"}</p><p><b>Location</b>{i.location}</p><p><b>Address</b>{i.address}</p><p><b>Tracking / WO / PO</b>{i.tracking}</p><p><b>Completed</b>{i.completed}</p><p><b>NTE</b>{formatNte(i.nte)}</p><p><b>Job Type</b>{i.category}</p><p><b>Work Summary</b>{i.summary}</p></section><h2>Labor</h2>{(i.labor || []).map((x:any,n:number)=><div className="line" key={n}><span>{x.role} · {x.time} · {x.techs} tech(s) × {x.hours} hr</span><b>{x.amount}</b></div>)}<h2>Materials</h2>{(i.materials || []).map((x:any,n:number)=><div className="line" key={n}><span>{x.description || "Material"} · {x.qty} {x.unit}</span><b>{x.billed}</b></div>)}<section className="totals"><span>Labor</span><b>{t.labor}</b><span>Travel</span><b>{t.travel}</b><span>Materials</span><b>{t.materials}</b><span>Freight / Other</span><b>{t.extras}</b><span>Total</span><b className="grand">{t.grand}</b></section>{data.alreadyDecided ? <div className="success">This invoice revision has already been {data.status}.</div> : <><label>Reason or requested changes (required for denial)</label><textarea rows={5} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Explain what needs to be changed"></textarea>{error && <div className="error">{error}</div>}<div className="actions"><button className="deny" onClick={()=>decide("denied")}>Deny & Request Changes</button><button className="approve" onClick={()=>decide("approved")}>Approve Invoice</button></div></>}</>}</div></main>;
}
