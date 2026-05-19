import { PawPrint } from "@phosphor-icons/react/dist/ssr";
import type { FurTone } from "@/lib/seed";
import { cn } from "@/lib/utils";

/**
 * Pet avatar per locked Screen 02 anatomy:
 * - 46px outer ring (3px fur-match band carrying primary fur tone)
 * - 40px inner photo with 1.5px Paper bezel
 * - Renders real photo when `photoUrl` is provided (pulled from
 *   pets.avatar_url via lib/data.ts adaptPet); falls back to Lucide
 *   PawPrint silhouette over a faint Ink wash when no photo
 *
 * Tailwind safelist via static map (JIT scans the source strings).
 */

const furBgClass: Record<FurTone, string> = {
  milk: "bg-fur-milk",
  vanilla: "bg-fur-vanilla",
  honey: "bg-fur-honey",
  peach: "bg-fur-peach",
  rust: "bg-fur-rust",
  mushroom: "bg-fur-mushroom",
  smoke: "bg-fur-smoke",
  steel: "bg-fur-steel",
  bark: "bg-fur-bark",
  sable: "bg-fur-sable",
};

export type PetAvatarSize = "sm" | "md" | "lg";

const sizeClasses: Record<
  PetAvatarSize,
  { outer: string; bandPx: number; photo: string; icon: string }
> = {
  sm: { outer: "w-9 h-9", bandPx: 2, photo: "w-[28px] h-[28px]", icon: "w-3.5 h-3.5" },
  md: { outer: "w-[46px] h-[46px]", bandPx: 3, photo: "w-10 h-10", icon: "w-[18px] h-[18px]" },
  lg: { outer: "w-[56px] h-[56px]", bandPx: 3, photo: "w-[50px] h-[50px]", icon: "w-6 h-6" },
};

export function PetAvatar({
  furTone,
  size = "md",
  alt,
  photoUrl,
}: {
  furTone: FurTone;
  size?: PetAvatarSize;
  alt?: string;
  photoUrl?: string | null;
}) {
  const sz = sizeClasses[size];
  return (
    <div
      className={cn("rounded-full shrink-0 flex items-center justify-center", sz.outer, furBgClass[furTone])}
      style={{ padding: `${sz.bandPx}px` }}
      aria-label={alt}
    >
      <div
        className={cn(
          "rounded-full border-[1.5px] border-canvas overflow-hidden flex items-center justify-center",
          sz.photo
        )}
        style={photoUrl ? undefined : { backgroundColor: "rgba(168, 163, 158, 0.16)" }}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={alt ?? "Pet photo"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <PawPrint className={cn("text-ink-faint", sz.icon)} strokeWidth={1.5} />
        )}
      </div>
    </div>
  );
}
