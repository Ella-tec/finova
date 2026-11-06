import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Finova | FAQ",
  description:
    "Finova — accounting, audit, and secure document collaboration for finance teams, CPA firms, and their clients.",
};

export default function AboutLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
