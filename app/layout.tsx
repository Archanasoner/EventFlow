import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "EventFlow Studio",
  description: "Interactive full-stack event planner with floor layouts, guests, vendors, and budgets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
