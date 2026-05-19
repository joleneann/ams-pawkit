import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * Editorial vet byline (Pawkit shared component, dashboard surface).
 *
 * Spec: `docs/premium-feel/byline.md`. The byline is the most-repeated premium
 * signal in the app. Treating it as a magazine byline (not a profile chip) is
 * what makes it editorial. Credential format locked 2026-05-09:
 * **name + clinic, nothing else.** No school, no year, no license number.
 *
 * Three variants:
 *   - "compact"  inline single-line "Dr Sagar Bhongale · Animal Medical Services"
 *                Used in: inbox row meta, conversation thread header,
 *                broadcast card byline.
 *   - "full"     two-line stacked. Line 1 name (text-md semibold), line 2
 *                clinic (text-xs ink-soft small caps + 0.08em tracking).
 *                Used in: Pet Page cover, broadcast reading view header.
 *   - "centre"   same as "full" but centred under a cover image with 16px
 *                top margin. Used in: broadcast cover.
 *
 * Avatar is OPTIONAL via the `avatar` prop. When present, it sits left of
 * the byline with a 12px gap — never inside the byline itself.
 *
 * Hard rules per byline.md:
 *   - Never wraps to 3 lines.
 *   - Clinic name truncates with ellipsis if compact-variant width is tight.
 *   - Never decorate with Berry; Berry is reserved for CTAs / hero counts /
 *     vet bubbles / active tabs / focus rings.
 *   - Never replace "Dr" with an emoji.
 *
 * Day-7 task per `docs/build-order.md`: roll into 4 surfaces and run a
 * visual rhythm check side-by-side.
 */
type VetBylineVariant = "compact" | "full" | "centre";

export interface VetBylineProps {
  vet: {
    name: string;
    clinic: string;
  };
  variant?: VetBylineVariant;
  /** Optional avatar; sits 12px left of the byline when present. */
  avatar?: {
    src?: string | null;
    initials: string;
  };
  /** Avatar size in px when shown (default 32 per byline.md). */
  avatarSize?: number;
  className?: string;
}

export function VetByline({
  vet,
  variant = "compact",
  avatar,
  avatarSize = 32,
  className,
}: VetBylineProps) {
  const byline =
    variant === "compact" ? (
      <CompactByline name={vet.name} clinic={vet.clinic} />
    ) : (
      <StackedByline name={vet.name} clinic={vet.clinic} />
    );

  const isCentred = variant === "centre";

  if (!avatar) {
    return (
      <div
        className={cn(
          "flex",
          isCentred ? "justify-center" : "items-center",
          className
        )}
      >
        {byline}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        isCentred && "justify-center",
        className
      )}
    >
      <Avatar
        className="bg-canvas-2"
        style={{ width: avatarSize, height: avatarSize }}
      >
        {avatar.src ? (
          <AvatarImage src={avatar.src} alt={vet.name} />
        ) : null}
        <AvatarFallback className="text-xs text-ink">
          {avatar.initials}
        </AvatarFallback>
      </Avatar>
      {byline}
    </div>
  );
}

function CompactByline({ name, clinic }: { name: string; clinic: string }) {
  return (
    <span className="text-base font-semibold text-ink leading-none truncate">
      {name}
      <span className="text-ink-30 font-normal mx-1.5" aria-hidden>
        ·
      </span>
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
        {clinic}
      </span>
    </span>
  );
}

function StackedByline({ name, clinic }: { name: string; clinic: string }) {
  return (
    <span className="flex flex-col gap-0.5 min-w-0">
      <span className="text-md font-semibold text-ink leading-tight truncate">
        {name}
      </span>
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft leading-tight truncate">
        {clinic}
      </span>
    </span>
  );
}
