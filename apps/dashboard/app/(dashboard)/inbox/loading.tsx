import { Skeleton, SkeletonCircle } from "@/components/ui/skeleton";

/**
 * Inbox list loading skeleton — 5 row outlines (46px avatar + 2 text lines + preview).
 * Per docs/premium-feel/states.md. Renders during the route Suspense boundary;
 * cross-fades to real content in 250ms.
 */
export default function InboxLoading() {
  return (
    <div className="px-8 py-6">
      <div className="flex gap-7 border-b border-ink-faint pb-3 mb-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <ul>
        {Array.from({ length: 5 }).map((_, i) => (
          <li
            key={i}
            className="grid grid-cols-[46px_180px_1fr_auto] gap-4 items-start py-4 border-b border-ink-faint"
          >
            <SkeletonCircle size={46} />
            <div className="flex flex-col gap-1.5 pt-1">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-2.5 w-32" />
            </div>
            <div className="flex flex-col gap-1.5 pt-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/5" />
            </div>
            <Skeleton className="h-3 w-12 mt-1" />
          </li>
        ))}
      </ul>
    </div>
  );
}
