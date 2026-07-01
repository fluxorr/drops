"use client";

import { useInView } from "@/lib/use-in-view";

export function BlurIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        filter: isInView ? "blur(0px)" : "blur(6px)",
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(12px)",
        transitionDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
