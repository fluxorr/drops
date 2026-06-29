import type { Metadata } from "next";
import { Manrope, Source_Sans_3 } from "next/font/google";

import "./globals.css";

const display = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Drops",
    template: "%s · Drops",
  },
  description: "A quiet personal ledger for daily, connected learning.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
