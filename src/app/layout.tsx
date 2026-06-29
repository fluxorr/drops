import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
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
      <body className={`${display.variable} ${body.variable}`}>
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "oklch(0.43 0.12 140)",
              colorForeground: "var(--ink)",
              colorBackground: "var(--canvas)",
              colorInput: "var(--canvas)",
              colorInputForeground: "var(--ink)",
              borderRadius: "8px",
              fontFamily: "var(--font-body), ui-sans-serif, sans-serif",
            },
            elements: {
              cardBox: "clerk-shell",
              card: "clerk-card",
              footer: "clerk-footer",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
