"use server";

import { revalidatePath } from "next/cache";
import { markInvoicePaid } from "@/lib/data";

/**
 * Flip an unpaid invoice to paid. Idempotent.
 *
 * Called from the /billing/[invoiceId] detail page when Sagar confirms a
 * parent settled at the desk. revalidatePath flushes the cached billing
 * landing + detail views so KPIs + ledger update immediately.
 */
export async function markInvoicePaidAction(
  invoiceId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await markInvoicePaid(invoiceId);
    revalidatePath("/billing");
    revalidatePath(`/billing/${invoiceId}`);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Mark paid failed" };
  }
}
