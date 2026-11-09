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
  const [access, setAccess] = useState<{ token: string; id: string } | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token") || "", id = params.get("id") || "";
    setAccess({ token, id });
    if (!token && !id) { setError("Open an invoice from Pending Invoice Approvals or your review email."); return; }
    const query = new URLSearchParams(token ? { token } : { id });
    fetch(`/api/invoice-approvals?${query}`, { cache: "no-store" }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(response.status === 401 ? "Sign in to the tracker, then open this invoice again." : result.error);
      setData(result);
    }).catch(cause => setError(cause.message));
  }, []);
  async function decide(decision: "approved" | "denied") {
    if (saving || !access || !data) return;
    if (decision === "denied" && !reason.trim()) { setError("Enter the changes needed before denying this invoice."); return; }
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/invoice-approvals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...access, revision: data.revision, decision, reason: decision === "denied" ? reason : "" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      const outcome = `Invoice ${result.status}. ${result.emailSent === false ? "The decision was saved, but the email to Gary failed." : "Gary was notified by email."}`;
      setSent(result.trackerSyncFailed ? `${outcome} The tracker update failed.` : outcome);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not record the decision."); }
    finally { setSaving(false); }
  }
  if (error && !data) return <main className="review"><div className="panel error">{error}</div></main>;
  if (!data) return <main className="review"><div className="panel">Loading invoice…</div></main>;
  const i = data.invoice, t = i.totals || {};
  return <main className="review"><div className="panel"><p className="eyebrow">FRONTLINE PRO SERVICES</p><h1>FedEx Invoice Approval</h1><p className="sub">Review for {data.reviewer} · Revision {data.revision}</p>{access?.id && !access.token && <p><a href="/invoice-creator#approvalList">Back to Pending Invoice Approvals</a></p>}{sent ? <div className="success" role="status">{sent}</div> : <><section className="facts"><p><b>Invoice Number</b>{i.invoiceNumber || "Not entered"}</p><p><b>Location</b>{i.location}</p><p><b>Address</b>{i.address}</p><p><b>Tracking / WO / PO</b>{i.tracking}</p><p><b>Completed</b>{i.completed}</p><p><b>Technicians on Job</b>{i.technicians || "Not entered"}</p><p><b>NTE</b>{formatNte(i.nte)}</p><p><b>Job Type</b>{i.category}</p><p><b>Work Summary</b>{i.summary}</p></section><h2>Labor</h2>{(i.labor || []).map((x:any,n:number)=><div className="line" key={n}><span>{x.role} · {x.time} · {x.techs} tech(s) × {x.hours} hr</span><b>{x.amount}</b></div>)}<h2>Materials</h2>{(i.materials || []).map((x:any,n:number)=><div className="line" key={n}><span>{x.description || "Material"} · {x.qty} {x.unit}</span><b>{x.billed}</b></div>)}<section className="totals"><span>Labor</span><b>{t.labor}</b><span>Travel</span><b>{t.travel}</b><span>Materials</span><b>{t.materials}</b><span>Freight / Other</span><b>{t.extras}</b><span>Total</span><b className="grand">{t.grand}</b></section>{data.alreadyDecided ? <div className="success">This invoice revision has already been {data.status}.</div> : <><label htmlFor="denial-notes">What needs to change? (required for denial)</label><textarea id="denial-notes" rows={5} maxLength={3000} disabled={saving} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Explain what needs to be changed"></textarea>{error && <div className="error" role="alert">{error}</div>}<div className="actions"><button className="deny" disabled={saving} onClick={()=>decide("denied")}>Deny & Request Changes</button><button className="approve" disabled={saving} onClick={()=>decide("approved")}>Approve Invoice</button></div></>}</>}</div></main>;
}
