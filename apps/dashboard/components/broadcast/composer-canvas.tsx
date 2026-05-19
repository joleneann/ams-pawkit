"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Warning as AlertTriangle,
  ArrowRight,
  CaretDown,
  CaretDown as ChevronDown,
  CaretUp,
  Eye,
  Globe,
  Microphone,
  PaperPlaneTilt,
  Phone,
  Plus,
  FloppyDisk as Save,
  Trash as Trash2,
  Users,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ComposerVoiceMic } from "@/components/ui/universal-voice-input";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import {
  defaultLabelFor,
  readCondition,
  useBroadcastDraft,
  type ConditionGroup,
  type LastVisitWindow,
  type Section,
  type SectionType,
  type SpeciesValue,
} from "@/app/(dashboard)/broadcasts/draft-state";

/**
 * What field the vet is dictating into. The composer tracks the last field
 * focused (survives the focus-loss from clicking the mic button itself);
 * the mic dispatches transcripts here.
 */
type FocusTarget =
  | { kind: "title" }
  | { kind: "body" }
  | { kind: "section-bullet"; sectionId: string; idx: number }
  | { kind: "section-label"; sectionId: string };
import {
  getAudienceCountAction,
  saveBroadcastDraftAction,
  type AudienceCountResult,
  type AudienceSamplePet,
} from "@/app/(dashboard)/broadcasts/actions";
import { CoverPhotoSlot } from "./cover-photo-slot";
import { AudienceModal } from "./audience-modal";
import { PreviewOverlay } from "./preview-overlay";
import { SendConfirmModal } from "./send-confirm-modal";

/**
 * Single-page broadcast composer (locked 2026-05-15 rebuild, sections v4
 * iteration 2026-05-15).
 *
 * Replaces /broadcasts/compose + /broadcasts/audience + /broadcasts/send.
 * The same form supports a Quick announcement (just title + body) AND an
 * Educational broadcast (cover + ordered sections). The vet can reorder
 * sections with up/down arrows, drop them with the inline trash, or add
 * new ones — standard types (Summary / Warning / When to call us) plus a
 * Custom-named block. AI dictation populates the 3 standard sections; the
 * vet then reorders / edits / adds as needed.
 *
 * Layout from top to bottom:
 *   - Page header (title + autosave + Preview / Save draft)
 *   - Cover photo slot (always visible; dropzone when empty, populated when set)
 *   - Toolbar (Writing in EN/MR · Auto-fill now · Universal voice mic)
 *   - Title (required, 26px)
 *   - Body (required, 15px / 1.6)
 *   - Sections list (iterate, each with up/down/remove + editable bullets)
 *   - Add-section chips
 *   - Audience strip (locked at bottom 2026-05-15 — sits right above send)
 *   - Send footer
 */
