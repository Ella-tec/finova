export type ExerciseStep = {
  title: string;
  detail: string;
};

export type HandsOnExercise = {
  id: string;
  title: string;
  level: string;
  minutes: number;
  goal: string;
  materials: string[];
  steps: ExerciseStep[];
  solutionTips: string[];
};

export type ReadingNote = {
  id: string;
  title: string;
  minutes: number;
  summary: string;
  bullets: string[];
  practicePrompt: string;
};

export const HANDS_ON: HandsOnExercise[] = [
  {
    id: "tb-to-statements",
    title: "Trial balance → statements workout",
    level: "Beginner",
    minutes: 25,
    goal: "Build a mini income statement and balance sheet from a short trial balance.",
    materials: [
      "Paper or spreadsheet",
      "Sample TB accounts: Cash, AR, Inventory, AP, Capital, Sales, COGS, Rent expense",
    ],
    steps: [
      {
        title: "1. Separate temporary vs permanent",
        detail: "List revenues/expenses apart from assets, liabilities, and equity.",
      },
      {
        title: "2. Draft the income statement",
        detail: "Sales − COGS − expenses = net income (or loss).",
      },
      {
        title: "3. Roll net income into equity",
        detail: "Add net income to capital/retained earnings before the balance sheet.",
      },
      {
        title: "4. Prepare the balance sheet",
        detail: "Confirm Assets = Liabilities + Equity after the income close effect.",
      },
    ],
    solutionTips: [
      "If the balance sheet does not balance, check that net income was included in equity.",
      "Do not put expense balances on the balance sheet after they are closed.",
    ],
  },
  {
    id: "bank-rec-lab",
    title: "Bank reconciliation lab",
    level: "Intermediate",
    minutes: 20,
    goal: "Reconcile book cash to bank cash with two timing differences and one bank fee.",
    materials: [
      "Book cash balance",
      "Bank statement balance",
      "List of outstanding checks, deposit in transit, service charge",
    ],
    steps: [
      {
        title: "1. Start from bank balance",
        detail: "Add deposits in transit; subtract outstanding checks.",
      },
      {
        title: "2. Adjust the books",
        detail: "Record bank fees, NSF checks, and interest the bank already posted.",
      },
      {
        title: "3. Match both sides",
        detail: "Adjusted bank balance should equal adjusted book balance.",
      },
      {
        title: "4. File the package",
        detail: "Attach statement, reconciling list, and any journal entry support.",
      },
    ],
    solutionTips: [
      "Outstanding checks are on the books, not yet on the bank — subtract from bank.",
      "Service charges hit the books with a journal entry if not already recorded.",
    ],
  },
  {
    id: "pbc-response",
    title: "PBC response exercise",
    level: "Intermediate",
    minutes: 15,
    goal: "Practice packaging client documents the way an audit team expects.",
    materials: [
      "Sample invoice PDF",
      "Bank statement",
      "Simple AP aging",
    ],
    steps: [
      {
        title: "1. Label each file",
        detail: "Use clear names: period, entity, document type (e.g. 2024-12 BankStmt Operating).",
      },
      {
        title: "2. Map to the request",
        detail: "Match every item on a mock PBC list to a file or a written N/A reason.",
      },
      {
        title: "3. Note open items",
        detail: "List missing support and the owner/date to follow up.",
      },
    ],
    solutionTips: [
      "Complete, labeled packages reduce follow-up questions.",
      "Never leave a requested item blank without status.",
    ],
  },
];

export const READING_NOTES: ReadingNote[] = [
  {
    id: "double-entry",
    title: "Reading note: Why double-entry exists",
    minutes: 8,
    summary:
      "Every resource comes from somewhere. Debits and credits keep that story balanced.",
    bullets: [
      "Assets are uses of funds; liabilities and equity are sources of funds.",
      "A single-entry cash log cannot catch many classification errors.",
      "Journals preserve chronology; ledgers preserve balances by account.",
    ],
    practicePrompt:
      "Write one transaction (e.g. buy inventory on credit) and label debit and credit with a one-line reason for each.",
  },
  {
    id: "accrual-vs-cash",
    title: "Reading note: Accrual vs cash thinking",
    minutes: 8,
    summary:
      "Cash timing and economic activity are not always the same month.",
    bullets: [
      "Accrual recognizes revenue when earned and expenses when incurred.",
      "Cash basis can misstate performance when receivables or payables are large.",
      "Month-end accruals exist to align the books with the real period.",
    ],
    practicePrompt:
      "List one revenue earned this month but collected next month, and the accounts you would touch.",
  },
  {
    id: "close-checklist",
    title: "Reading note: A calm month-end close",
    minutes: 10,
    summary:
      "Close quality comes from sequence: complete data, reconcile, adjust, review, lock.",
    bullets: [
      "Reconcile cash, AR, AP, and key suspense accounts before statements.",
      "Document judgments (estimates, cut-off) for reviewers.",
      "A locked period protects prior reporting from silent edits.",
    ],
    practicePrompt:
      "Draft a 6-item close checklist for a small trading company.",
  },
];
