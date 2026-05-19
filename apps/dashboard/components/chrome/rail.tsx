"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tray as Inbox, Megaphone, Receipt, Gear as Settings } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";
import type { i18n as i18nMap } from "@/lib/i18n-strings";

/**
 * Dashboard left rail. 230px wide, transparent background (rail-tint shows
 * through), 36px tall items with 8px radius. Active item gets `berry-soft`
 * bg + `berry` text + semibold. Settings pins to the bottom via `mt-auto`
 * inside a viewport-bounded flex row.
 */

type RailItem = {
  href: string;
  labelKey: keyof typeof i18nMap;
  icon: typeof Inbox;
  isSectionActive: (pathname: string) => boolean;
};

const primaryItems: RailItem[] = [
  {
    href: "/inbox",
    labelKey: "chrome.rail.inbox",
    icon: Inbox,
    isSectionActive: (p) => p.startsWith("/inbox"),
  },
  {
    href: "/broadcasts",
    labelKey: "chrome.rail.broadcasts",
    icon: Megaphone,
    isSectionActive: (p) => p.startsWith("/broadcasts"),
  },
  {
    href: "/billing",
    labelKey: "chrome.rail.billing",
    icon: Receipt,
    isSectionActive: (p) => p.startsWith("/billing"),
  },
];

const footerItem: RailItem = {
  href: "/settings",
  labelKey: "chrome.rail.settings",
  icon: Settings,
  isSectionActive: (p) => p.startsWith("/settings"),
};

export function ChromeRail({ awaitingCount }: { awaitingCount?: number } = {}) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const renderItem = (item: RailItem) => {
    const Icon = item.icon;
    const sectionActive = item.isSectionActive(pathname);
    const badge =
      item.href === "/inbox" && awaitingCount != null && awaitingCount > 0
        ? awaitingCount
        : undefined;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 h-9 px-3 rounded-[8px] transition-colors",
          sectionActive
            ? "bg-berry-soft text-primary font-semibold"
            : "text-ink-soft font-medium hover:bg-canvas-2 hover:text-ink"
        )}
      >
        <Icon className="w-[16px] h-[16px] flex-shrink-0" strokeWidth={1.7} />
        <span className="text-base flex-1">{t(item.labelKey)}</span>
        {badge !== undefined && (
          <span
            className={cn(
              "text-xs font-semibold font-tnum",
              sectionActive ? "text-primary" : "text-ink-50"
            )}
          >
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside
      className="flex flex-col self-stretch flex-shrink-0"
      style={{ width: 230, paddingTop: 22, paddingBottom: 18 }}
    >
      <div
        className="text-xxs text-ink-50 uppercase font-semibold tracking-[0.14em]"
        style={{ padding: "0 22px 10px" }}
      >
        {t("chrome.workspace")}
      </div>
      <div className="flex flex-col gap-[2px]" style={{ padding: "0 12px" }}>
        {primaryItems.map(renderItem)}
      </div>
      <div className="mt-auto" style={{ padding: "0 12px" }}>
        {renderItem(footerItem)}
      </div>
    </aside>
  );
}
