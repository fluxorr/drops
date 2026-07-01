import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";

import { ThemeProvider } from "@/components/theme/theme-provider";

import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: { default: "Drops", template: "%s · Drops" },
  description: "A quiet personal ledger for daily, connected learning.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={sans.variable}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Script id="sw-register" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `if('serviceWorker'in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js')})}`,
        }} />
      </body>
    </html>
  );
}
