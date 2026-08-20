import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { expectedFedExTrackerPassword, fedExTrackerCookieName, fedExTrackerCookieValue } from "@/lib/fedexTrackerAuth";
import ReportsClient from "./ReportsClient";

export const metadata = { title: "Completed PM Reports | Frontline Pro Services" };

export default async function ReportsPage() {
  const store = await cookies();
  const allowed = Boolean(expectedFedExTrackerPassword()) && store.get(fedExTrackerCookieName())?.value === fedExTrackerCookieValue();
  if (!allowed) redirect("/fedex-tracker");
  return <ReportsClient />;
}
