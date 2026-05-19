"use client";

import { useEffect, useState } from "react";
import {
  Warning as AlertTriangle,
  CaretLeft,
  Bell,
  ChatCircle as MessageCircle,
  Phone,
  ShareNetwork as Share2,
  X,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { BroadcastDraft, ContentSet, Section } from "@/app/(dashboard)/broadcasts/draft-state";
import type { AudienceSamplePet } from "@/app/(dashboard)/broadcasts/actions";

/**
/**
 * Mobile preview overlay — full-screen overlay with the broadcast rendered
 * inside an iPhone-like frame, as it would appear in Pawkit Parents. Vet can
 * toggle EN/MR inside the preview to verify both languages before send.
 *
 * Sample pet name (Lora italic) comes from the resolved audience's first pet
 * (Bruno for dog parents, Misha for cat parents, etc.), falling back to
 * "Gabby" if the audience hasn't resolved yet.
 *
 * Phone body iterates `content.sections` in vet-locked order, rendering by
 * type (warning → AlertTriangle frame, whenToCall → Phone icon, summary +
 * custom → canvas-2 card).
 *
 * Closes via the explicit "Close preview · esc" button, Escape key, or
 * backdrop click. EN/MR toggle marks the chosen language as previewed for
 * the bilingual-publish gate.
 */
export function PreviewOverlay({
  open,
  draft,
  samplePets,
  vetByline,
  vetAvatarUrl,
  audiencePetCount,
  onClose,
  onLanguageViewed,
  onAutoTranslate,
  translating,
}: {
  open: boolean;
  draft: BroadcastDraft;
  samplePets: AudienceSamplePet[];
  vetByline: string;
  vetAvatarUrl: string | null;
  audiencePetCount: number;
  onClose: () => void;
  onLanguageViewed: (lang: "en" | "mr") => void;
  /** Triggers Sarvam Mayura translation in the source→target direction the
   *  composer's translateDirection logic has picked. Fired from the empty
   *  state inside the phone preview when MR (or EN) is empty. Locked
   *  2026-05-18 v3 — addresses "Marathi preview not rendering" by giving
   *  the vet an inline path to fill the missing language. */
  onAutoTranslate: () => void;
  translating: boolean;
}) {
  const enHasContent = !!(
    draft.en.title.trim() ||
    draft.en.body.trim() ||
    draft.en.sections.length > 0
  );
  const mrHasContent = !!(
    draft.mr.title.trim() ||
    draft.mr.body.trim() ||
    draft.mr.sections.length > 0
  );
  // Honor the composer's active tab as the preview default (locked
  // 2026-05-18 v6). The previous v5 logic always preferred MR when MR was
  // filled, which meant "switching back to English from Marathi still
  // showed Marathi" on every open. New rule: open in the language the vet
  // was just editing. If that side is empty, fall back to the populated one.
  // The mrHasContent useEffect below still auto-switches WHILE the preview
  // is open when MR transitions empty→filled (e.g. via inline Auto-fill).
  const initialPreviewLang: "en" | "mr" =
    draft.language === "mr" && mrHasContent
      ? "mr"
      : draft.language === "en" && enHasContent
        ? "en"
        : enHasContent
          ? "en"
          : mrHasContent
            ? "mr"
            : draft.language;
  const [previewLang, setPreviewLang] = useState<"en" | "mr">(initialPreviewLang);

  // Reset previewLang on every open so we always pick up the latest draft
  // state. Belt-and-braces with useState's initial value (which only fires
  // on first mount). If `if (!open) return null;` ever stops unmounting the
  // component, this effect keeps the language fresh.
  useEffect(() => {
    if (open) {
      setPreviewLang(initialPreviewLang);
      onLanguageViewed(initialPreviewLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // While preview is open, auto-switch to MR the moment MR fills (e.g.
  // the vet clicked "Auto-fill मराठी now" inside the empty-state card).
  // No-op if vet has already toggled to MR explicitly.
  useEffect(() => {
    if (open && mrHasContent && previewLang === "en") {
      // Only auto-jump if the EN side existed before (the typical translate
      // flow). If EN was also empty, the vet probably isn't ready to verify.
      if (enHasContent) {
        setPreviewLang("mr");
        onLanguageViewed("mr");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mrHasContent]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const content: ContentSet = draft[previewLang];
  const samplePet = samplePets[0]?.name ?? "Gabby";

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-ink/55 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="grid items-center"
        style={{ gridTemplateColumns: "minmax(260px,320px) 380px", gap: 56 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left meta column */}
        <div className="text-canvas">
          <p className="text-xs font-medium text-canvas/55 mb-2">
            Preview as parent
          </p>
          <h3 className="text-canvas text-2xl font-semibold leading-tight mb-3">
            This is what{" "}
            <span className="font-serif text-canvas">{samplePet}</span>
            &apos;s family will see.
          </h3>
          <p className="text-canvas/75 text-sm leading-relaxed mb-5">
            Rendered as a push notification + broadcast detail in the Pawkit
            Parents app. Same in मराठी for parents with a Marathi preference.
          </p>

          {/* Language toggle */}
          <ToggleGroup
            type="single"
            value={previewLang}
            onValueChange={(v) => {
              if (v === "en" || v === "mr") {
                setPreviewLang(v);
                onLanguageViewed(v);
              }
            }}
            className="mb-5 inline-flex bg-canvas/10 rounded-full p-1 gap-1 w-auto"
          >
            <ToggleGroupItem
              value="en"
              aria-label="Preview in English"
              className="h-7 px-3 rounded-full text-xs font-semibold transition-colors text-canvas/70 hover:text-canvas data-[state=on]:bg-primary data-[state=on]:text-canvas"
            >
              English
            </ToggleGroupItem>
            <ToggleGroupItem
              value="mr"
              aria-label="Preview in Marathi"
              className="h-7 px-3 rounded-full text-xs font-semibold transition-colors text-canvas/70 hover:text-canvas data-[state=on]:bg-primary data-[state=on]:text-canvas"
            >
              मराठी
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Channels card */}
          <div className="bg-canvas/8 rounded-xl border border-canvas/10 p-4 mb-5">
            <p className="text-xs font-medium text-canvas/55 mb-2">
              Channels
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-canvas mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <Bell className="w-3.5 h-3.5 text-canvas/70" strokeWidth={1.7} />
              Push to Pawkit Parents · {audiencePetCount} devices
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-canvas/50">
              <span className="w-1.5 h-1.5 rounded-full bg-canvas/30" />
              <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.7} />
              WhatsApp · off for this broadcast
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="bg-transparent border-canvas/20 text-canvas hover:bg-canvas/10 hover:text-canvas"
          >
            <X className="w-3.5 h-3.5" strokeWidth={1.7} />
            Close preview · esc
          </Button>
        </div>

        {/* Right phone frame. `key` forces a hard re-mount on language
            toggle so the phone body's scroll state + image loads start
            fresh — guards against any stale-content scenario where a
            language switch didn't propagate to the inner render. */}
        <PhoneFrame
          key={previewLang}
          content={content}
          vetAvatarUrl={vetAvatarUrl}
          vetByline={vetByline}
          samplePet={samplePet}
          lang={previewLang}
          isEmpty={
            !content.title.trim() &&
            !content.body.trim() &&
            content.sections.length === 0
          }
          otherLangHasContent={
            previewLang === "mr"
              ? !!(
                  draft.en.title.trim() ||
                  draft.en.body.trim() ||
                  draft.en.sections.length > 0
                )
              : !!(
                  draft.mr.title.trim() ||
                  draft.mr.body.trim() ||
                  draft.mr.sections.length > 0
                )
          }
          onAutoTranslate={onAutoTranslate}
          translating={translating}
        />
      </div>
    </div>
  );
}

// ============================================================================
// PhoneFrame: faithful iPhone-ish mock per the design HTML
// ============================================================================

function PhoneFrame({
  content,
  vetByline,
  vetAvatarUrl,
  samplePet,
  lang,
  isEmpty,
  otherLangHasContent,
  onAutoTranslate,
  translating,
}: {
  content: ContentSet;
  vetByline: string;
  vetAvatarUrl: string | null;
  samplePet: string;
  lang: "en" | "mr";
  isEmpty: boolean;
  otherLangHasContent: boolean;
  onAutoTranslate: () => void;
  translating: boolean;
}) {
  return (
    <div
      className="relative bg-ink rounded-[46px] p-3"
      style={{
        width: 380,
        height: 760,
        boxShadow:
          "0 0 0 1.5px rgba(255,255,255,0.08) inset, 0 30px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.4)",
      }}
    >
      {/* Notch */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 bg-ink rounded-full"
        style={{ width: 110, height: 28, zIndex: 10 }}
      />

      <div className="bg-canvas rounded-[36px] overflow-hidden h-full flex flex-col">
        {/* Status bar */}
        <div
          className="flex items-center justify-between px-7 text-xs font-semibold text-ink font-tnum"
          style={{ height: 48, paddingTop: 10 }}
        >
          <span>9:41</span>
          <span className="text-ink/70">●●● ● ▮</span>
        </div>

        {/* App bar */}
        <div className="flex items-center gap-3 px-5 py-2 border-b border-rule-soft">
          <CaretLeft className="w-5 h-5 text-ink-soft" weight="bold" />
          <span className="text-base font-semibold text-ink">
            From {vetByline}
          </span>
          <Share2 className="ml-auto w-4 h-4 text-ink-soft" strokeWidth={1.7} />
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Empty-state card. Renders when the current preview language has
              no content (no title, no body, no sections). Most common cause:
              vet recorded in EN and previewed MR before toggling Auto-fill.
              Inline button kicks off Sarvam Mayura translation so the vet
              doesn't have to bounce back to the composer. Locked
              2026-05-18 v3. */}
          {isEmpty && (
            <div className="my-8 rounded-xl bg-canvas-2 border border-rule p-5 text-center">
              <p className="text-sm font-semibold text-ink mb-1.5">
                {lang === "mr"
                  ? "Marathi version not yet generated"
                  : "English version not yet filled"}
              </p>
              <p className="text-xs text-ink-soft mb-4 leading-[1.55]">
                {otherLangHasContent
                  ? lang === "mr"
                    ? "Translate the English content with Sarvam Mayura, then review."
                    : "Translate the Marathi content with Sarvam Mayura, then review."
                  : "Fill in the composer first, then come back to preview."}
              </p>
              {otherLangHasContent && (
                <Button
                  type="button"
                  onClick={onAutoTranslate}
                  disabled={translating}
                  size="sm"
                >
                  {translating
                    ? "Translating..."
                    : lang === "mr"
                      ? "Auto-fill मराठी now"
                      : "Auto-fill English now"}
                </Button>
              )}
            </div>
          )}

          {/* Sender row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary text-canvas flex items-center justify-center text-xs font-bold tracking-wider shrink-0">
                {vetAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={vetAvatarUrl}
                    alt="AMS"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  "AMS"
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-ink truncate">
                  Animal Medical Services
                </span>
                <span className="text-xs text-ink-faint">Today · 9:40 am</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-canvas-2 border border-rule text-xs text-ink-soft font-medium shrink-0">
              for{" "}
              <span className="font-serif text-ink">{samplePet}</span>
            </span>
          </div>

          {/* Cover photo — object-position mirrors what the vet chose in
              the composer reposition flow, so the preview crop = the
              final crop the parent sees. */}
          {content.coverImageUrl && (
            <div className="aspect-[16/7] rounded-xl overflow-hidden bg-canvas-2 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.coverImageUrl}
                alt=""
                className="w-full h-full object-cover"
                style={{ objectPosition: content.coverImagePosition ?? "50% 50%" }}
              />
            </div>
          )}

          {/* Title */}
          <h2 className="text-ink text-xl font-semibold leading-tight tracking-tight mb-3">
            {content.title || (
              <span className="text-ink-faint italic">
                {lang === "mr" ? "शीर्षक नाही" : "Untitled broadcast"}
              </span>
            )}
          </h2>

          {/* Body */}
          {content.body && (
            <p className="text-sm text-ink leading-[1.55] whitespace-pre-wrap mb-4">
              {content.body}
            </p>
          )}

          {/* Sections — iterate in vet's chosen order */}
          {content.sections.map((section) => (
            <PreviewSection key={section.id} section={section} />
          ))}

          {/* Sender byline footer removed 2026-05-18 — the byline now lives
              in the top app bar ("From [vet]"). Repeating it at the bottom
              read as visual duplication. */}
        </div>

        {/* Home indicator */}
        <div className="flex justify-center pb-2">
          <div
            className="bg-ink/50 rounded-full"
            style={{ width: 110, height: 4 }}
          />
        </div>
      </div>
    </div>
  );
}

function PreviewSection({ section }: { section: Section }) {
  if (section.items.length === 0) return null;
  const isCustom = section.type === "custom";
  const isWhenToCall = section.type === "whenToCall";
  const isHighlighted =
    section.type === "warning" || (isCustom && section.emphasis === "highlight");
  const Icon = isHighlighted
    ? AlertTriangle
    : isWhenToCall
      ? Phone
      : null;
  // whenToCall renders as a paragraph (single sentence statement) — no
  // bullets, no grey card. Custom paragraph sections opt in via the format
  // flag; everything else is bullets. Locked 2026-05-18 v2.
  const renderAsParagraph =
    isWhenToCall || (isCustom && section.format === "paragraph");
  const paragraphBody = renderAsParagraph
    ? isWhenToCall
      ? section.items.filter(Boolean).join(" ").trim()
      : (section.items[0] ?? "").trim()
    : "";
  if (renderAsParagraph && !paragraphBody) return null;

  return (
    <div
      className={cn(
        "mb-4",
        // whenToCall sits inline without a card wrapper — keeps the reader
        // flowing past the warning box. Highlighted sections (Warning signs,
        // custom emphasis=highlight) get the ink-frame card; other bullet
        // sections still get the soft canvas-2 card.
        isWhenToCall
          ? ""
          : isHighlighted
            ? "rounded-xl p-3.5 bg-canvas-2 border-[1.5px] border-ink"
            : "rounded-xl p-3.5 bg-canvas-2"
      )}
    >
      <p className="text-xxs font-semibold uppercase tracking-[0.14em] text-ink-soft mb-2 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
        {section.label}
      </p>
      {renderAsParagraph ? (
        <p className="text-sm text-ink leading-[1.6] whitespace-pre-wrap">
          {paragraphBody}
        </p>
      ) : (
        <ul className="space-y-1.5">
          {section.items.map((it, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-ink leading-snug"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-ink mt-1.5 shrink-0" />
              {section.type === "warning" && it ? it.charAt(0).toUpperCase() + it.slice(1) : it}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
