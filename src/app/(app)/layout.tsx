import { ClerkProvider } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { AppNav } from "./nav";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "var(--color-accent)",
          colorForeground: "var(--color-ink)",
          colorBackground: "var(--color-canvas)",
          colorInput: "var(--color-canvas)",
          colorInputForeground: "var(--color-ink)",
          borderRadius: "8px",
          fontFamily: "var(--font-sans)",
        },
        elements: {
          cardBox: "shadow-none! border! border-rule!",
          card: "border! border-rule! shadow-none!",
          footer: "bg-surface!",
        },
      }}
    >
      <div className="mx-auto w-[min(100%-40px,800px)] min-h-screen">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-rule bg-canvas/88 backdrop-blur-xl transition-all duration-200">
          <Link className="inline-flex items-center text-[0.9375rem] font-medium text-ink no-underline transition-opacity duration-150 hover:opacity-70" href="/today" aria-label="Drops today">
            <svg viewBox="0 0 28 28" className="size-[26px] mr-2" fill="none" aria-hidden="true">
              <rect width="28" height="28" rx="5" fill="var(--color-accent)" />
              <path d="M8 6V22M8 6H14C17 6 19.5 8.5 19.5 14C19.5 19.5 17 22 14 22H8" stroke="var(--color-canvas)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Drops
          </Link>
          <AppNav />
          <UserButton
            appearance={{ elements: { avatarBox: "size-[28px]! rounded-md!" } }}
            userProfileMode="modal"
          />
        </header>
        <main className="py-10 max-sm:py-8">{children}</main>
      </div>
    </ClerkProvider>
  );
}
