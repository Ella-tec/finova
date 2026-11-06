import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/access";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const raw = typeof body.message === "string" ? body.message : "";
  const message = raw.trim().slice(0, 2000).toLowerCase();
  if (!message) return NextResponse.json({ error: "A message is required" }, { status: 400 });

  let reply = "I can guide you through Finova's accounting, reporting, audit, and document workflows. Tell me which module you are working in and what you need to do.";
  if (message.includes("close") || message.includes("month")) {
    reply = "Open Month-End Close (/dashboard/close), select the accounting period, and review the checklist. Complete reconciliations, subledger reviews, journal entries, trial-balance review, and authorized approval. Verify each item against your firm's supporting records.";
  } else if (message.includes("sanit") || message.includes("pii") || message.includes("malware")) {
    reply = "Use File Sanitizer (/dashboard/security) to review file type, size, sensitive-data indicators, and the sharing classification before uploading or sending content to an AI service. A sanitizer result is not a malware guarantee.";
  } else if (message.includes("consolid") || message.includes("nci") || message.includes("fx")) {
    reply = "Open Consolidation (/dashboard/consolidation) after confirming entity ownership, reporting currencies, period balances, exchange rates, and intercompany balances. Review translation and non-controlling-interest calculations before posting or reporting.";
  } else if (message.includes("bank")) {
    reply = "Open Bank Reconciliation (/dashboard/bank-rec), select the correct client and period, import the bank statement and book activity, then review suggested matches and every unmatched exception. Confirm matches against source evidence.";
  } else if (message.includes("pbc") || message.includes("audit")) {
    reply = "Open Audit / PBC to manage evidence requests and workpapers. Keep preparer and reviewer responsibilities separate, document the evidence examined, and obtain required engagement sign-off.";
  } else if (message.includes("portal") || message.includes("client")) {
    reply = "The Client Portal (/portal) is for assigned client users to exchange documents and respond to requests. Access is limited to the client account associated with the signed-in user.";
  } else if (message.includes("statement") || message.includes("trial")) {
    reply = "Open Financial Reporting (/dashboard/reporting), validate the trial balance and period mapping, then review the balance sheet, income statement, cash-flow statement, and supporting notes before release.";
  } else if (message.includes("hello") || message === "hi") {
    reply = "Welcome to Finova. I can explain the close, bank reconciliation, reporting, consolidation, document security, and audit workflows.";
  }

  return NextResponse.json({ reply, user: user.email || null });
}
