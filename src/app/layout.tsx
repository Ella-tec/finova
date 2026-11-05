import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const siteUrl = process.env.NEXTAUTH_URL || "https://finova.ai";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Finova | Accounting ERP, Audit & Client Portal",
    template: "%s | Finova",
  },
  description:
    "Enterprise platform for accounting firms: general ledger, financial statements, month-end close, multi-entity consolidation, audit workpapers, PBC requests, document AI, bank reconciliation, and secure client collaboration.",
  keywords: [
    "accounting software",
    "CPA firm platform",
    "audit management",
    "financial statements",
    "month end close",
    "trial balance",
    "PBC requests",
    "client portal accounting",
    "bank reconciliation",
    "multi-entity consolidation",
    "NCI",
    "document AI accounting",
    "Microsoft Entra ID accounting",
  ],
  authors: [{ name: "Finova" }],
  creator: "Finova",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Finova",
    title: "Finova | Complete Accounting, Audit & Collaboration",
    description:
      "Accounting ERP + Audit + Document Gateway + AI Copilot for CPA firms, controllers, and clients.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Finova",
    description: "Enterprise accounting, audit, and client collaboration platform.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-white text-slate-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
