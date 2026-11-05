export type Lesson = { id: string; title: string; minutes: number };
export type Course = {
  id: string;
  title: string;
  level: string;
  duration: string;
  lessons: Lesson[];
  description: string;
  outcomes: string[];
};

export const COURSES: Course[] = [
  {
    id: "getting-started",
    title: "Getting Started with Finova",
    level: "Beginner",
    duration: "25 min",
    description: "Learn how to set up your firm, invite clients, and navigate the main workspace.",
    outcomes: ["Create firm workspace", "Invite users with roles", "Navigate sidebar modules"],
    lessons: [
      { id: "1", title: "Tour of the dashboard", minutes: 4 },
      { id: "2", title: "Invite your team", minutes: 5 },
      { id: "3", title: "Client & folder setup", minutes: 5 },
      { id: "4", title: "Using global search", minutes: 3 },
      { id: "5", title: "AI widget vs AI page", minutes: 4 },
      { id: "6", title: "Quick start checklist", minutes: 4 },
    ],
  },
  {
    id: "bank-rec",
    title: "Daily Accounting & Bank Reconciliation",
    level: "Beginner",
    duration: "40 min",
    description: "Master bank sync, AI matching, exception handling, and daily bookkeeping flows.",
    outcomes: ["Run AI Auto-Match", "Clear exceptions", "Link to close checklist"],
    lessons: [
      { id: "1", title: "Import bank feed", minutes: 5 },
      { id: "2", title: "AI matching explained", minutes: 6 },
      { id: "3", title: "Handling exceptions", minutes: 6 },
      { id: "4", title: "Book vs bank views", minutes: 5 },
      { id: "5", title: "Daily journal habits", minutes: 6 },
      { id: "6", title: "Approvals & audit trail", minutes: 4 },
      { id: "7", title: "Sample data practice", minutes: 5 },
      { id: "8", title: "Checklist for close", minutes: 3 },
    ],
  },
  {
    id: "month-end-close",
    title: "Month-End Close Mastery",
    level: "Intermediate",
    duration: "55 min",
    description: "Run a complete close using guided checklists, accruals, trial balance validation, and approvals.",
    outcomes: ["Start a close period", "Complete each step", "Final sign-off"],
    lessons: [
      { id: "1", title: "Close calendar & ownership", minutes: 5 },
      { id: "2", title: "Bank rec step", minutes: 6 },
      { id: "3", title: "AR / AP reviews", minutes: 8 },
      { id: "4", title: "Fixed assets & inventory", minutes: 8 },
      { id: "5", title: "Journal entries", minutes: 7 },
      { id: "6", title: "Trial balance validation", minutes: 6 },
      { id: "7", title: "Controller approval", minutes: 5 },
      { id: "8", title: "AI assist on close", minutes: 4 },
      { id: "9", title: "Lock period", minutes: 3 },
      { id: "10", title: "Practice run", minutes: 3 },
    ],
  },
  {
    id: "financial-statements",
    title: "Financial Statement Generation",
    level: "Intermediate",
    duration: "35 min",
    description: "Import trial balances, generate statements with AI, add notes, and prepare management packages.",
    outcomes: ["Import TB CSV", "Generate BS / P&L / CF", "Export package"],
    lessons: [
      { id: "1", title: "Trial balance import", minutes: 5 },
      { id: "2", title: "Mapping accounts", minutes: 5 },
      { id: "3", title: "Balance sheet", minutes: 5 },
      { id: "4", title: "Income statement", minutes: 5 },
      { id: "5", title: "Cash flow", minutes: 5 },
      { id: "6", title: "Notes outline", minutes: 5 },
      { id: "7", title: "Sample library TB practice", minutes: 5 },
    ],
  },
  {
    id: "audit-pbc",
    title: "Audit Workspace & PBC Requests",
    level: "Advanced",
    duration: "60 min",
    description: "Plan engagements, assess risk, create workpapers, manage PBC requests, and issue findings.",
    outcomes: ["Create PBC requests", "Workpaper templates", "Findings register"],
    lessons: [
      { id: "1", title: "Engagement setup", minutes: 5 },
      { id: "2", title: "Materiality & risk", minutes: 6 },
      { id: "3", title: "PBC request lifecycle", minutes: 6 },
      { id: "4", title: "Client portal uploads", minutes: 5 },
      { id: "5", title: "Workpaper templates", minutes: 6 },
      { id: "6", title: "Sampling worksheets", minutes: 5 },
      { id: "7", title: "Findings & management letter", minutes: 5 },
      { id: "8", title: "Evidence & sign-off", minutes: 5 },
      { id: "9", title: "Sample audit docs", minutes: 6 },
      { id: "10", title: "Partner review tips", minutes: 4 },
      { id: "11", title: "Opinion templates", minutes: 4 },
      { id: "12", title: "Practice engagement", minutes: 3 },
    ],
  },
  {
    id: "ai-copilot",
    title: "AI Copilot for Accountants",
    level: "Intermediate",
    duration: "30 min",
    description: "Use natural language to generate entries, statements, close tasks, and audit programs safely.",
    outcomes: ["Use AI page prompts", "Human approval gate", "Safe data practices"],
    lessons: [
      { id: "1", title: "What AI may and may not do", minutes: 5 },
      { id: "2", title: "Close checklist prompts", minutes: 6 },
      { id: "3", title: "Statement & analysis prompts", minutes: 6 },
      { id: "4", title: "Audit program drafts", minutes: 6 },
      { id: "5", title: "Sanitizer before AI", minutes: 7 },
    ],
  },
  {
    id: "security",
    title: "Security, Roles & Compliance",
    level: "All Levels",
    duration: "20 min",
    description: "Understand roles, segregation of duties, audit logs, MFA, and how Finova supports SOC 2.",
    outcomes: ["Role matrix", "File sanitizer workflow", "SoD basics"],
    lessons: [
      { id: "1", title: "Roles in Finova", minutes: 5 },
      { id: "2", title: "Segregation of duties", minutes: 5 },
      { id: "3", title: "File sanitizer & DLP ideas", minutes: 5 },
      { id: "4", title: "Audit trail expectations", minutes: 5 },
    ],
  },
  {
    id: "client-portal",
    title: "Client Portal Best Practices",
    level: "Beginner",
    duration: "15 min",
    description: "Help your clients upload documents, respond to requests, and approve items with zero friction.",
    outcomes: ["Client login path", "Upload folders", "PBC responses"],
    lessons: [
      { id: "1", title: "Client login at /portal", minutes: 3 },
      { id: "2", title: "Documents & requests", minutes: 4 },
      { id: "3", title: "Firm-side tracking", minutes: 4 },
      { id: "4", title: "Communication tips", minutes: 4 },
    ],
  },
];

export function getCourse(id: string) {
  return COURSES.find((c) => c.id === id);
}
