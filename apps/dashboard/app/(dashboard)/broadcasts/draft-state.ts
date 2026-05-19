"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Client-side broadcast draft (single-page composer rebuild 2026-05-15),
 * persisted to localStorage so /broadcasts/new survives navigation + tab close
 * without a DB round-trip on every keystroke.
 *
 * Bilingual model (per `docs/decisions-log.md` "Bilingual hard publish-block"):
 * the draft holds two parallel content sets (en + mr). The vet composes in one
 * language, hits "Auto-fill [other]" to populate the second via Sarvam
 * Translate, optionally edits, then reviews both in the Send confirm modal.
 * Send is blocked until `reviewedEn` AND `reviewedMr` are both true. Editing
 * any field in a language resets that language's reviewed flag.
 *
 * Audience model (v3 rebuild 2026-05-15):
 * Replaces the old `audienceFilter` + `audienceFilterGroupB` flat shape with
 * an explicit condition-groups model. Top-level array is OR-union across
 * groups; each group is AND-joined across its conditions. Supports four
 * fields: Species, Age range, Deceased, Last visit. The audience resolver
 * in `actions.ts` consumes this shape directly.
 */

// ============================================================================
// Condition / group types (audience model v3)
// ============================================================================

export type SpeciesValue = "dog" | "cat" | "both";
export type DeceasedValue = "include" | "exclude";
export type LastVisitWindow = "3m" | "12m" | "24m" | "any";

export type Condition =
  | { field: "species"; op: "is"; value: SpeciesValue }
  | { field: "ageRange"; op: "is"; value: { min: number; max: number } }
  | { field: "deceased"; op: "is"; value: DeceasedValue }
  | { field: "lastVisit"; op: "within"; value: LastVisitWindow };

export type ConditionField = Condition["field"];

export type ConditionGroup = {
  id: string;                    // local UUID for React keys + remove ops
  conditions: Condition[];       // joined by AND
  op: "AND";                     // reserved for v1+ intra-group OR
};

/** Conditions seeded in a fresh group so the UI never renders an empty group.
 *  Locked 2026-05-18 v5:
 *  - species: "both"
 *  - ageRange: 0-30 (matcher treats this as "any age" via `rangeIsWideOpen`
 *    in actions.ts)
 *  - deceased: "exclude" (reverted 2026-05-18 v5 per user — broadcasts
 *    should NOT default to reaching households whose only pet has passed;
 *    that's the grief-respecting default. Baseline count drops below 100%
 *    accordingly. Vet can flip to Include if a broadcast is genuinely
 *    relevant to all parents.)
 *  - lastVisit: "any" */
export const DEFAULT_GROUP_CONDITIONS: Condition[] = [
  { field: "species", op: "is", value: "both" },
  { field: "ageRange", op: "is", value: { min: 0, max: 30 } },
  { field: "deceased", op: "is", value: "exclude" },
  { field: "lastVisit", op: "within", value: "any" },
];

