import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beyond the Bell — Participant Information | The ABLE Foundation",
  description:
    "Where Learning Continues Beyond the Classroom - After-School Enrichment Center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#ededed] antialiased">{children}</body>
    </html>
  );
}
