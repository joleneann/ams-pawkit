"use client";

/**
 * Tiny byline used inside the broadcast phone preview.
 * Shows the vet's uploaded avatar (Supabase Storage URL) if present, falling
 * back to circular initials. Sizing is fixed to match the locked phone-preview
 * anatomy (28px avatar, 12px name, 9px meta).
 */
export function VetBylinePreview({
  avatarUrl,
  fullName,
  initials,
  meta,
}: {
  avatarUrl: string | null;
  fullName: string;
  initials: string;
  meta: string;
}) {
  return (
    <div className="flex gap-2 items-center mb-3">
      <div className="w-7 h-7 rounded-full bg-ink-faint flex items-center justify-center text-xxs font-bold text-ink overflow-hidden shrink-0">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={fullName}
            className="w-full h-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      <div>
        <div className="text-xs font-semibold text-ink">{fullName}</div>
        <div className="text-xxs text-ink-soft uppercase tracking-wider">{meta}</div>
      </div>
    </div>
  );
}
