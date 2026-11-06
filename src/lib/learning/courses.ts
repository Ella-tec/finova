
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
  description: string;
  outcomes: string[];
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
    title: "Getting Started with FinSphere AI",
    level: "Beginner",
    summary: "Set up your firm, invite clients, and navigate the main workspace.",
    description: "Learn how to set up your firm, invite clients, and navigate the main FinSphere AI workspace.",
    outcomes: ["Create firm workspace", "Invite users with roles", "Navigate sidebar modules"],
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
    description: "Master bank sync, AI matching, exception handling, and daily bookkeeping flows.",
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
    description: "Run a complete close using guided checklists, accruals, trial balance validation, and approvals.",
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
    summary: "Import trial balances, generate statements with AI, notes, management packs.",
    description: "Import trial balances, generate statements with AI, add notes, and prepare management packages.",
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
    description: "Plan engagements, assess risk, create workpapers, manage PBC requests, and issue findings.",
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
    summary: "Natural language for entries, statements, close tasks, and audit programs.",
    description: "Use natural language to generate entries, statements, close tasks, and audit programs safely.",
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
    description: "Understand roles, segregation of duties, audit logs, MFA, and how FinSphere AI supports SOC 2.",
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
    description: "Help your clients upload documents, respond to requests, and approve items with zero friction.",
    outcomes: ["Client login path", "Upload folders", "PBC responses"],
    lessons: [
      { id: "1", title: "Portal login", minutes: 4 },
      { id: "2", title: "Folders & upload", minutes: 4 },
      { id: "3", title: "PBC responses", minutes: 4 },
      { id: "4", title: "Approvals & signatures", minutes: 3 },
    ],
  }),
];

export function getCourse(id: string): Course | undefined {
  const aliases: Record<string, string> = {
    "bank-rec": "daily-bank-rec",
    "financial-statements": "statements",
  };

  const normalizedId = aliases[id] ?? id;
  return COURSES.find((course) => course.id === normalizedId);
}
