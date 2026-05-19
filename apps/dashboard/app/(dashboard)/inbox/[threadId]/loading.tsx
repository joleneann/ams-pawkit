import { Skeleton, SkeletonCircle } from "@/components/ui/skeleton";

/**
 * Thread detail loading skeleton — conversation column + pet panel placeholders.
 */
export default function ThreadLoading() {
  return (
    <div className="grid grid-cols-[1fr_468px] min-h-full">
      <section className="flex flex-col min-w-0 px-7 pt-3.5">
        {/* Breadcrumb */}
        <Skeleton className="h-3 w-48 mb-2" />
        {/* Follow-up banner */}
        <div className="border-[1.5px] border-ink-faint rounded-md py-3 px-4 my-3 flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-64" />
          <Skeleton className="h-3 w-52" />
        </div>
        {/* Bubbles */}
        <div className="flex flex-col gap-3.5 pt-2 pb-4">
          <BubbleSkeleton side="vet" />
          <BubbleSkeleton side="parent" />
          <BubbleSkeleton side="vet" />
          <BubbleSkeleton side="parent" wide />
        </div>
      </section>

      <aside className="w-[468px] border-l border-ink-faint bg-canvas flex flex-col">
        <div className="p-5">
          <div className="flex items-center gap-3.5 pb-3.5 border-b border-ink-faint mb-4">
            <SkeletonCircle size={56} />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <Skeleton className="h-3 w-20 mb-3" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function BubbleSkeleton({ side, wide }: { side: "vet" | "parent"; wide?: boolean }) {
  return (
    <div className={"flex " + (side === "parent" ? "justify-start" : "justify-end")}>
      <div className="flex flex-col gap-1.5">
        <Skeleton
          className="rounded-2xl"
          style={{ width: wide ? 260 : 180, height: 48 }}
        />
        <Skeleton className="h-2.5 w-24" />
      </div>
    </div>
  );
}
