"use client";

import { useState } from "react";
import { PaperPlaneTilt as Send, CircleNotch as Loader2, WarningCircle as AlertCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { BroadcastDraft } from "@/app/(dashboard)/broadcasts/draft-state";
import { publishBroadcastAction } from "@/app/(dashboard)/broadcasts/actions";

/**
 * Send confirm modal — the bilingual publish-block (locked 2026-05-15).
 *
 * Shows EN + MR side-by-side title + body excerpts. The "Both look right"
 * checkbox arms the Send button. Clicking Send fires `publishBroadcastAction`
 * and navigates to the detail page on success.
 *
 * Reuses the EN+MR review-flag state from `BroadcastDraft.reviewedEn /
 * reviewedMr` — those flags get flipped by the Preview overlay too. The
 * checkbox in this modal is a final "I confirm" act, not a substitute for
 * having actually viewed the languages in preview.
 */
export function SendConfirmModal({
  open,
  draft,
  audienceSummary,
  onClose,
  onSent,
}: {
  open: boolean;
  draft: BroadcastDraft;
  audienceSummary: string;
  onClose: () => void;
  onSent: (broadcastId: string) => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enReady = !!draft.en.title.trim() && !!draft.en.body.trim();
  const mrReady = !!draft.mr.title.trim() && !!draft.mr.body.trim();
  // Send is no longer gated on previewing both languages (locked 2026-05-18
  // v3 per user feedback: the bilingual-review gate was unnecessary friction).
  // The vet still needs at least one language to be ready; an untranslated
  // language surfaces a non-blocking warning so parents who prefer that
  // language know they won't see this broadcast.
  const canSend = (enReady || mrReady) && confirmed && !sending;

  const handleSend = async () => {
    setError(null);
    setSending(true);
    try {
      const res = await publishBroadcastAction({
        en: draft.en,
        mr: draft.mr,
        conditionGroups: draft.conditionGroups,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onSent(res.broadcastId);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !sending) onClose();
      }}
    >
      <DialogContent className="max-w-[600px] p-0 overflow-hidden gap-0 rounded-2xl">
        <DialogHeader className="px-7 pt-6 pb-4 border-b border-rule">
          <DialogTitle className="text-ink text-lg font-semibold">
            Ready to send?
          </DialogTitle>
          <DialogDescription className="text-sm text-ink-soft mt-0.5">
            Sending to {audienceSummary}. Please review both languages before
            you publish.
          </DialogDescription>
        </DialogHeader>

        <div className="px-7 py-5 grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <LangPreview
            label="English"
            ready={enReady}
            title={draft.en.title}
            body={draft.en.body}
          />
          <LangPreview
            label="मराठी"
            ready={mrReady}
            title={draft.mr.title}
            body={draft.mr.body}
          />
        </div>

        {/* Non-blocking warning when a language is empty — parents who prefer
            that language will only see the other one in their inbox. Vet can
            still send; this is just heads-up. */}
        {(!enReady || !mrReady) && (
          <div className="mx-7 mb-3 px-3 py-2 rounded-lg bg-canvas-2 border-[1.5px] border-ink flex items-start gap-2">
            <AlertCircle
              className="w-4 h-4 text-ink mt-0.5 shrink-0"
              strokeWidth={1.7}
            />
            <p className="text-sm text-ink leading-snug">
              {!enReady && !mrReady
                ? "No content yet. Add either an English or Marathi version before sending."
                : !mrReady
                  ? "Marathi version is empty. Parents with a Marathi preference won't see this broadcast."
                  : "English version is empty. Parents with an English preference won't see this broadcast."}
            </p>
          </div>
        )}

        <div className="px-7 pb-3">
          <label className="flex items-start gap-3 cursor-pointer select-none py-2 group">
            <Checkbox
              checked={confirmed}
              onCheckedChange={(v) => setConfirmed(v === true)}
              className="h-5 w-5 mt-0.5 shrink-0"
            />
            <span className="text-base font-medium text-ink leading-[1.5]">
              Send to <span className="font-semibold">{audienceSummary}</span>.
            </span>
          </label>
        </div>

        {error && (
          <div className="mx-7 mb-3 px-3 py-2 rounded-lg bg-canvas-2 border-[1.5px] border-ink flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-ink mt-0.5 shrink-0" strokeWidth={1.7} />
            <p className="text-sm text-ink font-medium">{error}</p>
          </div>
        )}

        <div className="border-t border-rule px-7 py-4 flex items-center gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="gap-2"
          >
            {sending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.7} />
            ) : (
              <Send className="w-3.5 h-3.5" strokeWidth={1.7} />
            )}
            Send broadcast
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LangPreview({
  label,
  ready,
  title,
  body,
}: {
  label: string;
  ready: boolean;
  /** previewed flag is no longer surfaced as a label here — the bilingual
   *  preview gate was dropped 2026-05-18 v4, so "Not previewed" / "Viewed
   *  in preview" was just noise. Keeping the prop on the call site for
   *  backward-compat is fine; this signature ignores it. */
  title: string;
  body: string;
}) {
  return (
    <div className="bg-canvas-2/50 border border-rule rounded-xl p-3.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
          {label}
        </span>
        {!ready && (
          <span className="text-xs font-medium text-ink-faint italic">
            Empty
          </span>
        )}
      </div>
      {ready ? (
        <>
          <p className="text-base font-semibold text-ink leading-snug mb-1 line-clamp-2">
            {title}
          </p>
          <p className="text-sm text-ink-soft leading-snug line-clamp-3">
            {body}
          </p>
        </>
      ) : (
        <p className="text-sm text-ink-faint italic">
          Missing — fill the title and body in this language before sending.
        </p>
      )}
    </div>
  );
}
