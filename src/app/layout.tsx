import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const siteUrl = process.env.NEXTAUTH_URL || "https://finova.ai";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Finova | Accounting, Audit & Finance Platform", template: "%s | Finova" },
  description: "Finova brings accounting operations, financial reporting, bank reconciliation, month-end close, audit workpapers, secure client collaboration, and AI-assisted document workflows into one workspace.",
  keywords: [
    "Finova", "accounting software", "accounting ERP", "audit management",
    "financial statements", "month-end close", "trial balance", "PBC requests",
    "client portal", "bank reconciliation", "multi-entity consolidation",
    "document intelligence", "accounting workflow automation",
  ],
  authors: [{ name: "Finova" }],
  creator: "Finova",
  icons: { icon: [{ url: "/logo.svg", type: "image/svg+xml" }], shortcut: ["/logo.svg"], apple: [{ url: "/logo.svg", type: "image/svg+xml" }] },
  openGraph: {
    type: "website", locale: "en_US", url: siteUrl, siteName: "Finova",
    title: "Finova | Accounting, Audit & Finance Platform",
    description: "A connected workspace for accounting teams, auditors, controllers, and their clients.",
  },
  twitter: { card: "summary_large_image", title: "Finova", description: "Accounting, audit, and client collaboration in one workspace." },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: siteUrl },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-white text-slate-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
