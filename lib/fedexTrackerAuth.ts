import { NextRequest } from "next/server";

const COOKIE_NAME = "fedex_tracker_access";

export function fedExTrackerCookieName() {
  return COOKIE_NAME;
}

export function expectedFedExTrackerPassword() {
  return process.env.FEDEX_TRACKER_PASSWORD || "";
}

export function hasFedExTrackerAccess(request: NextRequest) {
  const expected = expectedFedExTrackerPassword();
  if (!expected) return false;
  return request.cookies.get(COOKIE_NAME)?.value === expected;
}
