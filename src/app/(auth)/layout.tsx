import { ClerkProvider } from "@clerk/nextjs";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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
          cardBox: "shadow-none!",
          card: "border! border-rule! shadow-none!",
          footer: "bg-surface!",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
