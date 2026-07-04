import { NextRequest, NextResponse } from "next/server";
import { expectedFedExTrackerPassword, fedExTrackerCookieName, fedExTrackerCookieValue } from "@/lib/fedexTrackerAuth";

export async function POST(request: NextRequest) {
  const expected = expectedFedExTrackerPassword();
  if (!expected) {
    return new NextResponse("FedEx tracker password is not configured.", { status: 500 });
  }

  const form = await request.formData();
  const password = String(form.get("password") || "");
  if (password !== expected) {
    return NextResponse.redirect(new URL("/fedex-tracker?error=1", request.url), { status: 303 });
  }

  const response = NextResponse.redirect(new URL("/fedex-tracker", request.url), { status: 303 });
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12
  };

  response.cookies.set(fedExTrackerCookieName(), fedExTrackerCookieValue(), {
    ...cookieOptions,
    path: "/fedex-tracker"
  });
  response.cookies.set(fedExTrackerCookieName(), fedExTrackerCookieValue(), {
    ...cookieOptions,
    path: "/api/fedex-work-orders"
  });
  return response;
}
