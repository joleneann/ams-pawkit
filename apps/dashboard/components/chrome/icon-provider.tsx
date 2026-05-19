"use client";

import { IconContext } from "@phosphor-icons/react";

/**
 * Phosphor icon defaults for the entire dashboard. Sets `weight="fill"` so every
 * `<Icon />` renders solid by default — matches the clinical-but-warm aesthetic
 * locked 2026-05-15 evening (Lucide outlines replaced wholesale).
 *
 * Individual icons can still override via their own `weight` prop if a specific
 * surface needs the regular/light/duotone treatment.
 */
export function IconProvider({ children }: { children: React.ReactNode }) {
  return (
    <IconContext.Provider value={{ weight: "fill" }}>
      {children}
    </IconContext.Provider>
  );
}
