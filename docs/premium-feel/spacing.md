# Spacing rhythm system

Formal scale plus rules. Every text-style and component spacing locks
against this scale.

## Scale (px)

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`

No values outside this scale. No 6, no 10, no 14, no 20. Optical adjustments
allowed only for serif italic ascent (see below).

## Usage rules

| Value | Use for |
|---|---|
| 4px | Icon-to-text padding, chip border-to-text padding |
| 8px | Chip-to-chip gap, list-item internal stack |
| 12px | Avatar-to-text gap (cards), inside-card stack |
| 16px | Card padding (all four sides), screen edge padding (mobile) |
| 24px | Chip strip to content gap, between cards in a list |
| 32px | Within-screen section breaks (Timeline to Quick Facts on Pet Page) |
| 48px | Major section breaks (Cover, Name, Byline, Timeline) |
| 64px | Top of Pet Page name to context line (the editorial breath) |

## Optical corrections (Lora italic only)

Lora italic kerns differently from sans (same discipline applied in v1.3 to Spectral italic before the 2026-05-15 evening font swap):
- Pet Page name to context line gap: **+2px ascent compensation** (66 actual instead of 64 nominal)
- Magic toast pet name to "is here" line: **+1px ascent compensation**

## Negative-space discipline (the gutter move)

Replace `border-b border-ink-faint` dividers with `mb-6` (24px) or `mb-8` (32px)
whitespace wherever possible. Section breaks felt, not drawn. Exceptions where
dividers stay:
- Invoice line items (rhythm needs structural marker)
- Settings sections (visual ledger of configuration)
- Inbox rows (1px Ink-faint hairline; reading rhythm needs it at 72px row height)

## Tailwind/NativeWind tokens

Already built into Tailwind defaults (`mb-1` is 4px, `mb-2` is 8px, etc.).
No custom config needed; just **discipline of usage**. Sweep applies during
Day 6.
