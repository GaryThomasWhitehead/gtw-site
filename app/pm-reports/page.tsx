import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fedExTrackerCookieName, isFedExTrackerSessionValid } from "@/lib/fedexTrackerAuth";
import ReportsClient from "./ReportsClient";

export const metadata = { title: "Completed PM Reports | Frontline Pro Services" };

export default async function ReportsPage() {
  const store = await cookies();
  const allowed = isFedExTrackerSessionValid(store.get(fedExTrackerCookieName())?.value || "");
  if (!allowed) redirect("/fedex-tracker");
  return <ReportsClient />;
}
