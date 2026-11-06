import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About FAQ",
  description:
    "Finova — enterprise accounting, audit, and secure document collaboration platform. Frequently asked questions for CPA firms and clients.",
};

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}