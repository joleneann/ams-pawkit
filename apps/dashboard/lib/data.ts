import "server-only";
import { supabaseServer } from "./supabase-server";
import type {
  Pet,
  InboxThread,
  Bubble,
  Invoice,
  InvoiceDetail,
  SoapVisit,
  ClinicalVisit,
  FurTone,
  BillingScope,
  BillingStatusFilter,
  BillingRow,
  BillingStats,
} from "./seed";
import { gabbySoapCards, gabbyMay6Invoice, gabbyInvoices, demoBroadcast } from "./seed";

/**
 * Server-only data layer. Wraps Supabase queries and returns seed-compatible
 * shapes so page-level call-sites can swap `import { ... } from "@/lib/seed"`
 * for `import { ... } from "@/lib/data"` with minimal churn.
 *
 * Service-role client bypasses RLS (vet sees the whole clinic). See
 * `lib/supabase-server.ts` for the v0 rationale (no auth in v0).
 */

// ---------- helpers ----------

const FUR_TONES: FurTone[] = [
  "milk", "vanilla", "honey", "peach", "rust",
  "mushroom", "smoke", "steel", "bark", "sable",
];

function toFurTone(raw: string | null | undefined): FurTone {
  if (raw && (FUR_TONES as string[]).includes(raw)) return raw as FurTone;
  return "mushroom"; // safe default
}

/**
 * Demo-anchor constants. The Fernandes household + Gabby are the v0 demo's
 * fixed reference (per `CLAUDE.md` "Anchor: Fernandes household ..."). These
 * names also appear in `supabase/migrations/0004_v0_demo_anon_reads.sql` as
 * RLS scope. Tech-debt plan F022 (2026-05-18).
 */
export const FERNANDES_HOUSEHOLD_NAME = "The Fernandes Family";
export const FERNANDES_DEMO_PET = "Gabby";

/** Check whether a pet row is the Fernandes household's Gabby — used by
 *  multiple getters to gate the seed-fallback fixture path. */
export function isFernandesGabby(
  pet: { name?: string | null; household?: { name?: string | null } } | null | undefined
): boolean {
  return (
    pet?.name === FERNANDES_DEMO_PET &&
    pet?.household?.name === FERNANDES_HOUSEHOLD_NAME
  );
}

/** Detect whether a string contains Devanagari (Marathi) characters. */
function hasDevanagari(text: string | null | undefined): boolean {
  return !!text && /[ऀ-ॿ]/.test(text);
}

/**
 * Strip the DB-stored household name ("The Fernandes Family") down to just
 * the surname ("Fernandes"). The chrome suffix (" household" / " कुटुंब") is
 * appended at the UI layer (via `t("inbox.household.suffix")` on the client
 * or `tServer(...)` on the server) so it can translate alongside the rest of
 * the dashboard chrome.
 */
function householdSurname(rawName: string): string {
  return (
    rawName.replace(/^The\s+/i, "").replace(/\s+Family$/i, "").trim() || rawName
  );
}

function relativeTimestamp(iso: string): string {
  const t = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - t;
  const min = Math.floor(diffMs / 60000);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (day >= 1) return `${day}d ago`;
  if (hr >= 1) return `${hr}h ago`;
  if (min >= 1) return `${min}m ago`;
  return "just now";
}

/**
 * Wall-clock wait duration string for the Awaiting inbox row meta.
 * "1d 4h", "6h", "12m". Locked 2026-05-15 inbox-v2.
 */
function waitDuration(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms <= 0) return "just now";
  const min = Math.floor(ms / 60_000);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const remHr = hr - day * 24;
  if (day >= 1) {
    return remHr > 0 ? `${day}d ${remHr}h` : `${day}d`;
  }
  if (hr >= 1) return `${hr}h`;
  return `${min}m`;
}

function ageDisplay(birthday: string | null, ageYearsAtEntry: number | null): string {
  if (birthday) {
    const ms = Date.now() - new Date(birthday).getTime();
    const years = Math.floor(ms / (1000 * 60 * 60 * 24 * 365.25));
    if (years >= 1) return `${years}y`;
    const months = Math.floor(ms / (1000 * 60 * 60 * 24 * 30.44));
    return `${months}m`;
  }
  if (ageYearsAtEntry != null) return `${ageYearsAtEntry}y`;
  return "—";
}

function weightDisplay(kg: number | null): string | undefined {
  if (kg == null) return undefined;
  return `${kg.toFixed(1)} kg`;
}

function chronicDisplay(conditions: string[] | null): string | undefined {
  if (!conditions || conditions.length === 0) return undefined;
  return conditions.join(" · ");
}

// ---------- pet ----------

type PetRow = {
  id: string;
  household_id: string;
  name: string;
  species: "dog" | "cat";
  breed: string | null;
  sex: "male" | "female" | null;
  birthday: string | null;
  age_years_at_entry: number | null;
  weight_kg: number | null;
  chronic_conditions: string[] | null;
  fur_match_primary: string | null;
  deceased: boolean;
  avatar_url: string | null;
  household?: { name: string } | null;
};

function adaptPet(row: PetRow, householdName?: string): Pet {
  const hh = householdName ?? row.household?.name ?? "household";
  return {
    id: row.id,
    name: row.name,
    household: householdSurname(hh),
    furTone: toFurTone(row.fur_match_primary),
    species: row.species,
    sex: row.sex === "female" ? "F" : "M",
    breed: row.breed ?? "Mixed",
    ageDisplay: ageDisplay(row.birthday, row.age_years_at_entry),
    weightDisplay: weightDisplay(row.weight_kg),
    chronic: chronicDisplay(row.chronic_conditions),
    deceased: row.deceased || undefined,
    photoUrl: row.avatar_url ?? null,
  };
}

export async function getPet(petId: string): Promise<Pet> {
  const { data, error } = await supabaseServer
    .from("pets")
    .select("id, household_id, name, species, breed, sex, birthday, age_years_at_entry, weight_kg, chronic_conditions, fur_match_primary, deceased, avatar_url, household:households(name)")
    .eq("id", petId)
    .single();
  if (error || !data) throw new Error(`pet ${petId} not found: ${error?.message}`);
  const pet = adaptPet(data as unknown as PetRow);
  // Augment with latest visit context (Quick Facts uses these)
  const { data: lastVisit } = await supabaseServer
    .from("visits")
    .select("visit_date, chief_complaint, diagnosis")
    .eq("pet_id", petId)
    .order("visit_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lastVisit) {
    const d = new Date(lastVisit.visit_date);
    pet.lastVisitDate = d.toLocaleDateString("en-IN", { month: "short", day: "numeric", timeZone: "Asia/Kolkata" });
    pet.lastVisitReason = lastVisit.chief_complaint ?? lastVisit.diagnosis ?? undefined;
    pet.weightMonth = pet.lastVisitDate;
  }
  return pet;
}

