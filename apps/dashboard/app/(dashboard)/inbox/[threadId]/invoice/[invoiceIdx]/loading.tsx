import { Skeleton } from "@/components/ui/skeleton";

export default function InvoiceLoading() {
  return (
    <div className="max-w-[800px] mx-auto px-8 pt-6 pb-12">
      <Skeleton className="h-3 w-32 mb-6" />
      <div className="flex justify-between pb-5 border-b-2 border-ink mb-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="flex flex-col gap-2 items-end">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <section key={i} className="mb-4">
          <Skeleton className="h-3 w-24 mb-2" />
          {Array.from({ length: 2 }).map((__, j) => (
            <div
              key={j}
              className="grid grid-cols-[1fr_100px] gap-3 items-start py-3 border-b border-ink-faint"
            >
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3 w-12 justify-self-end" />
            </div>
          ))}
        </section>
      ))}
      <div className="mt-7 pt-4 border-t-2 border-ink flex justify-end">
        <Skeleton className="h-6 w-32" />
      </div>
    </div>
  );
}
