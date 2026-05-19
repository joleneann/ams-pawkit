import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretLeft as ChevronLeft } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { getPetByThread, getSoapHistory, getClinicalHistory } from "@/lib/data";
import { tServer } from "@/lib/i18n-server";

// v0 demo: always render fresh from DB. No Next.js fetch caching.
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Screen 05 — Clinical history full screen (view-only SOAP cards).
 * Anatomy locked in `docs/layout-spec.md` Section 5 + `mockups/admin-locked.html`
 * Screen 05 (Direction C, Linear-channeled with metadata pills + 80px SOAP grid).
 *
 * Server component fetching SOAP history + a compact preview of older visits
 * from Supabase via `lib/data.ts`. For Gabby/Fernandes the SOAP cards are the
 * hand-authored seed content (preserves the locked demo narrative); other pets
 * get whatever's in the visits table.
 */
export default async function ClinicalHistoryPage({
  params,
}: {
  params: { threadId: string };
}) {
  let pet, soapCards, clinical;
  try {
    pet = await getPetByThread(params.threadId);
    [soapCards, clinical] = await Promise.all([
      getSoapHistory(pet.id),
      getClinicalHistory(pet.id),
    ]);
  } catch (e) {
    notFound();
  }

  const fullSoapCount = soapCards.length;
  const olderCompact = clinical.slice(fullSoapCount);

  return (
    <div className="overflow-y-auto">
      <Link
        href={`/inbox/${params.threadId}`}
        className="px-8 pt-4 flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
        {tServer("inbox.backToThreadWith")} {pet.household}{" "}
        {tServer("inbox.household.suffix")}
      </Link>

      <div className="max-w-[800px] mx-auto px-7 pt-7 pb-16">
        <header className="pb-3.5 border-b border-ink-faint" style={{ marginBottom: 22 }}>
          <h1 className="text-ink text-lg font-semibold mb-0.5">
            {pet.name} · Clinical history
          </h1>
          <p className="text-sm text-ink-soft">
            {pet.breed} · {pet.ageDisplay} {pet.sex} · {pet.household}{" "}
            {tServer("inbox.household.suffix")} · {clinical.length} visit
            {clinical.length === 1 ? "" : "s"}
          </p>
        </header>

        {soapCards.length === 0 ? (
          <p className="text-base text-ink-faint italic text-center py-16">
            No clinical history yet for {pet.name}.
          </p>
        ) : (
          <>
            {/* Visit cards aligned to the SoapContextStrip's expanded-view
                anatomy (locked 2026-05-18 v5): bg-canvas + border-rule +
                rounded-xl (not the bold ink frame), header reads "Title ·
                date · vet" inline with pill on the right, SOAP rows with
                uppercase eyebrows via the shared SoapRow below. */}
            {soapCards.map((visit, i) => (
              <article
                key={i}
                className="bg-canvas border border-rule rounded-xl px-6 py-5 mb-4"
              >
                <header className="flex items-baseline justify-between gap-3 mb-4 pb-3 border-b border-rule">
                  <div className="flex items-baseline gap-3 flex-wrap min-w-0">
                    <h2 className="text-ink font-semibold text-base m-0">
                      {visit.reason}
                    </h2>
                    <span className="text-ink-50 text-xs font-tnum">
                      {visit.dateFull} · {visit.vetByline}
                      {visit.editedAgo && ` · edited ${visit.editedAgo}`}
                    </span>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {/* Defensive: pills is typed `string[]` but legacy seed
                        rows occasionally surfaced undefined here. Fall back
                        to empty array. */}
                    {(visit.pills ?? []).map((p) => (
                      <Badge
                        key={p}
                        variant="secondary"
                        className="bg-canvas-2 border border-rule text-ink-70 uppercase tracking-wider text-xs"
                        style={{ letterSpacing: "0.04em" }}
                      >
                        {p}
                      </Badge>
                    ))}
                  </div>
                </header>

                <dl
                  className="grid gap-y-2.5 gap-x-6 m-0"
                  style={{ gridTemplateColumns: "110px 1fr" }}
                >
                  <SoapRow label="Subjective" body={visit.s ?? ""} />
                  <SoapRow label="Objective" body={visit.o ?? ""} />
                  <SoapRow label="Assessment" body={visit.a ?? ""} />
                  <SoapRow label="Plan" body={visit.p ?? ""} />
                </dl>
              </article>
            ))}

            {olderCompact.length > 0 && (
              <div className="mt-7 pt-5 border-t border-ink-faint">
                <p className="text-xs font-medium text-ink-faint mb-2.5">
                  Earlier visits (compact)
                </p>
                {olderCompact.map((v, i) => (
                  <div
                    key={i}
                    className="flex gap-4 py-2.5 border-b border-ink-faint last:border-b-0"
                  >
                    <div className="w-[60px] shrink-0 text-xs text-ink-faint font-tnum">
                      {v.date}, {v.year}
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-medium text-ink">{v.reason}</div>
                      <div className="text-xs text-ink-soft leading-[1.5]">{v.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * SOAP row. Matches the SoapContextStrip's expanded-view row anatomy so
 * the inline preview (in the thread detail page) and the full clinical
 * history page render identically. Locked 2026-05-18 v5.
 */
function SoapRow({ label, body }: { label: string; body: string }) {
  return (
    <>
      <dt className="text-xs text-ink-50 uppercase font-semibold tracking-[0.14em] m-0">
        {label}
      </dt>
      <dd className="text-ink text-sm leading-[1.55] m-0">{body}</dd>
    </>
  );
}
