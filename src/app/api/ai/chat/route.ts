import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  // Allow widget for logged-in users; soft allow for demo
  const body = await req.json().catch(() => ({}));
  const message = String(body.message || "").toLowerCase();

  let reply =
    "I’m Finova on this page. Try File Sanitizer, Documents, Bank Rec, Statements, Close, Consolidation, or Audit/PBC from the sidebar.";

  if (message.includes("close") || message.includes("month"))
    reply =
      "Month-End Close: open /dashboard/close, pick the period, Start Close, then complete each checklist step (bank, AR/AP, assets, JEs, TB, approval). Progress is stored in the database.";
  else if (message.includes("sanit") || message.includes("pii") || message.includes("malware"))
    reply =
      "File Sanitizer (/dashboard/security): drop a file or paste text. You’ll get upload OK / public-AI gate, classification (PUBLIC→RESTRICTED), and PII hints before Documents upload.";
  else if (message.includes("consolid") || message.includes("nci") || message.includes("fx"))
    reply =
      "Consolidation applies ownership %, FX translation (e.g. EUR→USD), IC eliminations, and NCI. Manage entities under /dashboard/entities.";
  else if (message.includes("bank"))
    reply =
      "Bank Rec: /dashboard/bank-rec → choose period → AI Auto-Match → review unmatched exceptions.";
  else if (message.includes("pbc") || message.includes("audit"))
    reply =
      "Audit workspace: PBC requests with email notify, and Workpapers with prepare → review → sign-off.";
  else if (message.includes("portal") || message.includes("client"))
    reply =
      "Client portal is /portal (demo: client@acme.com / Demo123!). Clients upload files and mark PBC items uploaded.";
  else if (message.includes("statement") || message.includes("trial"))
    reply =
      "Reporting → Financial Statements: import trial balance CSV, then generate Balance Sheet, P&L, cash flow, and ratios.";
  else if (message.includes("hello") || message.includes("hi"))
    reply = "Hello! Ask me about close, consolidation, sanitizer, bank rec, or PBC — or open any module from the left nav.";

  return NextResponse.json({
    reply,
    user: session?.user ? (session.user as any).email : null,
  });
}