export function ComposerCanvas({
  vetByline,
  vetAvatarUrl,
  initialDraft,
}: {
  vetByline: string;
  vetAvatarUrl: string | null;
  /** Optional server-fetched draft to seed the composer with. Used when the
   *  route is `/broadcasts/new?draftId=...` — the page resolver loads the
   *  DB draft and passes it here, which then writes to localStorage so
   *  edits flow through the normal autosave pipeline. */
  initialDraft?: import("@/app/(dashboard)/broadcasts/draft-state").BroadcastDraft | null;
}) {
  const router = useRouter();
  const {
    draft,
    hydrated,
    activeContent,
    updateActiveContent,
    updateDraft,
    replaceLanguageContent,
    setReviewed,
    setCoverImage,
    setCoverImagePosition,
    addSection,
    removeSection,
    updateSection,
    moveSection,
    setConditionGroups,
    resetDraft,
  } = useBroadcastDraft(initialDraft);

  const { t } = useLanguage();
  const [audience, setAudience] = useState<AudienceCountResult | null>(null);
  const [audienceModalOpen, setAudienceModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [translating, setTranslating] = useState(false);
  /** Last field the vet focused. Persists across the mic-button click (which
   *  blurs the input), so the transcript still knows where to land. */
  const [focusedField, setFocusedField] = useState<FocusTarget | null>(null);

  // Server-autosave state (locked 2026-05-18). The composer debounces edits
  // and pushes to `broadcasts` (sent_at IS NULL) so drafts survive browser
  // close, show up in /broadcasts list, and reach the demo phone if Sagar
  // switches devices. See docs/decisions-log.md "Broadcast voice-dump feature".
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number>(0);
  /** DB id of the persisted draft row. Mutated synchronously by the save
   *  chain so the next save in the chain sees the freshest id without
   *  waiting for React state to propagate. */
  const draftIdRef = useRef<string | null>(draft.serverDraftId);
  /** Last-saved content hash. Skip no-op saves when content hasn't moved. */
  const lastSavedHashRef = useRef<string | null>(null);
  /** Debounce timer for autosave. Cleared + reset on every state change. */
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Promise chain ensuring at most ONE save is in flight at a time. Prevents
   *  the race where rapid edits + slow network cause two INSERTs (resulting
   *  in duplicate draft rows). */
  const saveChainRef = useRef<Promise<unknown>>(Promise.resolve());

  // Keep draftIdRef synced with externally-set serverDraftId (hydration from
  // ?draftId=... server fetch, or fresh voice-first hand-off).
  useEffect(() => {
    draftIdRef.current = draft.serverDraftId;
  }, [draft.serverDraftId]);

  // Debounced server autosave. Watches the saveable shape (en + mr + audience)
  // and pushes to the broadcasts table 2 seconds after edits stop.
  useEffect(() => {
    if (!hydrated) return;

    // Content gate: don't INSERT empty rows on mount. Once a draftId exists,
    // every update is fine (we're editing the existing row).
    const hasContent =
      draft.en.title.trim() !== "" ||
      draft.en.body.trim() !== "" ||
      draft.en.sections.length > 0 ||
      !!draft.en.coverImageUrl ||
      draft.mr.title.trim() !== "" ||
      draft.mr.body.trim() !== "" ||
      draft.mr.sections.length > 0;
    if (!hasContent && !draftIdRef.current) return;

    const hash = JSON.stringify({
      en: draft.en,
      mr: draft.mr,
      cg: draft.conditionGroups,
    });

    // First-pass prime: when resuming a draft from DB (serverDraftId already
    // set but no save has run yet in this mount), seed lastSavedHashRef
    // with the initial hash so we don't redundantly UPDATE the same content
    // back to the server on hydration. Real edits will diverge from this
    // baseline and trigger the normal debounce.
    if (lastSavedHashRef.current === null && draftIdRef.current !== null) {
      lastSavedHashRef.current = hash;
      setLastSavedAt(draft.lastAutosaveAt || Date.now());
      setSaveState("saved");
      return;
    }
    if (hash === lastSavedHashRef.current) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveChainRef.current = saveChainRef.current
        .catch(() => {})
        .then(async () => {
          // The hash may have advanced (or rolled back) while we waited for
          // a prior save in the chain; recompute and skip no-ops.
          if (hash === lastSavedHashRef.current) return;
          setSaveState("saving");
          try {
            const result = await saveBroadcastDraftAction({
              draftId: draftIdRef.current,
              en: draft.en,
              mr: draft.mr,
              conditionGroups: draft.conditionGroups,
            });
            if (result.ok) {
              lastSavedHashRef.current = hash;
              if (draftIdRef.current !== result.draftId) {
                draftIdRef.current = result.draftId;
                updateDraft({ serverDraftId: result.draftId });
              }
              setLastSavedAt(Date.now());
              setSaveState("saved");
            } else {
              console.warn("[autosave] failed:", result.error);
              setSaveState("error");
            }
          } catch (e) {
            console.warn("[autosave] threw:", (e as Error).message);
            setSaveState("error");
          }
        });
    }, 2000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [hydrated, draft.en, draft.mr, draft.conditionGroups, updateDraft]);

  // Manual "Save draft" button — flush immediately, skip the 2s debounce.
  const handleSaveDraftClick = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    saveChainRef.current = saveChainRef.current
      .catch(() => {})
      .then(async () => {
        setSaveState("saving");
        try {
          const result = await saveBroadcastDraftAction({
            draftId: draftIdRef.current,
            en: draft.en,
            mr: draft.mr,
            conditionGroups: draft.conditionGroups,
          });
          if (result.ok) {
            const hash = JSON.stringify({
              en: draft.en,
              mr: draft.mr,
              cg: draft.conditionGroups,
            });
            lastSavedHashRef.current = hash;
            if (draftIdRef.current !== result.draftId) {
              draftIdRef.current = result.draftId;
              updateDraft({ serverDraftId: result.draftId });
            }
            setLastSavedAt(Date.now());
            setSaveState("saved");
          } else {
            setSaveState("error");
          }
        } catch (e) {
          setSaveState("error");
        }
      });
  }, [draft.en, draft.mr, draft.conditionGroups, updateDraft]);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    getAudienceCountAction(draft.conditionGroups).then((res) => {
      if (!cancelled) setAudience(res);
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated, draft.conditionGroups]);

  /** Append `addition` to `existing` with one space separator, dropping the
   *  separator when the existing field is empty. Used by the voice-mic
   *  transcript dispatcher to grow a field across multiple recordings. */
  const appendVoiceText = (existing: string, addition: string): string => {
    if (!existing.trim()) return addition;
    return `${existing.trimEnd()} ${addition}`;
  };

  /** Drop the voice transcript into the field the vet last focused. */
  const handleVoiceTranscript = useCallback(
    (text: string) => {
      if (!focusedField) return;
      switch (focusedField.kind) {
        case "title":
          updateActiveContent({ title: appendVoiceText(activeContent.title, text) });
          return;
        case "body":
          updateActiveContent({ body: appendVoiceText(activeContent.body, text) });
          return;
        case "section-bullet": {
          const section = activeContent.sections.find((s) => s.id === focusedField.sectionId);
          if (!section) return;
          // Multi-bullet dictation (locked 2026-05-18 v3): if the vet
          // dictates "A, B, C" or "A and B and C", split into multiple
          // bullets so they don't have to focus each bullet individually.
          // Splice the chunks at the focused index, replacing the current
          // bullet's content and shifting any later bullets down.
          const chunks = text
            .split(/(?:,\s*|\s+and\s+)/i)
            .map((c) => c.trim())
            .filter(Boolean);
          if (chunks.length > 1) {
            const next = [...section.items];
            // If the focused bullet is empty, the first chunk replaces it.
            // If it has content, append the first chunk to it.
            const focusedItem = next[focusedField.idx] ?? "";
            chunks[0] = appendVoiceText(focusedItem, chunks[0] ?? "");
            next.splice(focusedField.idx, 1, ...chunks);
            updateSection(focusedField.sectionId, { items: next });
            return;
          }
          // Single chunk — preserve the original append-to-current-bullet behaviour.
          const next = section.items.map((it, i) =>
            i === focusedField.idx ? appendVoiceText(it, text) : it
          );
          updateSection(focusedField.sectionId, { items: next });
          return;
        }
        case "section-label": {
          const section = activeContent.sections.find((s) => s.id === focusedField.sectionId);
          if (!section) return;
          updateSection(focusedField.sectionId, {
            label: appendVoiceText(section.label, text),
          });
          return;
        }
      }
    },
    [focusedField, activeContent.title, activeContent.body, activeContent.sections, updateActiveContent, updateSection]
  );

  /** Human label for the voice-mic helper text — tells the vet which field
   *  the next recording will fill. Falls back to null when nothing's focused.
   *  Locked 2026-05-18 v4: dropped the trailing "· bullet N" — the bullet
   *  index didn't carry useful information, especially now that bullet
   *  dictation can split a single recording across multiple bullets via
   *  comma/and. The section label alone is the clearer affordance. */
  const focusedFieldLabel = ((): string | null => {
    if (!focusedField) return null;
    if (focusedField.kind === "title") return "Title";
    if (focusedField.kind === "body") return "Body";
    if (focusedField.kind === "section-label") return "Section label";
    const section = activeContent.sections.find((s) => s.id === focusedField.sectionId);
    return section?.label ?? "Section";
  })();

  /** Determine the translate direction. The button always fills the EMPTY
   *  side from the FILLED side, regardless of which tab the vet is on. If
   *  both sides have content, default to active→other (vet explicitly asked
   *  to refresh the other language). If both empty, no direction (disabled).
   *
   *  Locked 2026-05-18 v2: previously the button always translated active→
   *  other. On a vet who dictated in EN and switched to the MR tab, the
   *  label read "Auto-fill English now" (wrong direction) and a click would
   *  have wiped the EN content with translations of empty MR strings. */
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
  const translateDirection: { source: "en" | "mr"; target: "en" | "mr" } | null =
    !enHasContent && !mrHasContent
      ? null
      : enHasContent && mrHasContent
        ? // Both sides already filled — hide the auto-fill button entirely
          // (user feedback 2026-05-18: showing "Auto-fill English now" when
          // EN is already populated read as confusing/destructive).
          null
        : enHasContent
          ? { source: "en", target: "mr" }
          : { source: "mr", target: "en" };

  const handleAutoTranslate = async () => {
    if (!translateDirection) return;
    const { source, target } = translateDirection;
    setTranslating(true);
    try {
      const src = draft[source];
      const translateOne = async (text: string) => {
        if (!text.trim()) return "";
        const res = await fetch("/api/sarvam-translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            source,
            target,
          }),
        });
        const json = await res.json();
        return res.ok ? json.translated ?? "" : "";
      };
      const translateMany = async (arr: string[]) =>
        Promise.all(arr.map(translateOne));
      const [title, body, sections] = await Promise.all([
        translateOne(src.title),
        translateOne(src.body),
        Promise.all(
          src.sections.map(async (s) => ({
            ...s,
            label: await translateOne(s.label),
            items: await translateMany(s.items),
          }))
        ),
      ]);
      replaceLanguageContent(target, {
        title,
        body,
        sections,
        coverImageUrl: src.coverImageUrl,
        coverImagePosition: src.coverImagePosition,
      });
    } finally {
      setTranslating(false);
    }
  };

  const handleSent = (broadcastId: string) => {
    resetDraft();
    router.push(`/broadcasts/${broadcastId}`);
  };

  if (!hydrated) {
    return (
      <div className="px-8 py-8 text-ink-faint italic text-sm">
        Loading draft...
      </div>
    );
  }

  const audiencePill = describeAudiencePill(draft.conditionGroups);

  // Which standard section types are already present (used by the add-chips
  // row to hide chips for sections the vet has already added).
  const presentTypes = new Set(activeContent.sections.map((s) => s.type));

  return (
    <>
      <div className="px-8 pt-6 pb-3 flex items-baseline gap-4">
        <h1 className="text-ink text-lg font-semibold">
          {t("voice.header.title")}
        </h1>
        <SaveStateLabel state={saveState} lastSavedAt={lastSavedAt} />
      </div>

      <div className="px-8 pb-8">
        <div className="bg-canvas border border-rule rounded-2xl flex flex-col">
          {/* Toolbar (language + autofill + transcript + universal mic).
              Sticky to the top of the composer card so the language toggle
              and voice mic stay reachable as the vet scrolls through long
              sections. Locked 2026-05-18 v3 — replaces the inline toolbar +
              separate fixed bottom-right mic. */}
          <div className="sticky top-0 z-30 bg-canvas px-7 py-3 border-b border-rule rounded-t-2xl flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">
              {t("composer.toolbar.writing-in")}
            </span>
            <ToggleGroup
              type="single"
              value={draft.language}
              onValueChange={(v) => {
                if (v === "en" || v === "mr") updateDraft({ language: v });
              }}
              className="inline-flex bg-canvas-2 border border-rule rounded-full p-0.5 gap-0.5"
            >
              <ToggleGroupItem
                value="en"
                aria-label="Write in English"
                className="h-7 px-3 rounded-full text-xs font-semibold transition-colors text-ink-soft hover:text-ink data-[state=on]:bg-primary data-[state=on]:text-canvas"
              >
                English
              </ToggleGroupItem>
              <ToggleGroupItem
                value="mr"
                aria-label="Write in Marathi"
                className="h-7 px-3 rounded-full text-xs font-semibold transition-colors text-ink-soft hover:text-ink data-[state=on]:bg-primary data-[state=on]:text-canvas"
              >
                मराठी
              </ToggleGroupItem>
            </ToggleGroup>
            {translateDirection && (
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={handleAutoTranslate}
                disabled={translating}
                className="text-ink-soft hover:text-ink no-underline"
              >
                <Globe className="w-3.5 h-3.5" />
                {translating
                  ? "Translating..."
                  : `Auto-fill ${translateDirection.target === "en" ? "English" : "मराठी"} now`}
              </Button>
            )}
            <div className="ml-auto flex items-center gap-2.5">
              {draft.voiceTranscript && (
                <TranscriptDialog transcript={draft.voiceTranscript} />
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <ComposerVoiceMic
                      enabled={focusedField !== null}
                      targetLabel={focusedFieldLabel}
                      lang={draft.language}
                      onTranscript={handleVoiceTranscript}
                    />
                  </span>
                </TooltipTrigger>
                {focusedField === null && (
                  <TooltipContent>
                    To write with voice, click into a section
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>

          {/* Cover photo slot — always visible at top. Dropzone state when
              null, populated state when URL is set. Repositioning persists
              the image's object-position so preview + sent detail match. */}
          <CoverPhotoSlot
            imageUrl={activeContent.coverImageUrl}
            imagePosition={activeContent.coverImagePosition}
            slug={draft.slug}
            onUploaded={(url) => setCoverImage(url)}
            onRemove={() => setCoverImage(null)}
            onPositionChange={(pos) => setCoverImagePosition(pos)}
          />

          {/* Title — boxed input with default border + ring; placeholder
              matches the audience-teaser style (text-sm italic ink-faint)
              so the empty-state typography is uniform across the composer. */}
          <FieldBlock label="Title" required>
            <Input
              type="text"
              value={activeContent.title}
              onChange={(e) => updateActiveContent({ title: e.target.value })}
              onFocus={() => setFocusedField({ kind: "title" })}
              placeholder={
                draft.language === "mr"
                  ? "एक स्पष्ट, संक्षिप्त शीर्षक..."
                  : "A clear, concrete headline..."
              }
              className="h-auto px-4 py-3 text-lg font-semibold leading-tight bg-canvas placeholder:text-sm placeholder:italic placeholder:font-normal"
            />
          </FieldBlock>

          {/* Body — boxed textarea, same teaser-text discipline. */}
          <FieldBlock label="Body" required>
            <Textarea
              value={activeContent.body}
              onChange={(e) => updateActiveContent({ body: e.target.value })}
              onFocus={() => setFocusedField({ kind: "body" })}
              placeholder={
                draft.language === "mr"
                  ? "तुमचा संदेश इथे लिहा..."
                  : "Write your broadcast..."
              }
              rows={4}
              className="px-4 py-3 text-base leading-[1.6] bg-canvas resize-none min-h-[140px] placeholder:text-sm placeholder:italic placeholder:font-normal"
            />
          </FieldBlock>

          {/* Sections — fully ordered + addable + removable */}
          {activeContent.sections.map((section, idx) => (
            <SectionEditor
              key={section.id}
              section={section}
              isFirst={idx === 0}
              isLast={idx === activeContent.sections.length - 1}
              onChange={(patch) => updateSection(section.id, patch)}
              onRemove={() => removeSection(section.id)}
              onMoveUp={() => moveSection(section.id, "up")}
              onMoveDown={() => moveSection(section.id, "down")}
              onBulletFocus={(bulletIdx) =>
                setFocusedField({ kind: "section-bullet", sectionId: section.id, idx: bulletIdx })
              }
              onLabelFocus={() =>
                setFocusedField({ kind: "section-label", sectionId: section.id })
              }
            />
          ))}

          {/* Add-section chips: hide standard types already present.
              "Custom section" is always available. */}
          <AddSectionRow
            presentTypes={presentTypes}
            onAdd={(type) => addSection(type)}
          />

          {/* Audience strip — berry-soft tinted block (locked 2026-05-18 v2
              to match the inbox AwaitingBar visual treatment). The default
              flat full-width row was barely visible; the tinted card draws
              attention to the audience requirement before Send. */}
          <div className="mx-7 mt-5 mb-3 px-5 py-4 bg-berry-soft border border-berry/20 rounded-xl flex flex-col gap-3.5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-berry-deep">
                {t("composer.audience.eyebrow")}
              </span>
              {!audiencePill.empty && (
                <AudiencePill
                  label={audiencePill.label}
                  custom={audiencePill.custom}
                  empty={false}
                />
              )}
              <span className="text-sm text-ink-soft font-tnum">
                {audience ? (
                  <>
                    <span className={cn("font-semibold", audience.pets > 0 ? "text-ink" : "text-ink-faint")}>
                      {audience.pets}
                    </span>{" "}
                    pets
                    {audience.pets > 0 && (
                      <>
                        {" · "}
                        {audience.households} households
                      </>
                    )}
                  </>
                ) : (
                  <span className="italic text-ink-faint">counting...</span>
                )}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAudienceModalOpen(true)}
                className="ml-auto text-primary hover:bg-berry-soft hover:text-primary"
              >
                {audiencePill.custom ? (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.7} />
                    {t("composer.audience.edit-cta")}
                  </>
                ) : (
                  <>
                    <Users className="w-3.5 h-3.5" strokeWidth={1.7} />
                    {t("composer.audience.select-cta")}
                  </>
                )}
              </Button>
            </div>
            {audience && audience.pets > 0 && (
              <SamplePetRow pets={audience.samplePets} total={audience.pets} />
            )}
          </div>

          {/* Send footer. The left "Audience needed / Ready to send" copy was
              removed 2026-05-18 v2 — the Send broadcast tooltip already tells
              the vet exactly what to do, the audience pill above shows the
              count, and the duplicate copy read as visual noise. Save draft
              moves to the LHS (separated from primary actions on the right). */}
          <div className="px-6 py-4 bg-canvas-2/40 border-t border-rule rounded-b-2xl flex items-center gap-4 flex-wrap">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraftClick}
              disabled={saveState === "saving"}
            >
              <Save className="w-3.5 h-3.5" strokeWidth={1.7} />
              {t("composer.footer.save")}
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye className="w-3.5 h-3.5" strokeWidth={1.7} />
                {t("composer.footer.preview")}
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* Span wrapper so the tooltip still triggers on hover when
                      the button is visually disabled (Radix tooltips don't
                      fire on disabled buttons directly). The button itself
                      is kept enabled visually-only; onClick gates on audience
                      so the wrong action can never fire. */}
                  <span>
                    <Button
                      type="button"
                      onClick={() => {
                        if (!audience || audience.pets === 0) return;
                        setSendOpen(true);
                      }}
                      size="cta"
                      aria-disabled={!audience || audience.pets === 0}
                      className={cn(
                        (!audience || audience.pets === 0) &&
                          "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {t("composer.footer.send")}
                      <PaperPlaneTilt className="w-4 h-4" weight="fill" />
                    </Button>
                  </span>
                </TooltipTrigger>
                {(!audience || audience.pets === 0) && (
                  <TooltipContent side="top">
                    {t("composer.footer.send-disabled-tooltip")}
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Modals + overlay */}
      <AudienceModal
        open={audienceModalOpen}
        initialGroups={draft.conditionGroups}
        onApply={(groups) => {
          setConditionGroups(groups);
          setAudienceModalOpen(false);
        }}
        onClose={() => setAudienceModalOpen(false)}
      />
      <PreviewOverlay
        open={previewOpen}
        draft={draft}
        samplePets={audience?.samplePets ?? []}
        vetByline={vetByline}
        vetAvatarUrl={vetAvatarUrl}
        audiencePetCount={audience?.pets ?? 0}
        onClose={() => setPreviewOpen(false)}
        onLanguageViewed={(lang) => setReviewed(lang, true)}
        onAutoTranslate={handleAutoTranslate}
        translating={translating}
      />
      <SendConfirmModal
        open={sendOpen}
        draft={draft}
        audienceSummary={
          audience
            ? `${audience.pets} pets across ${audience.households} households`
            : "the selected audience"
        }
        onClose={() => setSendOpen(false)}
        onSent={handleSent}
      />
    </>
  );
}

// ============================================================================
// Field block (shared label + content layout for Title / Body)
// ============================================================================

function FieldBlock({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="px-7 pt-5 pb-2">
      <div className="text-xs font-medium uppercase tracking-[0.14em] text-ink-faint mb-2 flex items-center gap-2">
        {label}
        {required && (
          <span className="text-xs font-medium text-ink-faint normal-case tracking-normal">
            required
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ============================================================================
// Section editor (one section in the ordered list)
//
// Deletion UX: Backspace on an empty bullet auto-removes that bullet +
// focuses the previous one. Enter at end of a bullet adds a new one below.
// The section-level trash button removes the whole block. Up/Down arrows
// reorder the section relative to its siblings.
//
// Standard types render fixed:
//   - Warning sections: 1.5px ink frame + AlertTriangle icon (palette-only
//     alert treatment, no off-palette red), bulleted body
//   - WhenToCall: Phone icon, bulleted body
//   - Summary: bare canvas, bulleted body
//
// Custom sections expose three controls in the header row: a title input
// (replaces "Untitled section"), an Emphasis toggle (Normal / Highlight —
// Highlight applies the same ink-frame + AlertTriangle treatment as Warning)
// and a Format toggle (Bullets / Plain text — Plain text collapses the body
// to a single multi-line textarea).
// ============================================================================

function SectionEditor({
  section,
  isFirst,
  isLast,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  onBulletFocus,
  onLabelFocus,
}: {
  section: Section;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<Pick<Section, "label" | "items" | "emphasis" | "format">>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onBulletFocus: (idx: number) => void;
  onLabelFocus: () => void;
}) {
  const updateItem = (idx: number, val: string) => {
    onChange({ items: section.items.map((it, i) => (i === idx ? val : it)) });
  };
  const removeAt = (idx: number) => {
    onChange({ items: section.items.filter((_, i) => i !== idx) });
  };
  const addAfter = (idx: number) => {
    const next = [...section.items];
    next.splice(idx + 1, 0, "");
    onChange({ items: next });
  };

  const isCustom = section.type === "custom";
  const isHighlighted =
    section.type === "warning" || (isCustom && section.emphasis === "highlight");
  const Icon = isHighlighted
    ? AlertTriangle
    : section.type === "whenToCall"
      ? Phone
      : null;
  // whenToCall is conceptually a sentence/paragraph statement, not bullets.
  // Locked 2026-05-18 — long whenToCall items were getting truncated inside
  // the single-line <input> when rendered as bullets. Forcing paragraph mode
  // for whenToCall makes the text wrap inside a Textarea instead.
  const renderAsParagraph =
    section.type === "whenToCall" ||
    (isCustom && section.format === "paragraph");

  /** Switching format collapses or expands items[] so the data shape matches
   *  what the picked layout expects. Bullets → paragraph joins the bullets
   *  with blank lines into items[0]; paragraph → bullets splits items[0] on
   *  blank lines. Empty content becomes a single empty item. */
  const setFormat = (next: "bullets" | "paragraph") => {
    if (next === section.format) return;
    if (next === "paragraph") {
      const joined = section.items.filter(Boolean).join("\n\n");
      onChange({ format: "paragraph", items: [joined] });
    } else {
      const split = (section.items[0] ?? "")
        .split(/\n{2,}/)
        .map((s) => s.trim())
        .filter(Boolean);
      onChange({ format: "bullets", items: split.length > 0 ? split : [""] });
    }
  };

  return (
    <div
      className={cn(
        isHighlighted
          ? "mx-7 mt-3 rounded-xl px-5 py-4 bg-canvas-2 border-[1.5px] border-ink"
          : "px-7 pt-3 pb-2"
      )}
    >
      {/* Section header. Standard types show a static eyebrow; custom shows a
          full title input wired to setLabel + the two toggles below. */}
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-ink-soft shrink-0" />}
        {isCustom ? (
          <Input
            type="text"
            value={section.label}
            onChange={(e) => onChange({ label: e.target.value })}
            onFocus={onLabelFocus}
            className="h-8 px-2 py-1 text-md font-semibold bg-transparent border-input placeholder:text-sm placeholder:italic placeholder:font-normal min-w-0 flex-1"
            placeholder="Section title..."
          />
        ) : (
          <span className="text-xxs font-semibold uppercase tracking-[0.14em] text-ink-soft">
            {section.label}
          </span>
        )}
        <div className="ml-auto flex items-center gap-0.5">
          <SectionIconButton
            onClick={onMoveUp}
            disabled={isFirst}
            label="Move section up"
          >
            <CaretUp className="w-3.5 h-3.5" weight="bold" />
          </SectionIconButton>
          <SectionIconButton
            onClick={onMoveDown}
            disabled={isLast}
            label="Move section down"
          >
            <CaretDown className="w-3.5 h-3.5" weight="bold" />
          </SectionIconButton>
          <SectionIconButton onClick={onRemove} label="Remove section">
            <Trash2 className="w-3.5 h-3.5" />
          </SectionIconButton>
        </div>
      </div>

      {/* Custom-only toggles. Emphasis switches the ink-frame on/off; format
          switches between bulleted and plain-paragraph bodies. */}
      {isCustom && (
        <div className="flex items-center gap-4 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-soft">Emphasis</span>
            <ToggleGroup
              type="single"
              value={section.emphasis ?? "normal"}
              onValueChange={(v) => {
                if (v === "normal" || v === "highlight") onChange({ emphasis: v });
              }}
              className="inline-flex bg-canvas-2 border border-rule rounded-full p-0.5 gap-0.5"
            >
              <ToggleGroupItem
                value="normal"
                aria-label="Normal emphasis"
                className="h-6 px-2.5 rounded-full text-xs font-semibold transition-colors text-ink-soft hover:text-ink data-[state=on]:bg-primary data-[state=on]:text-canvas"
              >
                Normal
              </ToggleGroupItem>
              <ToggleGroupItem
                value="highlight"
                aria-label="Highlight emphasis"
                className="h-6 px-2.5 rounded-full text-xs font-semibold transition-colors text-ink-soft hover:text-ink data-[state=on]:bg-primary data-[state=on]:text-canvas"
              >
                Highlight
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-soft">Format</span>
            <ToggleGroup
              type="single"
              value={section.format ?? "bullets"}
              onValueChange={(v) => {
                if (v === "bullets" || v === "paragraph") setFormat(v);
              }}
              className="inline-flex bg-canvas-2 border border-rule rounded-full p-0.5 gap-0.5"
            >
              <ToggleGroupItem
                value="bullets"
                aria-label="Bulleted body"
                className="h-6 px-2.5 rounded-full text-xs font-semibold transition-colors text-ink-soft hover:text-ink data-[state=on]:bg-primary data-[state=on]:text-canvas"
              >
                Bullets
              </ToggleGroupItem>
              <ToggleGroupItem
                value="paragraph"
                aria-label="Plain-text body"
                className="h-6 px-2.5 rounded-full text-xs font-semibold transition-colors text-ink-soft hover:text-ink data-[state=on]:bg-primary data-[state=on]:text-canvas"
              >
                Plain text
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      )}

      {/* Body — bullets (default) or single textarea (paragraph mode). */}
      {renderAsParagraph ? (
        <Textarea
          value={section.items[0] ?? ""}
          onChange={(e) => updateItem(0, e.target.value)}
          onFocus={() => onBulletFocus(0)}
          placeholder="Write the section body..."
          rows={4}
          className="px-3 py-2 text-base leading-[1.6] bg-canvas resize-none min-h-[96px] placeholder:text-sm placeholder:italic placeholder:font-normal"
        />
      ) : (
        <>
          <ul className="flex flex-col gap-1.5">
            {section.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-[10px] w-1.5 h-1.5 rounded-full shrink-0 bg-ink-soft" />
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateItem(i, e.target.value)}
                  onFocus={() => onBulletFocus(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && item === "" && section.items.length > 1) {
                      e.preventDefault();
                      removeAt(i);
                      requestAnimationFrame(() => {
                        const inputs = (e.currentTarget.closest("ul")?.querySelectorAll(
                          "input"
                        ) ?? []) as NodeListOf<HTMLInputElement>;
                        inputs[Math.max(0, i - 1)]?.focus();
                      });
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      addAfter(i);
                      requestAnimationFrame(() => {
                        const inputs = (e.currentTarget.closest("ul")?.querySelectorAll(
                          "input"
                        ) ?? []) as NodeListOf<HTMLInputElement>;
                        inputs[i + 1]?.focus();
                      });
                    }
                  }}
                  className="flex-1 border-0 bg-transparent text-base leading-snug text-ink focus:outline-none placeholder:text-sm placeholder:italic placeholder:font-normal placeholder:text-ink-faint"
                  placeholder="Bullet point"
                />
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => addAfter(section.items.length - 1)}
            className="mt-2 h-auto px-0 text-sm font-semibold text-ink-soft hover:text-ink hover:bg-transparent"
          >
            <Plus className="w-3.5 h-3.5" />
            Add bullet
          </Button>
        </>
      )}
    </div>
  );
}

function SectionIconButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      className="h-7 w-7 rounded-md text-ink-faint hover:text-ink hover:bg-canvas-2 disabled:text-ink-faint/40"
      aria-label={label}
    >
      {children}
    </Button>
  );
}

// ============================================================================
// Add-section row (chips for adding new sections)
// ============================================================================

function AddSectionRow({
  presentTypes,
  onAdd,
}: {
  presentTypes: Set<SectionType>;
  onAdd: (type: SectionType) => void;
}) {
  // "Summary bullets" chip removed 2026-05-18 v3 — body is the primary
  // narrative now (per the earlier voice-dump rebuild), and if the vet wants
  // a bullet list they can add a Custom section.
  // "When to see the vet" label matches STANDARD_SECTION_LABELS.whenToCall.en.
  const standardTypes: { type: SectionType; label: string }[] = [
    { type: "warning", label: "Warning signs" },
    { type: "whenToCall", label: "When to see the vet" },
  ];
  const visibleStandard = standardTypes.filter((t) => !presentTypes.has(t.type));
  // Custom always available.
  return (
    <div className="px-7 pt-3.5 pb-2 flex gap-2 flex-wrap">
      {visibleStandard.map((c) => (
        <AddSectionChip key={c.type} onClick={() => onAdd(c.type)}>
          {c.label}
        </AddSectionChip>
      ))}
      <AddSectionChip onClick={() => onAdd("custom")}>
        Custom section
      </AddSectionChip>
    </div>
  );
}

function AddSectionChip({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className="h-auto px-3 py-1.5 rounded-full border-dashed border-rule text-xs text-ink-soft hover:border-primary hover:text-primary hover:bg-berry-soft hover:border-solid"
    >
      <Plus className="w-3 h-3" strokeWidth={2} />
      {children}
    </Button>
  );
}

// ============================================================================
// Audience pill (right of "Who's this for?")
// ============================================================================

function AudiencePill({
  label,
  custom,
  empty,
}: {
  label: string;
  custom: boolean;
  empty: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold",
        empty
          ? "bg-transparent border border-dashed border-rule text-ink-faint italic"
          : custom
            ? "bg-canvas border border-primary text-primary"
            : "bg-primary text-canvas"
      )}
    >
      <Users className="w-3.5 h-3.5" strokeWidth={1.8} />
      {label}
    </span>
  );
}

