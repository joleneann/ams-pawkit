import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretLeft as ChevronLeft, FileText } from "@phosphor-icons/react/dist/ssr";
import { getPetByThread, getInvoicesForPet } from "@/lib/data";
import { tServer } from "@/lib/i18n-server";

// v0 demo: always render fresh from DB. No Next.js fetch caching.
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * All invoices for the pet whose thread is being viewed (locked 2026-05-15).
 *
 * The previous "Invoices ↗" link inside the SOAP context strip jumped
 * straight to the most-recent invoice (`/invoice/0`), which made the rest
 * of the pet's invoice history invisible. This list page exists so the vet
 * sees every invoice on file + can drill into any of them. The link in
 * the strip now reads "All Invoices ↗" and routes here.
 */
export default async function InvoicesListPage({
  params,
}: {
  params: { threadId: string };
}) {
  let pet, invoices;
  try {
    pet = await getPetByThread(params.threadId);
    invoices = await getInvoicesForPet(pet.id);
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

      <div className="max-w-[800px] mx-auto px-7 pt-7 pb-16">
        <header className="pb-3.5 border-b border-ink-faint mb-5">
          <h1 className="text-ink text-lg font-semibold mb-0.5">
            {pet.name} · Invoices
          </h1>
          <p className="text-sm text-ink-soft">
            {pet.breed} · {pet.ageDisplay} {pet.sex} · {pet.household}{" "}
            {tServer("inbox.household.suffix")} · {invoices.length} invoice
            {invoices.length === 1 ? "" : "s"}
          </p>
        </header>

        {invoices.length === 0 ? (
          <p className="text-base text-ink-faint italic text-center py-16">
            No invoices on file yet for {pet.name}.
          </p>
        ) : (
          <ul className="bg-canvas border border-rule rounded-2xl overflow-hidden">
            {invoices.map((inv, i) => (
              <li key={`${inv.date}-${i}`}>
                <Link
                  href={`/inbox/${params.threadId}/invoice/${i}`}
                  className={
                    "grid items-center gap-4 px-5 py-4 hover:bg-canvas-2 transition-colors " +
                    (i < invoices.length - 1 ? "border-b border-rule" : "")
                  }
                  style={{ gridTemplateColumns: "36px 1fr 120px 90px" }}
                >
                  <div className="w-9 h-9 rounded-full bg-canvas-2 border border-rule flex items-center justify-center shrink-0">
                    <FileText
                      className="w-4 h-4 text-ink-soft"
                      strokeWidth={1.6}
                    />
                  </div>
                  <span className="text-md font-semibold text-ink truncate">
                    {inv.title}
                  </span>
                  <span className="text-sm text-ink-soft font-tnum text-right font-medium">
                    {inv.amount}
                  </span>
                  <span className="text-sm text-ink-faint font-tnum text-right">
                    {inv.date}, {inv.year}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
