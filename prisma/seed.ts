import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

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

  for (const user of users) {
    await prisma.user.upsert({
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
  ];

  for (const name of folderNames) {
    await prisma.folder.upsert({
      where: { id: `demo-folder-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` },
      update: {},
      create: {
        id: `demo-folder-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name,
        path: `/${name.toLowerCase().replace(/\s+/g, "-")}`,
        clientId: primaryClient.id,
      },
    });
  }

  console.log(
    `Finova demo data seeded (${DEMO_CLIENTS.length} clients). Demo password was read from FINOVA_DEMO_PASSWORD and was not printed.`
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
