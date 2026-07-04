import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { hasFedExTrackerAccess } from "@/lib/fedexTrackerAuth";

function loginPage(message = "") {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>FedEx Work Orders</title>
  <style>
    body { margin:0; min-height:100vh; display:grid; place-items:center; font-family: Arial, sans-serif; background:#eef4f7; color:#101827; }
    .login { width:min(420px, calc(100vw - 32px)); background:#fff; border:1px solid #d6e0e6; border-radius:8px; padding:28px; box-shadow:0 18px 50px rgba(20,35,45,.14); }
    h1 { margin:0 0 8px; font-size:26px; }
    p { margin:0 0 18px; color:#53616d; line-height:1.45; }
    label { display:block; font-weight:700; margin-bottom:8px; }
    input { width:100%; box-sizing:border-box; border:1px solid #b8c6d0; border-radius:6px; padding:12px; font-size:16px; }
    button { margin-top:16px; width:100%; border:0; border-radius:6px; padding:12px 14px; background:#4a148c; color:#fff; font-weight:800; cursor:pointer; }
    .error { color:#b42318; font-weight:700; margin-bottom:12px; }
  </style>
</head>
<body>
  <form class="login" method="post" action="/api/fedex-work-orders/login">
    <h1>FedEx Work Orders</h1>
    <p>Enter the tracker password to continue.</p>
    ${message ? `<div class="error">${message}</div>` : ""}
    <label for="password">Password</label>
    <input id="password" name="password" type="password" autocomplete="current-password" required autofocus />
    <button type="submit">Open Tracker</button>
  </form>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  if (!hasFedExTrackerAccess(request)) {
    const message = request.nextUrl.searchParams.get("error") ? "That password did not match. Please try again." : "";
    return new NextResponse(loginPage(message), { headers: { "content-type": "text/html; charset=utf-8" } });
  }

  const filePath = path.join(process.cwd(), "app", "fedex-tracker", "fedex-work-orders.html");
  const html = await readFile(filePath, "utf8");
  return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

