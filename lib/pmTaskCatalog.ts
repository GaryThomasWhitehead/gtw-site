import ExcelJS from "exceljs";
import JSZip from "jszip";
import path from "node:path";
import defaultCatalog from "@/data/pm-task-catalog.json";

export type PmTask = { task: string; description: string };
export type PmTaskGroup = { name: string; tasks: PmTask[] };
export type PmTaskCatalogRecord = {
  recordType: "pm-task-catalog";
  filename: string;
  uploadedAt: string;
  groupCount: number;
  taskCount: number;
  catalog: PmTaskGroup[];
};

const CURRENT_KEY = "PMTASKCATALOG:current";
const xmlDecode = (value: string) => value
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'").replace(/&amp;/g, "&").replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
const cellText = (value: ExcelJS.CellValue) => {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (typeof value !== "object") return String(value).trim();
  if ("richText" in value && Array.isArray(value.richText)) return value.richText.map((part) => part.text || "").join("").trim();
  if ("result" in value && value.result != null) return String(value.result).trim();
  if ("text" in value && value.text != null) return String(value.text).trim();
  return "";
};
const attributes = (tag: string) => Object.fromEntries(Array.from(tag.matchAll(/([\w:-]+)="([^"]*)"/g), match => [match[1], xmlDecode(match[2])]));
const relationships = (xml: string) => new Map(Array.from(xml.matchAll(/<Relationship\b[^>]*\/>/g), match => {
  const attrs = attributes(match[0]);
  return [attrs.Id, attrs.Target];
}));

async function drawingTasks(buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const workbookXml = await zip.file("xl/workbook.xml")?.async("string") || "";
  const workbookRels = relationships(await zip.file("xl/_rels/workbook.xml.rels")?.async("string") || "");
  const result = new Map<string, string[]>();
  for (const sheetTag of workbookXml.match(/<sheet\b[^>]*\/>/g) || []) {
    const sheetAttrs = attributes(sheetTag);
    const sheetTarget = workbookRels.get(sheetAttrs["r:id"]);
    if (!sheetTarget) continue;
    const sheetPath = path.posix.normalize(`xl/${sheetTarget.replace(/^\//, "")}`);
    const sheetXml = await zip.file(sheetPath)?.async("string") || "";
    const drawingId = attributes(sheetXml.match(/<drawing\b[^>]*\/>/)?.[0] || "")["r:id"];
    if (!drawingId) continue;
    const sheetFile = path.posix.basename(sheetPath);
    const sheetRelsPath = path.posix.join(path.posix.dirname(sheetPath), "_rels", `${sheetFile}.rels`);
    const sheetRels = relationships(await zip.file(sheetRelsPath)?.async("string") || "");
    const drawingTarget = sheetRels.get(drawingId);
    if (!drawingTarget) continue;
    const drawingPath = path.posix.normalize(path.posix.join(path.posix.dirname(sheetPath), drawingTarget));
    const drawingXml = await zip.file(drawingPath)?.async("string") || "";
    const lines: string[] = [];
    for (const paragraph of drawingXml.match(/<a:p\b[\s\S]*?<\/a:p>/g) || []) {
      const text = Array.from(paragraph.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g), match => xmlDecode(match[1])).join("").replace(/\s+/g, " ").trim();
      if (text.length > 4 && !lines.includes(text)) lines.push(text);
    }
    result.set(sheetAttrs.name, lines);
  }
  return result;
}

export async function parsePmTaskWorkbook(bytes: Buffer): Promise<PmTaskGroup[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(bytes as unknown as ExcelJS.Buffer);
  const start = workbook.worksheets.findIndex((sheet) => sheet.name.trim().toUpperCase() === "SLIDER BED");
  const end = workbook.worksheets.findIndex((sheet) => sheet.name.trim().toUpperCase() === "GDU BYPASS");
  if (start < 0 || end < start) throw new Error("Workbook must contain tabs from SLIDER BED through GDU BYPASS.");
  const drawings = await drawingTasks(bytes);
  const catalog: PmTaskGroup[] = [];
  for (const sheet of workbook.worksheets.slice(start, end + 1)) {
    const tasks: PmTask[] = [];
    for (let row = 2; row <= sheet.rowCount; row += 1) {
      const task = cellText(sheet.getCell(row, 1).value);
      const description = cellText(sheet.getCell(row, 2).value);
      if (description) tasks.push({ task: task || String(row - 1), description });
    }
    if (!tasks.length) {
      (drawings.get(sheet.name) || []).forEach((description, index) => tasks.push({ task: String(index + 1), description }));
    }
    if (tasks.length) catalog.push({ name: sheet.name, tasks });
  }
  if (!catalog.length) throw new Error("No PM checklist items were found in the required tab range.");
  return catalog;
}

function config() {
  return {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    table: process.env.FEDEX_TRACKER_TABLE || "fedex_work_orders",
  };
}
const apiHeaders = (key: string) => ({ apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" });

export async function loadPmTaskCatalogRecord(): Promise<PmTaskCatalogRecord | null> {
  const { url, key, table } = config();
  if (!url || !key) return null;
  const params = new URLSearchParams({ select: "data", tracking_number: `eq.${CURRENT_KEY}`, limit: "1" });
  const response = await fetch(`${url}/rest/v1/${table}?${params}`, { headers: apiHeaders(key), cache: "no-store" });
  if (!response.ok) return null;
  const [row] = await response.json() as Array<{ data?: PmTaskCatalogRecord }>;
  return row?.data?.recordType === "pm-task-catalog" && Array.isArray(row.data.catalog) ? row.data : null;
}

export async function loadCurrentPmTaskCatalog(): Promise<PmTaskGroup[]> {
  return (await loadPmTaskCatalogRecord())?.catalog || defaultCatalog as PmTaskGroup[];
}

export async function savePmTaskCatalog(record: PmTaskCatalogRecord) {
  const { url, key, table } = config();
  if (!url || !key) throw new Error("PM task storage is not configured.");
  const response = await fetch(`${url}/rest/v1/${table}?on_conflict=tracking_number`, {
    method: "POST",
    headers: { ...apiHeaders(key), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify([{ tracking_number: CURRENT_KEY, data: record, updated_at: record.uploadedAt }]),
  });
  if (!response.ok) throw new Error(await response.text());
}
