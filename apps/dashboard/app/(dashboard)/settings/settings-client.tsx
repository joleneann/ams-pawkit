"use client";

import { useState, useTransition, useRef } from "react";
import { SignOut as LogOut, User, Pencil, Check, X, CircleNotch as Loader2 } from "@phosphor-icons/react";
import { useLanguage } from "@/components/language-provider";
import type { Lang } from "@/lib/i18n-strings";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  updateVetFieldAction,
  updateVetLanguageAction,
  uploadVetAvatarAction,
  uploadClinicLogoAction,
  updateClinicFieldAction,
} from "./actions";

type VetData = {
  id: string;
  fullName: string;
  shortName: string;
  initials: string;
  vetLicense: string;
  phone: string;
  email: string;
  emailAdded: boolean;
  avatarUrl: string | null;
  language: "EN" | "MR";
};

type ClinicData = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  gstin: string;
  hours: string;
  phone: string;
  logoUrl: string | null;
  initials: string;
};

/**
 * Settings — three stacked cards (Profile / Account / Clinic) + Sign-out card
 * on the rail-tint ground. Locked 2026-05-15 evening to let the new
 * mauve-gray ground show between cards.
 *
 * Edit affordance: top-right of each card. Click Edit → all editable rows in
 * the card transform to inputs (Input + Upload appear), Save / Cancel replace
 * the Edit button. Account card has no Edit button because Phone is read-only
 * and the Language toggle is always-live.
 *
 * Read-only fields: Vet license (Profile), Phone (Account), Hours line (Clinic).
 * Address text follows the address row's state — editable inside Clinic edit
 * mode, multi-line textarea.
 */
export function SettingsClient({ vet, clinic }: { vet: VetData; clinic: ClinicData }) {
  const [signoutOpen, setSignoutOpen] = useState(false);

  return (
    <div className="max-w-[760px] mx-auto px-7 pt-7 pb-16">
      <div className="flex flex-col gap-5">
        <ProfileCard vet={vet} />
        <AccountCard vet={vet} />
        <ClinicCard clinic={clinic} />
      </div>
      <SignoutButton onClick={() => setSignoutOpen(true)} />
      <Footer />
      <SignoutDialog open={signoutOpen} onOpenChange={setSignoutOpen} />
    </div>
  );
}

// =====================================================================
// Card shell + header
// =====================================================================

function Card({ children }: { children: React.ReactNode }) {
  return (
    <article className="bg-canvas border border-rule rounded-2xl px-7 py-6">
      {children}
    </article>
  );
}

function CardHeader({
  label,
  editing,
  pending,
  onEdit,
  onSave,
  onCancel,
}: {
  label: string;
  editing?: boolean;
  pending?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
}) {
  const { t } = useLanguage();
  const editable = !!onEdit;
  return (
    <header className="flex items-center justify-between mb-4">
      <span className="text-md font-semibold text-ink">
        {label}
      </span>
      {editable && !editing && (
        <Button type="button" variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
          <Pencil className="w-3 h-3" strokeWidth={1.6} />
          {t("settings.field.edit")}
        </Button>
      )}
      {editable && editing && (
        <div className="flex gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={pending}
          >
            <X className="w-3 h-3" strokeWidth={2} />
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={onSave} disabled={pending} className="gap-1.5">
            {pending ? (
              <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
            ) : (
              <Check className="w-3 h-3" strokeWidth={2} />
            )}
            {pending ? "Saving..." : "Save"}
          </Button>
        </div>
      )}
    </header>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 items-center py-3.5 border-t border-rule-soft first:border-t-0">
      <div className="text-sm text-ink-50 font-medium">{label}</div>
      <div className="min-w-0 text-md text-ink font-semibold">{children}</div>
    </div>
  );
}

// =====================================================================
// Profile card
// =====================================================================

