import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About
FAQ",
  description: "Finova — enterprise accounting, audit, and secure document collaboration platform.
frequently asked questions for CPA firms and clients.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
