"use client";

import { useEffect, useMemo, useState } from "react";

type Approval = {
  id: string;
  revision: number;
  status: string;
  updatedAt: string;
  invoice: { invoiceNumber?: string; location?: string; address?: string; tracking?: string; completed?: string; category?: string; summary?: string; totals?: { grand?: string } };
  reviewers?: { name?: string; decision?: string; reason?: string }[];
};

export default function ApprovedInvoicesPage() {
  const [records, setRecords] = useState<Approval[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("Loading approved invoices…");
  const [sendingId, setSendingId] = useState("");

  useEffect(() => {
    fetch("/api/invoice-approvals", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text());
        return response.json();
      })
      .then((items: Approval[]) => {
        setRecords(items.filter((item) => item.status === "approved"));
        setMessage("");
      })
      .catch(() => setMessage("Approved invoices could not be loaded."));
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return records;
    return records.filter((record) => [record.invoice.invoiceNumber, record.invoice.location, record.invoice.address, record.invoice.tracking, record.invoice.category, record.invoice.summary]
      .some((value) => String(value || "").toLowerCase().includes(term)));
  }, [records, query]);

  async function emailCopy(record: Approval) {
    setSendingId(record.id);
    setMessage("");
    try {
      const response = await fetch("/api/invoice-approvals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ copyId: record.id }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Copy could not be sent.");
      setMessage("Invoice copy emailed to gary@frontlineworldwide.com.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setSendingId("");
    }
  }

  return <main className="archivePage">
    <header><div><p>Frontline Pro Services</p><h1>Approved Invoices</h1></div><nav><a href="/invoice-creator">New Invoice</a><a href="/fedex-tracker">Back to Tracker</a></nav></header>
    <section className="archiveWrap">
      <div className="archiveTools"><div><strong>{filtered.length}</strong><span> approved invoices</span></div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search invoice, location, or tracking number" /></div>
      {message && <p className="message">{message}</p>}
      <div className="invoiceList">
        {filtered.map((record) => {
          const approval = record.reviewers?.find((reviewer) => reviewer.decision === "approved");
          return <article key={record.id}>
            <div><h2>{record.invoice.location || "No location"} · {record.invoice.tracking || "No tracking number"}</h2><p>Invoice {record.invoice.invoiceNumber || "not entered"} · Revision {record.revision} · {record.invoice.totals?.grand || "$0.00"}</p><p>{record.invoice.completed || new Date(record.updatedAt).toLocaleDateString()} · {record.invoice.category || "Job type not entered"}</p>{approval && <small>{approval.name || "Reviewer"}: approved</small>}</div>
            <div className="rowActions"><a href={`/invoice-creator?invoice=${encodeURIComponent(record.id)}`}>View Invoice</a><button disabled={sendingId === record.id} onClick={() => void emailCopy(record)}>{sendingId === record.id ? "Sending…" : "Email Me Copy"}</button></div>
          </article>;
        })}
        {!message && !filtered.length && <p className="empty">No approved invoices match your search.</p>}
      </div>
    </section>
    <style jsx>{`
      .archivePage{min-height:100vh;background:#edf3f7;color:#172b3d;font:15px Arial,sans-serif}header{background:linear-gradient(110deg,#32105f,#4a148c);color:white;padding:20px max(18px,calc((100% - 1100px)/2));display:flex;justify-content:space-between;align-items:center;gap:16px}header p{margin:0 0 4px;text-transform:uppercase;letter-spacing:2px;font-size:11px;font-weight:800}h1{margin:0}nav{display:flex;gap:10px}nav a,.rowActions a,.rowActions button{border:0;border-radius:9px;padding:11px 15px;font-weight:800;text-decoration:none;cursor:pointer}nav a{background:white;color:#4a148c}.archiveWrap{max-width:1100px;margin:auto;padding:28px 16px 70px}.archiveTools{display:flex;justify-content:space-between;align-items:center;gap:18px;margin-bottom:18px}.archiveTools strong{font-size:30px;color:#143f68}.archiveTools input{width:min(480px,100%);padding:13px;border:1px solid #b9c9d8;border-radius:10px;font:inherit}.message,.empty{padding:16px;border-radius:10px;background:white;color:#60758a}.invoiceList{display:grid;gap:12px}.invoiceList article{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:18px;background:white;border:1px solid #cbd8e4;border-radius:14px;box-shadow:0 4px 15px #1734530c}.invoiceList h2{margin:0 0 7px;color:#143f68;font-size:19px}.invoiceList p{margin:4px 0;color:#60758a}.invoiceList small{display:block;margin-top:7px;color:#08785c;font-weight:800}.rowActions{display:flex;gap:8px}.rowActions a{background:#1670ad;color:white}.rowActions button{background:#e7f1fa;color:#143f68}.rowActions button:disabled{opacity:.6;cursor:wait}@media(max-width:700px){header,.archiveTools,.invoiceList article{align-items:stretch;flex-direction:column}.archiveTools input{width:100%}.rowActions{flex-direction:column}.rowActions a,.rowActions button{text-align:center}}
    `}</style>
  </main>;
}
