import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { DEFAULT_MONTH_END_TASKS } from "../src/lib/close/checklist";

const prisma = new PrismaClient();

const DEMO_CLIENTS = [
  { id: "demo-client-001", name: "Acme Corporation", legalName: "Acme Corporation Inc.", taxId: "12-3456789" },
  { id: "demo-client-002", name: "Nexus Retail Group", legalName: "Nexus Retail Group LLC", taxId: "12-3456790" },
  { id: "demo-client-003", name: "Orbit Software LLC", legalName: "Orbit Software LLC", taxId: "12-3456791" },
  { id: "demo-client-004", name: "Pulse Health Clinics", legalName: "Pulse Health Clinics PC", taxId: "12-3456792" },
  { id: "demo-client-005", name: "Granite Construction Partners", legalName: "Granite Construction Partners LP", taxId: "12-3456793" },
  { id: "demo-client-006", name: "Leaf & Co Foods", legalName: "Leaf & Co Foods Inc.", taxId: "12-3456794" },
  { id: "demo-client-007", name: "Atlas Logistics Inc", legalName: "Atlas Logistics Inc.", taxId: "12-3456795" },
  { id: "demo-client-008", name: "Summit Energy Holdings", legalName: "Summit Energy Holdings Corp.", taxId: "12-3456796" },
  { id: "demo-client-009", name: "BrightPath Education Inc", legalName: "BrightPath Education Inc.", taxId: "12-3456797" },
  { id: "demo-client-010", name: "Finova Parent Co (Demo Group)", legalName: "Finova Parent Co", taxId: "12-3456798" },
];

