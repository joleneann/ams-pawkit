import { notFound } from "next/navigation";
import { getInvoiceById, getCurrentClinic } from "@/lib/data";
import { BillingDetailClient } from "./billing-detail-client";

// v0 demo: always render fresh so a Mark-paid action updates immediately.
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Billing-scoped invoice detail (Screen 08b, locked 2026-05-15).
 *
 * Reuses the itemised invoice layout from the per-pet route
 * (`/inbox/[threadId]/invoice/[invoiceIdx]`) but adds:
 *   - A "Back to Billing" link instead of "Back to thread"
 *   - A Mark-paid CTA when status is unpaid
 *
 * Clicking Mark paid flips status to 'paid' + sets paid_at to now(), then
 * revalidates the landing + detail paths so KPIs + ledger reflect immediately.
 */
export default async function BillingInvoicePage({
  params,
}: {
  params: { invoiceId: string };
}) {
  let invoice, clinic;
  try {
    [invoice, clinic] = await Promise.all([
      getInvoiceById(params.invoiceId),
      getCurrentClinic(),
    ]);
  } catch (e) {
    notFound();
  }

  return <BillingDetailClient invoice={invoice} clinic={clinic} />;
}
