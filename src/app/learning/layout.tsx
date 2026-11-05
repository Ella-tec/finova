import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning Center",
  description: "Finova — guides for close, audit, consolidation, and file security.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
