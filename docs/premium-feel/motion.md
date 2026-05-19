# Motion system

Premium products move with intent. Material defaults read generic. These three
easings + five durations + a small set of choreography rules cover every motion
in v0.

## Easing curves (use these only)

| Token | Cubic-bezier | Use for |
|---|---|---|
| `ease-emphasised` | `cubic-bezier(0.2, 0, 0, 1)` | Page transitions, sheet open, magic toast entrance |
| `ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Everyday: tab swap, hover, row collapse |
| `ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | Entrances: cards, list items, chip rows |

No `ease-in`, no `ease-in-out`, no `linear` (linear is reserved for the Berry
scan-line which has its own custom curve). No spring physics outside
`@gorhom/bottom-sheet`.

## Duration scale (5 buckets)

| Bucket | ms | Use for |
|---|---|---|
| Instant | 50 | Chip select feedback, tab indicator move |
| Quick | 150 | Hover, focus ring, Tooltip fade |
| Standard | 250 | Page transitions, row collapse, send-row remove |
| Expressive | 400 | Sheet open, magic toast entrance, override-picker chip select |
| Ceremonial | 800 | Pet Page first-load only, fires once per session |

## Choreography rules

- **Stagger entrances** by 30ms (cards, chips, list rows)
- **FLIP for layout shifts.** Inbox row removal on send animates surrounding rows up smoothly, no jump.
- **Never animate two attention-grabbing elements simultaneously.** Magic toast plus sparkles overlap is allowed because sparkles are ambient; magic toast plus state change pulse is not.
- **Magic toast sparkles loop independently.** The 1.2s twinkle loop is owned by each sparkle, not the toast container.
- **No bounce, no overshoot** anywhere outside gorhom sheets (and even there, damping 22 / stiffness 280, never spongy).

## Per-screen motion specs

(These also live inline in `docs/layout-spec.md` per screen.)

| Screen | Motion |
|---|---|
| **Pet Page (parent #9)** | Entrance: photo fades and scales 1.02 to 1.0 in 800ms ceremonial. Name plus byline stagger in 150ms after. Timeline cards stagger 30ms each. Open-window banner slides down from top in 250ms standard if active. |
| **Magic toast (parent #9 State C)** | Refined 2026-05-10. Beneath the toast, the 10px Honey accent border on the Pet Page cover draws in left-to-right in ~600ms ease-decelerate, synchronized with the toast scale-up. Toast itself: scale 0.95 to 1.0 plus opacity 0 to 1 in 400ms expressive ease-emphasised. 3 sparkles twinkle on independent 1.2s loops staggered 200ms each. Auto-dismiss at 4-5s with reverse curve, then the page resolves into the locked steady-state Pet Page. NO full-cover gradient on the Transformed state (retired 2026-05-10). |
| **Override picker (parent #10)** | Sheet open: gorhom spring damping 22, stiffness 280. Drag handle responds 1:1 to gesture. Chip select: 50ms instant haptic plus 150ms quick scale 1.0 to 0.96 to 1.0. |
| **Inbox row send (admin #2 + parent #11)** | Row height 72px to 0 in 250ms ease-standard. Surrounding rows lift via FLIP in same window. Send confirmation toast slides in from bottom 250ms after. |
| **Tab switch (both apps)** | 200ms cross-fade plus 4px Y-axis lift on entering content. Tab indicator slides 50ms instant. |
| **Sheet open everywhere (gorhom on Expo, shadcn Sheet on web)** | Expressive 400ms ease-emphasised. Backdrop opacity 0 to 0.4 in same window. |
| **Loading skeleton (any screen)** | Skeleton fades in at 200ms after request fires (delays prevent flash on fast networks). Content cross-fades when ready in 250ms; no skeleton-to-content swap. |
| **Photo upload (parent #9, parent #11 messages)** | Thumb fades in at 200ms. Full image cross-fades in at 400ms expressive after upload settles. |

## Frame budget

Every motion must hit **60fps on a mid-range Android** (Sagar's phone class:
Snapdragon 6 Gen 1 / A14 Bionic equivalent baseline). During build, log
dropped frames in dev mode; any motion that drops more than 2 frames in a
1-second window goes back for tuning. Reanimated 4 worklets keep animations
off the JS thread; use `useAnimatedStyle` and `useDerivedValue`
aggressively.

The worklets babel plugin is auto-applied by `babel-preset-expo` on SDK 54;
do NOT add `react-native-reanimated/plugin` to `babel.config.js` manually
(duplicates). Reanimated 4 requires the New Architecture (auto-enabled in
SDK 54). The `react-native-worklets` peer is pinned to `0.5.1` to match
Expo Go SDK 54's bundled native ABI.

## Tokens
- Platform-neutral easings + durations exported from `packages/design-tokens/src/motion.ts`
- Web consumers wrap into CSS `cubic-bezier(...)`; Reanimated consumers wrap into `Easing.bezier(...)` inside worklets