// ============================================================================
// Sample pet row (avatars + names + "+ N more")
// ============================================================================

function SamplePetRow({
  pets,
  total,
}: {
  pets: AudienceSamplePet[];
  total: number;
}) {
  if (pets.length === 0) return null;
  const visible = pets.slice(0, 5);
  const remaining = Math.max(0, total - visible.length);
  // Locked 2026-05-18 v5: dropped the avatar circles + uppercase "SAMPLE"
  // eyebrow per user feedback ("don't make the whole sample thing so
  // prominent"). Now a plain comma-separated list with a soft "Sample:" label.
  return (
    <div className="flex items-baseline gap-2 pt-2 flex-wrap">
      <span className="text-xs text-ink-faint">Sample:</span>
      <span className="text-xs text-ink-soft">
        {visible.map((p) => p.name).join(", ")}
        {remaining > 0 && (
          <span className="text-ink-faint"> · + {remaining} more</span>
        )}
      </span>
    </div>
  );
}

// ============================================================================
// Autosave label
// ============================================================================

/**
 * View-transcript dialog. Surfaces only when the draft was seeded from the
 * voice-first landing (draft.voiceTranscript is set). Read-only display so
 * the vet can reference exactly what they said while editing the structured
 * version. localStorage-only in v0 — resuming a draft from a different
 * device won't show the transcript (no `voice_transcript` DB column yet).
 */
