import { forwardRef } from "react";

import { cn } from "@/lib/utils";

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-rule bg-transparent px-3 py-1 text-sm text-ink transition-colors duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink placeholder:text-muted focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-faint disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
