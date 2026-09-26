import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) return NextResponse.redirect(new URL("/fedex-tracker", request.url));
  const html = await readFile(path.join(process.cwd(), "app", "invoice-creator", "invoice-creator.html"), "utf8");
  return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
