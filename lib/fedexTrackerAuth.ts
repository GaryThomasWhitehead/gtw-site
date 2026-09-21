import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";

const COOKIE_NAME = "fedex_tracker_access";
const SESSION_MS = 12 * 60 * 60 * 1000;

type TrackerSession = { scope: "management"; exp: number };

function sessionSecret() {
  return process.env.FEDEX_TRACKER_SESSION_SECRET || "";
}

function signature(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

export function fedExTrackerCookieName() {
  return COOKIE_NAME;
}

export function createFedExTrackerSession() {
  if (!sessionSecret()) throw new Error("FEDEX_TRACKER_SESSION_SECRET is not configured");
  const payload: TrackerSession = { scope: "management", exp: Date.now() + SESSION_MS };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signature(encoded)}`;
}

export function expectedFedExTrackerPassword() {
  return process.env.FEDEX_TRACKER_PASSWORD || "";
}

export function isFedExTrackerSessionValid(raw: string) {
  if (!sessionSecret()) return false;
  const [encoded, supplied] = raw.split(".");
  if (!encoded || !supplied) return false;
  const expected = signature(encoded);
  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return false;
  try {
    const session = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as TrackerSession;
    return session.scope === "management" && session.exp > Date.now();
  } catch {
    return false;
  }
}

export function hasFedExTrackerAccess(request: NextRequest) {
  return isFedExTrackerSessionValid(request.cookies.get(COOKIE_NAME)?.value || "");
}
