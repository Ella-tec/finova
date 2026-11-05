/**
 * Month-End Close Checklist Engine
 */

export type CloseTaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "WAITING" | "COMPLETED" | "SKIPPED";

export type CloseTask = {
  id: string;
  step: number;
  title: string;
  description: string;
  category: "BANK" | "AR" | "AP" | "ASSETS" | "INVENTORY" | "JE" | "REVIEW" | "APPROVAL";
  status: CloseTaskStatus;
  ownerRole?: string;
  dueDay?: number; // day of month
  aiCanHelp?: boolean;
};

export type ClosePeriod = {
  id: string;
  period: string; // e.g. "2026-10"
  status: "OPEN" | "IN_PROGRESS" | "PENDING_APPROVAL" | "CLOSED";
  tasks: CloseTask[];
  startedAt?: string;
  closedAt?: string;
  progress: number; // 0-100
};

export const DEFAULT_MONTH_END_TASKS: Omit<CloseTask, "status">[] = [
  {
    id: "bank-rec",
    step: 1,
    title: "Bank Reconciliation",
    description: "Import bank statement, match transactions, investigate differences, approve reconciliation.",
    category: "BANK",
    ownerRole: "STAFF_ACCOUNTANT",
    dueDay: 3,
    aiCanHelp: true,
  },
  {
    id: "ar-review",
    step: 2,
    title: "Accounts Receivable Review",
    description: "Review aging, post bad debt entries, request customer confirmations, obtain approval.",
    category: "AR",
    ownerRole: "STAFF_ACCOUNTANT",
    dueDay: 4,
    aiCanHelp: true,
  },
  {
    id: "ap-review",
    step: 3,
    title: "Accounts Payable Review",
    description: "Review unpaid bills, accrue missing expenses, obtain approval.",
    category: "AP",
    ownerRole: "STAFF_ACCOUNTANT",
    dueDay: 4,
    aiCanHelp: true,
  },
  {
    id: "fixed-assets",
    step: 4,
    title: "Fixed Assets",
    description: "Record new assets, run depreciation, process disposals, review.",
    category: "ASSETS",
    ownerRole: "STAFF_ACCOUNTANT",
    dueDay: 5,
    aiCanHelp: true,
  },
  {
    id: "inventory",
    step: 5,
    title: "Inventory",
    description: "Count inventory, adjust variances, valuation, approval.",
    category: "INVENTORY",
    ownerRole: "STAFF_ACCOUNTANT",
    dueDay: 5,
    aiCanHelp: false,
  },
  {
    id: "journal-entries",
    step: 6,
    title: "Journal Entries",
    description: "Accruals, prepaids, reclasses, depreciation, amortization.",
    category: "JE",
    ownerRole: "SENIOR_ACCOUNTANT",
    dueDay: 6,
    aiCanHelp: true,
  },
  {
    id: "trial-balance",
    step: 7,
    title: "Review Trial Balance",
    description: "Validation rules, exception review, controller approval.",
    category: "REVIEW",
    ownerRole: "CONTROLLER",
    dueDay: 7,
    aiCanHelp: true,
  },
  {
    id: "final-approval",
    step: 8,
    title: "Final Close Approval",
    description: "Controller / CFO final sign-off and lock period.",
    category: "APPROVAL",
    ownerRole: "CONTROLLER",
    dueDay: 8,
    aiCanHelp: false,
  },
];

export function createClosePeriod(period: string): ClosePeriod {
  const tasks: CloseTask[] = DEFAULT_MONTH_END_TASKS.map((t) => ({
    ...t,
    status: "NOT_STARTED" as CloseTaskStatus,
  }));

  return {
    id: `close-${period}`,
    period,
    status: "OPEN",
    tasks,
    progress: 0,
  };
}

export function calculateProgress(tasks: CloseTask[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === "COMPLETED" || t.status === "SKIPPED").length;
  return Math.round((done / tasks.length) * 100);
}

export function updateTaskStatus(
  period: ClosePeriod,
  taskId: string,
  status: CloseTaskStatus
): ClosePeriod {
  const tasks = period.tasks.map((t) =>
    t.id === taskId ? { ...t, status } : t
  );
  const progress = calculateProgress(tasks);
  let overallStatus = period.status;

  if (progress === 100) {
    overallStatus = "PENDING_APPROVAL";
  } else if (progress > 0) {
    overallStatus = "IN_PROGRESS";
  }

  return {
    ...period,
    tasks,
    progress,
    status: overallStatus,
  };
}