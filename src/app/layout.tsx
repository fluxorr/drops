import type { Metadata } from "next";
import Script from "next/script";
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
  title: { default: "Drops", template: "%s · Drops" },
  description: "A quiet personal ledger for daily, connected learning.",
  icons: { icon: "/favicon.svg" },
};

const themeScript = `
(function(){try{var t=localStorage.getItem('drops-theme')||'system';if(t==='system'){var m=window.matchMedia('(prefers-color-scheme:dark)');document.documentElement.setAttribute('data-theme',m.matches?'dark':'light')}else{document.documentElement.setAttribute('data-theme',t)}}catch(e){}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${display.variable} ${body.variable}`}>
        <Script id="sw-register" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `if('serviceWorker'in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js')})}`,
        }} />
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "oklch(0.43 0.12 140)",
              colorForeground: "var(--color-ink)",
              colorBackground: "var(--color-canvas)",
              colorInput: "var(--color-canvas)",
              colorInputForeground: "var(--color-ink)",
              borderRadius: "8px",
              fontFamily: "var(--font-body)",
            },
            elements: {
              cardBox: "shadow-none!",
              card: "border! border-rule! shadow-none!",
              footer: "bg-surface!",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
