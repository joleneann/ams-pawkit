"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";
import type {
  ConditionGroup,
  ContentSet,
  LastVisitWindow,
  SpeciesValue,
} from "./draft-state";

/**
 * Vet profile snapshot used by the phone-preview byline (avatar + name).
 * Re-reads on each call so a freshly uploaded avatar shows up after the
 * Settings save without a page reload of the compose flow.
 */
export async function getVetProfileAction(): Promise<{
  fullName: string;
  shortName: string;
  initials: string;
  avatarUrl: string | null;
}> {
  const { data } = await supabaseServer
    .from("users")
    .select("full_name, avatar_url")
    .eq("role", "vet")
    .limit(1)
    .single();
  const fullName = data?.full_name ?? "Dr Sagar Bhongale";
  // Initials: take the last two name tokens' first letters; "Dr Sagar Bhongale" -> "SB"
  const tokens = fullName.replace(/^Dr\.?\s+/i, "").split(/\s+/).filter(Boolean);
  const initials = tokens
    .slice(-2)
    .map((tok: string) => tok[0]?.toUpperCase())
    .join("");
  return {
    fullName,
    shortName: tokens[0] ? `Dr ${tokens[0]}` : "Dr Sagar",
    initials: initials || "SB",
    avatarUrl: data?.avatar_url ?? null,
  };
}

// ============================================================================
// Audience resolution (condition-groups model v3, 2026-05-15)
// ============================================================================

function petAge(birthday: string | null, ageYearsAtEntry: number | null): number | null {
  if (birthday) {
    const ms = Date.now() - new Date(birthday).getTime();
    if (Number.isFinite(ms) && ms >= 0) {
      return ms / (1000 * 60 * 60 * 24 * 365.25);
    }
  }
  if (typeof ageYearsAtEntry === "number") return ageYearsAtEntry;
  return null;
}

/** Set of pet_ids that have any visit on or after the cutoff for the window.
 *  Returns `null` sentinel for "any" — caller skips the filter entirely.
 *  Pets with zero visits are never in the returned set, so they're excluded
 *  from any non-"any" Last visit filter.
 */
async function petsWithVisitInWindow(window: LastVisitWindow): Promise<Set<string> | null> {
  if (window === "any") return null;
  const months = window === "3m" ? 3 : window === "12m" ? 12 : 24;
  const cutoffMs = Date.now() - months * 30 * 24 * 60 * 60 * 1000;
  const cutoff = new Date(cutoffMs).toISOString().slice(0, 10);
  const { data } = await supabaseServer
    .from("visits")
    .select("pet_id")
    .gte("visit_date", cutoff)
    .limit(5000); // generous; demo has ~780 visits, would need a true bump if real-clinic scale hits this
  return new Set((data ?? []).map((v: any) => v.pet_id));
}

/** Pull the condition out of a group by field name. Returns `undefined` if
 *  absent (caller treats absent = no filter on that axis). */
function pickCondition(group: ConditionGroup, field: string) {
  return group.conditions.find((c) => c.field === field);
}

type PetRow = {
  id: string;
  household_id: string;
  name: string;
  species: "dog" | "cat";
};

/**
 * Resolve one condition group to a set of matching pets. Conditions are
 * AND-joined within the group. Absent conditions mean "no filter on that axis"
 * (e.g. a group with only `species=dog` matches every dog regardless of age).
 */
