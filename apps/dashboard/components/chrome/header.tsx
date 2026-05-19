"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { MagnifyingGlass as Search, X } from "@phosphor-icons/react";
import { useLanguage } from "@/components/language-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type ClinicChrome = {
  name: string;
  logoUrl: string | null;
  initials: string;
};

type VetChrome = {
  fullName: string;
  initials: string;
  avatarUrl: string | null;
};

/**
 * Dashboard top bar (inbox-v2 lock 2026-05-15, search-centering fix 2026-05-15).
 *
 * Anatomy per `claude design/README.md` workspace chrome:
 * - Three-column grid: 230px clinic | 1fr center | 230px doctor
 *   The 1fr center column is the search-bar lane; placing the bar inside that
 *   cell with `justify-self-center` keeps it visually centered relative to the
 *   page mid-line regardless of viewport width. Doctor block is locked to a
 *   fixed-width 3rd column so the layout stays balanced when the search
 *   placeholder is suppressed (settings/billing routes).
 * - Background: rail-tint (continuous with rail + content; NO border-bottom)
 * - Clinic block: 40×40 berry circle (flex-shrink:0) + name text-md semibold
 * - Search bar: bg-canvas + 1px rule, fixed 480px wide, text-base placeholder,
 *   focus = berry border + berry-ring shadow
 * - Doctor block: name text-md semibold + 34×34 canvas-2 monogram circle
 *
 * Three-tier chrome size discipline (locked 2026-05-15):
 *   - Identity (clinic + doctor) = 14px text-md semibold   ← "who"
 *   - Utility   (rail nav, search placeholder, awaiting headline) = 13px text-base
 *   - Metadata  (row meta, count badges)                = 12px text-sm
 * Clinic + doctor match each other (same size + weight) so the two identity
 * labels read as one chrome layer, not a hierarchy break — but sit one notch
 * above the rail / search utility so the workspace's "who" gets quiet
 * authority over its "what".
 */
export function ChromeHeader({
  clinic,
  vet,
}: {
  clinic: ClinicChrome;
  vet: VetChrome;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const route = pathname.startsWith("/settings")
    ? "settings"
    : pathname.startsWith("/billing")
      ? "billing"
      : pathname.startsWith("/broadcasts")
        ? "broadcasts"
        : "inbox";

  const searchPlaceholder =
    route === "broadcasts"
      ? t("chrome.search.broadcasts")
      : route === "billing"
        ? t("chrome.search.billing")
        : route === "inbox"
          ? t("chrome.search.inbox")
          : null;

  const targetRoute =
    route === "broadcasts" ? "/broadcasts" : route === "billing" ? "/billing" : "/inbox";
  const currentQ = searchParams?.get("q") ?? "";
  const [value, setValue] = useState(currentQ);

  useEffect(() => {
    setValue(currentQ);
  }, [currentQ]);

  const commit = (next: string) => {
    const trimmed = next.trim();
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");
    // Reset pagination when the search query changes — staying on page 4 with a
    // new filter would surface zero rows even when matches exist.
    params.delete("page");
    const qs = params.toString();
    router.push(`${targetRoute}${qs ? `?${qs}` : ""}`);
  };

  return (
    // Header is transparent — body bg-rail-tint shows through so chrome
    // reads as one continuous ground. Layering bg-rail-tint here too would
    // double the ink-over-canvas blend and visibly darken the strip.
    <header
      className="grid items-center"
      style={{ gridTemplateColumns: "230px 1fr 230px" }}
    >
      {/* Clinic block: 230px column matches rail width below */}
      <a
        href="/inbox"
        className="flex items-center gap-3 py-3.5 pl-[22px] pr-2 no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
        aria-label={`${clinic.name} — home`}
      >
        <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
          {clinic.logoUrl && (
            <AvatarImage src={clinic.logoUrl} alt={`${clinic.name} logo`} />
          )}
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold tracking-wider">
            {clinic.initials}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium text-ink-70 text-base whitespace-nowrap">
          {clinic.name}
        </span>
      </a>

      {/* Center column (search lane): the search bar sits centered in its
          own 1fr cell. The fixed-width 230px column to the right keeps the
          doctor block locked to the right edge, so the center remains the
          page mid-line. */}
      <div className="flex items-center justify-center py-3.5 px-7">
        {searchPlaceholder ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              commit(value);
            }}
            className="relative w-[480px]"
            role="search"
          >
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-50"
              strokeWidth={1.8}
            />
            <Input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setValue("");
                  commit("");
                }
              }}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="pl-10 pr-9 h-10 bg-canvas border-rule rounded-xl text-base font-medium placeholder:not-italic placeholder:text-ink-50 focus-visible:ring-berry-ring focus-visible:border-primary"
            />
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setValue("");
                  commit("");
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-ink-50 hover:text-ink"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.6} />
              </Button>
            )}
          </form>
        ) : null}
      </div>

      {/* Right column: doctor block (locked to right edge, name + 34px monogram) */}
      <a
        href="/settings"
        className="flex items-center gap-3 justify-self-end pr-7 py-3.5 no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
        aria-label="Open Settings"
      >
        <span className="font-medium text-ink-70 text-base hidden sm:inline">
          {vet.fullName}
        </span>
        <Avatar className="h-[34px] w-[34px] bg-canvas-2 border border-rule">
          {vet.avatarUrl && (
            <AvatarImage src={vet.avatarUrl} alt={vet.fullName} />
          )}
          <AvatarFallback className="bg-canvas-2 text-xs font-bold text-ink tracking-wider">
            {vet.initials}
          </AvatarFallback>
        </Avatar>
      </a>
    </header>
  );
}