// ---------- inbox threads ----------

/**
 * One row per active thread. "Active" = follow_up_window is open AND latest
 * message awaits a vet reply OR vet has replied and is monitoring.
 *
 * For v0 demo: "active" subtab returns threads with an open follow_up_window.
 * Oldest unreplied parent message floats to top.
 */
/**
 * Inbox list, scoped to the locked subtab semantics
 * (per `docs/flows/admin.md` and status.md 2026-05-11):
 *
 *   - **active** ("Awaiting reply"): the LATEST PARENT message in the thread
 *     has `replied_at IS NULL` (someone is waiting on Dr Sagar).
 *   - **inactive** ("Replied"): the latest parent message has been replied to,
 *     OR the follow-up window is closed.
 *
 * Sorted oldest-waiting first (longest-waiting parent message floats to top).
 */
export async function getInboxThreads(
  searchQuery?: string,
  status: "active" | "inactive" = "active"
): Promise<InboxThread[]> {
  const { data, error } = await supabaseServer
    .from("messages")
    .select(`
      id, thread_id, sender_type, body, attachment_type, created_at, read_at, replied_at,
      pet:pets!inner(id, household_id, name, species, breed, sex, birthday, age_years_at_entry, weight_kg, chronic_conditions, fur_match_primary, deceased, avatar_url, household:households(name))
    `)
    .order("created_at", { ascending: false });

  if (error || !data) throw new Error(`getInboxThreads: ${error?.message}`);

  // Pull all follow-up windows (open AND closed) so we can flag dates + state.
  const { data: windowsData } = await supabaseServer
    .from("follow_up_windows")
    .select("thread_id, opened_at, closes_at, closed_at");
  const windowByThread = new Map<string, { opened_at: string; closes_at: string; closed_at: string | null }>();
  for (const w of windowsData ?? []) {
    windowByThread.set(w.thread_id, w);
  }

  // Walk messages once (already desc-by-created_at). Track:
  //  - latest message overall (for the row preview/timestamp)
  //  - latest parent message (for replied/unread state + sort key)
  const latestByThread = new Map<string, any>();
  const latestParentByThread = new Map<string, any>();
  for (const m of data) {
    if (!latestByThread.has(m.thread_id)) latestByThread.set(m.thread_id, m);
    if (m.sender_type === "parent" && !latestParentByThread.has(m.thread_id)) {
      latestParentByThread.set(m.thread_id, m);
    }
  }

  // Pull the latest visit per pet so we can render a "case chip" on every
  // Awaiting/Replied row (e.g. "Ear infection check"). Inbox-v2 lock
  // 2026-05-15.
  const petIds = Array.from(
    new Set(Array.from(latestByThread.values()).map((m) => m.pet?.id).filter(Boolean))
  );
  const caseChipByPet = new Map<string, string>();
  if (petIds.length > 0) {
    const { data: visits } = await supabaseServer
      .from("visits")
      .select("pet_id, visit_date, chief_complaint, diagnosis")
      .in("pet_id", petIds)
      .order("visit_date", { ascending: false });
    for (const v of visits ?? []) {
      if (!caseChipByPet.has(v.pet_id)) {
        const label = v.chief_complaint ?? v.diagnosis ?? null;
        if (label) caseChipByPet.set(v.pet_id, label);
      }
    }
  }

  const threads: InboxThread[] = [];
  for (const [threadId, latestMsg] of latestByThread.entries()) {
    const parentMsg = latestParentByThread.get(threadId);
    if (!parentMsg) continue; // thread has no parent messages — skip (system-only threads)
    const w = windowByThread.get(threadId);
    const windowOpen = !!w && !w.closed_at;
    const awaitingReply = !parentMsg.replied_at;

    // Subtab logic:
    //   active  = window open AND parent message has no replied_at
    //   inactive = parent message replied_at IS NOT NULL OR window is closed
    const isActive = windowOpen && awaitingReply;
    if (status === "active" && !isActive) continue;
    if (status === "inactive" && isActive) continue;

    const pet = adaptPet(latestMsg.pet as unknown as PetRow);
    const previewType = latestMsg.attachment_type === "video"
      ? "video"
      : latestMsg.attachment_type === "image"
        ? "photo"
        : "text";
    const previewBody = latestMsg.body ?? "";
    const preview =
      previewType === "video"
        ? "Video"
        : previewType === "photo"
          ? "Photo"
          : previewBody;
    const previewFromVet = latestMsg.sender_type === "vet";

    threads.push({
      id: threadId,
      pet,
      preview,
      previewFromVet,
      previewType,
      timestamp: relativeTimestamp(latestMsg.created_at),
      status: isActive ? "active" : "inactive",
      unreplied: awaitingReply,
      unread: latestMsg.sender_type === "parent" && !latestMsg.read_at,
      windowOpen,
      windowOpenedDate: w
        ? new Date(w.opened_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", timeZone: "Asia/Kolkata" })
        : undefined,
      windowClosesDate: w
        ? new Date(w.closes_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", timeZone: "Asia/Kolkata" })
        : undefined,
      // Inbox-v2 meta (locked 2026-05-15)
      waitDuration: parentMsg.created_at ? waitDuration(parentMsg.created_at) : undefined,
      caseChip: pet.id ? caseChipByPet.get(pet.id) : undefined,
      latestParentAt: parentMsg.created_at,
    });
  }

  // Active sub: oldest-waiting first. Inactive: most-recently-replied first.
  threads.sort((a, b) => {
    const aT = latestParentByThread.get(a.id)?.created_at ?? "";
    const bT = latestParentByThread.get(b.id)?.created_at ?? "";
    return status === "active"
      ? aT.localeCompare(bT)
      : bT.localeCompare(aT);
  });

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    return threads.filter(
      (t) =>
        t.pet.name.toLowerCase().includes(q) ||
        t.pet.household.toLowerCase().includes(q) ||
        t.preview.toLowerCase().includes(q)
    );
  }

  return threads;
}

/** Count of "active" threads (Awaiting reply) for the subtab badge. */
export async function getActiveThreadCount(): Promise<number> {
  const all = await getInboxThreads(undefined, "active");
  return all.length;
}

// ---------- thread detail ----------

export async function getThreadBubbles(threadId: string): Promise<Bubble[]> {
  const { data, error } = await supabaseServer
    .from("messages")
    .select("sender_type, body, attachment_type, attachment_url, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });
  if (error || !data) throw new Error(`getThreadBubbles ${threadId}: ${error?.message}`);

  return data.map((m) => {
    const d = new Date(m.created_at);
    // Format in IST (the demo audience is in Pune); compare "today" in IST too.
    const istDate = d.toLocaleDateString("en-IN", { month: "short", day: "numeric", timeZone: "Asia/Kolkata" });
    const istTodayLabel = new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", timeZone: "Asia/Kolkata" });
    const todayLabel = istDate === istTodayLabel ? "Today" : istDate;
    const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
    const hasAttachment = m.attachment_type === "image" || m.attachment_type === "video";
    const body = m.body ?? (hasAttachment ? "" : "");
    return {
      side: m.sender_type === "vet" ? "vet" : "parent",
      body,
      date: todayLabel,
      time,
      attachmentUrl: hasAttachment ? m.attachment_url ?? undefined : undefined,
      attachmentType: hasAttachment ? (m.attachment_type as "image" | "video") : undefined,
    } satisfies Bubble;
  });
}

export async function getPetByThread(threadId: string): Promise<Pet> {
  const { data, error } = await supabaseServer
    .from("messages")
    .select("pet:pets!inner(id, household_id, name, species, breed, sex, birthday, age_years_at_entry, weight_kg, chronic_conditions, fur_match_primary, deceased, avatar_url, household:households(name))")
    .eq("thread_id", threadId)
    .limit(1)
    .single();
  if (error || !data?.pet) throw new Error(`getPetByThread ${threadId}: ${error?.message}`);
  // Delegate to getPet for latest-visit augmentation
  const pet = data.pet as unknown as PetRow;
  return await getPet(pet.id);
}

/**
 * Detect the language the parent in this thread writes in by scanning the
 * latest parent message for Devanagari characters. Returns "mr" if any
 * parent message contains Marathi script, else "en".
 *
 * Used by the inbox compose bar to hint Sarvam STT so the vet can speak the
 * parent's language regardless of which language the dashboard chrome is in.
 */
export async function getThreadParentLanguage(threadId: string): Promise<"en" | "mr"> {
  const { data } = await supabaseServer
    .from("messages")
    .select("body, sender_type")
    .eq("thread_id", threadId)
    .eq("sender_type", "parent")
    .order("created_at", { ascending: false })
    .limit(5);
  if (!data) return "en";
  for (const m of data) {
    if (hasDevanagari(m.body)) return "mr";
  }
  return "en";
}

export async function getOpenWindow(threadId: string): Promise<{ openedDate?: string; closesDate?: string; reason?: string } | null> {
  const { data } = await supabaseServer
    .from("follow_up_windows")
    .select("opened_at, closes_at")
    .eq("thread_id", threadId)
    .is("closed_at", null)
    .maybeSingle();
  if (!data) return null;
  return {
    openedDate: new Date(data.opened_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", timeZone: "Asia/Kolkata" }),
    closesDate: new Date(data.closes_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", timeZone: "Asia/Kolkata" }),
    reason: "ear-infection visit", // v0: derive from visit.chief_complaint when wired
  };
}

// ---------- clinical history ----------

export async function getClinicalHistory(petId: string): Promise<ClinicalVisit[]> {
  const { data, error } = await supabaseServer
    .from("visits")
    .select("visit_date, visit_type, chief_complaint, diagnosis, soap_note")
    .eq("pet_id", petId)
    .order("visit_date", { ascending: false });
  if (error || !data) throw new Error(`getClinicalHistory ${petId}: ${error?.message}`);
  return data.map((v) => {
    const d = new Date(v.visit_date);
    // Prefer `diagnosis` for the meta line (one-line clinical impression). Fall
    // back to the subjective-only chunk of a structured SOAP, then to the raw
    // soap_note. The structured format ("S: ... | O: ... | A: ... | P: ...")
    // truncates ugly at 140 chars otherwise.
    const parsed = parseStructuredSoap(v.soap_note);
    const metaSource = v.diagnosis ?? parsed.s ?? v.soap_note ?? "";
    return {
      date: d.toLocaleDateString("en-IN", { month: "short", day: "numeric", timeZone: "Asia/Kolkata" }),
      year: String(d.getFullYear()),
      reason: `${v.visit_type === "vaccination" ? "Vaccination" : "Visit"} · ${v.chief_complaint ?? v.diagnosis ?? "Checkup"}`,
      meta: metaSource.slice(0, 140),
    } satisfies ClinicalVisit;
  });
}

export async function getSoapHistory(petId: string): Promise<SoapVisit[]> {
  // For v0 demo, Gabby has hand-authored SOAP cards in seed; other pets fall back to visit rows.
  // If pet is Gabby, return the locked seed SOAP cards; else map visits to a minimal SoapVisit.
  const { data: pet } = await supabaseServer
    .from("pets")
    .select("name, household:households(name)")
    .eq("id", petId)
    .single();
  if (isFernandesGabby(pet as any)) {
    return gabbySoapCards;
  }
  const { data, error } = await supabaseServer
    .from("visits")
    .select("visit_date, visit_type, chief_complaint, diagnosis, soap_note")
    .eq("pet_id", petId)
    .order("visit_date", { ascending: false });
  if (error || !data) return [];
  return data.map((v) => {
    const d = new Date(v.visit_date);
    // 2026-05-15: the 50-pet inbox-expansion seed stores SOAP in a delimited
    // single-column format ("S: ... | O: ... | A: ... | P: ...") so all four
    // sections survive the trip through `visits.soap_note`. Parse that here so
    // SoapVisit cards render with proper S/O/A/P split. Falls through to the
    // legacy single-column behavior when the delimiters aren't present (older
    // seeded rows like Gabby's stay readable).
    const parsed = parseStructuredSoap(v.soap_note);
    return {
      dateFull: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }),
      reason: v.chief_complaint ?? v.diagnosis ?? "Checkup",
      pills: [v.visit_type === "vaccination" ? "Vaccination" : "Visit"],
      vetByline: "Dr Sagar Bhongale",
      s: parsed.s ?? v.soap_note ?? "",
      o: parsed.o ?? "",
      a: parsed.a ?? v.diagnosis ?? "",
      p: parsed.p ?? "",
    } satisfies SoapVisit;
  });
}

/**
 * Parse a delimited SOAP-note string of the form
 *   "S: subjective | O: objective | A: assessment | P: plan"
 * into its four fields. Returns nulls when a field is missing so the caller
 * can fall back to the legacy single-column display.
 *
 * The pipe delimiter is chosen because it's vanishingly rare in clinical
 * shorthand and keeps the value queryable as a single text column without
 * needing a JSON migration on `visits`.
 */
function parseStructuredSoap(raw: string | null | undefined): {
  s: string | null;
  o: string | null;
  a: string | null;
  p: string | null;
} {
  if (!raw || !raw.includes("|")) return { s: null, o: null, a: null, p: null };
  const parts = raw.split(" | ").map((seg) => seg.trim());
  const out: { s: string | null; o: string | null; a: string | null; p: string | null } = {
    s: null, o: null, a: null, p: null,
  };
  for (const seg of parts) {
    const m = seg.match(/^([SOAP]):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    const val = m[2] ?? "";
    if (key === "S") out.s = val;
    else if (key === "O") out.o = val;
    else if (key === "A") out.a = val;
    else if (key === "P") out.p = val;
  }
  return out;
}

// ---------- invoices ----------

export async function getInvoicesForPet(petId: string): Promise<Invoice[]> {
  // For v0 demo, Gabby's invoice history is hand-authored (6 invoices Apr 2025 to May 2026).
  const { data: pet } = await supabaseServer
    .from("pets")
    .select("name, household:households(name)")
    .eq("id", petId)
    .single();
  if (isFernandesGabby(pet as any)) {
    return gabbyInvoices;
  }
  const { data, error } = await supabaseServer
    .from("invoices")
    .select("id, issued_date, total_inr, visit:visits(chief_complaint, diagnosis)")
    .eq("pet_id", petId)
    .order("issued_date", { ascending: false });
  if (error || !data) return [];
  return data.map((inv: any) => {
    const d = new Date(inv.issued_date);
    return {
      date: d.toLocaleDateString("en-IN", { month: "short", day: "numeric", timeZone: "Asia/Kolkata" }),
      year: String(d.getFullYear()),
      title: inv.visit?.chief_complaint ?? inv.visit?.diagnosis ?? "Visit",
      amount: `₹${inv.total_inr.toLocaleString("en-IN")}`,
    } satisfies Invoice;
  });
}

export async function getInvoiceDetail(petId: string, invoiceIdx: number): Promise<InvoiceDetail> {
  // For v0 demo, Gabby's May 6 invoice is hand-authored (line items + tooltips).
  // Other pets fall back to a minimal version reading the row + line_items.
  const { data: pet } = await supabaseServer
    .from("pets")
    .select("name, household:households(name)")
    .eq("id", petId)
    .single();
  if (isFernandesGabby(pet as any) && invoiceIdx === 0) {
    return gabbyMay6Invoice;
  }
  const { data: invoices } = await supabaseServer
    .from("invoices")
    .select("id, invoice_number, issued_date, total_inr, pet:pets(name, household:households(name))")
    .eq("pet_id", petId)
    .order("issued_date", { ascending: false });
  const inv = invoices?.[invoiceIdx];
  if (!inv) throw new Error(`invoice ${invoiceIdx} for pet ${petId} not found`);
  const { data: items } = await supabaseServer
    .from("invoice_line_items")
    .select("item_type, item_name, line_total_inr")
    .eq("invoice_id", inv.id);
  // Group by item_type
  const byType = new Map<string, any[]>();
  for (const it of items ?? []) {
    const arr = byType.get(it.item_type) ?? [];
    arr.push({ name: it.item_name, amount: `₹${it.line_total_inr.toLocaleString("en-IN")}` });
    byType.set(it.item_type, arr);
  }
  return {
    id: inv.id,
    number: inv.invoice_number,
    issuedDate: new Date(inv.issued_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }),
    household: householdSurname((inv as any).pet?.household?.name ?? "household"),
    petName: (inv as any).pet?.name ?? "Pet",
    categories: [...byType.entries()].map(([type, lines]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      lines,
    })),
    total: `₹${inv.total_inr.toLocaleString("en-IN")}`,
  };
}

// ---------- billing (top-level ledger) ----------

/**
 * Lakh-style INR formatter. `₹1,72,874` style — three digits then groups of
 * two, matching `Intl.NumberFormat('en-IN')`. No decimals.
 */
function formatInr(amount: number): string {
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount)}`;
}

/** "8 May 2026" — full year so April/May straddle months reads cleanly. */
function formatIssuedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

/** "Paid 9 May" — relative paid date, year dropped since it always matches scope. */
function formatPaidLabel(paidAt: string | null): string {
  if (!paidAt) return "Unpaid";
  const d = new Date(paidAt);
  return `Paid ${d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  })}`;
}

/** Age in whole years from birthday → today. */
function ageInYears(birthday: string | null): number | null {
  if (!birthday) return null;
  const b = new Date(birthday);
  const now = new Date();
  const ms = now.getTime() - b.getTime();
  return Math.max(0, Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000)));
}

/** "<Breed>, <M|F>, <N>y" — compact pet meta for the ledger row. */
function petMetaFragment(
  breed: string | null,
  sex: "male" | "female" | null,
  birthday: string | null
): string {
  const parts: string[] = [];
  if (breed) parts.push(breed);
  if (sex) parts.push(sex === "female" ? "F" : "M");
  const age = ageInYears(birthday);
  if (age !== null) parts.push(`${age}y`);
  return parts.join(", ");
}

/**
 * Translate a BillingScope into [startISO, endExclusiveISO] for SQL filtering.
 * `all` returns `null` so the caller knows to skip the date filter entirely.
 */
function scopeToDateRange(scope: BillingScope): { from: string; toExclusive: string } | null {
  if (scope.kind === "all") return null;
  if (scope.kind === "custom") {
    // toExclusive = `to + 1 day` so the picker's inclusive end-date works.
    const t = new Date(scope.to);
    t.setUTCDate(t.getUTCDate() + 1);
    return { from: scope.from, toExclusive: t.toISOString().slice(0, 10) };
  }
  // this-month
  const from = new Date(Date.UTC(scope.year, scope.month, 1));
  const toExclusive = new Date(Date.UTC(scope.year, scope.month + 1, 1));
  return {
    from: from.toISOString().slice(0, 10),
    toExclusive: toExclusive.toISOString().slice(0, 10),
  };
}

/** KPI numbers for the active scope. Three cards: Billed / Collected / Outstanding. */
export async function getBillingStats(scope: BillingScope): Promise<BillingStats> {
  let q = supabaseServer.from("invoices").select("status, total_inr");
  const range = scopeToDateRange(scope);
  if (range) {
    q = q.gte("issued_date", range.from).lt("issued_date", range.toExclusive);
  }
  const { data, error } = await q;
  if (error) throw new Error(`getBillingStats: ${error.message}`);
  let billedCount = 0,
    billedInr = 0,
    paidCount = 0,
    collectedInr = 0,
    unpaidCount = 0,
    outstandingInr = 0;
  for (const r of data ?? []) {
    billedCount++;
    billedInr += r.total_inr;
    if (r.status === "paid") {
      paidCount++;
      collectedInr += r.total_inr;
    } else if (r.status === "unpaid") {
      unpaidCount++;
      outstandingInr += r.total_inr;
    }
  }
  return { scope, billedCount, billedInr, paidCount, collectedInr, unpaidCount, outstandingInr };
}

/**
 * Ledger rows for the active scope + status filter + optional search query,
 * sliced for pagination. Returns scope-filtered tab counts so the All/Unpaid/Paid
 * pill counts agree with whatever the table is showing (e.g. searching
 * "fernandes" reduces both rows AND tab counts to Fernandes invoices).
 *
 * Search is applied client-side after fetching the scope (max ~200 rows in v0
 * seed, well within memory). DB-side `or()` across two foreign-table joins
 * (pet.name + pet.household.name) is fragile in Supabase JS — JS filter is
 * cleaner and behaves predictably with case-insensitive matching.
 */
export async function getBillingLedger(
  scope: BillingScope,
  status: BillingStatusFilter,
  page: number,
  pageSize: number,
  searchQuery?: string
): Promise<{
  rows: BillingRow[];
  total: number;
  tabCounts: { all: number; unpaid: number; paid: number };
}> {
  let q = supabaseServer
    .from("invoices")
    .select(
      `id, invoice_number, issued_date, status, paid_at, total_inr,
       pet:pets!inner(id, name, breed, sex, birthday, household:households(name))`
    )
    .order("issued_date", { ascending: false })
    .order("invoice_number", { ascending: false });
  const range = scopeToDateRange(scope);
  if (range) {
    q = q.gte("issued_date", range.from).lt("issued_date", range.toExclusive);
  }
  const { data, error } = await q;
  if (error) throw new Error(`getBillingLedger: ${error.message}`);

  // Adapt raw DB rows to BillingRow shape first so search can match on the
  // resolved household label ("Fernandes household") and the petMeta fragment.
  const all: BillingRow[] = (data ?? []).map((r: any) => {
    const p = r.pet ?? {};
    const householdName = p.household?.name ?? "household";
    return {
      id: r.id,
      invoiceNumber: r.invoice_number,
      petId: p.id ?? "",
      petName: p.name ?? "Pet",
      petMeta: petMetaFragment(p.breed ?? null, p.sex ?? null, p.birthday ?? null),
      household: `${householdSurname(householdName)} household`,
      issuedDate: formatIssuedDate(r.issued_date),
      status: r.status as "paid" | "unpaid",
      statusLabel: r.status === "paid" ? formatPaidLabel(r.paid_at) : "Unpaid",
      amountInr: r.total_inr,
      amountDisplay: formatInr(r.total_inr),
    };
  });

  // Apply search filter (pet name OR household name, case-insensitive).
  const needle = searchQuery?.toLowerCase().trim() ?? "";
  const matchesSearch = (row: BillingRow) =>
    !needle ||
    row.petName.toLowerCase().includes(needle) ||
    row.household.toLowerCase().includes(needle);

  const searched = all.filter(matchesSearch);

  // Tab counts reflect the searched set (so the counts agree with what the
  // user is filtering, not the unfiltered scope).
  const tabCounts = {
    all: searched.length,
    unpaid: searched.filter((r) => r.status === "unpaid").length,
    paid: searched.filter((r) => r.status === "paid").length,
  };

  // Apply status filter on top.
  const statusFiltered =
    status === "all" ? searched : searched.filter((r) => r.status === status);

  // Paginate the final set.
  const from = (page - 1) * pageSize;
  const rows = statusFiltered.slice(from, from + pageSize);

  return { rows, total: statusFiltered.length, tabCounts };
}

/** Fetch one invoice by its UUID for the billing detail route. Shape matches
 *  the existing `InvoiceDetail` so the same viewer component renders both
 *  per-pet and billing-scoped detail pages. */
export async function getInvoiceById(
  invoiceId: string
): Promise<InvoiceDetail & { status: "paid" | "unpaid"; paidAt: string | null }> {
  const { data: inv, error } = await supabaseServer
    .from("invoices")
    .select(
      `id, invoice_number, issued_date, total_inr, status, paid_at,
       pet:pets(name, household:households(name))`
    )
    .eq("id", invoiceId)
    .single();
  if (error || !inv) throw new Error(`invoice ${invoiceId} not found: ${error?.message}`);
  const { data: items } = await supabaseServer
    .from("invoice_line_items")
    .select("item_type, item_name, line_total_inr")
    .eq("invoice_id", invoiceId);
  const byType = new Map<string, { name: string; amount: string }[]>();
  for (const it of items ?? []) {
    const arr = byType.get(it.item_type) ?? [];
    arr.push({ name: it.item_name, amount: formatInr(it.line_total_inr) });
    byType.set(it.item_type, arr);
  }
  return {
    id: (inv as any).id,
    number: (inv as any).invoice_number,
    issuedDate: formatIssuedDate((inv as any).issued_date),
    household: householdSurname((inv as any).pet?.household?.name ?? "household"),
    petName: (inv as any).pet?.name ?? "Pet",
    categories: [...byType.entries()].map(([type, lines]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      lines,
    })),
    total: formatInr((inv as any).total_inr),
    status: (inv as any).status as "paid" | "unpaid",
    paidAt: (inv as any).paid_at,
  };
}

/** Server-side flip from unpaid → paid. Idempotent (already-paid invoices stay paid). */
export async function markInvoicePaid(invoiceId: string): Promise<void> {
  const { error } = await supabaseServer
    .from("invoices")
    .update({ status: "paid", paid_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", invoiceId);
  if (error) throw new Error(`markInvoicePaid: ${error.message}`);
}

// ---------- broadcasts ----------

export async function getBroadcastDraft() {
  // For v0 demo, the compose flow uses the locked summer-dog-care content.
  // Wiring: read from broadcasts where sent_at IS NULL (drafts), else fall back to demo seed.
  return demoBroadcast;
}

/** v4 broadcast section (matches `Section` in `draft-state.ts`). The detail
 *  page renders sections by iterating this array; the type drives the icon
 *  + eyebrow styling (warning gets AlertTriangle, whenToCall gets Phone). */
export type BroadcastSection = {
  id: string;
  type: "summary" | "warning" | "whenToCall" | "custom";
  label: string;
  items: string[];
  /** Visual emphasis. "highlight" applies the ink-frame + AlertTriangle
   *  treatment to a custom section (matches the Warning section pattern).
   *  Standard types ignore this. */
  emphasis?: "normal" | "highlight";
  /** Body layout. "paragraph" collapses the body to a single multi-line
   *  block; "bullets" renders as a list. Standard types always render
   *  as bullets. */
  format?: "bullets" | "paragraph";
};

export type BroadcastContent = {
  title: string;
  body: string;
  /** Ordered list of sections. Empty for quick-announcement broadcasts. */
  sections: BroadcastSection[];
};

export type BroadcastDetail = {
  id: string;
  sentAt: string;
  audienceCount: number;
  /** English content set. Always populated for back-compat. */
  en: BroadcastContent;
  /** Marathi content set. `null` if the broadcast pre-dates the bilingual block. */
  mr: BroadcastContent | null;
  audienceFilter: {
    groupA: { species: "dog" | "cat" | "both"; ageMin: number; ageMax: number; excludeDeceased: boolean };
    groupB: { species: "dog" | "cat" | "both"; ageMin: number; ageMax: number; excludeDeceased: boolean } | null;
  } | null;
  /** Cover image URL (broadcast-covers bucket). Null for quick-announcement
   *  broadcasts. Added 2026-05-15 with the composer rebuild + Patch 13. */
  coverImageUrl: string | null;
  publicSlug: string | null;
};

/** Parse the `composed_message_text_<lang>` JSON blob into { body, sections,
 *  coverImagePosition }.
 *
 *  Three storage shapes supported:
 *    v4 (2026-05-15+): { body, sections: [{...}], coverImagePosition? }
 *    v3:              { body, summary[], warningSigns[], escalation[] }
 *    v0/seed:         plain string (no JSON) — treated as body-only
 *
 *  v3 rows are lifted into v4 by mapping each non-empty array into a typed
 *  section using canonical English labels. coverImagePosition was added
 *  2026-05-15 with the drag-to-reposition feature; missing => center crop. */
function parseBodyShape(raw: string | null | undefined): {
  body: string;
  sections: BroadcastSection[];
  coverImagePosition: string | null;
} {
  if (!raw) return { body: "", sections: [], coverImagePosition: null };
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const body = typeof parsed.body === "string" ? parsed.body : "";
      const coverImagePosition =
        typeof parsed.coverImagePosition === "string"
          ? parsed.coverImagePosition
          : null;
      // v4 shape with explicit sections.
      if (Array.isArray(parsed.sections)) {
        const sections: BroadcastSection[] = parsed.sections
          .filter((s: any) => s && typeof s === "object" && typeof s.type === "string")
          .map((s: any, i: number) => {
            const type: BroadcastSection["type"] =
              s.type === "summary" || s.type === "warning" || s.type === "whenToCall"
                ? s.type
                : "custom";
            const fallbackLabel =
              type === "summary"
                ? "Summary"
                : type === "warning"
                  ? "Warning signs"
                  : type === "whenToCall"
                    ? "When to call us"
                    : "Section";
            const section: BroadcastSection = {
              id: typeof s.id === "string" && s.id ? s.id : `s-${i}`,
              type,
              label: typeof s.label === "string" && s.label ? s.label : fallbackLabel,
              items: Array.isArray(s.items)
                ? s.items.filter((it: unknown): it is string => typeof it === "string")
                : [],
            };
            if (type === "custom") {
              section.emphasis = s.emphasis === "highlight" ? "highlight" : "normal";
              section.format = s.format === "paragraph" ? "paragraph" : "bullets";
            }
            return section;
          });
        return { body, sections, coverImagePosition };
      }
      // v3 flat arrays → lift into sections.
      const sections: BroadcastSection[] = [];
      if (Array.isArray(parsed.summary) && parsed.summary.length > 0) {
        sections.push({
          id: "legacy-summary",
          type: "summary",
          label: "Summary",
          items: parsed.summary.filter((s: unknown): s is string => typeof s === "string"),
        });
      }
      if (Array.isArray(parsed.warningSigns) && parsed.warningSigns.length > 0) {
        sections.push({
          id: "legacy-warning",
          type: "warning",
          label: "Warning signs",
          items: parsed.warningSigns.filter((s: unknown): s is string => typeof s === "string"),
        });
      }
      if (Array.isArray(parsed.escalation) && parsed.escalation.length > 0) {
        sections.push({
          id: "legacy-whenToCall",
          type: "whenToCall",
          label: "When to call us",
          items: parsed.escalation.filter((s: unknown): s is string => typeof s === "string"),
        });
      }
      return { body, sections, coverImagePosition };
    }
  } catch {
    // not JSON — treat as plain-text body
  }
  return { body: raw, sections: [], coverImagePosition: null };
}

export async function getBroadcastById(id: string): Promise<BroadcastDetail | null> {
  const { data, error } = await supabaseServer
    .from("broadcasts")
    .select("id, topic_en, topic_mr, sent_at, audience_count, composed_message_text_en, composed_message_text_mr, audience_filter, attached_kit_id, cover_image_url")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;

  const enParts = parseBodyShape(data.composed_message_text_en);
  const en: BroadcastContent = { title: data.topic_en ?? "", ...enParts };
  let mr: BroadcastContent | null = null;
  if (data.topic_mr || data.composed_message_text_mr) {
    const mrParts = parseBodyShape(data.composed_message_text_mr ?? null);
    mr = { title: data.topic_mr ?? "", ...mrParts };
  }

  // audience_filter spans three eras of the shape:
  //   v3 (2026-05-15+):  { conditionGroups: [ { conditions: [...], ... } ] }
  //   v2 (mid-build):    { groupA, groupB }                ← old compose flow
  //   v1 (seed):         { species, ageMin, ageMax, ... }   ← flat legacy
  // Detail page expects the v2 shape; lift v1 → v2 and project v3 → v2.
  const fillGroup = (raw: any) => ({
    species: (raw?.species === "cat" || raw?.species === "both") ? raw.species : "dog" as const,
    ageMin: typeof raw?.ageMin === "number" ? raw.ageMin : (typeof raw?.age_min === "number" ? raw.age_min : 0),
    ageMax: typeof raw?.ageMax === "number" ? raw.ageMax : (typeof raw?.age_max === "number" ? raw.age_max : 15),
    excludeDeceased: typeof raw?.excludeDeceased === "boolean"
      ? raw.excludeDeceased
      : (typeof raw?.exclude_deceased === "boolean" ? raw.exclude_deceased : true),
  });
  /** Project a v3 ConditionGroup down to v2's flat shape so the existing
   *  detail-page FilterSummary keeps rendering. Loses Last-visit info (not
   *  shown on detail page today; can be added when the detail page itself
   *  gets a rebuild). */
  const projectV3Group = (group: any) => {
    const find = (field: string) =>
      group?.conditions?.find?.((c: any) => c?.field === field);
    const species = find("species")?.value;
    const age = find("ageRange")?.value;
    const dec = find("deceased")?.value;
    return fillGroup({
      species,
      ageMin: age?.min,
      ageMax: age?.max,
      excludeDeceased: dec === "exclude",
    });
  };
  let audienceFilter: BroadcastDetail["audienceFilter"] = null;
  const af = data.audience_filter as any;
  if (af && typeof af === "object") {
    if (Array.isArray(af.conditionGroups)) {
      // v3 shape — project first two groups into A/B slots.
      const [g0, g1] = af.conditionGroups;
      if (g0) {
        audienceFilter = {
          groupA: projectV3Group(g0),
          groupB: g1 ? projectV3Group(g1) : null,
        };
      }
    } else if (af.groupA) {
      audienceFilter = {
        groupA: fillGroup(af.groupA),
        groupB: af.groupB ? fillGroup(af.groupB) : null,
      };
    } else if (Object.keys(af).length > 0) {
      audienceFilter = { groupA: fillGroup(af), groupB: null };
    }
  }

  return {
    id: data.id,
    sentAt: data.sent_at
      ? new Date(data.sent_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "Asia/Kolkata",
        })
      : "—",
    audienceCount: data.audience_count ?? 0,
    en,
    mr,
    audienceFilter,
    coverImageUrl: (data as any).cover_image_url ?? null,
    publicSlug: null,
  };
}

/** Derive the broadcast "kind" — `announcement` (just title + body) or
 *  `educational` (has sections OR a cover image) — from the stored content.
 *  Used to pick the list-row icon (Megaphone vs BookOpen) so the vet can
 *  scan quick announcements vs educational guides at a glance. */
export type BroadcastKind = "announcement" | "educational";

function deriveKind(
  composedTextJson: string | null | undefined,
  coverImageUrl: string | null
): BroadcastKind {
  if (coverImageUrl) return "educational";
  if (!composedTextJson) return "announcement";
  try {
    const parsed = JSON.parse(composedTextJson);
    if (parsed && typeof parsed === "object") {
      if (Array.isArray(parsed.sections) && parsed.sections.length > 0) {
        return "educational";
      }
      // Legacy v3 shape carrying any of the three flat arrays.
      const legacyHasSections =
        (Array.isArray(parsed.summary) && parsed.summary.length > 0) ||
        (Array.isArray(parsed.warningSigns) && parsed.warningSigns.length > 0) ||
        (Array.isArray(parsed.escalation) && parsed.escalation.length > 0);
      if (legacyHasSections) return "educational";
    }
  } catch {
    // not JSON → plain-text body → announcement-shape
  }
  return "announcement";
}

export async function getSentBroadcasts(searchQuery?: string): Promise<
  Array<{
    id: string;
    title: string;
    sentAt: string;
    audienceCount: number;
    kind: BroadcastKind;
  }>
> {
  let q = supabaseServer
    .from("broadcasts")
    .select("id, topic_en, sent_at, audience_count, composed_message_text_en, cover_image_url")
    .not("sent_at", "is", null)
    .order("sent_at", { ascending: false });
  if (searchQuery) {
    q = q.ilike("topic_en", `%${searchQuery}%`);
  }
  const { data, error } = await q;
  if (error || !data) return [];
  return data.map((b: any) => ({
    id: b.id,
    title: b.topic_en,
    sentAt: new Date(b.sent_at).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }),
    audienceCount: b.audience_count ?? 0,
    kind: deriveKind(b.composed_message_text_en, b.cover_image_url),
  }));
}

/** Load a draft broadcast (sent_at IS NULL) by id and project it into the
 *  composer's `BroadcastDraft` shape. Used by `/broadcasts/new?draftId=...`
 *  to resume a saved draft. Returns null if the id is missing, the row is
 *  sent (already published), or the row doesn't exist.
 *
 *  v4 sections shape is mapped through `parseBodyShape()`; legacy v3 rows
 *  (with `summary`/`warningSigns`/`escalation` arrays in the body JSON)
 *  are lifted into Section[] by that helper, so old drafts load correctly. */
export async function getBroadcastDraftById(id: string): Promise<{
  en: {
    title: string;
    body: string;
    sections: BroadcastSection[];
    coverImageUrl: string | null;
    coverImagePosition: string | null;
  };
  mr: {
    title: string;
    body: string;
    sections: BroadcastSection[];
    coverImageUrl: string | null;
    coverImagePosition: string | null;
  };
  language: "en";
  slug: string;
  conditionGroups: unknown[];
  autofillMrAfterSend: boolean;
  reviewedEn: boolean;
  reviewedMr: boolean;
  lastAutosaveAt: number;
  /** DB id so subsequent autosaves UPDATE this row instead of INSERTing a
   *  duplicate. Always set when resuming a draft via getBroadcastDraftById. */
  serverDraftId: string;
} | null> {
  if (!id) return null;
  const { data, error } = await supabaseServer
    .from("broadcasts")
    .select(
      "id, topic_en, topic_mr, composed_message_text_en, composed_message_text_mr, audience_filter, cover_image_url, updated_at, sent_at"
    )
    .eq("id", id)
    .is("sent_at", null)
    .maybeSingle();
  if (error || !data) return null;

  const enParsed = parseBodyShape(data.composed_message_text_en);
  const mrParsed = parseBodyShape(data.composed_message_text_mr);
  const af = data.audience_filter as any;
  const conditionGroups = Array.isArray(af?.conditionGroups)
    ? af.conditionGroups
    : [];

  return {
    en: {
      title: data.topic_en ?? "",
      body: enParsed.body,
      sections: enParsed.sections,
      coverImageUrl: data.cover_image_url ?? null,
      coverImagePosition: enParsed.coverImagePosition,
    },
    mr: {
      title: data.topic_mr ?? "",
      body: mrParsed.body,
      sections: mrParsed.sections,
      coverImageUrl: data.cover_image_url ?? null,
      coverImagePosition: mrParsed.coverImagePosition,
    },
    language: "en",
    slug: data.id,
    conditionGroups,
    autofillMrAfterSend: false,
    reviewedEn: false,
    reviewedMr: false,
    lastAutosaveAt: data.updated_at ? Date.parse(data.updated_at) : 0,
    serverDraftId: data.id,
  };
}

/** Draft broadcasts — rows in the `broadcasts` table where `sent_at IS NULL`.
 *  Surfaces alongside Sent on the broadcasts list (Sent / Drafts tab toggle,
 *  locked 2026-05-15). Returns updatedAt instead of sentAt; the list shows
 *  "Saved [date]" for drafts. */
export async function getDraftBroadcasts(searchQuery?: string): Promise<
  Array<{
    id: string;
    title: string;
    updatedAt: string;
    audienceCount: number;
    kind: BroadcastKind;
  }>
> {
  let q = supabaseServer
    .from("broadcasts")
    .select("id, topic_en, updated_at, audience_count, composed_message_text_en, cover_image_url")
    .is("sent_at", null)
    .order("updated_at", { ascending: false });
  if (searchQuery) {
    q = q.ilike("topic_en", `%${searchQuery}%`);
  }
  const { data, error } = await q;
  if (error || !data) return [];
  return data.map((b: any) => ({
    id: b.id,
    title: b.topic_en || "Untitled draft",
    updatedAt: new Date(b.updated_at).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }),
    audienceCount: b.audience_count ?? 0,
    kind: deriveKind(b.composed_message_text_en, b.cover_image_url),
  }));
}

export async function getAudienceCount(filter: { species?: "dog" | "cat" | "both"; excludeDeceased?: boolean; ageMin?: number; ageMax?: number }): Promise<{ pets: number; households: number }> {
  let q = supabaseServer.from("pets").select("id, household_id, species, deceased, birthday, age_years_at_entry", { count: "exact" });
  if (filter.species && filter.species !== "both") q = q.eq("species", filter.species);
  if (filter.excludeDeceased) q = q.eq("deceased", false);
  // Note: age filter computed client-side because birthday vs age_years_at_entry split
  const { data, count } = await q;
  if (!data) return { pets: 0, households: 0 };
  const householdIds = new Set(data.map((p: any) => p.household_id));
  return { pets: count ?? data.length, households: householdIds.size };
}

// ---------- vet + clinic ----------

export async function getCurrentVet() {
  const { data, error } = await supabaseServer
    .from("users")
    .select("id, full_name, email, vet_license, phone, preferred_language, avatar_url")
    .eq("role", "vet")
    .limit(1)
    .single();
  if (error || !data) throw new Error(`getCurrentVet: ${error?.message}`);
  return {
    id: data.id,
    fullName: data.full_name ?? "Dr Sagar Bhongale",
    shortName: "Dr Sagar",
    initials: "SB",
    vetLicense: data.vet_license ?? "MVC/2008/04821",
    phone: data.phone ?? "+91 98220 47561",
    email: data.email ?? "",
    emailAdded: !!data.email,
    avatarUrl: data.avatar_url ?? null,
    language: (data.preferred_language?.toUpperCase() ?? "EN") as "EN" | "MR",
  };
}

export async function getCurrentClinic() {
  const { data, error } = await supabaseServer
    .from("clinics")
    .select("id, name, address, phone, gst, license, logo_url")
    .limit(1)
    .single();
  if (error || !data) {
    // Fallback to seed if clinic not visible (RLS or empty)
    return {
      name: "Animal Medical Services",
      addressLine1: "Karve Road, Kothrud, Pune 411038",
      addressLine2: "Maharashtra, India",
      gstin: "27ABCDE1234F1Z2",
      hours: "Open 9am to 9pm, Mon to Sat",
      phone: "+91 20 2612 3456",
      logoUrl: null as string | null,
      initials: "AMS",
    };
  }
  // Split address on comma for line1/line2 display
  const fullAddress = data.address ?? "Karve Road, Kothrud, Pune 411038, Maharashtra, India";
  const parts = fullAddress.split(",").map((s: string) => s.trim());
  const splitIdx = parts.findIndex((p: string) => /Pune/i.test(p));
  const line1 = parts.slice(0, splitIdx + 1).join(", ");
  const line2 = parts.slice(splitIdx + 1).join(", ");
  // Initials from clinic name (max 3 letters, first letter of each significant word)
  const initialsRaw = data.name
    .split(/\s+/)
    .filter((w: string) => w.length > 0 && !/^(the|of|and|&)$/i.test(w))
    .slice(0, 3)
    .map((w: string) => (w[0] ?? "").toUpperCase())
    .join("");
  return {
    name: data.name,
    addressLine1: line1,
    addressLine2: line2 || "Maharashtra, India",
    gstin: data.gst ?? "27ABCDE1234F1Z2",
    hours: "Open 9am to 9pm, Mon to Sat",
    phone: data.phone ?? "+91 20 2612 3456",
    logoUrl: data.logo_url ?? null,
    initials: initialsRaw || "AMS",
  };
}