async function petsMatchingGroup(group: ConditionGroup): Promise<PetRow[]> {
  const speciesCond = pickCondition(group, "species") as
    | { field: "species"; op: "is"; value: SpeciesValue }
    | undefined;
  const ageCond = pickCondition(group, "ageRange") as
    | { field: "ageRange"; op: "is"; value: { min: number; max: number } }
    | undefined;
  const deceasedCond = pickCondition(group, "deceased") as
    | { field: "deceased"; op: "is"; value: "include" | "exclude" }
    | undefined;
  const lastVisitCond = pickCondition(group, "lastVisit") as
    | { field: "lastVisit"; op: "within"; value: LastVisitWindow }
    | undefined;

  let q = supabaseServer
    .from("pets")
    .select("id, household_id, name, species, birthday, age_years_at_entry, deceased")
    .limit(2000);

  if (speciesCond && speciesCond.value !== "both") {
    q = q.eq("species", speciesCond.value);
  }
  if (deceasedCond && deceasedCond.value === "exclude") {
    q = q.eq("deceased", false);
  }

  const { data } = await q;
  if (!data) return [];

  // Last visit prefilter — if present and not "any", restrict to pets with at
  // least one visit in the window. Run in parallel with the pets query above
  // would be cleaner, but the set lookup downstream is cheap enough.
  const visitSet = lastVisitCond
    ? await petsWithVisitInWindow(lastVisitCond.value)
    : null;

  // Age filter behaviour preserved from v2: pets with no known age get included
  // when the range is wide open (0-30y), otherwise included unconditionally
  // because the demo data has many pets without precise birthdays and silently
  // dropping them would tank the count.
  const ageMin = ageCond?.value.min ?? 0;
  const ageMax = ageCond?.value.max ?? 30;
  const rangeIsWideOpen = ageMin <= 0 && ageMax >= 30;

  return data
    .filter((p: any) => {
      if (visitSet && !visitSet.has(p.id)) return false;
      if (!ageCond) return true;
      if (rangeIsWideOpen) return true;
      const age = petAge(p.birthday, p.age_years_at_entry);
      if (age === null) return true;
      return age >= ageMin && age <= ageMax;
    })
    .map((p: any) => ({
      id: p.id,
      household_id: p.household_id,
      name: p.name,
      species: p.species,
    }));
}

export type AudienceSamplePet = {
  id: string;
  name: string;
  species: "dog" | "cat";
};

export type AudienceCountResult = {
  pets: number;
  households: number;
  /** Percentage of the relevant parent population this audience reaches. The
   *  population is implied by `pctScope`:
   *    - "dog"  → denominator = all dog-owning households
   *    - "cat"  → denominator = all cat-owning households
   *    - "all"  → denominator = all households with any non-deceased pet
   *  Locked 2026-05-15 evening (was always "% of dog parents" regardless of
   *  the species filter, which read as a bug when the vet picked cats only). */
  pctOfParents: number;
  pctScope: "dog" | "cat" | "all";
  /** First N matching pets (capped at 8) used for the sample-row in the audience
   *  strip + the "for [Pet]" pill in the mobile preview overlay. */
  samplePets: AudienceSamplePet[];
};

/**
 * Live audience count for a list of condition groups. Groups are OR-unioned;
 * within a group, conditions are AND-joined. Pets matched by multiple groups
 * count once.
 *
 * Empty `groups` array → returns 0 (locked 2026-05-15). The composer treats
 * "no audience selected" as a literal 0, not a "send to everyone" default,
 * so the vet must explicitly add a condition group via the Custom... modal
 * before Send becomes available. If the vet wants to send to all parents,
 * they create a group with no constraining conditions (wide-open match).
 */
