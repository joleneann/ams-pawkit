"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Pawkit ToggleGroup (shadcn-style, Radix UI under the hood).
 * Replaces the hand-rolled EN/MR language pill + Default/Mauve theme pill +
 * the per-broadcast language tab. Keyboard navigation + ARIA roles handled
 * by Radix.
 *
 * Uses Pawkit's locked segmented-pill anatomy: filled Ink rest, white text
 * on active. Hover lifts Ink-soft → Ink.
 */

const toggleGroupItemVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-sm text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      size: {
        default: "px-3 py-1 text-sm",
        sm: "px-2 py-0.5 text-xs",
      },
      tone: {
        default:
          "text-ink-soft hover:text-ink data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
        // Ink fallback when the primary fill is too loud for the context.
        ink:
          "text-ink-soft hover:text-ink data-[state=on]:bg-ink data-[state=on]:text-canvas",
      },
    },
    defaultVariants: {
      size: "default",
      tone: "default",
    },
  }
);

interface ToggleGroupContextValue extends VariantProps<typeof toggleGroupItemVariants> {}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  size: "default",
  tone: "default",
});

export const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleGroupItemVariants>
>(({ className, size, tone, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("inline-flex items-center gap-0 rounded p-[3px] bg-ink/[0.04]", className)}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ size, tone }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
));
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

export const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleGroupItemVariants>
>(({ className, children, size, tone, ...props }, ref) => {
  const ctx = React.useContext(ToggleGroupContext);
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleGroupItemVariants({
          size: size ?? ctx.size,
          tone: tone ?? ctx.tone,
        }),
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;
