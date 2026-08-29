import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { validatePmTechSession } from "@/lib/pmTechAuth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const tech = await validatePmTechSession(request);
  if (!tech) return NextResponse.redirect(new URL("/pm-tech-login?return=/tugger-report", request.url));
  const filePath = path.join(process.cwd(), "app", "tugger-report", "tugger-form.html");
  const html = (await readFile(filePath, "utf8")).replace("__TECH_SESSION__", JSON.stringify({ id: tech.id, name: tech.name }).replace(/</g, "\\u003c"));
  return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
