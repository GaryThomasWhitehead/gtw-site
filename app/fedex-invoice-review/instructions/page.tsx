import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { expectedFedExTrackerPassword, fedExTrackerCookieName, fedExTrackerCookieValue } from "@/lib/fedexTrackerAuth";

export const metadata = {
  title: "Housecall Pro Export Instructions | Frontline Pro Services",
  description: "How to export completed Housecall Pro jobs for Completed Work Review.",
};

const requiredColumns = [
  "job #",
  "created at",
  "date",
  "end time",
  "travel duration",
  "on job duration",
  "total duration",
  "customer",
  "customer tags",
  "address",
  "description",
  "amount",
  "job tags",
  "notes",
  "employee",
  "job status",
  "attachments",
  "segments",
];

export default async function HcpInstructionsPage() {
  const cookieStore = await cookies();
  const hasAccess = Boolean(expectedFedExTrackerPassword()) && cookieStore.get(fedExTrackerCookieName())?.value === fedExTrackerCookieValue();
  if (!hasAccess) redirect("/fedex-tracker");

  return <><link rel="stylesheet" href="/fedex-instructions.css" /><main className="instructionsShell">
    <header className="instructionsTopbar">
      <div className="instructionsBrand">FP</div>
      <div><p>FRONTLINE PRO SERVICES</p><h1>Housecall Pro Export Instructions</h1></div>
      <a href="/fedex-invoice-review">← Back to Completed Work Review</a>
    </header>

    <section className="instructionsHero">
      <p>HOUSECALL PRO → COMPLETED WORK REVIEW</p>
      <h2>Export the completed-job CSV correctly every time.</h2>
      <span>Use the next start date shown on Completed Work Review and export through the current date.</span>
    </section>

    <section className="instructionGrid">
      <article className="stepsCard">
        <div className="sectionTitle"><span>1</span><div><h3>Open the detailed Jobs report</h3><p>In Housecall Pro, open <strong>Dash</strong>, find the <strong>Jobs</strong> report card, and choose <strong>View/edit report</strong>.</p></div></div>
        <div className="tip"><strong>Use the detailed Jobs table.</strong> The summary “Job time tracking by employee” report does not contain every job note needed for matching.</div>
      </article>

      <article className="stepsCard">
        <div className="sectionTitle"><span>2</span><div><h3>Set the date range</h3><p>At the top of the report, click the date range and enter the period you need.</p></div></div>
        <div className="dateExample"><div><small>Example last upload</small><strong>5-1-2026 – 8-1-2026</strong></div><div className="arrow">→</div><div><small>Next export begins</small><strong>8-2-2026 – Current</strong></div></div>
        <p className="note">Always begin one day after the ending date shown on Completed Work Review. Overlapping dates are safe, but starting after that date avoids missing work.</p>
      </article>

      <article className="stepsCard">
        <div className="sectionTitle"><span>3</span><div><h3>Filter Job Status to Done</h3><p>Find the <strong>Job Status</strong> column on the far right. Click its funnel/filter icon, select only <strong>done</strong>, and click <strong>Filter</strong>. In Housecall Pro, done means completed.</p></div></div>
        <div className="tip warning"><strong>Do not export only the schedule view.</strong> The CSV must include the detailed Notes field containing the nine-digit ServiceChannel tracking number.</div>
      </article>

      <article className="stepsCard columnsCard">
        <div className="sectionTitle"><span>4</span><div><h3>Confirm the required columns</h3><p>Open <strong>Table columns</strong> and make sure these fields are checked:</p></div></div>
        <div className="columnList">{requiredColumns.map((column) => <span key={column}>✓ {column}</span>)}</div>
        <p className="note">This list follows the Housecall Pro menu from top to bottom so you can check each box in order. Other columns may remain selected. HCP ID and Finished may be added automatically to the downloaded CSV even though they are not choices in this menu.</p>
      </article>

      <article className="stepsCard matchCard">
        <div className="sectionTitle"><span>5</span><div><h3>Verify every job will match</h3><p>Before exporting, each job must contain the nine-digit ServiceChannel tracking number in <strong>Notes</strong>.</p></div></div>
        <div className="matchingExample"><span>Example Notes</span><strong>358350082</strong><small>Tracking</small></div>
        <ul><li>For follow-up jobs such as <strong>5214-1</strong> or <strong>5214-2</strong>, copy the same ServiceChannel tracking number from the original job into that follow-up job’s Notes.</li><li>Enter the completed work summary in <strong>Description</strong>.</li><li>Record mileage in Notes using a consistent phrase such as <strong>Drove 42 miles</strong>.</li></ul>
        <div className="tip warning"><strong>Important:</strong> selecting the correct columns cannot replace a missing tracking number. Every exported row needs the number in Notes for guaranteed matching.</div>
      </article>

      <article className="stepsCard">
        <div className="sectionTitle"><span>6</span><div><h3>Download the CSV</h3><p>Click the spreadsheet/export icon in the blue report toolbar. Save the file as a <strong>CSV</strong>. A typical filename is <strong>jobs_report.csv</strong>.</p></div></div>
      </article>

      <article className="stepsCard finishCard">
        <div className="sectionTitle"><span>7</span><div><h3>Update Completed Work Review</h3><p>Return to Completed Work Review, click <strong>Update from Housecall Pro</strong>, and select the CSV. Confirm the displayed upload dates, review the results, and click <strong>Save Changes</strong>.</p></div></div>
        <a href="/fedex-invoice-review">Go to Completed Work Review →</a>
      </article>
    </section>
  </main></>;
}
