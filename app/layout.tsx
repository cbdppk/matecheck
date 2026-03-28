import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MateCheck",
  description: "Mobile-first trotro revenue tracker for Ghana.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
