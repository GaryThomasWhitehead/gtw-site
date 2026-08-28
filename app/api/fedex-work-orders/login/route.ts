import { NextRequest, NextResponse } from "next/server";
import { expectedFedExTrackerPassword, fedExTrackerCookieName, fedExTrackerCookieValue } from "@/lib/fedexTrackerAuth";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const wantsJson = request.headers.get("accept")?.includes("application/json") || form.get("return") === "json";
  const expected = expectedFedExTrackerPassword();
  if (!expected) {
    return wantsJson
      ? NextResponse.json({ error: "Tracker password is not configured." }, { status: 500 })
      : new NextResponse("FedEx tracker password is not configured.", { status: 500 });
  }

  const password = String(form.get("password") || "");
  if (password !== expected) {
    return wantsJson
      ? NextResponse.json({ error: "Incorrect password." }, { status: 401 })
      : NextResponse.redirect(new URL("/fedex-tracker?error=1", request.url), { status: 303 });
  }

  const response = wantsJson
    ? NextResponse.json({ ok: true })
    : NextResponse.redirect(new URL("/fedex-tracker", request.url), { status: 303 });
  response.cookies.set(fedExTrackerCookieName(), fedExTrackerCookieValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
  return response;
}