/** Generate a stable-ish local id for new condition groups. */
function newGroupId(): string {
  return `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ============================================================================
// Content set + sections (v4 ordered/customisable sections, locked 2026-05-15)
//
// Earlier `ContentSet` had three fixed array fields (`summary` /
// `warningSigns` / `escalation`). The vet asked for full customisation:
// reorder sections, add new section types, drop sections inline. The new
// shape is an ordered `sections: Section[]` so:
//   - Each section carries its own `id` (local UUID for keys + reorder)
//   - Each section carries its `type` (standard ones — summary / warning /
//     whenToCall — render with their canonical icon + eyebrow; `custom`
//     lets the vet name their own block)
//   - Each section carries its `label` (editable for `custom`; defaults
//     for standard types come from i18n)
//   - Each section carries `items: string[]` (bullets)
// Title + Body remain top-level fixed fields (always present, required).
// Cover image stays a top-level optional field. The Section list lives
// BELOW the body and is fully ordered + addable.
// ============================================================================

export type SectionType = "summary" | "warning" | "whenToCall" | "custom";

export type Section = {
  id: string;
  type: SectionType;
  /** Visible eyebrow label. For standard types defaults to canonical English;
   *  for `custom` is whatever the vet typed. Stored on the section so MR
   *  sections can have their own translated labels. */
  label: string;
  items: string[];
  /** Visual emphasis. Only meaningful for `custom` sections — when "highlight"
   *  the section gets the same 1.5px ink-frame + AlertTriangle treatment as a
   *  Warning section. Standard types ignore this (warning is implicitly
   *  highlighted, summary + whenToCall are implicitly normal). */
  emphasis?: "normal" | "highlight";
  /** Body layout. Only meaningful for `custom` sections — `"bullets"` renders
   *  the items as a bulleted list (composer default), `"paragraph"` renders
   *  them as a single multi-line text body without bullets. Standard types
   *  always render as bullets. */
  format?: "bullets" | "paragraph";
};

export type ContentSet = {
  title: string;
  body: string;
  /** Ordered list of section blocks. Empty for quick announcements. */
  sections: Section[];
  /** Public URL in the `broadcast-covers` bucket; null when no cover uploaded. */
  coverImageUrl: string | null;
  /** CSS `object-position` value (e.g. "50% 30%") controlling how the cover
   *  image is cropped inside the 16:5 frame. `null` = center (default).
   *  Wired by drag-to-reposition on the cover slot (locked 2026-05-15). */
  coverImagePosition: string | null;
};

export const EMPTY_CONTENT: ContentSet = {
  title: "",
  body: "",
  sections: [],
  coverImageUrl: null,
  coverImagePosition: null,
};

/** Canonical labels for the three standard section types. Custom sections
 *  default to "Untitled section" and are immediately editable. */
export const STANDARD_SECTION_LABELS: Record<Exclude<SectionType, "custom">, { en: string; mr: string }> = {
  summary: { en: "Summary bullets", mr: "सारांश बुलेट्स" },
  warning: { en: "Warning signs", mr: "धोक्याची चिन्हे" },
  // EN updated 2026-05-18 v2: "When to call us" → "When to see the vet"
  // (more accurate framing — AMS is walk-in only, not phone-booking).
  // MR awaits the Phase 3b Sarvam translate pass; preserving the prior
  // Marathi for now so the existing parent-app preview doesn't break.
  whenToCall: { en: "When to see the vet", mr: "आम्हाला कधी कॉल करावा" },
};

export function defaultLabelFor(type: SectionType, lang: "en" | "mr"): string {
  // Custom sections start with an empty label so the vet sees the title input
  // as a "needs your name" prompt, not as a placeholder masquerading as content.
  if (type === "custom") return "";
  return STANDARD_SECTION_LABELS[type][lang];
}

function newSectionId(): string {
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Make a fresh section of the given type, ready to be appended to ContentSet.sections. */
export function makeSection(type: SectionType, lang: "en" | "mr", seedItem?: string): Section {
  return {
    id: newSectionId(),
    type,
    label: defaultLabelFor(type, lang),
    items: seedItem ? [seedItem] : [""],
    ...(type === "custom" ? { emphasis: "normal" as const, format: "bullets" as const } : {}),
  };
}

// ============================================================================
// Draft shape
// ============================================================================

export type BroadcastDraft = {
  en: ContentSet;
  mr: ContentSet;
  /** Which set the composer form is currently bound to. */
  language: "en" | "mr";
  slug: string;
  /** OR-union across groups; each group is AND-joined. Empty == "all parents". */
  conditionGroups: ConditionGroup[];
  /** Auto-fill मराठी after sending toggle (composer toolbar). */
  autofillMrAfterSend: boolean;
  reviewedEn: boolean;
  reviewedMr: boolean;
  /** Unix ms; bumped on every persist(). Drives the "Autosaved Ns ago" label. */
  lastAutosaveAt: number;
  /** DB id of the persisted draft row (sent_at IS NULL). `null` = not yet
   *  saved to the server — the next autosave will INSERT. Subsequent
   *  autosaves UPDATE the same row. Reset to null on `resetDraft()` so a
   *  brand-new compose starts a brand-new server draft. */
  serverDraftId: string | null;
  /** Raw transcript from the voice-first flow. Captured at hand-off so the
   *  vet can reference the original dictation while editing the structured
   *  draft. localStorage-only (not persisted to DB in v0); means resume-
   *  from-another-device loses the transcript but keeps the structured
   *  content. Adding a `voice_transcript` column is a v1+ change. */
  voiceTranscript: string | null;
};

/**
 * Empty default — every "New broadcast" click drops the vet on a COMPLETELY
 * blank composer (locked 2026-05-15 per Sagar review). Empty `conditionGroups`
 * (no seeded dog-parents default) means "no audience selected" → resolver
 * returns 0 pets and the Send button stays disabled until the vet picks an
 * audience via the Custom... button. This matches the user's "selections
 * should be completely blank · 0" rule.
 */
export const DEFAULT_DRAFT: BroadcastDraft = {
  en: { ...EMPTY_CONTENT },
  mr: { ...EMPTY_CONTENT },
  language: "en",
  slug: "draft",
  conditionGroups: [],
  autofillMrAfterSend: false,
  reviewedEn: false,
  reviewedMr: false,
  lastAutosaveAt: 0,
  serverDraftId: null,
  voiceTranscript: null,
};

/**
 * Sample broadcast preserved as an exported constant for future "Load
 * example" affordances. NOT auto-loaded on page open. If we ever add a
 * drafts list or examples menu, this is the canonical Pawkit demo
 * broadcast that shows the full educational shape (cover + title + body
 * + summary + warning + whenToCall sections).
 */
export const SAMPLE_SUMMER_DRAFT: BroadcastDraft = {
  en: {
    title: "How to care for your dog in the summer",
    body:
      "Maharashtra summers are tough on dogs. They don't sweat like us and can overheat quickly, especially short-nosed breeds and seniors.",
    sections: [
      {
        id: "sample-summary",
        type: "summary",
        label: STANDARD_SECTION_LABELS.summary.en,
        items: [
          "Unlimited fresh water, change twice daily",
          "Protect paws, asphalt over 50°C burns",
          "NEVER leave in a parked car",
          "Walk before 7am or after 7pm",
          "Heat stroke: panting, drool, vomiting, collapse",
        ],
      },
      {
        id: "sample-warning",
        type: "warning",
        label: STANDARD_SECTION_LABELS.warning.en,
        items: [
          "Excessive panting that doesn't slow",
          "Thick drool · vomiting",
          "Bright red gums",
          "Stumbling or collapse",
          "Temp above 39.5°C",
        ],
      },
      {
        id: "sample-whenToCall",
        type: "whenToCall",
        label: STANDARD_SECTION_LABELS.whenToCall.en,
        items: [
          "If temp over 39.5°C OR dog can't stand, emergency.",
          "Call AMS: +91 20 2612 3456",
          "En route: cool water + AC full blast.",
        ],
      },
    ],
    coverImageUrl: null,
    coverImagePosition: null,
  },
  mr: { ...EMPTY_CONTENT },
  language: "en",
  slug: "summer-dog-care",
  conditionGroups: [
    {
      id: "sample-group-a",
      conditions: [...DEFAULT_GROUP_CONDITIONS],
      op: "AND",
    },
  ],
  autofillMrAfterSend: false,
  reviewedEn: false,
  reviewedMr: false,
  lastAutosaveAt: 0,
  serverDraftId: null,
  voiceTranscript: null,
};

export const STORAGE_KEY = "pawkit.broadcast.draft";
// v5-empty-default 2026-05-15: empty DEFAULT_DRAFT for fresh "New broadcast"
// starts. Bumping the version invalidates any browser still holding the old
// summer-seeded v4 draft, so the next page load lands on a blank composer.
const STORAGE_VERSION = "v5-empty-default";

/**
 * Synchronously clear the persisted draft. Called from rail "Create new" +
 * the "+ New broadcast" CTA so those entry points always land on a blank
 * composer — without this, the composer would re-hydrate from whatever the
 * last loaded draft put in localStorage (so clicking a draft in /broadcasts
 * then clicking "Create new" carried that draft's content over).
 * Direct URL navigation to /broadcasts/new (no fresh-start click) still
 * hydrates from localStorage so refresh during a drafting session doesn't
 * lose work.
 */
export function resetBroadcastDraftStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Intentionally swallowed (tech-debt F028 audited 2026-05-18):
    // localStorage access throws in private-browsing / disabled-storage
    // contexts. Falling back to in-memory state is fine for v0.
  }
}

/**
 * Synchronously seed the persisted draft. Used by the voice-first landing
 * (`/broadcasts/new`) to hand a freshly-structured broadcast to the manual
 * composer (`/broadcasts/new/manual`) via localStorage — the manual page's
 * `useBroadcastDraft` hook hydrates from this on mount. Stamps the current
 * `STORAGE_VERSION` so a future bump invalidates stale seeds.
 */
export function seedBroadcastDraftStorage(draft: BroadcastDraft) {
  try {
    const stamped: BroadcastDraft = { ...draft, lastAutosaveAt: Date.now() };
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...stamped, __version: STORAGE_VERSION })
    );
  } catch {
    // Intentionally swallowed (tech-debt F028 audited 2026-05-18):
    // localStorage write throws on quota / private-browsing. Voice-first
    // hand-off falls back to fresh manual composer state; vet re-records.
  }
}

type StoredDraft = BroadcastDraft & { __version?: string };

/** Convert legacy flat content (v1-v3 had `summary` + `warningSigns` +
 *  `escalation` arrays) into the v4 ordered Section[]. Preserves order
 *  summary → warning → whenToCall. Empty arrays produce no section. */
function liftFlatToSections(raw: any, lang: "en" | "mr"): Section[] {
  const out: Section[] = [];
  if (Array.isArray(raw?.summary) && raw.summary.length > 0) {
    out.push({
      id: `migrated-summary-${lang}`,
      type: "summary",
      label: STANDARD_SECTION_LABELS.summary[lang],
      items: raw.summary.filter((s: unknown): s is string => typeof s === "string"),
    });
  }
  if (Array.isArray(raw?.warningSigns) && raw.warningSigns.length > 0) {
    out.push({
      id: `migrated-warning-${lang}`,
      type: "warning",
      label: STANDARD_SECTION_LABELS.warning[lang],
      items: raw.warningSigns.filter((s: unknown): s is string => typeof s === "string"),
    });
  }
  if (Array.isArray(raw?.escalation) && raw.escalation.length > 0) {
    out.push({
      id: `migrated-whenToCall-${lang}`,
      type: "whenToCall",
      label: STANDARD_SECTION_LABELS.whenToCall[lang],
      items: raw.escalation.filter((s: unknown): s is string => typeof s === "string"),
    });
  }
  return out;
}

/** Sanitise a v4 ContentSet payload, ensuring sections always have valid
 *  shape (id, type, label, items[]). */
function normaliseSections(raw: any, lang: "en" | "mr"): Section[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s: any) => s && typeof s === "object" && typeof s.type === "string")
    .map((s: any, i: number) => {
      const type: SectionType =
        s.type === "summary" || s.type === "warning" || s.type === "whenToCall"
          ? s.type
          : "custom";
      const section: Section = {
        id: typeof s.id === "string" && s.id ? s.id : `restored-${i}-${lang}`,
        type,
        label: typeof s.label === "string" ? s.label : defaultLabelFor(type, lang),
        items: Array.isArray(s.items) ? s.items.filter((it: unknown): it is string => typeof it === "string") : [],
      };
      if (type === "custom") {
        section.emphasis = s.emphasis === "highlight" ? "highlight" : "normal";
        section.format = s.format === "paragraph" ? "paragraph" : "bullets";
      }
      return section;
    });
}

function liftContentSet(raw: any, lang: "en" | "mr"): ContentSet {
  if (!raw || typeof raw !== "object") return { ...EMPTY_CONTENT };
  const sections = Array.isArray(raw.sections)
    ? normaliseSections(raw.sections, lang)
    : liftFlatToSections(raw, lang);
  return {
    title: typeof raw.title === "string" ? raw.title : "",
    body: typeof raw.body === "string" ? raw.body : "",
    sections,
    coverImageUrl: typeof raw.coverImageUrl === "string" ? raw.coverImageUrl : null,
    coverImagePosition: typeof raw.coverImagePosition === "string" ? raw.coverImagePosition : null,
  };
}

/**
 * Lift legacy persisted shapes (v1 flat, v2 bilingual-flat, v3 flat-with-
 * conditionGroups) into v4 sections. Called from the hydration effect when
 * the stored shape doesn't match the current version.
 */
function migrateLegacyDraft(raw: any): BroadcastDraft {
  // Detect the unedited demo summer-seed draft (v3 and v4 both shipped
  // with "How to care for your dog in the summer" / slug "summer-dog-care").
  // When found, treat it as "no real draft" and reset to the empty
  // DEFAULT_DRAFT — the 2026-05-15 lock says New broadcast lands on a blank
  // composer. Real WIP drafts (different title/slug) are preserved.
  const isUneditedSummerSeed =
    raw && typeof raw === "object" &&
    (raw.slug === "summer-dog-care") &&
    raw.en?.title === "How to care for your dog in the summer";

  // v4 (forward-compat / partial-fill).
  if (
    raw && typeof raw === "object" &&
    Array.isArray(raw.conditionGroups) &&
    raw.en && Array.isArray(raw.en.sections)
  ) {
    if (isUneditedSummerSeed) return DEFAULT_DRAFT;
    return {
      ...DEFAULT_DRAFT,
      ...raw,
      en: liftContentSet(raw.en, "en"),
      mr: liftContentSet(raw.mr, "mr"),
      autofillMrAfterSend: raw.autofillMrAfterSend ?? DEFAULT_DRAFT.autofillMrAfterSend,
      lastAutosaveAt: typeof raw.lastAutosaveAt === "number" ? raw.lastAutosaveAt : 0,
    };
  }
  // v3: condition-groups + flat summary/warning/escalation per language.
  if (
    raw && typeof raw === "object" &&
    Array.isArray(raw.conditionGroups) &&
    "en" in raw && "mr" in raw
  ) {
    if (isUneditedSummerSeed) return DEFAULT_DRAFT;
    return {
      ...DEFAULT_DRAFT,
      ...raw,
      en: liftContentSet(raw.en, "en"),
      mr: liftContentSet(raw.mr, "mr"),
      autofillMrAfterSend: raw.autofillMrAfterSend ?? DEFAULT_DRAFT.autofillMrAfterSend,
      lastAutosaveAt: typeof raw.lastAutosaveAt === "number" ? raw.lastAutosaveAt : 0,
    };
  }
  // v2: bilingual content + flat filter (+ optional B group).
  if (raw && typeof raw === "object" && "en" in raw && "mr" in raw) {
    const groups: ConditionGroup[] = [];
    if (raw.audienceFilter) {
      groups.push({
        id: "migrated-group-a",
        conditions: legacyFilterToConditions(raw.audienceFilter),
        op: "AND",
      });
    }
    if (raw.audienceFilterGroupB) {
      groups.push({
        id: "migrated-group-b",
        conditions: legacyFilterToConditions(raw.audienceFilterGroupB),
        op: "AND",
      });
    }
    return {
      ...DEFAULT_DRAFT,
      en: liftContentSet(raw.en, "en"),
      mr: liftContentSet(raw.mr, "mr"),
      language: raw.language === "mr" ? "mr" : "en",
      slug: typeof raw.slug === "string" ? raw.slug : DEFAULT_DRAFT.slug,
      conditionGroups: groups.length > 0 ? groups : DEFAULT_DRAFT.conditionGroups,
      autofillMrAfterSend: DEFAULT_DRAFT.autofillMrAfterSend,
      reviewedEn: false,
      reviewedMr: false,
      lastAutosaveAt: 0,
    };
  }
  // v1: pre-bilingual flat shape (title/body/summary at root + language).
  if (raw && typeof raw === "object" && "title" in raw) {
    const legacyLang = raw.language === "mr" ? "mr" : "en";
    const legacySet = liftContentSet(raw, legacyLang);
    return {
      ...DEFAULT_DRAFT,
      [legacyLang]: legacySet,
      language: legacyLang,
      slug: raw.slug ?? DEFAULT_DRAFT.slug,
      conditionGroups: raw.audienceFilter
        ? [
            {
              id: "migrated-group-a",
              conditions: legacyFilterToConditions(raw.audienceFilter),
              op: "AND",
            },
          ]
        : DEFAULT_DRAFT.conditionGroups,
      reviewedEn: false,
      reviewedMr: false,
      lastAutosaveAt: 0,
    };
  }
  return DEFAULT_DRAFT;
}

/** Map the v2 flat audience-filter shape onto v3 conditions. */
function legacyFilterToConditions(filter: any): Condition[] {
  const conds: Condition[] = [];
  if (filter && (filter.species === "dog" || filter.species === "cat" || filter.species === "both")) {
    conds.push({ field: "species", op: "is", value: filter.species });
  }
  if (filter && (typeof filter.ageMin === "number" || typeof filter.ageMax === "number")) {
    conds.push({
      field: "ageRange",
      op: "is",
      value: { min: filter.ageMin ?? 0, max: filter.ageMax ?? 30 },
    });
  }
  if (filter && typeof filter.excludeDeceased === "boolean") {
    conds.push({
      field: "deceased",
      op: "is",
      value: filter.excludeDeceased ? "exclude" : "include",
    });
  }
  // legacy shape had no last-visit; default to "any" so behavior is preserved.
  if (conds.length > 0) {
    conds.push({ field: "lastVisit", op: "within", value: "any" });
  }
  return conds;
}

// ============================================================================
// Hook
// ============================================================================

export function useBroadcastDraft(initialDraft?: BroadcastDraft | null) {
  const [draft, setDraft] = useState<BroadcastDraft>(initialDraft ?? DEFAULT_DRAFT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // When the page passes a server-fetched draft (e.g. /broadcasts/new
    // with ?draftId=...), use it as the source of truth. Overwrite any
    // localStorage state because the explicit "Resume draft" click is the
    // user's intent — they want THAT draft's content, not whatever's in
    // the browser slot.
    if (initialDraft) {
      setDraft(initialDraft);
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...initialDraft, __version: STORAGE_VERSION })
        );
      } catch {
        // Intentionally swallowed (tech-debt F028 audited 2026-05-18):
        // private-browsing / quota errors. Server-fetched draft is in
        // React state regardless; localStorage is just the persistence
        // cache for refresh-survival.
      }
      setHydrated(true);
      return;
    }
    // Otherwise hydrate from localStorage as before.
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredDraft = JSON.parse(stored);
        if (
          parsed.__version === STORAGE_VERSION &&
          Array.isArray(parsed.conditionGroups) &&
          parsed.en && Array.isArray((parsed.en as any).sections) &&
          parsed.mr && Array.isArray((parsed.mr as any).sections)
        ) {
          // Spread DEFAULT_DRAFT to default any fields added since this
          // browser's last save (e.g. serverDraftId from 2026-05-18 autosave
          // work). Stored values take precedence; defaults fill missing keys.
          setDraft({ ...DEFAULT_DRAFT, ...parsed });
        } else {
          const migrated = migrateLegacyDraft(parsed);
          setDraft(migrated);
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ ...migrated, __version: STORAGE_VERSION })
          );
        }
      }
    } catch {
      // corrupt storage — leave defaults
    }
    setHydrated(true);
  }, [initialDraft]);

  /** Persist + stamp `lastAutosaveAt` so the autosave label updates. */
  const persist = (next: BroadcastDraft) => {
    const stamped: BroadcastDraft = { ...next, lastAutosaveAt: Date.now() };
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...stamped, __version: STORAGE_VERSION })
      );
    } catch {
      // Intentionally swallowed (tech-debt F028 audited 2026-05-18):
      // every keystroke calls persist(); failing localStorage shouldn't
      // crash the composer. Server-side autosave is the durable copy.
    }
    return stamped;
  };

  /**
   * Patch the currently-active language's content set. Editing always resets
   * that language's reviewed flag so a re-edit re-requires approval before
   * Send unblocks.
   */
  const updateActiveContent = useCallback((patch: Partial<ContentSet>) => {
    setDraft((prev) => {
      const lang = prev.language;
      const nextContent = { ...prev[lang], ...patch };
      const next: BroadcastDraft = {
        ...prev,
        [lang]: nextContent,
        ...(lang === "en" ? { reviewedEn: false } : { reviewedMr: false }),
      };
      return persist(next);
    });
  }, []);

  /** Patch any draft-level field (slug, language, reviewed flags, autofill, etc). */
  const updateDraft = useCallback((patch: Partial<BroadcastDraft>) => {
    setDraft((prev) => persist({ ...prev, ...patch }));
  }, []);

  /** Replace one language's content set wholesale (auto-translate + universal-mic sectioning). */
  const replaceLanguageContent = useCallback(
    (lang: "en" | "mr", content: ContentSet) => {
      setDraft((prev) => {
        const next: BroadcastDraft = {
          ...prev,
          [lang]: content,
          ...(lang === "en" ? { reviewedEn: false } : { reviewedMr: false }),
        };
        return persist(next);
      });
    },
    []
  );

  const setReviewed = useCallback((lang: "en" | "mr", value: boolean) => {
    setDraft((prev) =>
      persist({
        ...prev,
        ...(lang === "en" ? { reviewedEn: value } : { reviewedMr: value }),
      })
    );
  }, []);

  /** Cover image is shared across both languages (locked 2026-05-18 v5).
   *  Uploading on either tab writes to BOTH `en` and `mr` so the vet doesn't
   *  have to re-upload after switching languages. The Send confirm + parent
   *  app reader already treat the cover as a single asset; this just makes
   *  the source of truth consistent across the composer. */
  const setCoverImage = useCallback((url: string | null) => {
    setDraft((prev) => {
      const next: BroadcastDraft = {
        ...prev,
        en: {
          ...prev.en,
          coverImageUrl: url,
          // Reset position when the image changes or is removed.
          coverImagePosition: url ? prev.en.coverImagePosition : null,
        },
        mr: {
          ...prev.mr,
          coverImageUrl: url,
          coverImagePosition: url ? prev.mr.coverImagePosition : null,
        },
        // Both languages' content changed; both reviewed flags reset.
        reviewedEn: false,
        reviewedMr: false,
      };
      return persist(next);
    });
  }, []);

  /** Persist the cover image's `object-position` value (drag-to-reposition).
   *  Synced across both languages so the crop matches on both tabs +
   *  parent-app preview. */
  const setCoverImagePosition = useCallback((position: string | null) => {
    setDraft((prev) => {
      const next: BroadcastDraft = {
        ...prev,
        en: { ...prev.en, coverImagePosition: position },
        mr: { ...prev.mr, coverImagePosition: position },
        reviewedEn: false,
        reviewedMr: false,
      };
      return persist(next);
    });
  }, []);

  // -------- condition-groups mutators --------

  const setConditionGroups = useCallback((groups: ConditionGroup[]) => {
    setDraft((prev) => persist({ ...prev, conditionGroups: groups }));
  }, []);

  const addConditionGroup = useCallback(() => {
    setDraft((prev) =>
      persist({
        ...prev,
        conditionGroups: [
          ...prev.conditionGroups,
          { id: newGroupId(), conditions: [...DEFAULT_GROUP_CONDITIONS], op: "AND" },
        ],
      })
    );
  }, []);

  const removeConditionGroup = useCallback((groupId: string) => {
    setDraft((prev) =>
      persist({
        ...prev,
        conditionGroups: prev.conditionGroups.filter((g) => g.id !== groupId),
      })
    );
  }, []);

  /** Patch one condition inside a group. Identifies the condition by field name. */
  const updateCondition = useCallback(
    (groupId: string, field: ConditionField, value: Condition["value"]) => {
      setDraft((prev) =>
        persist({
          ...prev,
          conditionGroups: prev.conditionGroups.map((g) =>
            g.id !== groupId
              ? g
              : {
                  ...g,
                  conditions: g.conditions.map((c) =>
                    c.field === field ? ({ ...c, value } as Condition) : c
                  ),
                },
          ),
        })
      );
    },
    []
  );

  /** Add a condition to a group (used when the group is missing one of the 4 standard fields). */
  const addCondition = useCallback(
    (groupId: string, condition: Condition) => {
      setDraft((prev) =>
        persist({
          ...prev,
          conditionGroups: prev.conditionGroups.map((g) =>
            g.id !== groupId
              ? g
              : { ...g, conditions: [...g.conditions, condition] }
          ),
        })
      );
    },
    []
  );

  /** Remove a condition by field name. Group becomes a no-op filter if it has zero conditions. */
  const removeCondition = useCallback(
    (groupId: string, field: ConditionField) => {
      setDraft((prev) =>
        persist({
          ...prev,
          conditionGroups: prev.conditionGroups.map((g) =>
            g.id !== groupId
              ? g
              : { ...g, conditions: g.conditions.filter((c) => c.field !== field) }
          ),
        })
      );
    },
    []
  );

  // -------- sections mutators (operate on the active language) --------

  /** Patch the active language's section list. Editing always resets that
   *  language's reviewed flag so re-edits re-require approval before Send. */
  const setActiveSections = useCallback((sections: Section[]) => {
    setDraft((prev) => {
      const lang = prev.language;
      const next: BroadcastDraft = {
        ...prev,
        [lang]: { ...prev[lang], sections },
        ...(lang === "en" ? { reviewedEn: false } : { reviewedMr: false }),
      };
      return persist(next);
    });
  }, []);

  /** Append a fresh section of the given type to the active language. */
  const addSection = useCallback(
    (type: SectionType, label?: string) => {
      setDraft((prev) => {
        const lang = prev.language;
        const fresh = makeSection(type, lang);
        if (label) fresh.label = label;
        const next: BroadcastDraft = {
          ...prev,
          [lang]: { ...prev[lang], sections: [...prev[lang].sections, fresh] },
          ...(lang === "en" ? { reviewedEn: false } : { reviewedMr: false }),
        };
        return persist(next);
      });
    },
    []
  );

  /** Drop the section with the given id from the active language. */
  const removeSection = useCallback((id: string) => {
    setDraft((prev) => {
      const lang = prev.language;
      const next: BroadcastDraft = {
        ...prev,
        [lang]: {
          ...prev[lang],
          sections: prev[lang].sections.filter((s) => s.id !== id),
        },
        ...(lang === "en" ? { reviewedEn: false } : { reviewedMr: false }),
      };
      return persist(next);
    });
  }, []);

  /** Patch one section (label / items / emphasis / format) by id. */
  const updateSection = useCallback(
    (id: string, patch: Partial<Pick<Section, "label" | "items" | "emphasis" | "format">>) => {
      setDraft((prev) => {
        const lang = prev.language;
        const next: BroadcastDraft = {
          ...prev,
          [lang]: {
            ...prev[lang],
            sections: prev[lang].sections.map((s) =>
              s.id !== id ? s : { ...s, ...patch }
            ),
          },
          ...(lang === "en" ? { reviewedEn: false } : { reviewedMr: false }),
        };
        return persist(next);
      });
    },
    []
  );

  /** Move a section up (toward index 0) or down (toward last). No-ops at edges. */
  const moveSection = useCallback((id: string, direction: "up" | "down") => {
    setDraft((prev) => {
      const lang = prev.language;
      const sections = [...prev[lang].sections];
      const idx = sections.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const swapWith = direction === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= sections.length) return prev;
      const tmp = sections[idx]!;
      sections[idx] = sections[swapWith]!;
      sections[swapWith] = tmp;
      const next: BroadcastDraft = {
        ...prev,
        [lang]: { ...prev[lang], sections },
        ...(lang === "en" ? { reviewedEn: false } : { reviewedMr: false }),
      };
      return persist(next);
    });
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(DEFAULT_DRAFT);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Intentionally swallowed (tech-debt F028 audited 2026-05-18):
      // private-browsing / disabled-storage. In-memory reset still fires.
    }
  }, []);

  return {
    draft,
    hydrated,
    activeContent: draft[draft.language],
    // language + content
    updateActiveContent,
    updateDraft,
    replaceLanguageContent,
    setReviewed,
    setCoverImage,
    setCoverImagePosition,
    // sections
    setActiveSections,
    addSection,
    removeSection,
    updateSection,
    moveSection,
    // audience
    setConditionGroups,
    addConditionGroup,
    removeConditionGroup,
    updateCondition,
    addCondition,
    removeCondition,
    // misc
    resetDraft,
  };
}

// ============================================================================
// Public helpers (consumed by server actions + audience-modal previews)
// ============================================================================

/** Convenience accessor for a known field's value inside a group, or undefined
 *  if absent. Runtime safety is guaranteed by the field-name match on the
 *  discriminant; TS can't infer the narrowing through the generic so the
 *  return type is asserted via `any`. */
export function readCondition<F extends ConditionField>(
  group: ConditionGroup,
  field: F
): Extract<Condition, { field: F }>["value"] | undefined {
  const c = group.conditions.find((c) => c.field === field);
  // Discriminant narrowing (`c.field === field`) is correct at runtime but
  // TS can't infer it through the generic, so cast via `any`. The
  // `@typescript-eslint/no-explicit-any` rule is not loaded under the
  // current `next/core-web-vitals` config, so no disable comment is needed.
  // eslint-disable-next-line
  return c?.value as any;
}
