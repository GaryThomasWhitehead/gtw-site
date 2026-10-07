import { NextRequest, NextResponse } from "next/server";
import {
  correctiveActionViewerCookieName,
  createCorrectiveActionViewerSession,
  createFedExTrackerSession,
  expectedCorrectiveActionViewerCode,
  expectedFedExTrackerPassword,
  fedExTrackerCookieName,
} from "@/lib/fedexTrackerAuth";
import { checkLoginRateLimit, clearLoginFailures, recordLoginFailure } from "@/lib/loginRateLimit";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const limit = await checkLoginRateLimit(request, "corrective-actions");
  if (!limit.allowed) return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429 });

  const code = String(form.get("code") || "").trim();
  const management = expectedFedExTrackerPassword();
  const viewer = expectedCorrectiveActionViewerCode();
  const isManagement = Boolean(management) && code === management;
  const isViewer = code.toLowerCase() === viewer.toLowerCase();
  if (!isManagement && !isViewer) {
    await recordLoginFailure(request, "corrective-actions");
    return NextResponse.redirect(new URL("/corrective-actions?error=1", request.url), { status: 303 });
  }

  await clearLoginFailures(request, "corrective-actions");
  const response = NextResponse.redirect(new URL("/corrective-actions", request.url), { status: 303 });
  response.cookies.set(
    isManagement ? fedExTrackerCookieName() : correctiveActionViewerCookieName(),
    isManagement ? createFedExTrackerSession() : createCorrectiveActionViewerSession(),
    { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 },
  );
  return response;
}
