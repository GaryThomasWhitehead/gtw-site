import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { expectedFedExTrackerPassword, fedExTrackerCookieName, fedExTrackerCookieValue } from "@/lib/fedexTrackerAuth";
import InvoiceReviewClient from "./InvoiceReviewClient";

export const metadata = {
  title: "Completed Work Review | Frontline Pro Services",
  description: "Review ServiceChannel and Housecall Pro work before QuickBooks export.",
};

export default async function InvoiceReviewPage() {
  const cookieStore = await cookies();
  const hasAccess = Boolean(expectedFedExTrackerPassword()) && cookieStore.get(fedExTrackerCookieName())?.value === fedExTrackerCookieValue();
  if (!hasAccess) redirect("/fedex-tracker");
  return <InvoiceReviewClient />;
}
