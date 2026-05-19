"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

/**
 * Pawkit Popover (shadcn-style, Radix UI under the hood).
 *
 * Used for floating, transient overlays anchored to a trigger (month picker,
 * filter chips). Radix handles outside-click, escape-to-close, focus
 * management, and portal rendering — replaces the hand-rolled useEffect
 * outside-click logic the billing month picker used to carry.
 *
 * Styling: canvas bg + 1px rule + 12px radius + the one overlay shadow we
 * permit (`box-shadow: 0 12px 32px -8px rgba(0,0,0,0.18)`). Per the brand
 * discipline ("elevation is tonal contrast + hairlines"), shadows live ONLY
 * on transient overlays — never on in-flow surfaces.
 */
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "start", sideOffset = 8, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 rounded-xl border border-rule bg-canvas p-3.5 text-ink outline-none",
        className
      )}
      style={{ boxShadow: "0 12px 32px -8px rgba(0,0,0,0.18)" }}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
