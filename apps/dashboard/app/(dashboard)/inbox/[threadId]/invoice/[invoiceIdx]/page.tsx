import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretLeft as ChevronLeft } from "@phosphor-icons/react/dist/ssr";
import { getPetByThread, getInvoiceDetail, getCurrentClinic } from "@/lib/data";
import { tServer } from "@/lib/i18n-server";

// v0 demo: always render fresh from DB. No Next.js fetch caching.
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Screen 04 — Itemised invoice (view-only).
 * Anatomy locked in `docs/layout-spec.md` Section 4 + `mockups/admin-locked.html`
 * Screen 04 (Direction A, Stripe-channeled).
 *
 * Server component fetching invoice + line items + clinic header from Supabase.
 * For Gabby's index-0 invoice the line items are the hand-authored seed
 * content (tooltips locked); other invoices map line_items from the DB.
 */
export default async function InvoicePage({
  params,
}: {
  params: { threadId: string; invoiceIdx: string };
}) {
  const invoiceIdx = parseInt(params.invoiceIdx, 10);
  let pet, invoice, clinic;
  try {
    pet = await getPetByThread(params.threadId);
    [invoice, clinic] = await Promise.all([
      getInvoiceDetail(pet.id, invoiceIdx),
      getCurrentClinic(),
    ]);
  } catch (e) {
    notFound();
  }

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

      <div className="max-w-[800px] mx-auto px-8 pt-6 pb-12">
        <header className="flex justify-between pb-5 border-b-2 border-ink mb-6">
          <div>
            <div className="font-display text-xl font-bold text-ink mb-[3px]">
              {clinic.name}
            </div>
            <div className="text-xs text-ink-soft font-tnum">
              Pune · GSTIN {clinic.gstin}
            </div>
          </div>
          <div className="text-right flex flex-col gap-1 items-end">
            <div className="font-display text-base font-semibold text-ink font-tnum">
              Invoice {invoice.number}
            </div>
            <div className="text-xs text-ink-soft font-tnum">
              Issued {invoice.issuedDate}
            </div>
          </div>
        </header>

        {invoice.categories.length === 0 ? (
          <p className="text-base text-ink-faint italic text-center py-16">
            No line items recorded for this invoice.
          </p>
        ) : (
          invoice.categories.map((cat) => (
            <section key={cat.name} className="mb-4">
              <div className="text-xxs font-medium text-ink-faint pb-2 border-b border-ink-faint mb-1">
                {cat.name}
              </div>
              {cat.lines.map((line, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_100px] gap-3 items-start py-3 border-b border-ink-faint last:border-b-0"
                >
                  <div>
                    <div className="text-base text-ink font-medium mb-[3px]">
                      {line.name}
                    </div>
                    {line.tooltip && (
                      <div className="text-xs text-ink-soft leading-[1.5]">
                        {line.tooltip}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-base font-semibold text-ink font-tnum">
                    {line.amount}
                  </div>
                </div>
              ))}
            </section>
          ))
        )}

        <div className="mt-7 pt-4 border-t-2 border-ink flex flex-col items-end gap-1">
          <div className="flex gap-7 items-baseline w-[280px] justify-between">
            <span className="font-display text-md font-bold text-ink">Total</span>
            <span className="font-display text-2xl font-bold text-ink font-tnum">
              {invoice.total}
            </span>
          </div>
          <div className="text-xs text-ink-faint italic text-right w-[280px] pt-1">
            GST included
          </div>
        </div>
      </div>
    </div>
  );
}