function ProfileCard({ vet }: { vet: VetData }) {
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(vet.fullName);
  const [email, setEmail] = useState(vet.email);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const save = () => {
    setErr(null);
    startTransition(async () => {
      const ops: Promise<{ ok: true } | { ok: false; error: string }>[] = [];
      if (fullName !== vet.fullName) ops.push(updateVetFieldAction("full_name", fullName));
      if (email !== vet.email) ops.push(updateVetFieldAction("email", email));
      const results = await Promise.all(ops);
      const failure = results.find((r) => !r.ok);
      if (failure && !failure.ok) {
        setErr(failure.error);
        return;
      }
      setEditing(false);
    });
  };

  const cancel = () => {
    setFullName(vet.fullName);
    setEmail(vet.email);
    setErr(null);
    setEditing(false);
  };

  return (
    <Card>
      <CardHeader
        label={t("settings.section.profile")}
        editing={editing}
        pending={pending}
        onEdit={() => setEditing(true)}
        onSave={save}
        onCancel={cancel}
      />
      <AvatarSlot
        vet={vet}
        editing={editing}
        label={t("settings.profile.photo.label")}
        help={t("settings.profile.photo.help")}
        uploadLabel={t("settings.profile.upload")}
      />
      <Row label={t("settings.profile.fullname")}>
        {editing ? (
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={pending}
            autoFocus
          />
        ) : (
          vet.fullName
        )}
      </Row>
      <Row label={t("settings.profile.license")}>
        <span className="font-tnum">{vet.vetLicense}</span>
      </Row>
      <Row label={t("settings.profile.email")}>
        {editing ? (
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
            placeholder={t("settings.profile.email.placeholder")}
          />
        ) : (
          email || (
            <span className="text-ink-faint italic font-normal">
              {t("settings.profile.email.placeholder")}
            </span>
          )
        )}
      </Row>
      {err && (
        <p className="mt-3 text-xs text-ink-50 italic" role="alert">
          {err}
        </p>
      )}
    </Card>
  );
}

// =====================================================================
// Account card — no Edit (Phone read-only, Language always-live)
// =====================================================================

function AccountCard({ vet }: { vet: VetData }) {
  const { t, lang, setLang } = useLanguage();
  return (
    <Card>
      <CardHeader label={t("settings.section.account")} />
      <Row label={t("settings.account.phone")}>
        <span className="font-tnum">{vet.phone}</span>
      </Row>
      <div className="grid grid-cols-[140px_1fr] gap-4 items-start py-3.5 border-t border-rule-soft">
        <div className="text-sm text-ink-50 font-medium pt-1.5">
          {t("settings.account.language")}
        </div>
        <div className="flex flex-col items-start gap-2">
          <LangToggle current={lang} onChange={setLang} />
          <p className="text-xs text-ink-50 leading-[1.55] max-w-[420px]">
            {t("settings.account.language.helper")}
          </p>
        </div>
      </div>
    </Card>
  );
}

// =====================================================================
// Clinic card
// =====================================================================

