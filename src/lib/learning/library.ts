export type LibraryItem = {
  id: string;
  title: string;
  authors: string;
  kind: "Book" | "Article" | "Research" | "Standard / guide";
  year?: string;
  level: string;
  blurb: string;
  topics: string[];
  /** Prefer official or widely available catalog links — not pirated copies */
  accessUrl?: string;
  accessNote: string;
};

export const LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: "warren-reeve",
    title: "Accounting (textbook series)",
    authors: "Warren / Reeve / Duchac (and similar intro texts)",
    kind: "Book",
    level: "Beginner",
    blurb:
      "Clear walkthrough of the accounting cycle, journals, adjusting entries, and statements — ideal first serious textbook path.",
    topics: ["Cycle", "Journals", "Statements"],
    accessNote: "Library, campus bookstore, or publisher e-text. Search by title + edition.",
    accessUrl: "https://www.cengage.com/",
  },
  {
    id: "horngren",
    title: "Introduction to Financial Accounting",
    authors: "Horngren / Philbrick (classic intro lineage)",
    kind: "Book",
    level: "Beginner",
    blurb:
      "Emphasizes how transactions flow into statements and how users read financial information.",
    topics: ["Financial statements", "Users of accounts"],
    accessNote: "University libraries often hold multiple editions.",
    accessUrl: "https://www.worldcat.org/",
  },
  {
    id: "kieso-intermediate",
    title: "Intermediate Accounting",
    authors: "Kieso / Weygandt / Warfield",
    kind: "Book",
    level: "Advanced",
    blurb:
      "The standard intermediate reference for recognition, measurement, and reporting topics beyond the basics.",
    topics: ["IFRS/US GAAP depth", "Recognition"],
    accessNote: "Reference copy in most accounting programs; use the edition your course specifies.",
    accessUrl: "https://www.wiley.com/",
  },
  {
    id: "audit-arens",
    title: "Auditing and Assurance Services",
    authors: "Arens / Elder / Beasley (and peers)",
    kind: "Book",
    level: "Intermediate",
    blurb:
      "Risk, evidence, internal control, and reporting — the conceptual backbone of external audit work.",
    topics: ["Audit risk", "Evidence", "Controls"],
    accessNote: "Pair chapters with real PBC practice in Finova Audit workspace.",
    accessUrl: "https://www.pearson.com/",
  },
  {
    id: "fasb-concepts",
    title: "FASB Concepts Statements (conceptual framework)",
    authors: "Financial Accounting Standards Board",
    kind: "Standard / guide",
    level: "Intermediate",
    blurb:
      "Official thinking on objectives, qualitative characteristics, elements, and recognition — free from the source.",
    topics: ["Framework", "Recognition"],
    accessNote: "Read summaries first, then the full concepts statements on FASB’s site.",
    accessUrl: "https://www.fasb.org/",
  },
  {
    id: "ifrs-framework",
    title: "Conceptual Framework for Financial Reporting",
    authors: "IFRS Foundation",
    kind: "Standard / guide",
    level: "Intermediate",
    blurb:
      "International counterpart to conceptual guidance — essential if you work with IFRS clients.",
    topics: ["IFRS", "Framework"],
    accessNote: "IFRS Foundation publishes the framework and standards materials online.",
    accessUrl: "https://www.ifrs.org/",
  },
  {
    id: "sec-financial-reporting",
    title: "SEC financial reporting resources",
    authors: "U.S. Securities and Exchange Commission",
    kind: "Article",
    level: "Intermediate",
    blurb:
      "Public-company reporting context, investor-oriented explanations, and enforcement themes.",
    topics: ["Public reporting", "Disclosure"],
    accessNote: "Free official materials — start at Investor.gov / SEC education pages.",
    accessUrl: "https://www.sec.gov/",
  },
  {
    id: "pcaob-standards",
    title: "PCAOB auditing standards (overview)",
    authors: "Public Company Accounting Oversight Board",
    kind: "Standard / guide",
    level: "Advanced",
    blurb:
      "How public-company audits are structured in the U.S. regulatory environment.",
    topics: ["Audit standards", "QC"],
    accessNote: "Use for orientation; engagement teams follow the firm’s methodology mapped to standards.",
    accessUrl: "https://pcaobus.org/",
  },
  {
    id: "coso",
    title: "Internal Control — Integrated Framework (COSO)",
    authors: "Committee of Sponsoring Organizations",
    kind: "Research",
    level: "Intermediate",
    blurb:
      "The control framework most audit and risk discussions still reference: components and principles of internal control.",
    topics: ["Internal control", "Risk"],
    accessNote: "Executive summaries are widely cited; full framework is licensed via COSO.",
    accessUrl: "https://www.coso.org/",
  },
  {
    id: "openstax-principles",
    title: "Principles of Accounting (OpenStax)",
    authors: "OpenStax",
    kind: "Book",
    level: "Beginner",
    blurb:
      "Freely available open textbook covering financial and managerial fundamentals — excellent zero-cost starting point.",
    topics: ["Open textbook", "Cycle", "Managerial basics"],
    accessNote: "Free legal PDF/HTML from OpenStax.",
    accessUrl: "https://openstax.org/details/books/principles-financial-accounting",
  },
  {
    id: "journal-accountancy",
    title: "Journal of Accountancy (AICPA)",
    authors: "AICPA & CIMA contributors",
    kind: "Article",
    level: "All levels",
    blurb:
      "Practice-oriented articles on reporting, tax, audit, technology, and firm management.",
    topics: ["Practice", "Current topics"],
    accessNote: "Many articles free to read on journalofaccountancy.com.",
    accessUrl: "https://www.journalofaccountancy.com/",
  },
  {
    id: "ssrn-accounting",
    title: "Accounting research working papers",
    authors: "Various (SSRN / university repositories)",
    kind: "Research",
    level: "Advanced",
    blurb:
      "Academic working papers on reporting quality, audit, and capital markets — useful for deeper research habits.",
    topics: ["Research methods", "Empirical accounting"],
    accessNote: "Search SSRN for ‘accounting’ + your topic; prefer peer-reviewed versions when citing.",
    accessUrl: "https://www.ssrn.com/",
  },
];

export const LIBRARY_KINDS = ["All", "Book", "Article", "Research", "Standard / guide"] as const;
