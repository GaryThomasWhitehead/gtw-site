export type PartOrder = {
  description: string;
  price: string;
  orderedOn: string;
  expectedOn: string;
  received: boolean;
};

export type TrackingPartOrders = {
  trackingNumber: string;
  location: string;
  partsOrders: PartOrder[];
  version: string;
};

export function partOrderTracking(value: unknown) {
  const tracking = typeof value === "string" ? value.trim().toUpperCase() : "";
  return /^[A-Z0-9][A-Z0-9._/-]{0,63}$/.test(tracking) ? tracking : "";
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function validatePartsOrders(input: unknown): PartOrder[] {
  if (!Array.isArray(input) || input.length > 50) throw new Error("Enter no more than 50 parts per report.");
  return input.map((row, index) => {
    if (!row || typeof row !== "object") throw new Error(`Invalid part on row ${index + 1}.`);
    const { description, price, orderedOn, expectedOn, received } = row;
    if (typeof description !== "string" || !description.trim() || description.length > 500) throw new Error(`Enter a description for part ${index + 1} (500 characters maximum).`);
    if (typeof price !== "string" || (price && !/^\d{1,9}(?:\.\d{1,2})?$/.test(price))) throw new Error(`Enter a valid price for part ${index + 1}, or leave it blank.`);
    if (typeof orderedOn !== "string" || !validDate(orderedOn)) throw new Error(`Enter the ordered date for part ${index + 1}.`);
    if (typeof expectedOn !== "string" || (expectedOn && (!validDate(expectedOn) || expectedOn < orderedOn))) throw new Error(`The expected delivery for part ${index + 1} must be on or after the ordered date.`);
    return { description: description.trim(), price, orderedOn, expectedOn, received: received === true };
  });
}

export function legacyPartOrder(note?: string): PartOrder | undefined {
  if (!note) return;
  const orderedOn = note.match(/^\s*ordered\s+on\s+(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i)?.[1];
  if (!orderedOn) return;
  const expectedOn = note.match(/\bexpected\s+(?:delivery|arrival)(?:\s+date)?\s*[: ]\s*(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i)?.[1] || "";
  return { description: note, price: "", orderedOn, expectedOn, received: false };
}
