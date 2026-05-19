"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CaretLeft as ChevronLeft, ArrowClockwise } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

/**
 * Error boundary for the clinical history page.
 *
 * Next.js renders this when the server component throws OR when a client
 * component nested inside hits a runtime exception. Without this file the
 * default behavior is the giant "Application error: a client-side exception
 * has occurred" page — unacceptable for the demo.
 *
 * Locked 2026-05-18 v4 after the user reported intermittent "View visits"
 * crashes. The error is captured + logged, the vet sees a sensible fallback
 * with two recovery paths (Try again, Back to inbox).
 */
export default function ClinicalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface in dev terminal so we can identify the actual throw next time.
    console.error("[clinical/error.tsx]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="overflow-y-auto">
      <Link
        href="/inbox"
        className="px-8 pt-4 flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
        Back to inbox
      </Link>

      <div className="max-w-[640px] mx-auto px-7 pt-12 pb-16 text-center">
        <h1 className="text-ink text-2xl font-semibold mb-2">
          Couldn&apos;t load the clinical history
        </h1>
        <p className="text-sm text-ink-soft mb-8 max-w-[420px] mx-auto leading-[1.6]">
          Something hiccupped while pulling this pet&apos;s visits. The
          underlying data is safe — this is just a render hiccup. Try again,
          or come back from the inbox list.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            onClick={reset}
            size="cta"
            className="gap-2"
          >
            <ArrowClockwise className="w-4 h-4" weight="bold" />
            Try again
          </Button>
          <Button type="button" variant="outline" asChild size="cta">
            <Link href="/inbox">Back to inbox</Link>
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && error.message && (
          <pre className="mt-10 text-left text-xs text-ink-faint bg-canvas-2 border border-rule rounded-md p-4 overflow-auto max-h-[200px]">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        )}
      </div>
    </div>
  );
}
