"use client";

import { useState } from "react";
import { validatePartsOrders, type PartOrder } from "@/lib/partsOrders";
import styles from "./reports.module.css";

const blankPart = (): PartOrder => ({ description: "", price: "", orderedOn: "", expectedOn: "", received: false });

export default function PartsOrderEditor({ orders, legacyNote, startWithPart = false, detailsChanged = false, onSave }: {
  orders: PartOrder[];
  legacyNote?: string;
  startWithPart?: boolean;
  detailsChanged?: boolean;
  onSave: (orders: PartOrder[]) => Promise<void>;
}) {
  const [draft, setDraft] = useState(() => startWithPart && orders.length < 50 ? [...orders, blankPart()] : orders);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  function edit(index: number, update: Partial<PartOrder>) {
    setDraft(current => current.map((part, i) => i === index ? { ...part, ...update } : part));
    setMessage("");
  }
  async function save() {
    setSaving(true);
    setMessage("");
    setError(false);
    try {
      const validated = validatePartsOrders(draft);
      await onSave(validated);
      setDraft(validated);
      setMessage("Part orders saved.");
    } catch (cause) {
      setError(true);
      setMessage(cause instanceof Error ? cause.message : "Could not save part orders.");
    } finally { setSaving(false); }
  }
  return <div className={styles.partOrderEditor}>
    <strong>Part orders</strong>
    <p>Enter each part after ordering it. Mark it received when it arrives.</p>
    {legacyNote && <p>Previous order note: {legacyNote}</p>}
    {draft.map((part, index) => <fieldset className={styles.partOrderFields} key={index} disabled={saving}>
      <legend>Part {index + 1}</legend>
      <label>Part description<input maxLength={500} value={part.description} onChange={event => edit(index, { description: event.target.value })} /></label>
      <label>Price (USD)<input type="number" inputMode="decimal" min="0" step="0.01" value={part.price} onChange={event => edit(index, { price: event.target.value })} /></label>
      <label>Ordered date<input type="date" value={part.orderedOn} onChange={event => edit(index, { orderedOn: event.target.value })} /></label>
      <label>Expected delivery<input type="date" min={part.orderedOn || undefined} value={part.expectedOn} onChange={event => edit(index, { expectedOn: event.target.value })} /></label>
      <label className={styles.partReceived}><input type="checkbox" checked={part.received} onChange={event => edit(index, { received: event.target.checked })} />Received</label>
      <button type="button" onClick={() => setDraft(current => current.filter((_, i) => i !== index))}>Remove row</button>
    </fieldset>)}
    <div className={styles.partOrderButtons}>
      <button type="button" disabled={saving || draft.length >= 50} onClick={() => setDraft(current => [...current, blankPart()])}>Add ordered part</button>
      <button type="button" disabled={saving || (!detailsChanged && JSON.stringify(draft) === JSON.stringify(orders))} onClick={() => void save()}>{saving ? "Saving…" : "Save part orders"}</button>
    </div>
    {message && <p role={error ? "alert" : "status"}>{message}</p>}
  </div>;
}
