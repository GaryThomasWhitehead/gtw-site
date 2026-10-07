import CorrectiveActionsClient from "./CorrectiveActionsClient";
import { cookies } from "next/headers";
import { correctiveActionViewerCookieName, fedExTrackerCookieName, isCorrectiveActionViewerSessionValid, isFedExTrackerSessionValid } from "@/lib/fedexTrackerAuth";

export const dynamic = "force-dynamic";

export default async function CorrectiveActionsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const cookieStore = await cookies();
  const management = isFedExTrackerSessionValid(cookieStore.get(fedExTrackerCookieName())?.value || "");
  const viewer = isCorrectiveActionViewerSessionValid(cookieStore.get(correctiveActionViewerCookieName())?.value || "");
  if (!management && !viewer) {
    const params = await searchParams;
    return <main style={{ minHeight: "100vh", background: "#eef4f8", padding: "8vh 20px", fontFamily: "Arial, sans-serif" }}>
      <form action="/api/corrective-actions/login" method="post" style={{ maxWidth: 520, margin: "0 auto", background: "white", border: "1px solid #c7d8e5", borderRadius: 18, padding: 32, boxShadow: "0 12px 30px #174b701a" }}>
        <p style={{ color: "#136ca5", fontWeight: 800, letterSpacing: 2, margin: 0 }}>FRONTLINE PRO SERVICES</p>
        <h1 style={{ color: "#0d4268", fontSize: 32 }}>Corrective Actions Needed</h1>
        <p>Enter your 4-digit management code or authorized viewer code.</p>
        <label style={{ display: "grid", gap: 8, fontWeight: 700 }}>Access code<input name="code" type="password" required autoFocus style={{ padding: 14, border: "1px solid #9db8cc", borderRadius: 8, fontSize: 18 }} /></label>
        {params.error && <p style={{ color: "#b42318" }}>That access code was not recognized.</p>}
        <button type="submit" style={{ marginTop: 20, padding: "13px 22px", border: 0, borderRadius: 8, background: "#1378b5", color: "white", fontWeight: 800, fontSize: 17 }}>View Report</button>
      </form>
    </main>;
  }
  return <CorrectiveActionsClient readOnly={!management} />;
}
