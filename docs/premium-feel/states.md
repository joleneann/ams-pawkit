# States system

Premium products are defined by how non-content moments feel. Sagar will see at
least 2 of these during the demo. A parent on a flaky connection will hit at
least one offline state.

## Loading skeleton (per-screen)

Skeleton fades in at **200ms after request fires** (delays prevent flash on fast
networks). Content cross-fades when ready in 250ms; never a skeleton-to-content
swap, always blend.

| Screen | Skeleton shape |
|---|---|
| Pet Page | Cover rectangle (4:5) + name line (Lora italic placeholder) + 3 timeline cards |
| Inbox | 5 row outlines (32px avatar circle + 2 text lines per row) |
| Invoice list | 5 row outlines (pet swatch + name line + total) |
| Invoice reading | Total card + 5 line item rows + status pill |
| Broadcast reading | Cover rectangle (if applicable) + title line + 5 key_points lines + body paragraph block |
| Override picker | Sheet header + 10 chip placeholders (3-col grid) |

**Skeleton fill:** solid `--text-faint` at 50% opacity (3% darker than canvas, no
shimmer; stillness reads as confidence).

## Empty states

| Screen | Empty copy | Notes |
|---|---|---|
| Inbox (parent) | "No messages from Dr Sagar yet." | Inter 16px italic Ink-faint |
| Invoices (parent) | "No invoices yet." | Same treatment |
| Pets (parent) | n/a | Always >=1 pet (enforced by 2-step onboarding) |
| Inbox (admin) | "No open windows right now. Take a breath." | Slightly warmer for the vet's eye |
| Broadcasts (admin, list) | "No broadcasts yet. Tap **New broadcast** to start one." | Includes affordance pointer |

**Hard rule:** no illustrations in empty states. Single sentence ending in
period. No "Get started!" copy.

## Error states (3 types)

| Type | When | Spec |
|---|---|---|
| **Inline form** | Field-level validation (e.g. invalid email format on settings) | 2px Ink underline (instead of the default 1px Ink-faint) + Phosphor WarningCircle icon (16px, 1.75 stroke) at the right of the input + 11pt italic message in Ink-soft below: "That email doesn't look right." |
| **Banner** | Top-of-screen blocker (e.g. broadcast send failed) | canvas card + 4px Ink left bar + 1.5px Ink border + Phosphor WarningCircle icon (18px, 1.75 stroke) prefixing headline. Headline + 1-line context + Retry link. Persists until dismissed |
| **Toast** | Transient (e.g. photo upload failed) | canvas card + 4px Ink left bar + 1.5px Ink border + Phosphor WarningCircle icon prefixing headline. Auto-dismiss 6s with manual close. Slides in from bottom |

**Never red. Fur tokens never in chrome (locked 2026-05-08).** Alert signal is
Ink plus a Phosphor warning icon, no colour. The previous Rust-as-form-error and
Peach-as-banner-toast carve-outs are killed. `--text-error` is no longer
defined as Rust; alert role is structural (heavier underline weight, icon
prefix) not chromatic.

## Offline state

Premium products handle offline gracefully. Pawkit specifically benefits because
fur-match runs on-device.

- **Banner:** subtle canvas banner at very top of screen (full width, 32px tall)
- **Copy:** "You're offline. Pawkit's still working, your photos and notes save
  locally." in Ink-soft 12pt italic
- **Behaviour:** fur-match still works (on-device, no upload). Inbox shows
  last-fetched data with "Updated 5m ago" caption. Send queues messages with
  "Will send when online" footnote per pending row.
- **Recovery:** banner slides up and away when connection restores; pending
  messages send in queued order with normal send animation.

## Stale data caption

- **Position:** top-right of any data screen
- **Copy:** "Updated 5m ago" in Ink-faint 11pt
- **Threshold transitions:**
  - Under 1m: hidden
  - 1 to 9m: "Updated Nm ago"
  - 10m+: "Updated Nm ago, refresh" (refresh is a tappable Ink link)
  - 1h+: "Updated 1h ago, refresh"
- **Stale data still renders.** The caption signals freshness, doesn't block
  content.

## Voice input states (Sarvam Audio + Whisper fallback)

Voice input is a load-bearing in-scope AI feature on dashboard compose surfaces (Broadcast body + structured-section fields, inbox reply). Failure modes are predictable. Defaults below; exact copy finalised in Phase 3 microcopy round.

| State | When | Treatment |
|---|---|---|
| **Mic blocked** | Browser permission denied | Silent fallback to text input. Mic icon shows struck-through (`mic-off`) inline. Inline 11pt italic Ink-soft caption below the field: "Mic blocked in browser settings." |
| **Network failure** | Sarvam API unreachable after 3s timeout | Silent fallback to text input. Toast (per Error states above) with headline "Voice transcription unavailable" + 1-line context "Network issue, try typing instead." Auto-dismiss 6s. |
| **Low-confidence transcription** | Sarvam returns text below confidence threshold (~0.6) | Transcription inserted as draft text with 1px Ink-faint dotted underline (signals "verify this"). Inline 11pt italic Ink-soft caption: "Tap to confirm or retype." Tapping or clicking the draft once removes the underline (confirms acceptance). |
| **Silence detected** | No audible speech for 4s after mic activation | Mic stops listening. Inline 11pt italic Ink-soft caption: "Didn't catch anything, try again." Mic icon returns to resting state. |

Mic icon states: resting = Phosphor `Microphone` 13px Ink-soft; listening = Phosphor `Microphone` 13px Ink with 2px Ink pulse ring (no Berry on transient listening state; the v1.3 "one Teal per screen" budget was relaxed at the mauve lock, but the listening state staying achromatic is still the right call); blocked = Phosphor `MicrophoneSlash` 13px Ink-faint.
