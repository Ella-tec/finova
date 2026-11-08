export type Lesson = {
  id: string;
  title: string;
  minutes: number;
};

export type Course = {
  id: string;
  title: string;
  level: string;
  minutes: number;
  duration: string;
  lessons: Lesson[];
  summary: string;
  description?: string;
  outcomes?: string[];
  modules: { title: string; minutes: number }[];
};

const makeCourse = (
  course: Omit<Course, "minutes" | "duration" | "modules"> & {
    modules?: { title: string; minutes: number }[];
  }
): Course => {
  const modules =
    course.modules ??
    course.lessons.map(({ title, minutes }) => ({ title, minutes }));

  const totalMinutes = course.lessons.reduce(
    (total, lesson) => total + lesson.minutes,
    0
  );

  return {
    ...course,
    modules,
    minutes: totalMinutes,
    duration: `${totalMinutes} min`,
  };
};

export const COURSES: Course[] = [
  makeCourse({
    id: "getting-started",
    title: "Getting Started with Finova",
    level: "Beginner",
    summary: "Set up your firm, invite clients, and navigate the main workspace.",
    description:
      "Learn how to set up your firm, invite clients, and navigate the main Finova workspace.",
    outcomes: [
      "Create firm workspace",
      "Invite users with roles",
      "Navigate sidebar modules",
    ],
    lessons: [
      { id: "1", title: "Tour of the dashboard", minutes: 4 },
      { id: "2", title: "Invite your team", minutes: 5 },
      { id: "3", title: "Client & folder setup", minutes: 5 },
      { id: "4", title: "Using global search", minutes: 3 },
      { id: "5", title: "AI widget vs AI page", minutes: 4 },
      { id: "6", title: "Quick start checklist", minutes: 4 },
    ],
  }),
  makeCourse({
    id: "daily-bank-rec",
    title: "Daily Accounting & Bank Reconciliation",
    level: "Beginner",
    summary: "Bank sync, AI matching, exceptions, and daily bookkeeping flows.",
    description:
      "Master bank sync, AI matching, exception handling, and daily bookkeeping flows.",
    outcomes: ["Run AI Auto-Match", "Clear exceptions", "Link to close checklist"],
    lessons: [
      { id: "1", title: "Import bank feed", minutes: 5 },
      { id: "2", title: "AI auto-match", minutes: 6 },
      { id: "3", title: "Exception handling", minutes: 6 },
      { id: "4", title: "Journal from match", minutes: 5 },
      { id: "5", title: "Recurring items", minutes: 4 },
      { id: "6", title: "Reconciliation report", minutes: 5 },
      { id: "7", title: "Controller review", minutes: 5 },
      { id: "8", title: "Practice exercise", minutes: 4 },
    ],
  }),
  makeCourse({
    id: "month-end-close",
    title: "Month-End Close Mastery",
    level: "Intermediate",
    summary: "Guided checklists, accruals, trial balance validation, and approvals.",
    description:
      "Run a complete close using guided checklists, accruals, trial balance validation, and approvals.",
    outcomes: ["Start a close period", "Complete each step", "Final sign-off"],
    lessons: [
      { id: "1", title: "Close calendar", minutes: 5 },
      { id: "2", title: "Checklist engine", minutes: 6 },
      { id: "3", title: "AR / AP reviews", minutes: 6 },
      { id: "4", title: "Accruals & prepaids", minutes: 6 },
      { id: "5", title: "Fixed assets", minutes: 5 },
      { id: "6", title: "Inventory", minutes: 5 },
      { id: "7", title: "Journal packages", minutes: 6 },
      { id: "8", title: "TB validation", minutes: 6 },
      { id: "9", title: "Approvals & lock", minutes: 5 },
      { id: "10", title: "Close pack export", minutes: 5 },
    ],
  }),
  makeCourse({
    id: "statements",
    title: "Financial Statement Generation",
    level: "Intermediate",
    summary:
      "Import trial balances, generate statements with AI, notes, management packs.",
    description:
      "Import trial balances, generate statements with AI, add notes, and prepare management packages.",
    outcomes: ["Import TB CSV", "Generate BS / P&L / CF", "Export package"],
    lessons: [
      { id: "1", title: "Trial balance import", minutes: 5 },
      { id: "2", title: "Mapping accounts", minutes: 5 },
      { id: "3", title: "Balance sheet", minutes: 5 },
      { id: "4", title: "Income statement", minutes: 5 },
      { id: "5", title: "Cash flow", minutes: 5 },
      { id: "6", title: "Notes & disclosures", minutes: 5 },
      { id: "7", title: "Export PDF / Excel", minutes: 5 },
    ],
  }),
  makeCourse({
    id: "audit-pbc",
    title: "Audit Workspace & PBC Requests",
    level: "Advanced",
    summary: "Plan engagements, assess risk, workpapers, PBC, findings.",
    description:
      "Plan engagements, assess risk, create workpapers, manage PBC requests, and issue findings.",
    outcomes: ["Create PBC requests", "Workpaper templates", "Findings register"],
    lessons: [
      { id: "1", title: "Engagement setup", minutes: 5 },
      { id: "2", title: "Materiality", minutes: 5 },
      { id: "3", title: "Risk assessment", minutes: 5 },
      { id: "4", title: "PBC request list", minutes: 5 },
      { id: "5", title: "Client portal uploads", minutes: 5 },
      { id: "6", title: "Lead schedules", minutes: 5 },
      { id: "7", title: "Sampling", minutes: 5 },
      { id: "8", title: "Testing workpapers", minutes: 5 },
      { id: "9", title: "Findings register", minutes: 5 },
      { id: "10", title: "Review notes", minutes: 5 },
      { id: "11", title: "Management letter", minutes: 5 },
      { id: "12", title: "Opinion draft", minutes: 5 },
    ],
  }),
  makeCourse({
    id: "ai-copilot",
    title: "AI Copilot for Accountants",
    level: "Intermediate",
    summary:
      "Natural language for entries, statements, close tasks, and audit programs.",
    description:
      "Use natural language to generate entries, statements, close tasks, and audit programs safely.",
    outcomes: ["Use AI page prompts", "Human approval gate", "Safe data practices"],
    lessons: [
      { id: "1", title: "Safe AI principles", minutes: 6 },
      { id: "2", title: "Close prompts", minutes: 6 },
      { id: "3", title: "Statement prompts", minutes: 6 },
      { id: "4", title: "Audit program drafts", minutes: 6 },
      { id: "5", title: "Human approval gates", minutes: 6 },
    ],
  }),
  makeCourse({
    id: "security",
    title: "Security, Roles & Compliance",
    level: "All Levels",
    summary: "Roles, segregation of duties, audit logs, MFA, SOC 2 support.",
    description:
      "Understand roles, segregation of duties, audit logs, MFA, and how Finova supports SOC 2.",
    outcomes: ["Role matrix", "File sanitizer workflow", "SoD basics"],
    lessons: [
      { id: "1", title: "Roles matrix", minutes: 5 },
      { id: "2", title: "File sanitizer", minutes: 5 },
      { id: "3", title: "Audit trail", minutes: 5 },
      { id: "4", title: "Client data isolation", minutes: 5 },
    ],
  }),
  makeCourse({
    id: "client-portal",
    title: "Client Portal Best Practices",
    level: "Beginner",
    summary: "Help clients upload documents, respond to requests, and approve items.",
    description:
      "Help your clients upload documents, respond to requests, and approve items with zero friction.",
    outcomes: ["Client login path", "Upload folders", "PBC responses"],
    lessons: [
      { id: "1", title: "Portal login", minutes: 4 },
      { id: "2", title: "Folders & upload", minutes: 4 },
      { id: "3", title: "PBC responses", minutes: 4 },
      { id: "4", title: "Approvals & signatures", minutes: 3 },
    ],
  }),
  makeCourse({
    id: "documents-ocr",
    title: "Documents, OCR & AI Analysis",
    level: "Beginner",
    summary: "Upload, sanitize, OCR, and let AI extract key data from source documents.",
    description:
      "Master document intake, file sanitizer, OCR extraction, and AI-assisted analysis for invoices, statements, and contracts.",
    outcomes: [
      "Upload and organize documents",
      "Run the file sanitizer",
      "Extract data with OCR + AI",
    ],
    lessons: [
      { id: "1", title: "Document library overview", minutes: 4 },
      { id: "2", title: "Secure upload & folders", minutes: 5 },
      { id: "3", title: "File sanitizer gate", minutes: 5 },
      { id: "4", title: "OCR extraction", minutes: 6 },
      { id: "5", title: "AI data mapping", minutes: 6 },
      { id: "6", title: "Review & approve extractions", minutes: 5 },
      { id: "7", title: "Linking to journals & PBC", minutes: 4 },
    ],
  }),
  makeCourse({
    id: "consolidation",
    title: "Multi-Entity Consolidation",
    level: "Advanced",
    summary: "Consolidate entities, handle NCI, eliminations, and group reporting.",
    description:
      "Learn intercompany eliminations, non-controlling interest, currency translation, and producing consolidated financial statements.",
    outcomes: [
      "Set up entity hierarchy",
      "Run eliminations",
      "Produce consolidated pack",
    ],
    lessons: [
      { id: "1", title: "Entity structure & ownership", minutes: 6 },
      { id: "2", title: "Mapping charts of accounts", minutes: 5 },
      { id: "3", title: "Intercompany balances", minutes: 6 },
      { id: "4", title: "Eliminations worksheet", minutes: 7 },
      { id: "5", title: "NCI calculation", minutes: 6 },
      { id: "6", title: "Currency translation", minutes: 6 },
      { id: "7", title: "Consolidated statements", minutes: 6 },
      { id: "8", title: "Group reporting pack", minutes: 5 },
    ],
  }),
  makeCourse({
    id: "operations-workspace",
    title: "Accounting Operations Workspace",
    level: "Intermediate",
    summary:
      "Company setup, chart of accounts, journals, customers, vendors, and payroll records.",
    description:
      "Work inside the Operations workspace to capture accounting, sales, purchasing, banking, and payroll records as a foundation for full ledgers.",
    outcomes: [
      "Configure company & COA",
      "Record journals & invoices",
      "Track vendors and payroll runs",
    ],
    lessons: [
      { id: "1", title: "Company setup", minutes: 5 },
      { id: "2", title: "Chart of accounts", minutes: 6 },
      { id: "3", title: "Journal entries", minutes: 6 },
      { id: "4", title: "Customers & invoices", minutes: 5 },
      { id: "5", title: "Vendors & bills", minutes: 5 },
      { id: "6", title: "Bank accounts & statements", minutes: 5 },
      { id: "7", title: "Employees & payroll runs", minutes: 6 },
      { id: "8", title: "Draft vs posted records", minutes: 4 },
    ],
  }),
  makeCourse({
    id: "sample-library",
    title: "Sample Library & Workpaper Templates",
    level: "Beginner",
    summary: "Browse and adapt 40+ free audit and accounting samples.",
    description:
      "Discover the Sample Library, download templates, customize workpapers, and accelerate engagement setup.",
    outcomes: [
      "Browse sample categories",
      "Download and adapt templates",
      "Link samples to engagements",
    ],
    lessons: [
      { id: "1", title: "Library overview", minutes: 4 },
      { id: "2", title: "Accounting samples", minutes: 5 },
      { id: "3", title: "Audit workpaper samples", minutes: 5 },
      { id: "4", title: "Customizing a template", minutes: 5 },
      { id: "5", title: "Attaching to clients & jobs", minutes: 4 },
    ],
  }),
  makeCourse({
    id: "market-pulse",
    title: "Market Pulse: FX & Benchmarks",
    level: "Intermediate",
    summary: "Track FX rates, industry benchmarks, and use them in reporting.",
    description:
      "Use Market Pulse to pull FX rates, compare performance against benchmarks, and enrich management reports.",
    outcomes: [
      "View live FX rates",
      "Apply benchmarks to KPIs",
      "Export pulse snapshots",
    ],
    lessons: [
      { id: "1", title: "Market Pulse dashboard", minutes: 4 },
      { id: "2", title: "FX rate sources", minutes: 5 },
      { id: "3", title: "Benchmark selection", minutes: 5 },
      { id: "4", title: "Embedding in statements", minutes: 5 },
      { id: "5", title: "Alerts & history", minutes: 4 },
    ],
  }),
];

export function getCourse(id: string): Course | undefined {
  const aliases: Record<string, string> = {
    "bank-rec": "daily-bank-rec",
    "financial-statements": "statements",
    docs: "documents-ocr",
    ocr: "documents-ocr",
    consolidate: "consolidation",
    operations: "operations-workspace",
    samples: "sample-library",
    market: "market-pulse",
  };

  const normalizedId = aliases[id] ?? id;
  return COURSES.find((course) => course.id === normalizedId);
}

export const LEVELS = [
  "All",
  "Beginner",
  "Intermediate",
  "Advanced",
  "All Levels",
] as const;

export type LevelFilter = (typeof LEVELS)[number];
