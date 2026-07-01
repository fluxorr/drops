"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="default-light"
      themes={[
        "default-light",
        "serika",
        "solarized",
        "bushido",
        "coffee",
        "nord",
        "monokai",
        "dracula",
        "tokyo-night",
        "everforest",
        "catppuccin",
        "miami",
        "nebula",
        "matcha",
        "cherry",
        "midnight",
        "olivia",
        "laser",
        "striker",
        "sky",
        "terra",
        "aubergine",
      ]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
