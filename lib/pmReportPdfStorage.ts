const BUCKET = process.env.PM_REPORT_PDF_BUCKET || "pm-report-pdfs";

const storageHeaders = (key: string) => ({ apikey: key, Authorization: `Bearer ${key}` });
const objectUrl = (url: string, path: string) => `${url}/storage/v1/object/${encodeURIComponent(BUCKET)}/${path.split("/").map(encodeURIComponent).join("/")}`;

async function ensureBucket(url: string, key: string) {
  const existing = await fetch(`${url}/storage/v1/bucket/${encodeURIComponent(BUCKET)}`, { headers: storageHeaders(key), cache: "no-store" });
  if (existing.ok) return true;
  const created = await fetch(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...storageHeaders(key), "Content-Type": "application/json" },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: false }),
  });
  return created.ok || created.status === 409;
}

export function reportPdfPath(id: string) {
  return `reports/${String(id).replace(/[^a-zA-Z0-9._-]/g, "_")}.pdf`;
}

export async function uploadReportPdf(url: string, key: string, path: string, pdf: Buffer | Uint8Array) {
  if (!(await ensureBucket(url, key))) return false;
  const response = await fetch(objectUrl(url, path), {
    method: "POST",
    headers: { ...storageHeaders(key), "Content-Type": "application/pdf", "x-upsert": "true" },
    body: new Uint8Array(pdf),
  });
  return response.ok;
}

export async function downloadReportPdf(url: string, key: string, path: string) {
  const response = await fetch(objectUrl(url, path), { headers: storageHeaders(key), cache: "no-store" });
  if (!response.ok) return null;
  return Buffer.from(await response.arrayBuffer());
}

export async function deleteReportPdf(url: string, key: string, path: string) {
  const response = await fetch(`${url}/storage/v1/object/${encodeURIComponent(BUCKET)}`, {
    method: "DELETE",
    headers: { ...storageHeaders(key), "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: [path] }),
  });
  return response.ok;
}
