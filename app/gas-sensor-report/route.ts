import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { validatePmTechSession } from "@/lib/pmTechAuth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const tech = await validatePmTechSession(request);
  if (!tech) return NextResponse.redirect(new URL("/pm-tech-login?return=/gas-sensor-report", request.url));
  const html = (await readFile(path.join(process.cwd(), "app", "gas-sensor-report", "gas-sensor-form.html"), "utf8"))
    .replace("__TECH_SESSION__", JSON.stringify({ id: tech.id, name: tech.name }).replace(/</g, "\\u003c"));
  return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
