import { Skeleton } from "@/components/ui/skeleton";

export default function ClinicalLoading() {
  return (
    <div className="max-w-[800px] mx-auto px-7 pt-7 pb-16">
      <Skeleton className="h-3 w-32 mb-6" />
      <div className="pb-3.5 border-b border-ink-faint mb-6">
        <Skeleton className="h-6 w-72 mb-2" />
        <Skeleton className="h-3 w-96" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <article
          key={i}
          className="border-[1.5px] border-ink-faint rounded-md mb-3.5"
          style={{ padding: "18px 22px" }}
        >
          <div className="flex gap-3.5 items-center mb-3.5 pb-3 border-b border-ink-faint flex-wrap">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((__, j) => (
              <div
                key={j}
                className="grid gap-4"
                style={{ gridTemplateColumns: "80px 1fr" }}
              >
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
