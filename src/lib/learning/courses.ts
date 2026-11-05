export type Course = {
  id: string;
  title: string;
  level: string;
  minutes: number;
  lessons: number;
  summary: string;
  modules: { title: string; minutes: number }[];
};

export const COURSES: Course[] = [
  {
    id: "getting-started",
    title: "Getting Started with FinSphere AI",
    level: "Beginner",
    minutes: 25,
    lessons: 6,
    summary: "Set up your firm, invite clients, and navigate the main workspace.",
    modules: [
      { title: "Sign in and roles", minutes: 4 },
      { title: "Dashboard tour", minutes: 5 },
      { title: "Invite users", minutes: 4 },
      { title: "Create a client", minutes: 4 },
      { title: "Document folders", minutes: 4 },
      { title: "AI assistant basics", minutes: 4 },
    ],
  },
  {
    id: "daily-bank-rec",
    title: "Daily Accounting & Bank Reconciliation",
    level: "Beginner",
    minutes: 40,
    lessons: 8,
    summary: "Bank sync, AI matching, exceptions, and daily bookkeeping flows.",
    modules: [
      { title: "Import bank feed", minutes: 5 },
      { title: "AI auto-match", minutes: 6 },
      { title: "Exception handling", minutes: 6 },
      { title: "Journal from match", minutes: 5 },
      { title: "Recurring items", minutes: 4 },
      { title: "Reconciliation report", minutes: 5 },
      { title: "Controller review", minutes: 5 },
      { title: "Practice exercise", minutes: 4 },
    ],
  },
  {
    id: "month-end-close",
    title: "Month-End Close Mastery",
    level: "Intermediate",
    minutes: 55,
    lessons: 10,
    summary: "Guided checklists, accruals, trial balance validation, and approvals.",
    modules: [
      { title: "Close calendar", minutes: 5 },
      { title: "Checklist engine", minutes: 6 },
      { title: "AR / AP reviews", minutes: 6 },
      { title: "Accruals & prepaids", minutes: 6 },
      { title: "Fixed assets", minutes: 5 },
      { title: "Inventory", minutes: 5 },
      { title: "Journal packages", minutes: 6 },
      { title: "TB validation", minutes: 6 },
      { title: "Approvals & lock", minutes: 5 },
      { title: "Close pack export", minutes: 5 },
    ],
  },
  {
    id: "statements",
    title: "Financial Statement Generation",
    level: "Intermediate",
    minutes: 35,
    lessons: 7,
    summary: "Import trial balances, generate statements with AI, notes, management packs.",
    modules: [
      { title: "Trial balance import", minutes: 5 },
      { title: "Mapping accounts", minutes: 5 },
      { title: "Balance sheet", minutes: 5 },
      { title: "Income statement", minutes: 5 },
      { title: "Cash flow", minutes: 5 },
      { title: "Notes & disclosures", minutes: 5 },
      { title: "Export PDF / Excel", minutes: 5 },
    ],
  },
  {
    id: "audit-pbc",
    title: "Audit Workspace & PBC Requests",
    level: "Advanced",
    minutes: 60,
    lessons: 12,
    summary: "Plan engagements, assess risk, workpapers, PBC, findings.",
    modules: [
      { title: "Engagement setup", minutes: 5 },
      { title: "Materiality", minutes: 5 },
      { title: "Risk assessment", minutes: 5 },
      { title: "PBC request list", minutes: 5 },
      { title: "Client portal uploads", minutes: 5 },
      { title: "Lead schedules", minutes: 5 },
      { title: "Sampling", minutes: 5 },
      { title: "Testing workpapers", minutes: 5 },
      { title: "Findings register", minutes: 5 },
      { title: "Review notes", minutes: 5 },
      { title: "Management letter", minutes: 5 },
      { title: "Opinion draft", minutes: 5 },
    ],
  },
  {
    id: "ai-copilot",
    title: "AI Copilot for Accountants",
    level: "Intermediate",
    minutes: 30,
    lessons: 5,
    summary: "Natural language for entries, statements, close tasks, and audit programs.",
    modules: [
      { title: "Safe AI principles", minutes: 6 },
      { title: "Close prompts", minutes: 6 },
      { title: "Statement prompts", minutes: 6 },
      { title: "Audit program drafts", minutes: 6 },
      { title: "Human approval gates", minutes: 6 },
    ],
  },
  {
    id: "security",
    title: "Security, Roles & Compliance",
    level: "All Levels",
    minutes: 20,
    lessons: 4,
    summary: "Roles, segregation of duties, audit logs, MFA, SOC 2 support.",
    modules: [
      { title: "Roles matrix", minutes: 5 },
      { title: "File sanitizer", minutes: 5 },
      { title: "Audit trail", minutes: 5 },
      { title: "Client data isolation", minutes: 5 },
    ],
  },
  {
    id: "client-portal",
    title: "Client Portal Best Practices",
    level: "Beginner",
    minutes: 15,
    lessons: 4,
    summary: "Help clients upload documents, respond to requests, and approve items.",
    modules: [
      { title: "Portal login", minutes: 4 },
      { title: "Folders & upload", minutes: 4 },
      { title: "PBC responses", minutes: 4 },
      { title: "Approvals & signatures", minutes: 3 },
    ],
  },
];

export function getCourse(id: string) {
  return COURSES.find((c) => c.id === id);
}
