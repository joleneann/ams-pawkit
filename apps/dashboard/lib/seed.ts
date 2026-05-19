/**
 * v0 seed data lifted from `mockups/admin-locked.html`.
 * Hardcoded for the demo; replace with Supabase queries when wiring lands
 * (Day 4-5 per `docs/build-order.md`).
 *
 * Pet identities + Fernandes anchor per `CLAUDE.md` "What we're building":
 * Raffy (M, deceased), Gabby (M, alive), Angel (F, alive), Galaxy (F, alive).
 */

export type FurTone =
  | "milk"
  | "vanilla"
  | "honey"
  | "peach"
  | "rust"
  | "mushroom"
  | "smoke"
  | "steel"
  | "bark"
  | "sable";

export type Pet = {
  id: string;
  name: string;
  household: string;
  furTone: FurTone;
  species: "dog" | "cat";
  sex: "M" | "F";
  breed: string;
  ageDisplay: string; // "4 years" or "4y 2m"
  weightDisplay?: string; // "31.2 kg"
  weightMonth?: string; // "Apr 22"
  chronic?: string;
  lastVisitDate?: string;
  lastVisitReason?: string;
  deceased?: boolean;
  /**
   * Public Supabase Storage URL for the pet's real portrait. Pulled from
   * `pets.avatar_url` via lib/data.ts adaptPet. Falls back to the
   * fur-tone-ringed paw silhouette when null. (Seeded 2026-05-14 with
   * Pexels portraits for the 5 demo pets.)
   */
  photoUrl?: string | null;
};

export type InboxThread = {
  id: string;
  pet: Pet;
  preview: string;
  /**
   * True when the latest message in the thread was sent by the vet
   * (Replied subtab rows). The "You:" / "तुम्ही:" preview prefix is rendered
   * at the UI layer so it can be translated.
   */
  previewFromVet?: boolean;
  previewType: "text" | "photo" | "video";
  timestamp: string; // relative
  status: "active" | "inactive";
  unreplied?: boolean;
  unread?: boolean; // vet hasn't seen the latest parent message yet
  windowOpen?: boolean;
  windowOpenedDate?: string;
  windowClosesDate?: string;
  windowOpenedReason?: string;
  /**
   * Inbox-v2 additions (locked 2026-05-15):
   * - `waitDuration` is a wall-clock string like "1d 4h" / "6h" computed
   *   from the latest PARENT message's `created_at`. Shown on Awaiting
   *   rows; the oldest row in the list renders this in berry instead of ink-70.
   * - `caseChip` is the visit context label (e.g. "Ear infection check",
   *   "Post-op recheck") pulled from the pet's latest visit row. Shown
   *   as a small pill on Awaiting and Replied rows.
   * - `latestParentAt` is the ISO timestamp of the latest parent message,
   *   used by the reply-queue auto-advance logic to find the next oldest.
   */
  waitDuration?: string;
  caseChip?: string;
  latestParentAt?: string;
};

/**
 * Compose a signalment shorthand for clinical handover ("Golden Retriever · M · 4y · 31.2 kg").
 * Skips parts when data is missing.
 */
export function signalment(pet: Pet): string {
  const parts = [pet.breed, pet.sex, pet.ageDisplay, pet.weightDisplay].filter(Boolean);
  return parts.join(" · ");
}

export type Bubble = {
  side: "vet" | "parent";
  body: string;
  date: string;
  time: string;
  /**
   * Optional attachment (inbox-v2 lock 2026-05-15). When present the bubble
   * renders an inline <img> or <video> above the body text. Uploaded via
   * the composer Attach button → `/api/inbox-attach` → messages-images or
   * messages-videos Supabase bucket (public URL).
   */
  attachmentUrl?: string;
  attachmentType?: "image" | "video";
};

export type ClinicalVisit = {
  date: string; // "May 6"
  year: string; // "2026"
  reason: string; // "Visit · Ear infection check"
  meta: string; // SOAP-ish summary
};

export type Invoice = {
  date: string;
  year: string;
  title: string;
  amount: string; // "₹3,150"
};