function ClinicCard({ clinic }: { clinic: ClinicData }) {
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  // Reconstruct the editable address string from the line-split format.
  const fullAddress = [clinic.addressLine1, clinic.addressLine2]
    .filter(Boolean)
    .join(", ");
  const [name, setName] = useState(clinic.name);
  const [phone, setPhone] = useState(clinic.phone);
  const [gstin, setGstin] = useState(clinic.gstin);
  const [address, setAddress] = useState(fullAddress);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const save = () => {
    setErr(null);
    startTransition(async () => {
      const ops: Promise<{ ok: true } | { ok: false; error: string }>[] = [];
      if (name !== clinic.name) ops.push(updateClinicFieldAction("name", name));
      if (phone !== clinic.phone) ops.push(updateClinicFieldAction("phone", phone));
      if (gstin !== clinic.gstin) ops.push(updateClinicFieldAction("gst", gstin));
      if (address !== fullAddress) ops.push(updateClinicFieldAction("address", address));
      const results = await Promise.all(ops);
      const failure = results.find((r) => !r.ok);
      if (failure && !failure.ok) {
        setErr(failure.error);
        return;
      }
      setEditing(false);
    });
  };

  const cancel = () => {
    setName(clinic.name);
    setPhone(clinic.phone);
    setGstin(clinic.gstin);
    setAddress(fullAddress);
    setErr(null);
    setEditing(false);
  };

  return (
    <Card>
      <CardHeader
        label={t("settings.section.clinic")}
        editing={editing}
        pending={pending}
        onEdit={() => setEditing(true)}
        onSave={save}
        onCancel={cancel}
      />
      <LogoSlot
        clinic={clinic}
        editing={editing}
        label={t("settings.clinic.logo")}
        help={t("settings.clinic.logo.help")}
        uploadLabel={t("settings.profile.upload")}
      />
      <Row label={t("settings.clinic.name")}>
        {editing ? (
          <Input value={name} onChange={(e) => setName(e.target.value)} disabled={pending} autoFocus />
        ) : (
          clinic.name
        )}
      </Row>
      <Row label={t("settings.clinic.phone")}>
        {editing ? (
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={pending}
            className="font-tnum"
          />
        ) : (
          <span className="font-tnum">{clinic.phone}</span>
        )}
      </Row>
      <Row label={t("settings.clinic.gstin")}>
        {editing ? (
          <Input
            value={gstin}
            onChange={(e) => setGstin(e.target.value)}
            disabled={pending}
            className="font-tnum"
          />
        ) : (
          <span className="font-tnum">{clinic.gstin}</span>
        )}
      </Row>
      <div className="grid grid-cols-[140px_1fr] gap-4 items-start py-3.5 border-t border-rule-soft">
        <div className="text-sm text-ink-50 font-medium pt-1.5">
          {t("settings.clinic.address")}
        </div>
        <div className="min-w-0">
          {editing ? (
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={pending}
              rows={2}
              className="resize-y leading-snug"
            />
          ) : (
            <div className="text-md text-ink font-semibold leading-[1.5]">
              <div>{clinic.addressLine1}</div>
              {clinic.addressLine2 && <div>{clinic.addressLine2}</div>}
            </div>
          )}
        </div>
      </div>
      {err && (
        <p className="mt-3 text-xs text-ink-50 italic" role="alert">
          {err}
        </p>
      )}
    </Card>
  );
}

// =====================================================================
// Sign-out card
// =====================================================================

function SignoutButton({ onClick }: { onClick: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="flex justify-center mt-6">
      <Button
        type="button"
        onClick={onClick}
        variant="ghost"
        size="sm"
        className="text-ink-50 hover:text-ink gap-1.5"
      >
        <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
        {t("settings.signout")}
      </Button>
    </div>
  );
}

// =====================================================================
// Avatar + Logo slots (upload affordance visible only when card is editing)
// =====================================================================

