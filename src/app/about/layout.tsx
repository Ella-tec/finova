import type { Metadata } from "next";

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "About FAQ",
  description:
    "Finova — enterprise accounting, audit, and secure document collaboration platform. Frequently asked questions for CPA firms and clients.",
=======
  title: "About Finova | FAQ",
  description: "Learn about Finova's accounting, audit, and secure document collaboration platform.",
>>>>>>> 5f479a955308d8bda680057f2f093418c2b9959d
};

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}