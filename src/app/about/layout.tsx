import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Finova | FAQ",
  description: "Learn about Finova's accounting, audit, and secure document collaboration platform.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
