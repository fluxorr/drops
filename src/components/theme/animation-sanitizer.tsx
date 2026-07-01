"use client";

import { useSyncExternalStore } from "react";

function getSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

function subscribe() {
  return () => {};
}

export function AnimationSanitizer({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!mounted) return <div className="opacity-0" />;
  return <>{children}</>;
}