const SAMPLE_DOCS = [
  { name: "Invoice INV-1001", fileName: "INV-1001-Beta-Foods.pdf", mimeType: "application/pdf", tags: "invoice,AR,sample" },
  { name: "Bank Statement Oct", fileName: "Bank-Statement-2026-10.pdf", mimeType: "application/pdf", tags: "bank,sample" },
  { name: "Trial Balance Oct", fileName: "TB-2026-10.csv", mimeType: "text/csv", tags: "trial-balance,sample" },
  { name: "Vendor Bill V-440", fileName: "Bill-V440-Office-Supply.pdf", mimeType: "application/pdf", tags: "AP,bill,sample" },
  { name: "Payroll Register", fileName: "Payroll-2026-10.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", tags: "payroll,sample" },
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The Finova demo seed is disabled in production.");
  }

  const demoPassword = process.env.FINOVA_DEMO_PASSWORD;
  if (!demoPassword || demoPassword.length < 14) {
    throw new Error(
      "Set FINOVA_DEMO_PASSWORD to a unique password of at least 14 characters before running the demo seed."
    );
  }

  console.log("Seeding Finova demo data...");

  const firm = await prisma.firm.upsert({
    where: { slug: "demo-firm" },
    update: {},
    create: { name: "Demo CPA Firm", slug: "demo-firm" },
  });

  for (const c of DEMO_CLIENTS) {
    await prisma.client.upsert({
      where: { id: c.id },
      update: { name: c.name, legalName: c.legalName, taxId: c.taxId, firmId: firm.id },
      create: {
        id: c.id,
        name: c.name,
        legalName: c.legalName,
        taxId: c.taxId,
        firmId: firm.id,
      },
    });
  }

  const primaryClient = DEMO_CLIENTS[0];

  const passwordHash = await hash(demoPassword, 12);
  const users = [
    { email: "demo@finova.ai", name: "Demo Accountant", role: Role.STAFF_ACCOUNTANT, firmId: firm.id },
    { email: "controller@finova.ai", name: "Demo Controller", role: Role.CONTROLLER, firmId: firm.id },
    { email: "partner@finova.ai", name: "Demo Partner", role: Role.PARTNER, firmId: firm.id },
    {
      email: "client@acme.com",
      name: "Demo Client User",
      role: Role.CLIENT,
      firmId: firm.id,
      clientId: primaryClient.id,
    },
    { email: "admin@finova.ai", name: "Demo Administrator", role: Role.ADMIN, firmId: firm.id },
  ];

  let demoUserId = "";
  for (const user of users) {
    const row = await prisma.user.upsert({
      where: { email: user.email },
      update: { passwordHash, name: user.name, role: user.role, firmId: user.firmId },
      create: {
        email: user.email,
        name: user.name,
        passwordHash,
        role: user.role,
        firmId: user.firmId,
        clientId: "clientId" in user ? user.clientId : null,
      },
    });
    if (user.email === "demo@finova.ai") demoUserId = row.id;
  }

  const folderNames = [
    "Corporate Docs",
    "Trial Balance",
    "Journal Entries",
    "Income Statement",
    "Balance Sheet",
    "Cash Flow",
    "General Ledger",
    "Bank Statements",
    "Payroll",
    "Fixed Assets",
    "Tax",
    "Audit",
    "Final Statements",
    "Archive",
    "Invoices",
  ];

  const invoiceFolderId = `demo-folder-invoices`;
  for (const name of folderNames) {
    const id = `demo-folder-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    await prisma.folder.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name,
        path: `/${name.toLowerCase().replace(/\s+/g, "-")}`,
        clientId: primaryClient.id,
      },
    });
  }

  // Sample document metadata (upload real files via UI for binary preview)
  for (let i = 0; i < SAMPLE_DOCS.length; i++) {
    const d = SAMPLE_DOCS[i];
    const id = `demo-doc-${i + 1}`;
    await prisma.document.upsert({
      where: { id },
      update: {
        name: d.name,
        fileName: d.fileName,
        mimeType: d.mimeType,
        tags: d.tags,
        status: i < 2 ? "APPROVED" : "PENDING_REVIEW",
      },
      create: {
        id,
        name: d.name,
        fileName: d.fileName,
        mimeType: d.mimeType,
        size: 12000 + i * 1500,
        storageKey: `${primaryClient.id}/sample-${i + 1}${d.fileName.slice(d.fileName.lastIndexOf("."))}`,
        status: i < 2 ? "APPROVED" : "PENDING_REVIEW",
        clientId: primaryClient.id,
        folderId: i === 0 ? invoiceFolderId : undefined,
        uploadedById: demoUserId || undefined,
        tags: d.tags,
        ocrText:
          i === 0
            ? "INVOICE INV-1001\nBeta Foods Inc\nAmount due: $15,000.00\nDue: 2026-10-15"
            : null,
      },
    });
  }

  // Month-end close: prior period partly done + current period open
  const priorPeriod = "2025-12";
  const currentPeriod = new Date().toISOString().slice(0, 7);

  for (const period of [priorPeriod, currentPeriod]) {
    const existing = await prisma.closePeriod.findFirst({
      where: { period, clientId: primaryClient.id },
      include: { tasks: true },
    });
    if (existing) continue;

    const isPrior = period === priorPeriod;
    await prisma.closePeriod.create({
      data: {
        period,
        clientId: primaryClient.id,
        firmId: firm.id,
        status: isPrior ? "CLOSED" : "IN_PROGRESS",
        progress: isPrior ? 100 : 35,
        startedAt: new Date(),
        closedAt: isPrior ? new Date() : null,
        tasks: {
          create: DEFAULT_MONTH_END_TASKS.map((t, idx) => ({
            step: t.step,
            title: t.title,
            description: t.description,
            category: t.category,
            status: isPrior
              ? "COMPLETED"
              : idx < 3
                ? "COMPLETED"
                : idx < 5
                  ? "IN_PROGRESS"
                  : "NOT_STARTED",
            ownerRole: t.ownerRole,
            aiCanHelp: t.aiCanHelp || false,
            completedAt: isPrior || idx < 3 ? new Date() : null,
          })),
        },
      },
    });
  }

  // Sample AR-style workspace records
  const invoices = [
    { title: "INV-1001 Beta Foods", reference: "INV-1001", counterparty: "Beta Foods Inc", amount: 15000, status: "OVERDUE" },
    { title: "INV-1002 City Distributors", reference: "INV-1002", counterparty: "City Distributors", amount: 10500, status: "PARTIAL" },
    { title: "INV-1003 Delta Stores", reference: "INV-1003", counterparty: "Delta Stores", amount: 20000, status: "OPEN" },
  ];
  for (const inv of invoices) {
    await prisma.workspaceRecord.create({
      data: {
        area: "AR",
        kind: "INVOICE",
        title: inv.title,
        reference: inv.reference,
        counterparty: inv.counterparty,
        amount: inv.amount,
        currency: "USD",
        status: inv.status,
        firmId: firm.id,
        clientId: primaryClient.id,
        createdById: demoUserId || undefined,
        description: "Demo invoice — open detail for supporting documents workflow.",
        payload: JSON.stringify({ sample: true, supportDocs: ["INV-1001-Beta-Foods.pdf"] }),
      },
    });
  }

  console.log(
    `Finova demo data seeded (${DEMO_CLIENTS.length} clients, sample docs, close periods, AR invoices).`
  );
}

main()
  .catch((error) => {
    console.error("Finova seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
