# Haptic feedback (parent app only; dashboard is web)

Premium native apps live and die by haptics. A low-literacy user navigating
one-handed gets confidence from device response. Sagar feels them too on the
second phone. Replaces the audio cues v0 doesn't have (no sound design).

## Library

`expo-haptics`, bundled with Expo SDK, no additional dependency.

## Pattern map

| Trigger | Haptic | Notes |
|---|---|---|
| Tab switch | `Haptics.selectionAsync()` | Light, frequent. Matches iOS Tab Bar. |
| Chip selection (override picker) | `Haptics.impactAsync(Light)` | Each chip tap |
| Photo upload complete | `Haptics.impactAsync(Medium)` | After thumb settles |
| Message send confirmed | `Haptics.impactAsync(Medium)` | After server ack, not on tap |
| Fur-match reveal (magic toast) | `Haptics.notificationAsync(Success)` | Synchronised with toast scale-up |
| Override picker chip scrolling | `Haptics.selectionAsync()` rate-limited 50ms | iOS Picker pattern |
| Incoming message push | OS-level notification haptic | Don't override; let OS handle |
| Error state appearance | `Haptics.notificationAsync(Warning)` | Banner and toast both |

## Discipline

- **Never on hover.** Web concept, doesn't exist on touch.
- **Never on auto-events.** Incoming notifications are OS-level.
- **Never repeated within 100ms.** Rate-limit chip-scroll, message-typing, etc.
- **Respect Reduce Motion.** `expo-haptics` honours OS accessibility setting; no
  extra code needed.
- **Low-literacy users:** every primary interaction has a haptic confirmation;
  the app responds physically, not just visually. This is the structural reason
  haptics matter for the AMS audience and for any independent clinic where the
  parent base includes users who cannot rely on reading the UI confirmation.

## Per-screen haptic checklist

When building each parent screen, confirm:
- [ ] Tab switches fire selection haptic
- [ ] Primary actions (Save, Send, Add photo) fire medium impact on success
- [ ] Errors fire warning notification
- [ ] No haptic on auto-events or hover-equivalents
