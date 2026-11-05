export type Lesson = { id: string; title: string; minutes: number };
export type CourseModule = { title: string; minutes: number };

export type Course = {
  id: string;
  title: string;
  level: string;
  duration: string;
  minutes: number;
  lessons: Lesson[];
  summary: string;
  description: string;
  outcomes: string[];
  modules: CourseModule[];
};

function makeCourse(
  id: string,
  title: string,
  level: string,
  minutes: number,
  description: string,
  outcomes: string[],
  lessonTitles: [string, number][],
): Course {
  const lessons = lessonTitles.map(([title, duration], index) => ({
    id: String(index + 1),
    title,
    minutes: duration,
  }));
  return {
    id, title, level, duration: `${minutes} min`, minutes,
    lessons, summary: description, description, outcomes,
    modules: lessons.map(({ title, minutes }) => ({ title, minutes })),
  };
}

export const COURSES: Course[] = [
  makeCourse("getting-started", "Getting Started with FinSphere AI", "Beginner", 25,
    "Learn how to set up your firm, invite clients, and navigate the main FinSphere AI workspace.",
    ["Create firm workspace", "Invite users with roles", "Navigate sidebar modules"],
    [["Tour of the dashboard",4],["Invite your team",5],["Client & folder setup",5],["Using global search",3],["AI widget vs AI page",4],["Quick start checklist",4]]),
  makeCourse("bank-rec", "Daily Accounting & Bank Reconciliation", "Beginner", 40,
    "Master bank sync, AI matching, exception handling, and daily bookkeeping flows.",
    ["Run AI Auto-Match", "Clear exceptions", "Link to close checklist"],
    [["Import bank feed",5],["AI matching explained",6],["Handling exceptions",6],["Book vs bank views",5],["Daily journal habits",6],["Approvals & audit trail",4],["Sample data practice",5],["Checklist for close",3]]),
  makeCourse("month-end-close", "Month-End Close Mastery", "Intermediate", 55,
    "Run a complete close using guided checklists, accruals, trial balance validation, and approvals.",
    ["Start a close period", "Complete each step", "Final sign-off"],
    [["Close calendar & ownership",5],["Bank rec step",6],["AR / AP reviews",8],["Fixed assets & inventory",8],["Journal entries",7],["Trial balance validation",6],["Controller approval",5],["AI assist on close",4],["Lock period",3],["Practice run",3]]),
  makeCourse("financial-statements", "Financial Statement Generation", "Intermediate", 35,
    "Import trial balances, generate statements with AI, add notes, and prepare management packages.",
    ["Import TB CSV", "Generate BS / P&L / CF", "Export package"],
    [["Trial balance import",5],["Mapping accounts",5],["Balance sheet",5],["Income statement",5],["Cash flow",5],["Notes outline",5],["Sample library TB practice",5]]),
  makeCourse("audit-pbc", "Audit Workspace & PBC Requests", "Advanced", 60,
    "Plan engagements, assess risk, create workpapers, manage PBC requests, and issue findings.",
    ["Create PBC requests", "Workpaper templates", "Findings register"],
    [["Engagement setup",5],["Materiality & risk",6],["PBC request lifecycle",6],["Client portal uploads",5],["Workpaper templates",6],["Sampling worksheets",5],["Findings & management letter",5],["Evidence & sign-off",5],["Sample audit docs",6],["Partner review tips",4],["Opinion templates",4],["Practice engagement",3]]),
  makeCourse("ai-copilot", "AI Copilot for Accountants", "Intermediate", 30,
    "Use natural language to generate entries, statements, close tasks, and audit programs safely.",
    ["Use AI page prompts", "Human approval gate", "Safe data practices"],
    [["What AI may and may not do",5],["Close checklist prompts",6],["Statement & analysis prompts",6],["Audit program drafts",6],["Sanitizer before AI",7]]),
  makeCourse("security", "Security, Roles & Compliance", "All Levels", 20,
    "Understand roles, segregation of duties, audit logs, MFA, and how FinSphere supports SOC 2.",
    ["Role matrix", "File sanitizer workflow", "SoD basics"],
    [["Roles in FinSphere AI",5],["Segregation of duties",5],["File sanitizer & DLP ideas",5],["Audit trail expectations",5]]),
  makeCourse("client-portal", "Client Portal Best Practices", "Beginner", 15,
    "Help your clients upload documents, respond to requests, and approve items with zero friction.",
    ["Client login path", "Upload folders", "PBC responses"],
    [["Client login at /portal",3],["Documents & requests",4],["Firm-side tracking",4],["Communication tips",4]]),
];

export function getCourse(id: string) {
  // Keep the earlier course URL working after the course was renamed.
  const normalizedId = id === "daily-bank-rec" ? "bank-rec" : id;
  return COURSES.find((course) => course.id === normalizedId);
}
