import { forwardRef } from "react";

import { cn } from "@/lib/utils";

const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[100px] w-full rounded-lg border border-rule bg-transparent px-3.5 py-2.5 text-sm leading-relaxed text-ink transition-all duration-150 placeholder:text-muted/60 hover:border-ink/30 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-faint focus-visible:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50 resize-y",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