export async function getAudienceCountAction(
  groups: ConditionGroup[]
): Promise<AudienceCountResult> {
  if (groups.length === 0) {
    return { pets: 0, households: 0, pctOfParents: 0, pctScope: "all", samplePets: [] };
  }
  const perGroup = await Promise.all(groups.map(petsMatchingGroup));
  const byId = new Map<string, PetRow>();
  for (const groupPets of perGroup) {
    for (const p of groupPets) byId.set(p.id, p);
  }
  const allPets: PetRow[] = [...byId.values()];

  const householdIds = new Set(allPets.map((p) => p.household_id));

  // Scope = the species shape of the resolved audience. All-dogs → compare
  // against the dog-parent population; all-cats → cat-parent population;
  // mixed → all-parent population. Locked 2026-05-15 evening (replaces the
  // older "% of dog parents" that was hard-coded regardless of filter).
  const audienceSpecies = new Set(allPets.map((p) => p.species));
  const pctScope: "dog" | "cat" | "all" =
    audienceSpecies.size === 1 && audienceSpecies.has("dog")
      ? "dog"
      : audienceSpecies.size === 1 && audienceSpecies.has("cat")
        ? "cat"
        : "all";

  let pctOfParents = 0;
  if (allPets.length > 0) {
    let q = supabaseServer
      .from("pets")
      .select("household_id")
      .eq("deceased", false)
      .limit(5000);
    if (pctScope === "dog") q = q.eq("species", "dog");
    else if (pctScope === "cat") q = q.eq("species", "cat");
    const { data: denominatorPets } = await q;
    const denominator = new Set(
      (denominatorPets ?? []).map((p: any) => p.household_id)
    ).size;
    if (denominator > 0) {
      const numerator =
        pctScope === "all"
          ? householdIds.size
          : new Set(
              allPets
                .filter((p) => p.species === pctScope)
                .map((p) => p.household_id)
            ).size;
      pctOfParents = Math.round((numerator / denominator) * 100);
    }
  }

  // Sample pets: first 8 by db order (stable enough for the preview pet-name pill).
  const samplePets: AudienceSamplePet[] = allPets.slice(0, 8).map((p) => ({
    id: p.id,
    name: p.name,
    species: p.species,
  }));

  return {
    pets: allPets.length,
    households: householdIds.size,
    pctOfParents,
    pctScope,
    samplePets,
  };
}

// ============================================================================
// Cover photo upload (broadcast-covers bucket reuse, locked 2026-05-15)
// ============================================================================

/**
 * Upload a cover image to the existing `broadcast-covers` bucket under
 * `broadcasts/<slug>-<timestamp>.<ext>`. Returns the public URL.
 *
 * Mirrors `uploadClinicLogoAction()` in settings/actions.ts — same bucket,
 * different key prefix.
 */
