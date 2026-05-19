"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * Upload a profile photo to Supabase Storage (`pet-photos` bucket, vet-avatars
 * path) and set users.avatar_url to the public URL.
 *
 * We reuse the existing `pet-photos` bucket (public read) so we don't need a
 * new bucket. v0.1 should add a dedicated `clinic-staff-avatars` bucket.
 */
export async function uploadVetAvatarAction(formData: FormData): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const file = formData.get("file");
  if (!(file instanceof Blob)) return { ok: false, error: "file is required" };
  if (file.size > 2 * 1024 * 1024) return { ok: false, error: "Photo must be under 2MB" };

  const { data: vet } = await supabaseServer
    .from("users")
    .select("id")
    .eq("role", "vet")
    .limit(1)
    .single();
  if (!vet) return { ok: false, error: "No vet user in DB" };

  // Path: vet-avatars/<vet_id>-<timestamp>.<ext>
  const fileObj = file as File;
  const ext = (fileObj.name?.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `vet-avatars/${vet.id}-${Date.now()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabaseServer.storage
    .from("pet-photos")
    .upload(path, buffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: fileObj.type || "image/jpeg",
    });
  if (upErr) return { ok: false, error: upErr.message };

  const { data: pub } = supabaseServer.storage.from("pet-photos").getPublicUrl(path);
  const url = pub.publicUrl;

  const { error: updErr } = await supabaseServer
    .from("users")
    .update({ avatar_url: url })
    .eq("id", vet.id);
  if (updErr) return { ok: false, error: updErr.message };

  revalidatePath("/settings");
  return { ok: true, url };
}

/**
 * Upload a clinic logo to Supabase Storage and set clinics.logo_url.
 * Reuses the `broadcast-covers` bucket (public-read, vet-only-write per spec)
 * so we don't need to provision a new bucket for v0.
 */
export async function uploadClinicLogoAction(formData: FormData): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const file = formData.get("file");
  if (!(file instanceof Blob)) return { ok: false, error: "file is required" };
  if (file.size > 2 * 1024 * 1024) return { ok: false, error: "Logo must be under 2MB" };

  const { data: clinic } = await supabaseServer
    .from("clinics")
    .select("id")
    .limit(1)
    .single();
  if (!clinic) return { ok: false, error: "No clinic in DB" };

  const fileObj = file as File;
  const ext = (fileObj.name?.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `clinic-logos/${clinic.id}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabaseServer.storage
    .from("broadcast-covers")
    .upload(path, buffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: fileObj.type || "image/jpeg",
    });
  if (upErr) return { ok: false, error: upErr.message };

  const { data: pub } = supabaseServer.storage.from("broadcast-covers").getPublicUrl(path);
  const url = pub.publicUrl;
  const { error: updErr } = await supabaseServer
    .from("clinics")
    .update({ logo_url: url })
    .eq("id", clinic.id);
  if (updErr) return { ok: false, error: updErr.message };

  revalidatePath("/", "layout"); // refresh chrome on every route
  return { ok: true, url };
}

/**
 * Update clinic info on the single AMS row. Used by Settings -> Clinic inline edit.
 */
export async function updateClinicFieldAction(
  field: "name" | "address" | "phone" | "email" | "gst" | "license",
  value: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: clinic } = await supabaseServer
    .from("clinics")
    .select("id")
    .limit(1)
    .single();
  if (!clinic) return { ok: false, error: "No clinic in DB" };
  const { error } = await supabaseServer
    .from("clinics")
    .update({ [field]: value })
    .eq("id", clinic.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Update a single field on the vet user. v0 fields: full_name, email.
 * (vet_license is locked in v0 by the legacy clinical_lock convention;
 * Settings UI shows it read-only with an Edit affordance that no-ops.)
 */
export async function updateVetFieldAction(field: "full_name" | "email", value: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: vet } = await supabaseServer
    .from("users")
    .select("id")
    .eq("role", "vet")
    .limit(1)
    .single();
  if (!vet) return { ok: false, error: "No vet user in DB" };
  const { error } = await supabaseServer
    .from("users")
    .update({ [field]: value })
    .eq("id", vet.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Update the vet's preferred language. Also persists which language the
 * dashboard chrome renders in for v0 (still client-side via LanguageProvider
 * for instant feedback; this is the DB-side write for future sessions).
 */
export async function updateVetLanguageAction(lang: "en" | "mr"): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: vet } = await supabaseServer
    .from("users")
    .select("id")
    .eq("role", "vet")
    .limit(1)
    .single();
  if (!vet) return { ok: false, error: "No vet user in DB" };
  const { error } = await supabaseServer
    .from("users")
    .update({ preferred_language: lang })
    .eq("id", vet.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
