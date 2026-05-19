"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * Send a vet reply on an open thread.
 * Inserts into messages + marks all unreplied parent messages in the thread as
 * replied. Returns the new message id so the client can append optimistically.
 *
 * Inbox-v2 addition (2026-05-15): optional `attachment` payload with the
 * already-uploaded public URL + type. The client uploads first via
 * `uploadAttachmentAction`, then passes the resulting URL here.
 */
export async function sendReplyAction(
  threadId: string,
  body: string,
  opts?: { attachmentUrl?: string; attachmentType?: "image" | "video" }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = body.trim();
  const hasAttachment = !!opts?.attachmentUrl && !!opts?.attachmentType;
  if (!trimmed && !hasAttachment) {
    return { ok: false, error: "Reply cannot be empty." };
  }

  // Look up vet + household + pet from the thread
  const { data: contextMsg, error: ctxErr } = await supabaseServer
    .from("messages")
    .select("pet_id, household_id, thread_id")
    .eq("thread_id", threadId)
    .limit(1)
    .single();
  if (ctxErr || !contextMsg) {
    return { ok: false, error: `Thread ${threadId} not found.` };
  }
  const { data: vet } = await supabaseServer
    .from("users")
    .select("id")
    .eq("role", "vet")
    .limit(1)
    .single();
  if (!vet) return { ok: false, error: "No vet user in DB." };

  const nowIso = new Date().toISOString();

  // Insert the vet reply
  const { error: insErr } = await supabaseServer.from("messages").insert({
    pet_id: contextMsg.pet_id,
    household_id: contextMsg.household_id,
    thread_id: threadId,
    sender_type: "vet",
    sender_id: vet.id,
    body: trimmed,
    created_at: nowIso,
    attachment_type: hasAttachment ? opts!.attachmentType : null,
    attachment_url: hasAttachment ? opts!.attachmentUrl : null,
  });
  if (insErr) return { ok: false, error: insErr.message };

  // Mark all prior unreplied parent messages in this thread as replied
  const { error: updErr } = await supabaseServer
    .from("messages")
    .update({ replied_at: nowIso, replied_by: vet.id })
    .eq("thread_id", threadId)
    .eq("sender_type", "parent")
    .is("replied_at", null);
  if (updErr) return { ok: false, error: updErr.message };

  // Revalidate so the inbox list + this thread reflect the new state
  revalidatePath("/inbox");
  revalidatePath(`/inbox/${threadId}`);
  return { ok: true };
}

/**
 * Upload a vet-side attachment (image or video) to Supabase Storage.
 * Inbox-v2 addition 2026-05-15.
 *
 * Routes by MIME type:
 *   image/* → messages-images bucket
 *   video/* → messages-videos bucket
 *
 * Returns the public URL. Note: the buckets are currently public:false +
 * public:false respectively per the supabase-config; we use signed/public
 * URLs via the SDK. For v0 demo we upload via service-role client and
 * return the Supabase public-object URL — RLS policies remain aspirational
 * per docs/open-issues.md.
 */
export async function uploadAttachmentAction(
  fd: FormData
): Promise<
  | { ok: true; url: string; type: "image" | "video" }
  | { ok: false; error: string }
> {
  const file = fd.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "No file provided." };
  }
  const mime = file.type;
  const kind: "image" | "video" | null = mime.startsWith("image/")
    ? "image"
    : mime.startsWith("video/")
      ? "video"
      : null;
  if (!kind) {
    return {
      ok: false,
      error: "Only image and video attachments are supported.",
    };
  }

  // 10MB cap per attachment
  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    return { ok: false, error: "Attachment too large (max 10MB)." };
  }

  const bucket = kind === "image" ? "messages-images" : "messages-videos";
  const ext = file.name.includes(".")
    ? file.name.split(".").pop()!.toLowerCase()
    : kind === "image"
      ? "jpg"
      : "mp4";
  const objectName = `vet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadErr } = await supabaseServer.storage
    .from(bucket)
    .upload(objectName, arrayBuffer, {
      contentType: mime,
      upsert: false,
    });
  if (uploadErr) return { ok: false, error: uploadErr.message };

  // Build a public URL (works for both public + private buckets via Supabase
  // public-object URL signing; v0 RLS doesn't enforce). Future: signed URLs
  // with TTL when RLS lands per docs/open-issues.md.
  const { data: pub } = supabaseServer.storage
    .from(bucket)
    .getPublicUrl(objectName);

  return { ok: true, url: pub.publicUrl, type: kind };
}

/**
 * Mark thread's parent messages as seen by the vet (read receipt).
 * Fires when the vet opens a thread detail page.
 */
export async function markThreadReadAction(threadId: string): Promise<void> {
  await supabaseServer
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("thread_id", threadId)
    .eq("sender_type", "parent")
    .is("read_at", null);
  revalidatePath("/inbox");
}