export async function uploadBroadcastCoverAction(
  formData: FormData
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const file = formData.get("file");
  const slug = (formData.get("slug") as string | null) ?? "draft";
  if (!(file instanceof File)) {
    return { ok: false, error: "No file in form data" };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { ok: false, error: "Cover image must be under 8 MB" };
  }
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const safeSlug = slug.replace(/[^a-z0-9-]+/gi, "-").toLowerCase().slice(0, 60) || "draft";
  const path = `broadcasts/${safeSlug}-${Date.now()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error: uploadErr } = await supabaseServer.storage
    .from("broadcast-covers")
    .upload(path, buf, {
      contentType: file.type || `image/${ext}`,
      upsert: true,
    });
  if (uploadErr) return { ok: false, error: uploadErr.message };
  const { data } = supabaseServer.storage.from("broadcast-covers").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

// ============================================================================
// Duplicate a sent broadcast as a new draft (locked 2026-05-15).
//
// Reuse > edit-after-send: sent comms are immutable in Pawkit (parents
// already received the notification, cached the detail page; "edit-then-
// re-notify" is a v1+ scope expansion). Instead, the vet clones any sent
// broadcast — gets a new row with `sent_at = NULL`, identical content +
// audience filter + cover, and lands in the composer to edit + resend.
// Original sent row is untouched.
// ============================================================================

export async function duplicateBroadcastAsDraftAction(
  broadcastId: string
): Promise<{ ok: true; newDraftId: string } | { ok: false; error: string }> {
  if (!broadcastId || typeof broadcastId !== "string") {
    return { ok: false, error: "Missing broadcast id" };
  }
  // Read the source row (any broadcast — sent or draft). The clone is
  // always a draft, regardless of the source's sent_at status.
  const { data: src, error: readErr } = await supabaseServer
    .from("broadcasts")
    .select(
      "clinic_id, vet_id, topic_en, topic_mr, composed_message_text_en, composed_message_text_mr, audience_filter, audience_count, cover_image_url"
    )
    .eq("id", broadcastId)
    .maybeSingle();
  if (readErr || !src) {
    return { ok: false, error: readErr?.message ?? "Source broadcast not found" };
  }
  const { data: inserted, error: insertErr } = await supabaseServer
    .from("broadcasts")
    .insert({
      clinic_id: src.clinic_id,
      vet_id: src.vet_id,
      topic_en: src.topic_en,
      topic_mr: src.topic_mr,
      composed_message_text_en: src.composed_message_text_en,
      composed_message_text_mr: src.composed_message_text_mr,
      audience_filter: src.audience_filter,
      audience_count: src.audience_count,
      cover_image_url: src.cover_image_url,
      sent_at: null,
    })
    .select("id")
    .single();
  if (insertErr || !inserted) {
    return { ok: false, error: insertErr?.message ?? "Could not create draft" };
  }
  revalidatePath("/broadcasts");
  return { ok: true, newDraftId: inserted.id };
}

// ============================================================================
// Delete a draft (locked 2026-05-15: drafts can be removed; sent broadcasts
// cannot — the `.is("sent_at", null)` clause is a safety belt so this action
// can never accidentally nuke a published row.)
// ============================================================================

export async function deleteBroadcastDraftAction(
  broadcastId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!broadcastId || typeof broadcastId !== "string") {
    return { ok: false, error: "Missing broadcast id" };
  }
  const { error } = await supabaseServer
    .from("broadcasts")
    .delete()
    .eq("id", broadcastId)
    .is("sent_at", null);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/broadcasts");
  return { ok: true };
}

// ============================================================================
// Publish (bilingual hard publish-block enforced server-side)
// ============================================================================

/**
 * Publish a broadcast with bilingual content (EN + MR both required per the
 * locked publish-block). Inserts a row in `broadcasts` with `sent_at = now`,
 * both topic columns + both composed_message_text columns populated, the
 * combined condition-groups filter, the computed audience count, and the
 * optional cover image URL.
 *
 * Caller (the Send confirm modal) wraps this in a client-side 15s setTimeout
 * to honour the locked undo window. The server action only fires once the
 * timer expires.
 */
export async function publishBroadcastAction(payload: {
  en: ContentSet;
  mr: ContentSet;
  conditionGroups: ConditionGroup[];
}): Promise<{ ok: true; broadcastId: string } | { ok: false; error: string }> {
  // Single-language publish allowed (locked 2026-05-18 v3 — bilingual hard
  // gate removed per user feedback). At least one of EN or MR must have
  // title + body. Parents whose preferred language is empty won't see this
  // broadcast in their inbox; that's surfaced in the confirm modal as a
  // non-blocking warning.
  const enReady = !!payload.en.title.trim() && !!payload.en.body.trim();
  const mrReady = !!payload.mr.title.trim() && !!payload.mr.body.trim();
  if (!enReady && !mrReady) {
    return {
      ok: false,
      error: "Add either an English or Marathi title + body before sending.",
    };
  }

  const { data: vet } = await supabaseServer
    .from("users")
    .select("id, clinic_id")
    .eq("role", "vet")
    .limit(1)
    .single();
  if (!vet) return { ok: false, error: "No vet user in DB" };

  const audienceCount = await getAudienceCountAction(payload.conditionGroups);

  // Cover image URL: en.coverImageUrl is canonical (the upload sets it on the
  // active language at upload time; in practice both EN and MR share the same
  // cover, but mr.coverImageUrl falls back to en if not set explicitly).
  const coverImageUrl =
    payload.en.coverImageUrl ?? payload.mr.coverImageUrl ?? null;

  const nowIso = new Date().toISOString();
  // v4 storage shape (locked 2026-05-15 sections rebuild):
  // composed_message_text_<lang> stores { body, sections: [{ type, label, items }] }.
  // `getBroadcastById()` in lib/data.ts knows how to read this and lifts the
  // legacy `summary/warningSigns/escalation` arrays for older rows.
  const { data, error } = await supabaseServer
    .from("broadcasts")
    .insert({
      clinic_id: vet.clinic_id,
      vet_id: vet.id,
      topic_en: payload.en.title,
      topic_mr: payload.mr.title,
      composed_message_text_en: JSON.stringify({
        body: payload.en.body,
        sections: payload.en.sections,
        coverImagePosition: payload.en.coverImagePosition,
      }),
      composed_message_text_mr: JSON.stringify({
        body: payload.mr.body,
        sections: payload.mr.sections,
        coverImagePosition: payload.mr.coverImagePosition,
      }),
      audience_filter: { conditionGroups: payload.conditionGroups } as any,
      audience_count: audienceCount.pets,
      cover_image_url: coverImageUrl,
      sent_at: nowIso,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Insert failed" };
  revalidatePath("/broadcasts");
  return { ok: true, broadcastId: data.id };
}

// ============================================================================
// Save draft (server autosave, locked 2026-05-18)
//
// Called from the composer's debounced autosave effect AND from the manual
// "Save draft" button. Behaviour:
//   - `draftId == null` → INSERT a new row with `sent_at = NULL`. Returns
//     the new draftId so the client can stash it for subsequent autosaves.
//   - `draftId != null` → UPDATE that row, guarded by `.is("sent_at", null)`
//     so we can never overwrite an already-published broadcast. If the
//     guard misses (sent_at is now set, or the row was deleted), returns
//     an error and the client falls back to creating a new draft.
//
// Note: this is intentionally permissive about empty content (no title-
// required guard). Drafts are work-in-progress; the publish path is the
// real gatekeeper. The composer's autosave effect adds its own "has any
// content" gate so we don't INSERT empty rows on a freshly mounted
// composer with no edits yet.
// ============================================================================

export async function saveBroadcastDraftAction(payload: {
  draftId: string | null;
  en: ContentSet;
  mr: ContentSet;
  conditionGroups: ConditionGroup[];
}): Promise<{ ok: true; draftId: string } | { ok: false; error: string }> {
  const { data: vet } = await supabaseServer
    .from("users")
    .select("id, clinic_id")
    .eq("role", "vet")
    .limit(1)
    .single();
  if (!vet) return { ok: false, error: "No vet user in DB" };

  // Audience count: 0 when no groups (matches publish behaviour); otherwise
  // resolve live so drafts persist a meaningful number for the drafts list.
  const audienceCount =
    payload.conditionGroups.length === 0
      ? 0
      : (await getAudienceCountAction(payload.conditionGroups)).pets;

  const coverImageUrl =
    payload.en.coverImageUrl ?? payload.mr.coverImageUrl ?? null;

  const row = {
    clinic_id: vet.clinic_id,
    vet_id: vet.id,
    topic_en: payload.en.title,
    topic_mr: payload.mr.title,
    composed_message_text_en: JSON.stringify({
      body: payload.en.body,
      sections: payload.en.sections,
      coverImagePosition: payload.en.coverImagePosition,
    }),
    composed_message_text_mr: JSON.stringify({
      body: payload.mr.body,
      sections: payload.mr.sections,
      coverImagePosition: payload.mr.coverImagePosition,
    }),
    audience_filter: { conditionGroups: payload.conditionGroups } as any,
    audience_count: audienceCount,
    cover_image_url: coverImageUrl,
    sent_at: null,
  };

  if (payload.draftId) {
    const { data, error } = await supabaseServer
      .from("broadcasts")
      .update(row)
      .eq("id", payload.draftId)
      .is("sent_at", null)
      .select("id")
      .single();
    if (error || !data) {
      return {
        ok: false,
        error:
          error?.message ??
          "Could not update draft (it may have been published or deleted)",
      };
    }
    revalidatePath("/broadcasts");
    return { ok: true, draftId: data.id };
  }

  const { data, error } = await supabaseServer
    .from("broadcasts")
    .insert(row)
    .select("id")
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not create draft" };
  }
  revalidatePath("/broadcasts");
  return { ok: true, draftId: data.id };
}
