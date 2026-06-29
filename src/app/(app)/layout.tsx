import { UserButton } from "@clerk/nextjs";
import { BookOpenText, History, Lightbulb, Settings } from "lucide-react";
import Link from "next/link";

const navigation = [
  { href: "/today" as const, label: "Today", icon: BookOpenText },
  { href: "/history" as const, label: "History", icon: History },
  { href: "/interests" as const, label: "Interests", icon: Lightbulb },
  { href: "/settings" as const, label: "Settings", icon: Settings },
];

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="app-frame">
      <header className="app-header">
        <Link className="wordmark" href="/today" aria-label="Drops today">
          <span className="wordmark-mark" aria-hidden="true">D</span>
          <span>Drops</span>
        </Link>
        <nav aria-label="Primary navigation">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <UserButton
          appearance={{ elements: { avatarBox: "user-avatar" } }}
          userProfileMode="modal"
        />
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