function AvatarSlot({
  vet,
  editing,
  label,
  help,
  uploadLabel,
}: {
  vet: VetData;
  editing: boolean;
  label: string;
  help: string;
  uploadLabel: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(vet.avatarUrl);

  const triggerUpload = () => fileRef.current?.click();
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") setPreviewUrl(ev.target.result);
    };
    reader.readAsDataURL(file);
    const fd = new FormData();
    fd.append("file", file);
    startTransition(async () => {
      const res = await uploadVetAvatarAction(fd);
      if (!res.ok) {
        setErr(res.error);
        setPreviewUrl(vet.avatarUrl);
      } else {
        setPreviewUrl(res.url);
      }
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 items-center py-3.5 border-t border-rule-soft first:border-t-0">
      <div className="text-sm text-ink-50 font-medium">{label}</div>
      <div className="flex items-center gap-3.5 min-w-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={editing ? triggerUpload : undefined}
          disabled={!editing || pending}
          aria-label={editing ? "Upload profile photo" : undefined}
          className="h-10 w-10 rounded-full border-[1.5px] border-rule bg-canvas-2 overflow-hidden hover:bg-canvas-2 disabled:cursor-default disabled:opacity-100 p-0"
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt={vet.fullName} className="w-full h-full object-cover" />
          ) : pending ? (
            <Loader2 className="w-4 h-4 text-ink-50 animate-spin" strokeWidth={1.5} />
          ) : (
            <span className="text-xs font-bold text-ink-70 tracking-wider">{vet.initials}</span>
          )}
        </Button>
        <div className="flex-1 min-w-0 text-xs text-ink-50 leading-[1.5]">
          {help}
          {err && (
            <div className="text-ink-50 italic mt-1" role="alert">
              {err}
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
        {editing && (
          <Button type="button" onClick={triggerUpload} disabled={pending} variant="outline" size="sm" className="shrink-0">
            {pending ? (
              <Loader2 className="w-3 h-3 animate-spin" strokeWidth={1.5} />
            ) : null}
            {pending ? "Uploading..." : uploadLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

function LogoSlot({
  clinic,
  editing,
  label,
  help,
  uploadLabel,
}: {
  clinic: ClinicData;
  editing: boolean;
  label: string;
  help: string;
  uploadLabel: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(clinic.logoUrl);

  const triggerUpload = () => fileRef.current?.click();
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") setPreviewUrl(ev.target.result);
    };
    reader.readAsDataURL(file);
    const fd = new FormData();
    fd.append("file", file);
    startTransition(async () => {
      const res = await uploadClinicLogoAction(fd);
      if (!res.ok) {
        setErr(res.error);
        setPreviewUrl(clinic.logoUrl);
      } else {
        setPreviewUrl(res.url);
      }
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 items-center py-3.5 border-t border-rule-soft first:border-t-0">
      <div className="text-sm text-ink-50 font-medium">{label}</div>
      <div className="flex items-center gap-3.5 min-w-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={editing ? triggerUpload : undefined}
          disabled={!editing || pending}
          aria-label={editing ? "Upload clinic logo" : undefined}
          className="h-10 w-10 rounded-md border-[1.5px] border-rule bg-canvas-2 overflow-hidden hover:bg-canvas-2 disabled:cursor-default disabled:opacity-100 p-0"
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt={`${clinic.name} logo`} className="w-full h-full object-cover" />
          ) : pending ? (
            <Loader2 className="w-4 h-4 text-ink-50 animate-spin" strokeWidth={1.5} />
          ) : (
            <span className="text-xxs font-bold text-ink-70 tracking-wider">{clinic.initials}</span>
          )}
        </Button>
        <div className="flex-1 min-w-0 text-xs text-ink-50 leading-[1.5]">
          {help}
          {err && (
            <div className="text-ink-50 italic mt-1" role="alert">
              {err}
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        {editing && (
          <Button type="button" onClick={triggerUpload} disabled={pending} variant="outline" size="sm" className="shrink-0">
            {pending ? (
              <Loader2 className="w-3 h-3 animate-spin" strokeWidth={1.5} />
            ) : null}
            {pending ? "Uploading..." : uploadLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// Language toggle (always-live)
// =====================================================================

function LangToggle({
  current,
  onChange,
}: {
  current: Lang;
  onChange: (l: Lang) => void;
}) {
  const [pending, startTransition] = useTransition();
  const pick = (l: Lang) => {
    onChange(l);
    startTransition(async () => {
      await updateVetLanguageAction(l);
    });
  };
  return (
    <ToggleGroup
      type="single"
      value={current}
      onValueChange={(v) => {
        if (v === "en" || v === "mr") pick(v);
      }}
      disabled={pending}
      aria-label="Dashboard language"
      className="bg-canvas-2 rounded-full p-1 inline-flex gap-1"
    >
      <ToggleGroupItem
        value="en"
        className="rounded-full px-3.5 h-7 text-xs font-semibold data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-ink-70"
      >
        English
      </ToggleGroupItem>
      <ToggleGroupItem
        value="mr"
        className="rounded-full px-3.5 h-7 text-xs font-semibold data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-ink-70"
      >
        मराठी
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

// =====================================================================
// Footer + Sign-out dialog
// =====================================================================

function Footer() {
  return (
    <div className="text-center mt-8 flex justify-center items-baseline gap-2">
      <span className="font-display text-xs font-bold text-ink-50">Pawkit</span>
      <span className="text-xxs text-ink-50">·</span>
      <span className="text-xxs text-ink-50 font-tnum tracking-wide">v0.1</span>
    </div>
  );
}

function SignoutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Sign out arrives in v0.1</DialogTitle>
          <DialogDescription>
            v0 is a single-vet demo: there is no login surface yet, so there is
            nothing to sign out of. Auth and multi-vet support land in v0.1,
            when the AMS pre-launch build adds proper roles and sessions.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)} size="sm">
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
