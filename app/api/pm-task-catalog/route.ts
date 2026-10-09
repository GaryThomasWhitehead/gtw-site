import { NextRequest, NextResponse } from "next/server";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";
import { loadPmTaskCatalogRecord, parsePmTaskWorkbook, savePmTaskCatalog } from "@/lib/pmTaskCatalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const record = await loadPmTaskCatalogRecord();
  return NextResponse.json(record ? {
    filename: record.filename,
    uploadedAt: record.uploadedAt,
    groupCount: record.groupCount,
    taskCount: record.taskCount,
  } : { filename: "Built-in PM task catalog", uploadedAt: "", groupCount: 30, taskCount: 863 });
}

export async function POST(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an Excel workbook." }, { status: 400 });
  if (!/\.xlsx$/i.test(file.name)) return NextResponse.json({ error: "The PM task file must be an .xlsx workbook." }, { status: 400 });
  if (file.size > 20_000_000) return NextResponse.json({ error: "The workbook must be smaller than 20 MB." }, { status: 413 });
  try {
    const catalog = await parsePmTaskWorkbook(Buffer.from(await file.arrayBuffer()));
    const uploadedAt = new Date().toISOString();
    const taskCount = catalog.reduce((total, group) => total + group.tasks.length, 0);
    await savePmTaskCatalog({ recordType: "pm-task-catalog", filename: file.name, uploadedAt, groupCount: catalog.length, taskCount, catalog });
    return NextResponse.json({ filename: file.name, uploadedAt, groupCount: catalog.length, taskCount });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "The workbook could not be processed." }, { status: 400 });
  }
}
