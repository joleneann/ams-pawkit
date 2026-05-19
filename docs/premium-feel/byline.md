# Vet credentials editorial byline

The byline is the most-repeated premium signal in the app. It appears on Pet
Page cover, Broadcast reading view, Inbox row meta, conversation thread
headers, broadcast cards. Treating it as a magazine byline (not a profile
chip) is what makes it editorial.

**Credential format locked 2026-05-09: name + clinic, nothing else.** No
school, no graduation year, no license number. The byline carries clinic
affiliation, not a credentials list. Editorial bylines say "By Janet Smith,
The New Yorker", not "Janet Smith, MFA Iowa 2014, Reg. JS-04821". Same
discipline here.

## Component API

```tsx
<VetByline
  vet={vet}                    // { name, clinic }
  variant="compact" | "full"
  align="left" | "center"
/>
```

## Variants

**Compact** (Inbox row meta, conversation thread header, broadcast card byline):

```
Dr Sagar Bhongale · Animal Medical Services
```

- Name: Inter 13pt semibold Ink
- Middle dot: Inter 13pt Ink-faint, surrounded by 4px space on each side
- Clinic: Inter 11pt Ink-soft small caps
- All on one line; no wrap. Clinic truncates with ellipsis if width is tight.

**Full** (Pet Profile cover, Broadcast reading view header):

```
Dr Sagar Bhongale
Animal Medical Services
```

- Name: Inter 14pt semibold Ink (line 1)
- Clinic line: Inter 11pt Ink-soft small caps with 0.08em letter-spacing (line 2)
- Two lines maximum.

**Centre** (Broadcast cover):

Same as Full but centred under cover image, with 16px top margin from cover bottom.

## Avatar pairing

- 32px circle, Ink-faint placeholder fallback (Sagar's photo loaded in v0 from seed)
- Avatar sits left of byline with 12px gap
- Avatar **never inside the byline.** Always external left.

## Hard rules

- Byline never wraps to 3 lines
- Clinic name truncates with ellipsis if compact-variant width is tight
- Never decorate byline with Berry. Berry is reserved for CTAs, hero counts, vet bubbles, active tabs, and other call-to-action chrome (was Teal in v1.3; rename followed the 2026-05-14 mauve lock).
- Never replace "Dr" with "🩺" or other emoji
- Marathi variant: "डॉ. सागर भोंगळे · ॲनिमल मेडिकल सर्व्हिसेस" (final MR translation finalises in microcopy round)
- **No school, no year, no license number anywhere on the byline (locked 2026-05-09).** That detail belongs to a future "About this vet" surface, not the recurring byline.

## Component lives in

- `packages/design-tokens/src/components/VetByline.tsx` (shared between dashboard + parent app via React Native + React DOM dual export)
- Dashboard rendering uses regular DOM
- Parent app rendering uses React Native primitives wrapped in NativeWind
