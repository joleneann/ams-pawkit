"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CaretLeft as ChevronLeft, Check, WarningCircle as CircleAlert, CircleNotch as Loader2 } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/language-provider";
import type { InvoiceDetail } from "@/lib/seed";
import { markInvoicePaidAction } from "../actions";

type InvoiceWithStatus = InvoiceDetail & {
  status: "paid" | "unpaid";
  paidAt: string | null;
};

type ClinicHeader = {
  name: string;
  gstin: string;
};

/**
 * Billing-scoped invoice detail client. Same layout as the per-pet invoice
 * viewer at /inbox/[threadId]/invoice/[invoiceIdx] (so vets recognise the
 * itemised-invoice document instantly) but with:
 *   - "Back to Billing" link (not "Back to thread")
 *   - A status pill in the invoice header (paid / unpaid)
 *   - A "Mark paid" CTA next to the Total when status is unpaid
 *
 * Mark paid triggers a server action that updates the row + revalidates
 * /billing + /billing/[invoiceId] so the ledger + KPIs update on the next
 * navigation.
 */
export function BillingDetailClient({
  invoice,
  clinic,
}: {
  invoice: InvoiceWithStatus;
  clinic: ClinicHeader;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const handleMarkPaid = () => {
    if (pending) return;
    setErr(null);
    startTransition(async () => {
      const res = await markInvoicePaidAction(invoice.id);
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="overflow-y-auto">
      <Link
        href="/billing"
        className="px-8 pt-4 flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
        {t("billing.detail.back")}
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
            <div className="mt-1.5">
              {invoice.status === "paid" ? (
                <Badge
                  variant="outline"
                  className="bg-canvas-2 border-transparent text-ink-70 gap-1.5 font-semibold whitespace-nowrap"
                >
                  <Check className="w-2.5 h-2.5" strokeWidth={2} />
                  {invoice.paidAt
                    ? `Paid ${new Date(invoice.paidAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        timeZone: "Asia/Kolkata",
                      })}`
                    : "Paid"}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-berry-soft border-transparent text-berry-deep gap-1.5 font-semibold whitespace-nowrap"
                >
                  <CircleAlert className="w-2.5 h-2.5" strokeWidth={2} />
                  {t("billing.status.unpaid")}
                </Badge>
              )}
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

          {invoice.status === "unpaid" && (
            <div className="mt-5 w-[280px] flex flex-col gap-1.5">
              <Button
                type="button"
                size="cta"
                onClick={handleMarkPaid}
                disabled={pending}
                className="w-full"
              >
                {pending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.6} />
                    {t("billing.detail.markPaid.pending")}
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" strokeWidth={1.8} />
                    {t("billing.detail.markPaid")}
                  </>
                )}
              </Button>
              {err && (
                <p className="text-xs text-ink-50 italic text-right" role="alert">
                  {err}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
