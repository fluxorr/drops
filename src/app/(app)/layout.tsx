import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { AppNav } from "./nav";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto w-[min(100%-32px,1080px)] min-h-screen">
      <header className="sticky top-0 z-20 flex min-h-[64px] items-center justify-between border-b border-rule bg-canvas/92 backdrop-blur-lg">
        <Link className="inline-flex items-center gap-2.5 font-display font-bold text-ink no-underline transition-opacity duration-150 hover:opacity-70" href="/today" aria-label="Drops today">
          <span className="grid size-[30px] place-items-center rounded-lg bg-moss-strong text-[0.8125rem] text-white" aria-hidden="true">D</span>
          <span className="text-[1.0625rem] max-sm:sr-only">Drops</span>
        </Link>
        <AppNav />
        <UserButton
          appearance={{ elements: { avatarBox: "size-[30px]! rounded-lg!" } }}
          userProfileMode="modal"
        />
      </header>
      <main className="py-12 max-sm:py-10">{children}</main>
    </div>
  );
}
