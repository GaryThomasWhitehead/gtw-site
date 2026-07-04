import { NextRequest } from "next/server";

const COOKIE_NAME = "fedex_tracker_access";
const ACCESS_VALUE = "granted";

export function fedExTrackerCookieName() {
  return COOKIE_NAME;
}

export function fedExTrackerCookieValue() {
  return ACCESS_VALUE;
}

export function expectedFedExTrackerPassword() {
  return process.env.FEDEX_TRACKER_PASSWORD || "";
}

export function hasFedExTrackerAccess(request: NextRequest) {
  if (!expectedFedExTrackerPassword()) return false;
  return request.cookies.get(COOKIE_NAME)?.value === ACCESS_VALUE;
}
