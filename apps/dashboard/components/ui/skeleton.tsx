import { cn } from "@/lib/utils";

/**
 * Skeleton bar per `docs/premium-feel/states.md`: solid Ink-faint at 50% opacity,
 * no shimmer animation (stillness signals confidence). Used inside loading.tsx
 * boundaries.
 */
export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn("rounded-sm", className)}
      style={{
        backgroundColor: "var(--text-muted)",
        opacity: 0.5,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCircle({
  size = 46,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("rounded-full shrink-0", className)}
      style={{
        width: size,
        height: size,
        backgroundColor: "var(--text-muted)",
        opacity: 0.5,
      }}
      aria-hidden="true"
    />
  );
}