function TranscriptDialog({ transcript }: { transcript: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="link" size="sm" className="text-ink-soft hover:text-ink no-underline">
          <Microphone className="w-3.5 h-3.5" weight="regular" />
          View original transcript
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Your original recording</DialogTitle>
        </DialogHeader>
        <div className="mt-2 max-h-[60vh] overflow-auto rounded-md border border-rule-soft bg-canvas-2 px-4 py-3 text-base leading-[1.7] text-ink-soft whitespace-pre-wrap">
          {transcript}
        </div>
        <p className="text-xs text-ink-faint mt-1">
          Stays available for this draft on this browser. Edits above don&apos;t
          change the transcript.
        </p>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Save indicator. Shows transient state only — no ticking "Ns ago" counter.
 * - "Saving..." while a save is in flight.
 * - "Saved" briefly (3s) after a successful save, then hides itself.
 * - "Couldn't save" persists on error until the next save attempt.
 *
 * Locked 2026-05-18 v2: the previous version polled every 5 seconds to update
 * a "Saved Ns ago" label. The user read this as either noise or implied
 * background API calls; the indicator is now silent once a save settles.
 */
function SaveStateLabel({
  state,
  lastSavedAt,
}: {
  state: "idle" | "saving" | "saved" | "error";
  lastSavedAt: number;
}) {
  const [showSaved, setShowSaved] = useState(false);
  useEffect(() => {
    if (state !== "saved" || lastSavedAt <= 0) return;
    setShowSaved(true);
    const id = setTimeout(() => setShowSaved(false), 3000);
    return () => clearTimeout(id);
  }, [state, lastSavedAt]);

  if (state === "saving") {
    return (
      <span className="text-sm text-ink-faint font-medium">Saving...</span>
    );
  }
  if (state === "error") {
    return (
      <span className="text-sm text-berry-deep font-medium">
        Couldn&apos;t save
      </span>
    );
  }
  if (state === "saved" && showSaved) {
    return <span className="text-sm text-ink-faint font-medium">Saved</span>;
  }
  return null;
}

// ============================================================================
// Helpers
// ============================================================================

function describeAudiencePill(
  groups: ConditionGroup[]
): { label: string; custom: boolean; empty: boolean } {
  if (groups.length === 0) {
    // 2026-05-15 lock: no seeded default. Empty groups = "audience not yet
    // picked" — pill renders as a dashed-border placeholder, count reads 0,
    // Send stays disabled until the vet opens Custom... and adds a group.
    return { label: "Select audience", custom: false, empty: true };
  }
  if (groups.length === 1) {
    const g = groups[0]!;
    const species = readCondition(g, "species") as SpeciesValue | undefined;
    const lastVisit = readCondition(g, "lastVisit") as LastVisitWindow | undefined;
    const speciesLabel =
      species === "dog"
        ? "Dog parents"
        : species === "cat"
          ? "Cat parents"
          : species === "both"
            ? "Dog + cat parents"
            : "All parents";
    const visitLabel =
      lastVisit && lastVisit !== "any"
        ? `, visited in last ${lastVisit.replace("m", " months")}`
        : "";
    return { label: `Custom: ${speciesLabel}${visitLabel}`, custom: true, empty: false };
  }
  return { label: `Custom: ${groups.length} groups`, custom: true, empty: false };
}
