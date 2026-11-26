export type QuizChoice = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: QuizChoice[];
  correctId: string;
  explanation: string;
  topic: string;
};

export type QuizSet = {
  id: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  minutes: number;
  questions: QuizQuestion[];
};

export const QUIZ_SETS: QuizSet[] = [
  {
    id: "accounting-basics",
    title: "Accounting basics workout",
    description: "Debits, credits, the accounting equation, and core statements.",
    level: "Beginner",
    minutes: 12,
    questions: [
      {
        id: "q1",
        topic: "Equation",
        prompt: "Which equation is the foundation of double-entry bookkeeping?",
        choices: [
          { id: "a", text: "Assets = Liabilities + Equity" },
          { id: "b", text: "Revenue − Expenses = Assets" },
          { id: "c", text: "Cash = Bank − Credit cards" },
          { id: "d", text: "Equity = Revenue + Liabilities" },
        ],
        correctId: "a",
        explanation:
          "The balance sheet always balances: resources (assets) equal claims by creditors (liabilities) and owners (equity). Every transaction preserves this equation.",
      },
      {
        id: "q2",
        topic: "Debits & credits",
        prompt: "A cash sale increases which accounts?",
        choices: [
          { id: "a", text: "Debit Expense, credit Cash" },
          { id: "b", text: "Debit Cash, credit Revenue" },
          { id: "c", text: "Debit Revenue, credit Cash" },
          { id: "d", text: "Debit Liability, credit Equity" },
        ],
        correctId: "b",
        explanation:
          "Cash (asset) increases with a debit. Revenue increases with a credit. That records the inflow and the earnings at the same time.",
      },
      {
        id: "q3",
        topic: "Statements",
        prompt: "Which statement reports financial position at a point in time?",
        choices: [
          { id: "a", text: "Income statement" },
          { id: "b", text: "Statement of cash flows" },
          { id: "c", text: "Balance sheet" },
          { id: "d", text: "Trial balance only" },
        ],
        correctId: "c",
        explanation:
          "The balance sheet is a snapshot on a date. The income statement and cash flow statement cover a period of time.",
      },
      {
        id: "q4",
        topic: "Normal balances",
        prompt: "What is the normal balance of an expense account?",
        choices: [
          { id: "a", text: "Credit" },
          { id: "b", text: "Debit" },
          { id: "c", text: "Either, depending on the month" },
          { id: "d", text: "Neither — expenses have no balance" },
        ],
        correctId: "b",
        explanation:
          "Expenses reduce equity. They carry a normal debit balance, so recording an expense is typically a debit to the expense account.",
      },
      {
        id: "q5",
        topic: "Accrual",
        prompt: "Under accrual accounting, revenue is recognized when:",
        choices: [
          { id: "a", text: "Cash is collected only" },
          { id: "b", text: "The invoice is printed" },
          { id: "c", text: "It is earned, even if cash is not yet received" },
          { id: "d", text: "The bank deposit clears" },
        ],
        correctId: "c",
        explanation:
          "Accrual basis matches economic activity to the period: revenue when earned, expenses when incurred — not only when cash moves.",
      },
    ],
  },
  {
    id: "journal-and-tb",
    title: "Journals, ledgers & trial balance",
    description: "From source documents to a balanced trial balance.",
    level: "Beginner",
    minutes: 10,
    questions: [
      {
        id: "q1",
        topic: "Journal",
        prompt: "What is the primary purpose of a journal entry?",
        choices: [
          { id: "a", text: "To list only cash receipts" },
          { id: "b", text: "To record a transaction with equal debits and credits chronologically" },
          { id: "c", text: "To replace the financial statements" },
          { id: "d", text: "To delete prior period balances" },
        ],
        correctId: "b",
        explanation:
          "Journals capture the story of each transaction in date order, with balanced debits and credits, before posting to the ledger.",
      },
      {
        id: "q2",
        topic: "Trial balance",
        prompt: "A trial balance that balances means:",
        choices: [
          { id: "a", text: "All account balances are correct" },
          { id: "b", text: "Total debits equal total credits (no arithmetic imbalance)" },
          { id: "c", text: "The company is profitable" },
          { id: "d", text: "Bank reconciliation is complete" },
        ],
        correctId: "b",
        explanation:
          "A balanced trial balance only proves debits equal credits. Wrong accounts, omitted entries, or compensating errors can still exist.",
      },
      {
        id: "q3",
        topic: "Posting",
        prompt: "Posting moves amounts from the journal to the:",
        choices: [
          { id: "a", text: "Tax return only" },
          { id: "b", text: "General ledger accounts" },
          { id: "c", text: "Customer website" },
          { id: "d", text: "Payroll provider" },
        ],
        correctId: "b",
        explanation:
          "After journalizing, amounts are posted to ledger accounts so each account’s running balance can be summarized on the trial balance.",
      },
      {
        id: "q4",
        topic: "Adjusting",
        prompt: "Accrued wages at month-end are recorded to:",
        choices: [
          { id: "a", text: "Debit Cash, credit Wages expense" },
          { id: "b", text: "Debit Wages expense, credit Wages payable" },
          { id: "c", text: "Debit Equity, credit Cash" },
          { id: "d", text: "No entry until paid" },
        ],
        correctId: "b",
        explanation:
          "Under accrual rules, expense is recognized when incurred. Debit expense and credit a liability until cash is paid.",
      },
    ],
  },
  {
    id: "bank-rec-close",
    title: "Bank reconciliation & close",
    description: "Outstanding items, reconciling items, and month-end discipline.",
    level: "Intermediate",
    minutes: 12,
    questions: [
      {
        id: "q1",
        topic: "Bank rec",
        prompt: "Outstanding checks are checks that:",
        choices: [
          { id: "a", text: "Have cleared the bank already" },
          { id: "b", text: "Were recorded in the books but have not yet cleared the bank" },
          { id: "c", text: "Were never recorded in the books" },
          { id: "d", text: "Belong to a different company" },
        ],
        correctId: "b",
        explanation:
          "Outstanding checks reduce book cash already but still appear on the bank statement until they clear — a classic reconciling item.",
      },
      {
        id: "q2",
        topic: "Deposits",
        prompt: "A deposit in transit is:",
        choices: [
          { id: "a", text: "Recorded by the bank but not yet in the books" },
          { id: "b", text: "Recorded in the books but not yet on the bank statement" },
          { id: "c", text: "Always an error" },
          { id: "d", text: "A type of loan" },
        ],
        correctId: "b",
        explanation:
          "Timing differences: the company recorded the deposit; the bank has not processed it yet. It is added when reconciling the bank balance.",
      },
      {
        id: "q3",
        topic: "Close",
        prompt: "Temporary accounts closed at period end typically include:",
        choices: [
          { id: "a", text: "Cash and accounts receivable" },
          { id: "b", text: "Revenues, expenses, and dividends (or drawings)" },
          { id: "c", text: "Land and buildings only" },
          { id: "d", text: "Long-term debt only" },
        ],
        correctId: "b",
        explanation:
          "Temporary accounts measure performance for a period and are closed to retained earnings (or capital) so the next period starts clean.",
      },
      {
        id: "q4",
        topic: "Controls",
        prompt: "Why attach the bank statement and support to the reconciliation package?",
        choices: [
          { id: "a", text: "For decoration only" },
          { id: "b", text: "To provide audit evidence and review trail for reconciling items" },
          { id: "c", text: "Because cash does not appear on statements" },
          { id: "d", text: "To replace journal entries" },
        ],
        correctId: "b",
        explanation:
          "Reviewers and auditors need evidence that differences were investigated and that the reconciled cash balance is supported.",
      },
    ],
  },
  {
    id: "audit-awareness",
    title: "Audit & PBC awareness",
    description: "Evidence, materiality mindset, and client document requests.",
    level: "Intermediate",
    minutes: 10,
    questions: [
      {
        id: "q1",
        topic: "PBC",
        prompt: "PBC in an audit context usually means:",
        choices: [
          { id: "a", text: "Paid by client" },
          { id: "b", text: "Prepared by client (document request list)" },
          { id: "c", text: "Posted before close" },
          { id: "d", text: "Public bank confirmation" },
        ],
        correctId: "b",
        explanation:
          "Prepared-by-client lists tell management which schedules, statements, and support the audit team needs — on time and complete.",
      },
      {
        id: "q2",
        topic: "Evidence",
        prompt: "Which is generally stronger evidence for cash?",
        choices: [
          { id: "a", text: "An informal email with no amount" },
          { id: "b", text: "Bank confirmation / statement from the financial institution" },
          { id: "c", text: "A handwritten sticky note" },
          { id: "d", text: "A budget spreadsheet only" },
        ],
        correctId: "b",
        explanation:
          "External evidence from the bank is more persuasive than internal notes alone when testing cash existence and accuracy.",
      },
      {
        id: "q3",
        topic: "Materiality",
        prompt: "Materiality helps auditors:",
        choices: [
          { id: "a", text: "Ignore all small accounts forever" },
          { id: "b", text: "Focus effort on amounts and risks that could influence decisions" },
          { id: "c", text: "Guarantee zero error" },
          { id: "d", text: "Replace sampling" },
        ],
        correctId: "b",
        explanation:
          "Materiality is a planning and evaluation concept: prioritize what could matter to users of the financial statements.",
      },
    ],
  },
];

export function getQuizSet(id: string) {
  return QUIZ_SETS.find((q) => q.id === id) ?? null;
}
