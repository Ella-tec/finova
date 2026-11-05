import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("<1 Seeding Finova database...");

  // Create demo firm
  const firm = await prisma.firm.upsert({
    where: { slug: "demo-firm" },
    update: {},
    create: {
      name: "Demo CPA Firm",
      slug: "demo-firm",
    },
  });

  // Create demo client
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

  // Create demo users with different roles
  const passwordHash = await hash("Demo123!", 12);

  const users = [
    {
      email: "demo@finova.ai",
      name: "Demo Accountant",
      role: Role.STAFF_ACCOUNTANT,
      firmId: firm.id,
    },
    {
      email: "controller@finova.ai",
      name: "Sarah Controller",
      role: Role.CONTROLLER,
      firmId: firm.id,
    },
    {
      email: "partner@finova.ai",
      name: "James Partner",
      role: Role.PARTNER,
      firmId: firm.id,
    },
    {
      email: "client@acme.com",
      name: "Acme Client User",
      role: Role.CLIENT,
      firmId: firm.id,
      clientId: client.id,
    },
    {
      email: "admin@finova.ai",
      name: "System Admin",
      role: Role.ADMIN,
      firmId: firm.id,
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        passwordHash,
        name: u.name,
        role: u.role,
      },
      create: {
        email: u.email,
        name: u.name,
        passwordHash,
        role: u.role,
        firmId: u.firmId,
        clientId: (u as any).clientId || null,
      },
    });
    console.log(`   User: ${u.email} (${u.role})`);
  }

  // Create basic folders for the demo client
  const folderNames = [
    "Corporate Docs",
    "Trial Balance",
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
    await prisma.folder.create({
      data: {
        name,
        path: `/${name.toLowerCase().replace(/\s+/g, "-")}`,
        clientId: client.id,
      },
    });
  }
  console.log(`   Created ${folderNames.length} document folders for Acme`);

  console.log("\n Seed completed successfully!");
  console.log("\nDemo logins:");
  console.log("  Email: demo@finova.ai");
  console.log("  Password: Demo123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });