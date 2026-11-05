import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Finova — frequently asked questions for CPA firms and clients.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