// --- Gabby's invoices (6 entries) ---

export const gabbyInvoices: Invoice[] = [
  { date: "May 6", year: "2026", title: "Ear infection check", amount: "₹3,150" },
  {
    date: "Apr 22",
    year: "2026",
    title: "Annual wellness + DHPP booster",
    amount: "₹2,400",
  },
  { date: "Jan 15", year: "2026", title: "Allergy flare", amount: "₹950" },
  { date: "Nov 28", year: "2025", title: "Rabies booster", amount: "₹850" },
  { date: "Aug 4", year: "2025", title: "Ear infection (left)", amount: "₹2,100" },
  { date: "Apr 18", year: "2025", title: "Annual wellness + DHPP", amount: "₹2,200" },
];

// --- Invoice line items ---

export type InvoiceLineItem = {
  name: string;
  tooltip?: string;
  amount: string;
};

export type InvoiceDetail = {
  id: string;
  number: string; // "INV-2026-0451"
  issuedDate: string; // "6 May 2026"
  household: string;
  petName: string;
  categories: { name: string; lines: InvoiceLineItem[] }[];
  total: string;
};

export const gabbyMay6Invoice: InvoiceDetail = {
  id: "gabby-may-6-2026",
  number: "INV-2026-0451",
  issuedDate: "6 May 2026",
  household: "Fernandes household",
  petName: "Gabby",
  total: "₹3,150",
  categories: [
    {
      name: "Examination",
      lines: [
        {
          name: "Consultation",
          tooltip: "This is for Dr Sagar's time with Gabby.",
          amount: "₹500",
        },
        {
          name: "Otoscope examination",
          tooltip: "Visual examination of Gabby's ear canal.",
          amount: "₹200",
        },
        {
          name: "Cytology · ear swab",
          tooltip: "A sample taken from the ear for lab analysis.",
          amount: "₹350",
        },
      ],
    },
    {
      name: "Medication",
      lines: [
        { name: "Cefadroxil 250mg · 14 tabs", amount: "₹500" },
        { name: "Otic cleansing solution · 60ml", amount: "₹350" },
        { name: "Mometasone otic drops · 10ml", amount: "₹800" },
      ],
    },
    {
      name: "Procedure",
      lines: [
        {
          name: "In-clinic ear flush",
          tooltip: "Cleaning of the ear canal performed at the clinic.",
          amount: "₹450",
        },
      ],
    },
  ],
};

// --- Billing ledger (Screen 08 — Billing landing) ---

/**
 * Scope of the Billing landing screen. The picker chip is the master scope
 * control; KPIs + ledger always agree on what scope they represent.
 *
 *   - `this-month` — a specific calendar month/year. `month` is 0-indexed.
 *   - `custom`     — arbitrary date range (UI deferred to v0.1).
 *   - `all`        — every invoice ever issued.
 */
export type BillingScope =
  | { kind: "this-month"; year: number; month: number }
  | { kind: "custom"; from: string; to: string }
  | { kind: "all" };

export type BillingStatusFilter = "all" | "paid" | "unpaid";

/** One row in the billing ledger. Hand-shaped for the rendered table — the
 *  data layer does all the formatting so the table component stays pure. */
export type BillingRow = {
  id: string;             // invoice UUID — drives the /billing/[id] route
  invoiceNumber: string;  // "INV-2026-5003" / "INV-2026-FERN-001"
  petId: string;
  petName: string;        // "Buddy"
  petMeta: string;        // "German Shepherd, M, 1y" (breed, sex, age fragment)
  household: string;      // "Sharma household"
  issuedDate: string;     // "8 May 2026"
  status: "paid" | "unpaid";
  statusLabel: string;    // "Paid 9 May" | "Unpaid"
  amountInr: number;      // 3520 — raw paise-free integer for math + formatting
  amountDisplay: string;  // "₹3,520"
};

