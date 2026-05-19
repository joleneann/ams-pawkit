"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type {
  Condition,
  ConditionField,
  ConditionGroup,
  LastVisitWindow,
  SpeciesValue,
  DeceasedValue,
} from "@/app/(dashboard)/broadcasts/draft-state";
import { DEFAULT_GROUP_CONDITIONS, readCondition } from "@/app/(dashboard)/broadcasts/draft-state";
import {
  getAudienceCountAction,
  type AudienceCountResult,
} from "@/app/(dashboard)/broadcasts/actions";

/**
 * Custom audience modal (locked 2026-05-15 broadcast composer rebuild).
 *
 * Opens from the Custom… / Edit filters button on the audience strip. Shows
 * one or more condition groups (OR-unioned at the top level; each group's
 * conditions are AND-joined). Live audience-size footer updates as the vet
 * tweaks conditions — 250ms debounce against `getAudienceCountAction()`.
 *
 * The modal operates on a LOCAL copy of the groups; Apply commits back to
 * the draft via `onApply()`. Cancel / Esc / backdrop click discards.
 */
export function AudienceModal({
  open,
  initialGroups,
  onApply,
  onClose,
}: {
  open: boolean;
  initialGroups: ConditionGroup[];
  onApply: (groups: ConditionGroup[]) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [groups, setGroups] = useState<ConditionGroup[]>(initialGroups);
  const [count, setCount] = useState<AudienceCountResult | null>(null);
  const [computing, setComputing] = useState(false);

  // Seed local groups ONLY when the modal transitions from closed to open.
  // The previous version listed `initialGroups` in the deps, which caused the
  // local state to reset every time the parent re-rendered with a new
  // initialGroups reference (e.g. on every keystroke in the composer above).
  // That's the "tab keeps resetting unnecessarily" bug — locked fix 2026-05-18.
  // Single condition group only per the 2026-05-15 lock.
  useEffect(() => {
    if (!open) return;
    if (initialGroups.length === 0) {
      setGroups([
        {
          id: `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          conditions: [...DEFAULT_GROUP_CONDITIONS],
          op: "AND",
        },
      ]);
    } else {
      setGroups(initialGroups.slice(0, 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Debounced live count.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setComputing(true);
    const handle = setTimeout(() => {
      getAudienceCountAction(groups)
        .then((res) => {
          if (!cancelled) setCount(res);
        })
        .finally(() => {
          if (!cancelled) setComputing(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [open, groups]);

  const updateGroup = (idx: number, next: ConditionGroup) => {
    setGroups((prev) => prev.map((g, i) => (i === idx ? next : g)));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        className="max-w-[760px] max-h-[calc(100vh-64px)] p-0 overflow-hidden gap-0 rounded-2xl"
      >
        <DialogHeader className="px-7 pt-6 pb-5 border-b border-rule">
          <DialogTitle className="text-ink text-lg font-semibold">
            {t("audience.modal.title")}
          </DialogTitle>
          <DialogDescription className="text-sm text-ink-soft mt-0.5">
            {t("audience.modal.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-7 py-6 max-h-[calc(100vh-280px)] flex flex-col gap-5 bg-canvas-2/40">
          {/* Exactly one group ever — OR-multiple-groups removed
              2026-05-15 per locked single-group semantic. */}
          {groups[0] ? (
            <GroupCard
              key={groups[0].id}
              group={groups[0]}
              label="Condition group"
              onChange={(next) => updateGroup(0, next)}
            />
          ) : (
            <div className="bg-canvas border border-dashed border-rule rounded-[14px] px-5 py-8 text-center">
              <p className="text-sm text-ink-soft mb-3">
                {t("audience.empty.headline")}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setGroups([
                    {
                      id: `g-${Date.now().toString(36)}-${Math.random()
                        .toString(36)
                        .slice(2, 6)}`,
                      conditions: DEFAULT_GROUP_CONDITIONS.map((c) => ({ ...c })),
                      op: "AND",
                    },
                  ])
                }
              >
                {t("audience.empty.cta")}
              </Button>
            </div>
          )}
        </div>

        <div className="border-t border-rule px-7 py-4 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-sm text-ink-soft font-tnum">
              {count ? (
                <>
                  <span className="font-semibold text-ink">{count.pets} pets</span>
                  {" · "}
                  {count.households} households
                  {count.pctOfParents > 0 && (
                    <>
                      {" · "}
                      {count.pctOfParents}%{" "}
                      {count.pctScope === "dog"
                        ? "of dog parents"
                        : count.pctScope === "cat"
                          ? "of cat parents"
                          : "of all parents"}
                    </>
                  )}
                </>
              ) : (
                <span className="italic text-ink-faint">
                  {computing ? "Counting..." : "—"}
                </span>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              // Clear empties the audience entirely (locked 2026-05-18 v4
              // after the user said "Clear still doesn't do shit, 100% of
              // parents still selected"). Setting groups to [] makes the
              // live count drop to 0/0/0%, which is the visible signal that
              // the audience is truly cleared. Vet picks again or Applies
              // the empty state (composer will show "Select audience").
              setGroups([]);
            }}
            className="text-ink-soft hover:text-ink"
          >
            {t("audience.footer.clear")}
          </Button>
          <Button type="button" onClick={() => onApply(groups)}>
            {t("audience.footer.apply")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Group card (one condition group)
// ============================================================================

function GroupCard({
  group,
  label,
  onChange,
}: {
  group: ConditionGroup;
  label: string;
  onChange: (next: ConditionGroup) => void;
}) {
  const updateCondition = useCallback(
    (field: ConditionField, value: Condition["value"]) => {
      onChange({
        ...group,
        conditions: group.conditions.map((c) =>
          c.field === field ? ({ ...c, value } as Condition) : c
        ),
      });
    },
    [group, onChange]
  );

  return (
    <div className="bg-canvas border border-rule rounded-[14px] px-5 py-4">
      {/* "Condition group" header + WHERE/AND connector chips removed
          2026-05-18 v3 — single-group semantic doesn't need legend chrome. */}
      <ConditionRow field="Species" operator="is">
        <Seg
          options={[
            { value: "dog", label: "Dogs" },
            { value: "cat", label: "Cats" },
            { value: "both", label: "Dogs and cats" },
          ]}
          value={(readCondition(group, "species") ?? "both") as SpeciesValue}
          onChange={(v) => updateCondition("species", v)}
        />
      </ConditionRow>

      <ConditionRow field="Age range" operator="is">
        <AgeRangeInput
          value={readCondition(group, "ageRange") ?? { min: 0, max: 30 }}
          onChange={(v) => updateCondition("ageRange", v)}
        />
      </ConditionRow>

      <ConditionRow field="Deceased pets" operator="is">
        <Seg
          options={[
            { value: "include", label: "Include" },
            { value: "exclude", label: "Exclude" },
          ]}
          value={(readCondition(group, "deceased") ?? "include") as DeceasedValue}
          onChange={(v) => updateCondition("deceased", v)}
        />
      </ConditionRow>

      <ConditionRow field="Last visit" operator="within">
        <Seg
          options={[
            { value: "3m", label: "3 months" },
            { value: "12m", label: "12 months" },
            { value: "24m", label: "24 months" },
            { value: "any", label: "Any" },
          ]}
          value={(readCondition(group, "lastVisit") ?? "any") as LastVisitWindow}
          onChange={(v) => updateCondition("lastVisit", v)}
        />
      </ConditionRow>
    </div>
  );
}

// ============================================================================
// Condition row: Where/And · field name · operator · value control
// ============================================================================

function ConditionRow({
  field,
  operator,
  children,
}: {
  field: string;
  operator: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-3.5 py-3 border-t border-rule first:border-t-0 first:pt-3">
      <div
        className="grid items-center gap-3.5"
        style={{ gridTemplateColumns: "130px 36px 1fr" }}
      >
        <span className="text-base font-semibold text-ink">{field}</span>
        <span className="text-sm text-ink-faint">{operator}</span>
        <div className="flex items-center gap-2 flex-wrap min-w-0">{children}</div>
      </div>
    </div>
  );
}

// ============================================================================
// Segmented control (rounded-md track + on-state berry pill)
// ============================================================================

function Seg<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v) onChange(v as T);
      }}
      className="inline-flex bg-canvas-2 rounded-lg p-0.5 gap-0.5"
    >
      {options.map((opt) => (
        <ToggleGroupItem
          key={opt.value}
          value={opt.value}
          className="h-8 px-3.5 rounded-md text-sm font-semibold transition-colors text-ink-soft hover:text-ink data-[state=on]:bg-primary data-[state=on]:text-canvas"
        >
          {opt.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

// ============================================================================
// Age range input: from N to M years
// ============================================================================

/**
 * Age range input with an "All" tickbox (locked 2026-05-18 v2). The audience
 * matcher in actions.ts treats `min<=0 && max>=30` as "any age" and includes
 * pets whose age is null. The tickbox writes those exact sentinel values so
 * the DB persistence + the live count both interpret "All" correctly without
 * any new schema. When "All" is unchecked, the vet edits the from/to inputs
 * directly.
 */
/**
 * Age range input with an "All" tickbox. Layout (2026-05-18 v3): the All
 * tickbox sits AFTER the years inputs, sized 20×20 so it's actually visible.
 * When checked: writes {min: 0, max: 30}, the sentinel the audience matcher
 * (actions.ts line 137) treats as "any age" including null-age pets.
 */
function AgeRangeInput({
  value,
  onChange,
}: {
  value: { min: number; max: number };
  onChange: (v: { min: number; max: number }) => void;
}) {
  const isAll = value.min <= 0 && value.max >= 30;
  return (
    <>
      <span className={cn("text-sm text-ink-soft", isAll && "opacity-40")}>
        from
      </span>
      <Input
        type="number"
        min={0}
        max={30}
        value={value.min}
        onChange={(e) => onChange({ ...value, min: Number(e.target.value) || 0 })}
        disabled={isAll}
        className={cn(
          "w-14 h-8 px-2 text-center text-sm font-semibold text-ink font-tnum",
          isAll && "opacity-40"
        )}
      />
      <span className={cn("text-sm text-ink-soft", isAll && "opacity-40")}>
        to
      </span>
      <Input
        type="number"
        min={0}
        max={30}
        value={value.max}
        onChange={(e) => onChange({ ...value, max: Number(e.target.value) || 30 })}
        disabled={isAll}
        className={cn(
          "w-14 h-8 px-2 text-center text-sm font-semibold text-ink font-tnum",
          isAll && "opacity-40"
        )}
      />
      <span className={cn("text-sm text-ink-soft", isAll && "opacity-40")}>
        years
      </span>
      <label className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft cursor-pointer ml-3">
        <Checkbox
          checked={isAll}
          onCheckedChange={(checked) => {
            if (checked === true) onChange({ min: 0, max: 30 });
            else onChange({ min: 1, max: 12 });
          }}
          className="h-5 w-5"
        />
        All
      </label>
    </>
  );
}

// OR-divider component removed 2026-05-15 — single condition group only.
