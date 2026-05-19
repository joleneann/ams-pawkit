"use client";

import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, ArrowsClockwise as RefreshCw, X, CircleNotch as Loader2, ArrowsOutCardinal as Move } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { uploadBroadcastCoverAction } from "@/app/(dashboard)/broadcasts/actions";

/**
 * Cover photo slot for the broadcast composer (locked 2026-05-15,
 * drag-to-reposition added 2026-05-15).
 *
 * Two states per `claude design/broadcast rebuild/Broadcast Composer.html`
 * `.cover-slot` rules:
 *   - Empty (dashed dropzone): cursor-pointer card prompting upload. Hover
 *     fills with berry-soft + flips text to berry.
 *   - Populated (16:5 image): the uploaded image as a cover with Reposition
 *     / Replace / Remove buttons. Click Reposition (or click the image
 *     itself) to enter drag mode — vet drags the image up/down/left/right
 *     to choose what's visible in the 16:5 crop. Position is persisted as
 *     a CSS `object-position` value on the draft so the parent-app preview
 *     and the sent broadcast detail page show the same crop.
 *
 * Upload goes through `uploadBroadcastCoverAction()` which writes to the
 * existing `broadcast-covers` bucket under `broadcasts/<slug>-<ts>.<ext>`.
 */
export function CoverPhotoSlot({
  imageUrl,
  imagePosition,
  slug,
  onUploaded,
  onRemove,
  onPositionChange,
}: {
  imageUrl: string | null;
  imagePosition: string | null;
  slug: string;
  onUploaded: (url: string) => void;
  onRemove: () => void;
  onPositionChange: (position: string | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repositioning, setRepositioning] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slug", slug);
      const res = await uploadBroadcastCoverAction(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onUploaded(res.url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const openPicker = () => fileInputRef.current?.click();

  if (!imageUrl) {
    return (
      <div className="mx-7 mt-5">
        <button
          type="button"
          onClick={openPicker}
          disabled={uploading}
          className={cn(
            "w-full flex items-center gap-3.5 px-4 py-3.5",
            "border border-dashed border-rule rounded-xl",
            "text-ink-faint transition-colors",
            "hover:border-primary hover:bg-berry-soft hover:text-primary",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-berry-ring",
            uploading && "opacity-60 cursor-wait"
          )}
          aria-label="Upload cover photo"
        >
          <span className="w-9 h-9 rounded-lg bg-canvas-2 flex items-center justify-center shrink-0 text-ink-soft">
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.6} />
            ) : (
              <ImageIcon className="w-[18px] h-[18px]" strokeWidth={1.6} />
            )}
          </span>
          <span className="flex flex-col items-start text-left">
            <span className="text-base font-semibold text-ink-soft">
              {uploading ? "Uploading cover..." : "Add a cover photo"}
            </span>
            <span className="text-sm font-medium text-ink-faint">
              16:7 ratio, JPG or PNG, up to 8 MB
            </span>
          </span>
        </button>
        {error && (
          <p className="mt-2 text-sm text-ink font-semibold">{error}</p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
    );
  }

  return (
    <PopulatedSlot
      imageUrl={imageUrl}
      imagePosition={imagePosition}
      uploading={uploading}
      error={error}
      repositioning={repositioning}
      onToggleReposition={() => setRepositioning((v) => !v)}
      onPositionChange={onPositionChange}
      onReplaceClick={openPicker}
      onRemove={onRemove}
      fileInputRef={fileInputRef}
      onFile={(file) => {
        if (file) handleFile(file);
      }}
    />
  );
}

// ============================================================================
// Populated slot — image + Reposition / Replace / Remove buttons + drag-to-
// reposition handler that updates the CSS `object-position` value live.
// ============================================================================

function PopulatedSlot({
  imageUrl,
  imagePosition,
  uploading,
  error,
  repositioning,
  onToggleReposition,
  onPositionChange,
  onReplaceClick,
  onRemove,
  fileInputRef,
  onFile,
}: {
  imageUrl: string;
  imagePosition: string | null;
  uploading: boolean;
  error: string | null;
  repositioning: boolean;
  onToggleReposition: () => void;
  onPositionChange: (position: string | null) => void;
  onReplaceClick: () => void;
  onRemove: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFile: (file: File | undefined) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [livePos, setLivePos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
  } | null>(null);

  // Parse the stored object-position (e.g. "50% 30%") into numeric x/y % once.
  const parsed = parsePosition(imagePosition);
  const x = livePos?.x ?? parsed.x;
  const y = livePos?.y ?? parsed.y;

  const onPointerDown = (e: React.PointerEvent) => {
    if (!repositioning) return;
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: x,
      startY: y,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!repositioning || !dragRef.current || !frameRef.current) return;
    const frame = frameRef.current.getBoundingClientRect();
    if (frame.width === 0 || frame.height === 0) return;
    // Drag direction is inverted: dragging right moves the visible window
    // right, which means the image's object-position-x decreases. Use a
    // straightforward 1:1 mapping of pixel delta to percent delta.
    const dx = ((e.clientX - dragRef.current.startClientX) / frame.width) * 100;
    const dy = ((e.clientY - dragRef.current.startClientY) / frame.height) * 100;
    const nextX = clampPct(dragRef.current.startX - dx);
    const nextY = clampPct(dragRef.current.startY - dy);
    setLivePos({ x: nextX, y: nextY });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!repositioning || !dragRef.current) return;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    dragRef.current = null;
    if (livePos) {
      onPositionChange(`${livePos.x.toFixed(1)}% ${livePos.y.toFixed(1)}%`);
      setLivePos(null);
    }
  };

  // If user toggles reposition off mid-drag, flush the pending state.
  useEffect(() => {
    if (!repositioning && livePos) {
      onPositionChange(`${livePos.x.toFixed(1)}% ${livePos.y.toFixed(1)}%`);
      setLivePos(null);
      dragRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repositioning]);

  const objectPosition = `${x}% ${y}%`;

  return (
    <div className="mx-7 mt-5 group relative overflow-hidden rounded-xl border border-rule bg-canvas">
      <div
        ref={frameRef}
        className={cn(
          "aspect-[16/7] w-full overflow-hidden",
          repositioning && "cursor-grab active:cursor-grabbing select-none"
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Broadcast cover"
          className="w-full h-full object-cover pointer-events-none"
          style={{ objectPosition }}
          draggable={false}
        />
      </div>
      {repositioning && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 pointer-events-none">
          <span className="text-xs font-semibold text-canvas bg-ink/70 rounded px-2 py-1 pointer-events-none">
            Drag the image to reposition
          </span>
        </div>
      )}
      <div className="absolute top-3 right-3 flex gap-1.5">
        <button
          type="button"
          onClick={onToggleReposition}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors",
            repositioning
              ? "bg-primary text-canvas hover:bg-berry-deep"
              : "bg-ink/70 text-canvas hover:bg-ink/85"
          )}
          aria-label={repositioning ? "Done repositioning" : "Reposition cover photo"}
        >
          <Move className="w-3.5 h-3.5" strokeWidth={1.7} />
          {repositioning ? "Done" : "Reposition"}
        </button>
        <button
          type="button"
          onClick={onReplaceClick}
          disabled={uploading || repositioning}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg",
            "bg-ink/70 text-canvas text-xs font-semibold",
            "hover:bg-ink/85 transition-colors",
            (uploading || repositioning) && "opacity-60 cursor-not-allowed"
          )}
          aria-label="Replace cover photo"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.7} />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.7} />
          )}
          Replace
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={repositioning}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-ink/70 text-canvas text-xs font-semibold hover:bg-ink/85 transition-colors",
            repositioning && "opacity-60 cursor-not-allowed"
          )}
          aria-label="Remove cover photo"
        >
          <X className="w-3.5 h-3.5" strokeWidth={1.7} />
          Remove
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          onFile(file);
          e.target.value = "";
        }}
      />
      {error && (
        <p className="absolute bottom-3 left-3 right-3 text-sm text-ink font-semibold bg-canvas/90 rounded px-2 py-1">
          {error}
        </p>
      )}
    </div>
  );
}

/** Parse a CSS `object-position` string ("50% 30%") into numeric x/y %.
 *  Falls back to center if missing or malformed. */
function parsePosition(raw: string | null): { x: number; y: number } {
  if (!raw) return { x: 50, y: 50 };
  const m = raw.match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/);
  if (!m) return { x: 50, y: 50 };
  return { x: clampPct(parseFloat(m[1]!)), y: clampPct(parseFloat(m[2]!)) };
}

function clampPct(v: number): number {
  return Math.max(0, Math.min(100, v));
}