/** KPI summary for the active billing scope. Drives the three KPI cards. */
export type BillingStats = {
  scope: BillingScope;
  billedCount: number;
  billedInr: number;
  paidCount: number;
  collectedInr: number;
  unpaidCount: number;
  outstandingInr: number;
};

// --- SOAP cards (Gabby's full clinical history) ---

export type SoapVisit = {
  dateFull: string; // "6 May 2026"
  reason: string;
  pills: string[];
  vetByline: string;
  editedAgo?: string; // e.g. "12m ago" — surfaces audit-trail marker if present
  s: string;
  o: string;
  a: string;
  p: string;
};

export const gabbySoapCards: SoapVisit[] = [
  {
    dateFull: "6 May 2026",
    reason: "Ear infection check (right ear)",
    pills: ["Sick visit", "Otitis"],
    vetByline: "Dr Sagar Bhongale",
    editedAgo: "12m ago",
    s: "Parent reports right ear scratching for 3 days, head-shaking, mildly lethargic. Appetite normal.",
    o: "T 38.6°C, P 92, R 24. Weight 31.2 kg. BCS 5/9. Right ear: erythematous canal, mild yellow-brown discharge, pain on palpation, drum intact. Cytology: cocci +++, yeast +. Remainder NSF.",
    a: "Otitis externa, right ear (bacterial with secondary yeast). Suspected trigger: seasonal allergies.",
    p: "In-clinic ear flush. Cefadroxil 250mg PO BID × 7 days. Otic cleansing solution + Mometasone otic drops BID. Recheck 16 May.",
  },
  {
    dateFull: "22 Apr 2026",
    reason: "Annual wellness + DHPP booster",
    pills: ["Wellness", "Vaccination"],
    vetByline: "Dr Sagar Bhongale",
    s: "Annual wellness visit. Parent reports good appetite, normal energy. No concerns.",
    o: "T 38.4°C, P 88, R 22. Weight 31.2 kg. BCS 5/9. Heart and lungs clear. Abdomen NSF. Mild chronic seasonal dermatitis on hindquarters.",
    a: "Healthy adult Golden Retriever. Chronic mild seasonal dermatitis (managed). Otitis history (monitor).",
    p: "DHPP booster administered IM. Continue Apoquel 5.4mg PRN. Next wellness Apr 2027.",
  },
  {
    dateFull: "15 Jan 2026",
    reason: "Allergy flare",
    pills: ["Sick visit", "Allergy"],
    vetByline: "Dr Sagar Bhongale",
    s: "Increased scratching, mild redness on belly and inner thighs over past 4 days. No diet changes.",
    o: "T 38.3°C, P 90, R 22. Mild erythema on ventral abdomen and inguinal area. No primary lesions. Ears clear.",
    a: "Mild contact dermatitis, likely seasonal allergy flare (chronic).",
    p: "Cetirizine 10mg PO BID × 7 days. Recheck if not improving by 22 Jan. Hypoallergenic shampoo if persists.",
  },
];

// --- Demo broadcast content ---

export const demoBroadcast = {
  title: "How to care for your dog in the summer",
  slug: "summer-dog-care",
  summary: [
    "Unlimited fresh water, change twice daily",
    "Protect paws, asphalt over 50°C burns",
    "NEVER leave in a parked car",
    "Walk before 7am or after 7pm",
    "Heat stroke: panting, drool, vomiting, collapse",
  ],
  body:
    "Maharashtra summers are tough on dogs. They don't sweat like us and can overheat quickly, especially short-nosed breeds and seniors.",
  warningSigns: [
    "Excessive panting that doesn't slow",
    "Thick drool · vomiting",
    "Bright red gums",
    "Stumbling or collapse",
    "Temp above 39.5°C",
  ],
  escalation: [
    "If temp over 39.5°C OR dog can't stand, emergency.",
    "Call AMS: +91 20 2612 3456",
    "En route: cool water + AC full blast.",
  ],
  audience: {
    species: "Dogs only",
    ageRange: "0 to 15 years",
    deceased: "Excluded",
    pets: 187,
    households: 143,
    pctOfParents: 94,
    pctScope: "dog" as const,
  },
};

