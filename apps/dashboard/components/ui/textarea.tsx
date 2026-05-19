"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Pawkit Textarea (shadcn-style). Same token bridge as Input; resizes
 * vertically by default. Pass `resize-none` className for fixed-height
 * compose surfaces (inbox reply bar).
 */
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-ink-faint placeholder:italic focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
