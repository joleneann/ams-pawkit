"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PaperPlaneTilt as Send, Paperclip, ArrowRight, X, CircleNotch as Loader2 } from "@phosphor-icons/react";
import { VoiceMic } from "@/components/ui/voice-mic";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/components/language-provider";
import { usePollRefresh } from "@/components/hooks/use-poll-refresh";
import { sendReplyAction, uploadAttachmentAction } from "./actions";

type Mode = "single" | "queue";

/**
 * Inbox compose-reply bar (inbox-v2 lock 2026-05-15).
 *
 * Two modes:
 * - `single` — single-thread page. Send returns to /inbox. No skip button.
 * - `queue`  — reply-queue mode. Send & next → advances to nextThreadId
 *              (or /inbox if queue empty). Skip · later moves current to
 *              end of queue.
 *
 * Composer additions:
 * - Attach button (Paperclip) → opens file picker (image/* + video/*),
 *   uploads via uploadAttachmentAction, attaches to the next send.
 * - Language toggle ("This parent writes in X. · Reply in: [EN][MR]").
 * - Voice mic (Sarvam STT).
 */
export function ComposeReply({
  threadId,
  parentLanguage,
  mode,
  nextThreadId,
  queueIndex,
  queueTotal,
}: {
  threadId: string;
  parentLanguage: "en" | "mr";
  mode: Mode;
  nextThreadId?: string | null;
  queueIndex?: number;
  queueTotal?: number;
}) {
  usePollRefresh(mode === "single" ? 5000 : 0);
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<{
    url: string;
    type: "image" | "video";
    fileName: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [replyLang, setReplyLang] = useState<"en" | "mr">(parentLanguage);
  useEffect(() => {
    setReplyLang(parentLanguage);
  }, [parentLanguage, threadId]);

  const handleSend = () => {
    if ((!text.trim() && !attachment) || pending) return;
    setErr(null);
    startTransition(async () => {
      const res = await sendReplyAction(threadId, text, {
        attachmentUrl: attachment?.url,
        attachmentType: attachment?.type,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setText("");
      setAttachment(null);
      if (mode === "queue") {
        if (nextThreadId) {
          router.push(`/inbox/queue?thread=${nextThreadId}`);
        } else {
          // Queue empty → back to inbox (inbox-zero will render)
          router.push("/inbox");
        }
      } else {
        // Single mode: bounce back to the list
        router.push("/inbox");
      }
    });
  };

  const handleSkip = () => {
    if (mode !== "queue" || pending) return;
    if (nextThreadId) {
      router.push(`/inbox/queue?thread=${nextThreadId}&skipped=${threadId}`);
    } else {
      router.push("/inbox");
    }
  };

  const handleAttachClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await uploadAttachmentAction(fd);
      if (res.ok) {
        setAttachment({ url: res.url, type: res.type, fileName: file.name });
      } else {
        setErr(res.error);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const placeholder = replyLang === "mr" ? "उत्तर..." : "Reply to Anjali...";
  const parentHint =
    parentLanguage === "mr"
      ? "This parent writes in Marathi."
      : "This parent writes in English.";

  const canSend = (!!text.trim() || !!attachment) && !pending && !uploading;

  return (
    <div className="border-t border-rule bg-canvas px-7 pt-3.5 pb-4 flex flex-col gap-2.5 shrink-0">
      {/* Language affordance row */}
      <div className="flex items-center gap-2.5 text-sm text-ink-50">
        <span className="font-medium">{parentHint}</span>
        <span className="text-rule">·</span>
        <span className="font-medium">Reply in:</span>
        <ToggleGroup
          type="single"
          value={replyLang}
          onValueChange={(v) => {
            if (v === "en" || v === "mr") setReplyLang(v);
          }}
          size="sm"
          className="bg-canvas border border-rule rounded-full p-0.5"
        >
          <ToggleGroupItem
            value="en"
            aria-label="Reply in English"
            className="rounded-full px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            English
          </ToggleGroupItem>
          <ToggleGroupItem
            value="mr"
            aria-label="Reply in Marathi"
            className="rounded-full px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            मराठी
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Input field */}
      <Textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder={placeholder}
        rows={3}
        disabled={pending}
        className="min-h-[72px] text-md leading-[1.5] resize-y border-rule bg-transparent rounded-xl px-4 py-3.5"
      />

      {/* Attachment preview (if any) */}
      {attachment && (
        <div className="flex items-center gap-2.5 bg-canvas-2 border border-rule rounded-lg px-3 py-2">
          {attachment.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={attachment.url}
              alt="attachment preview"
              className="w-10 h-10 rounded object-cover"
            />
          ) : (
            <video src={attachment.url} className="w-14 h-10 rounded object-cover" />
          )}
          <span className="text-sm text-ink-70 flex-1 truncate font-medium">
            {attachment.fileName}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setAttachment(null)}
            aria-label="Remove attachment"
          >
            <X className="w-3.5 h-3.5" strokeWidth={1.6} />
          </Button>
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center gap-1.5 mt-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAttachClick}
          disabled={pending || uploading}
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.6} />
          ) : (
            <Paperclip className="w-3.5 h-3.5" strokeWidth={1.6} />
          )}
          Attach
        </Button>
        <VoiceMic
          lang={replyLang}
          onTranscript={(t) => setText((prev) => (prev ? prev + " " + t : t))}
        />
        <div className="ml-auto flex items-center gap-2.5">
          {mode === "queue" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              disabled={pending}
              className="text-ink-50 hover:text-ink"
            >
              Skip · later
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            size="cta"
          >
            {pending
              ? mode === "queue"
                ? "Sending..."
                : "Sending..."
              : mode === "queue"
                ? "Send & next"
                : replyLang === "mr"
                  ? "पाठवा"
                  : "Send"}
            {mode === "queue" && (
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} />
            )}
            {mode !== "queue" && (
              <Send className="w-3.5 h-3.5" strokeWidth={1.6} />
            )}
          </Button>
        </div>
      </div>

      {err && (
        <div className="text-xs text-ink-50 italic mt-1" role="alert">
          {err}
        </div>
      )}
    </div>
  );
}
