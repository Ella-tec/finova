/**
 * Finova File Sanitizer
 * Lightweight pre-AI / pre-storage checks for accounting & audit documents.
 * Complements enterprise tools (Defender, Purview, OPSWAT) — does not replace them.
 */

export type Classification = "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";

export type SanitizeFinding = {
  severity: "info" | "low" | "medium" | "high" | "critical";
  code: string;
  message: string;
  recommendation?: string;
};

export type SanitizeResult = {
  safeToUpload: boolean;
  safeForPublicAI: boolean; // ChatGPT / consumer tools
  classification: Classification;
  findings: SanitizeFinding[];
  piiHits: { type: string; count: number; sample?: string }[];
  fileTypeOk: boolean;
  suggestedActions: string[];
  cleanedFileName: string;
};

const DANGEROUS_EXT = new Set([
  ".exe", ".bat", ".cmd", ".com", ".msi", ".scr", ".ps1", ".vbs", ".js", ".jar",
  ".dll", ".sys", ".lnk", ".wsf", ".hta", ".reg",
]);

const MACRO_EXT = new Set([".docm", ".xlsm", ".pptm", ".dotm", ".xltm"]);

const OFFICE_EXT = new Set([".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".odt", ".ods"]);

const SAFE_EXT = new Set([
  ".pdf", ".txt", ".csv", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".tif", ".tiff",
  ".docx", ".xlsx", ".pptx", ".doc", ".xls", ".ppt", ".rtf", ".xml", ".json",
]);

// Simple PII patterns (demo-grade; production should use Presidio / Purview)
const PII_PATTERNS: { type: string; re: RegExp; severity: SanitizeFinding["severity"] }[] = [
  { type: "SSN", re: /\b\d{3}-\d{2}-\d{4}\b/g, severity: "critical" },
  { type: "SSN_COMPACT", re: /\b\d{9}\b/g, severity: "medium" }, // noisy; keep medium
  { type: "CREDIT_CARD", re: /\b(?:4\d{3}|5[1-5]\d{2}|3[47]\d{2}|6(?:011|5\d{2}))[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, severity: "critical" },
  { type: "API_KEY_LIKE", re: /\b(?:sk|pk|api|key|secret|token)[_-][a-zA-Z0-9]{16,}\b/gi, severity: "high" },
  { type: "PASSWORD_ASSIGN", re: /\b(?:password|passwd|pwd)\s*[:=]\s*\S+/gi, severity: "high" },
  { type: "AWS_KEY", re: /\bAKIA[0-9A-Z]{16}\b/g, severity: "critical" },
  { type: "EMAIL", re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, severity: "low" },
  { type: "PHONE_US", re: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, severity: "low" },
  { type: "IBAN", re: /\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/g, severity: "high" },
  { type: "ROUTING_ACCOUNT", re: /\brouting\s*[#:.]?\s*\d{9}\b/gi, severity: "high" },
];

function extOf(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

function cleanFileName(name: string) {
  return name
    .replace(/[^\w.\- ()[\]]+/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 180);
}

/** Suggest classification for accounting/audit context */
export function suggestClassification(fileName: string, textSample: string, piiCritical: boolean): Classification {
  if (piiCritical) return "RESTRICTED";
  const n = (fileName + " " + textSample).toLowerCase();
  if (
    n.includes("payroll") ||
    n.includes("w-2") ||
    n.includes("w2") ||
    n.includes("ssn") ||
    n.includes("bank statement") ||
    n.includes("wire") ||
    n.includes("tax return") ||
    n.includes("1099")
  ) {
    return "CONFIDENTIAL";
  }
  if (n.includes("invoice") || n.includes("trial balance") || n.includes("ledger") || n.includes("pbc")) {
    return "INTERNAL";
  }
  if (n.includes("marketing") || n.includes("public") || n.includes("brochure")) {
    return "PUBLIC";
  }
  return "INTERNAL";
}

export type SanitizeInput = {
  fileName: string;
  mimeType?: string;
  size: number;
  /** Optional text extracted from file (OCR / plain text). Binary files may omit. */
  textContent?: string;
};

export function sanitizeFile(input: SanitizeInput): SanitizeResult {
  const findings: SanitizeFinding[] = [];
  const piiHits: SanitizeResult["piiHits"] = [];
  const suggestedActions: string[] = [];
  const ext = extOf(input.fileName);
  const cleanedFileName = cleanFileName(input.fileName);

  // Size
  const maxBytes = 25 * 1024 * 1024;
  if (input.size > maxBytes) {
    findings.push({
      severity: "high",
      code: "SIZE_LIMIT",
      message: `File exceeds 25 MB (${(input.size / 1024 / 1024).toFixed(1)} MB).`,
      recommendation: "Split or compress before upload.",
    });
  }
  if (input.size === 0) {
    findings.push({ severity: "high", code: "EMPTY_FILE", message: "File is empty." });
  }

  // Extension / type
  let fileTypeOk = true;
  if (DANGEROUS_EXT.has(ext)) {
    fileTypeOk = false;
    findings.push({
      severity: "critical",
      code: "DANGEROUS_TYPE",
      message: `Executable or script type not allowed: ${ext}`,
      recommendation: "Do not upload. Request a PDF or data export instead.",
    });
  }
  if (MACRO_EXT.has(ext)) {
    findings.push({
      severity: "high",
      code: "MACRO_ENABLED",
      message: `Macro-enabled Office file (${ext}).`,
      recommendation: "Remove macros or export to .xlsx/.docx/.pdf without macros before AI use.",
    });
    suggestedActions.push("Disable macros or re-save without VBA");
  }
  if (ext && !SAFE_EXT.has(ext) && !DANGEROUS_EXT.has(ext) && !MACRO_EXT.has(ext)) {
    findings.push({
      severity: "medium",
      code: "UNUSUAL_TYPE",
      message: `Uncommon extension for accounting uploads: ${ext}`,
      recommendation: "Prefer PDF, CSV, or standard Office formats.",
    });
  }
  if (SAFE_EXT.has(ext) || OFFICE_EXT.has(ext)) {
    findings.push({
      severity: "info",
      code: "TYPE_OK",
      message: `Recognized document type ${ext || "(none)"}.`,
    });
  }

  // MIME vs extension (light check)
  if (input.mimeType) {
    const mt = input.mimeType.toLowerCase();
    if (mt.includes("executable") || mt.includes("x-msdownload") || mt === "application/x-bat") {
      fileTypeOk = false;
      findings.push({
        severity: "critical",
        code: "MIME_EXECUTABLE",
        message: `MIME type looks executable: ${input.mimeType}`,
      });
    }
  }

  // PII scan on text
  const text = input.textContent || "";
  let piiCritical = false;
  if (text.length > 0) {
    for (const p of PII_PATTERNS) {
      const matches = text.match(p.re);
      if (matches && matches.length) {
        // Reduce noise for compact 9-digit if few hits and no SSN dashes
        if (p.type === "SSN_COMPACT" && matches.length < 3) continue;
        const count = matches.length;
        if (p.severity === "critical" || p.severity === "high") piiCritical = true;
        piiHits.push({
          type: p.type,
          count,
          sample: matches[0]?.replace(/\d(?=\d{4})/g, "•"), // mask
        });
        findings.push({
          severity: p.severity,
          code: `PII_${p.type}`,
          message: `Possible ${p.type.replace(/_/g, " ")} detected (${count} hit(s)).`,
          recommendation:
            p.severity === "critical"
              ? "Redact before any public AI. Use only approved private AI (e.g. Azure OpenAI / firm Copilot)."
              : "Review and redact if not required for the task.",
        });
      }
    }
  } else {
    findings.push({
      severity: "info",
      code: "NO_TEXT_SCAN",
      message: "No text layer provided — PII scan limited. Run OCR or open in editor for full check.",
      recommendation: "For PDFs/images, use document analyze after upload inside Finova (private path).",
    });
  }

  // Accounting-specific hints
  const lower = (input.fileName + " " + text.slice(0, 2000)).toLowerCase();
  if (lower.includes("password") && lower.includes("protected")) {
    findings.push({
      severity: "medium",
      code: "PASSWORD_PROTECTED_HINT",
      message: "File may be password-protected.",
      recommendation: "Unlock with approved process before firm processing; never share passwords in chat AI.",
    });
  }

  const classification = suggestClassification(input.fileName, text.slice(0, 3000), piiCritical);

  if (classification === "RESTRICTED") {
    suggestedActions.push("Do not send to public ChatGPT/Claude consumer plans");
    suggestedActions.push("Use Finova internal analyze or Azure OpenAI under firm tenant only");
    suggestedActions.push("Log access and retention per policy");
  }
  if (classification === "CONFIDENTIAL") {
    suggestedActions.push("Prefer private AI (Microsoft 365 Copilot / Azure OpenAI)");
    suggestedActions.push("Confirm engagement letter / NDA covers this client data");
  }
  if (MACRO_EXT.has(ext)) {
    suggestedActions.push("Convert to PDF or macro-free Office format");
  }
  if (piiHits.some((h) => h.type === "CREDIT_CARD" || h.type === "SSN")) {
    suggestedActions.push("Redact SSN/PAN before sharing outside the engagement team");
  }

  const hasCritical = findings.some((f) => f.severity === "critical");
  const hasHigh = findings.some((f) => f.severity === "high");

  const safeToUpload = fileTypeOk && !hasCritical && input.size > 0 && input.size <= maxBytes;
  const safeForPublicAI =
    safeToUpload &&
    classification !== "RESTRICTED" &&
    classification !== "CONFIDENTIAL" &&
    !piiCritical &&
    !MACRO_EXT.has(ext);

  if (safeForPublicAI) {
    suggestedActions.push("OK for careful use in approved tools after human review");
  } else if (safeToUpload) {
    suggestedActions.push("OK to store in Finova firm workspace — not for public AI");
  }

  // Metadata reminder
  findings.push({
    severity: "info",
    code: "METADATA_REMINDER",
    message: "Office/PDF files may contain author, company, or GPS metadata.",
    recommendation: "Office: File → Info → Check for Issues → Inspect Document. PDF: use a metadata cleaner if required.",
  });

  return {
    safeToUpload,
    safeForPublicAI,
    classification,
    findings,
    piiHits,
    fileTypeOk,
    suggestedActions: [...new Set(suggestedActions)],
    cleanedFileName,
  };
}

/** Extra ideas / enterprise checklist (documented for Security page) */
export const SANITIZER_PLAYBOOK = [
  {
    title: "Engagement-scoped vault",
    detail: "Store client files only under that client’s folder; block cross-client AI context.",
  },
  {
    title: "Content Disarm & Reconstruction (CDR)",
    detail: "Rebuild PDFs/Office into known-safe structures (OPSWAT, Votiro, Check Point).",
  },
  {
    title: "Presidio / Purview redaction",
    detail: "Auto-mask SSN, PAN, IBAN before any model prompt is built.",
  },
  {
    title: "Hash & allowlist",
    detail: "SHA-256 of approved workpapers; alert on unexpected modification.",
  },
  {
    title: "Macro & OLE deep inspect",
    detail: "Block embedded objects and external links in Office files.",
  },
  {
    title: "Prompt firewall",
    detail: "Strip secrets from text pasted into the AI assistant, not only from files.",
  },
  {
    title: "Retention & legal hold",
    detail: "Align upload retention with audit workpaper policy and client deletion requests.",
  },
  {
    title: "Watermark & download control",
    detail: "Client portal downloads marked; disable bulk export for restricted packs.",
  },
  {
    title: "Human approval gate",
    detail: "CONFIDENTIAL+ requires reviewer checkbox before AI statement generation.",
  },
  {
    title: "Vendor AI inventory",
    detail: "Only Azure OpenAI / M365 Copilot / Finova — no shadow ChatGPT with client TB.",
  },
];
