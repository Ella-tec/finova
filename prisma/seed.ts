import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The Finova demo seed is disabled in production.");
  }

  const demoPassword = process.env.FINOVA_DEMO_PASSWORD;
  if (!demoPassword || demoPassword.length < 14) {
    throw new Error("Set FINOVA_DEMO_PASSWORD to a unique password of at least 14 characters before running the demo seed.");
  }

  console.log("Seeding Finova demo data...");

  const firm = await prisma.firm.upsert({
    where: { slug: "demo-firm" },
    update: {},
    create: { name: "Demo CPA Firm", slug: "demo-firm" },
  });

  const client = await prisma.client.upsert({
    where: { id: "demo-client-001" },
    update: {},
    create: {
      id: "demo-client-001",
      name: "Acme Corporation",
      legalName: "Acme Corporation Inc.",
      taxId: "12-3456789",
      firmId: firm.id,
    },
  });

  const passwordHash = await hash(demoPassword, 12);
  const users = [
    { email: "demo@finova.ai", name: "Demo Accountant", role: Role.STAFF_ACCOUNTANT, firmId: firm.id },
    { email: "controller@finova.ai", name: "Demo Controller", role: Role.CONTROLLER, firmId: firm.id },
    { email: "partner@finova.ai", name: "Demo Partner", role: Role.PARTNER, firmId: firm.id },
    { email: "client@acme.com", name: "Demo Client User", role: Role.CLIENT, firmId: firm.id, clientId: client.id },
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
    "Corporate Docs", "Trial Balance", "General Ledger", "Bank Statements",
    "Payroll", "Fixed Assets", "Tax", "Audit", "Final Statements", "Archive",
  ];

  for (const name of folderNames) {
    await prisma.folder.upsert({
      where: { id: `demo-folder-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` },
      update: {},
      create: {
        id: `demo-folder-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name,
        path: `/${name.toLowerCase().replace(/\\s+/g, "-")}`,
        clientId: client.id,
      },
    });
  }

  console.log("Finova demo data seeded. Demo password was read from FINOVA_DEMO_PASSWORD and was not printed.");
}

main()
  .catch((error) => {
    console.error("Finova seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
