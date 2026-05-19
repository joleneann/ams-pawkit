# Broadcast content format (recommendations)

Locked 2026-05-12 from content-format research across Mayo / CDC / NHS / VCA / AKC / Queen Creek / Preventive Vet / academic patient-education literature. Use as defaults for the Screen 06 broadcast composer and the eventual microcopy round. These are suggestions the composer surfaces, not enforced rules.

## Field structure (6 fields after 2026-05-12 refinement)

- **Title** (required, bilingual EN+MR): 5-9 words, one clear idea.
- **Who this applies to** (optional microfield, added 2026-05-12): One-line audience tag near the title. Examples: "For: puppies under 16 weeks" / "For: senior dogs" / leave blank for general advisories. Real outbreak advisories always answer "is this me?" within the first 50 words.

> **Note on the dropped readability indicator (2026-05-12):** The earlier proposed "live readability indicator" (sentence length + reading-grade widget in the composer) was rejected by the user as condescending chrome. The underlying length / voice / low-literacy guidance below stays; it informs field hints, placeholder copy, and the microcopy round, but is not surfaced as a visible Grade-X widget to Sagar.
- **Cover image** (optional): Ink-faint dashed placeholder if absent.
- **Summary** (optional, renamed from "Key points" 2026-05-12): 3-5 bullets, 5-15 words each. CDC's "At a glance" / MedlinePlus's "Summary" pattern. Real clinical advisories rarely use "Key points" as a label.
- **Body** (required, bilingual EN+MR): 30-80 words for a short notice; 300-800 for an advisory; up to 1,200 for educational long-form.
- **Warning signs** (optional, bulleted): 4-8 symptoms, symptom + measurable threshold where possible ("temperature above 39.5°C", not just "fever"). NHS Care Cards visual treatment.
- **Escalation** (optional, when to call): 1-3 conditional lines. Phone number + hours + after-hours fallback always present. NHS Care Cards visual treatment, distinct from warning signs.

## Voice defaults

- "We" for clinic (Sagar speaking on behalf of AMS), "you / your dog" for parent.
- Active voice; passive flagged (target less than 5% passive).
- Action verbs in warning signs and escalation: "Watch for...", "Call us if...", "Bring [pet] in if..."
- Imperatives, not abstract advice.
- Conditional, not absolute ("Call us if you see X", not "You should call us").
- Tone: matter-of-fact, not panicked. The visual treatment (red card, icon) does the urgency work; words inside stay calm.

## Length and readability targets

For AMS's roughly 20% low-literacy audience, target the tighter end of plain-language standards:
- 8-12 words per sentence (low-literacy spec, not the general 20).
- 6th-8th grade reading level (academic patient-education standard).
- 1-2 syllables per word where possible.
- Paragraph max ~5 sentences.

The composer surfaces a live readability indicator (sentence length + reading grade) that nudges Sagar toward these defaults without enforcing.

## Bilingual structure

- **Dashboard composer**: side-by-side EN/MR tabs per field (current spec, validated by research).
- **Parent-app reading view**: STACKED, not side-by-side. Marathi block then English block per field. Side-by-side columns fail on phone screens. Heading parity required (translate the section labels too, not just the body).
- **Public web reading URL** (`pawkit.app/broadcasts/[slug]`): per-field language toggle, or stacked with a single language toggle at top.
- No mixed-language sentences. Translate or omit.
- Devanagari typography needs more vertical space than Latin. Use Mukta (Google Fonts) or Tiro Devanagari Marathi (Adobe Fonts) for parent-app body.

## NHS Care Cards pattern (warning signs + escalation)

The reference structure for urgent-care messaging:
- Red-bordered card.
- Bold heading at top, often with icon (alert-triangle for warning, phone for escalation).
- Bulleted list of conditions / symptoms inside.
- Color is supplementary, not primary signal (color-blind + screen-reader safe). Bold heading + icon do the urgency work first.
- Source: https://service-manual.nhs.uk/design-system/components/care-cards

Pawkit's variation: single warning + escalation visual variant for v0 (NHS's three-tier system is overkill for a walk-in clinic). Both sections use the same red-bordered card pattern but with different headings ("Watch for these warning signs" vs "When to call us").

## Low-literacy and accessibility

- Icons WITH labels, not icons replacing labels. The Pawkit "icons over labels" principle in `CLAUDE.md` is about navigation chrome (rail icons); in body content, icons should be accompanied by text labels.
- Generous whitespace, large font, high contrast.
- Active voice; one idea per sentence.
- Color is reinforcement, never the only signal.

## Sources

- NHS Care Cards: https://service-manual.nhs.uk/design-system/components/care-cards
- NHS pattern: Help users decide when and where to get care: https://service-manual.nhs.uk/design-system/patterns/help-users-decide-when-and-where-to-get-care
- CDC Plain Language: https://www.cdc.gov/health-literacy/php/develop-materials/plain-language.html
- CDC Clear Communication Index: https://www.cdc.gov/ccindex/tool/index.html
- CDC Everyday Words: https://www.cdc.gov/ccindex/everydaywords/index.html
- Mayo Clinic patient pages (sectioned: Overview / Symptoms / When to see a doctor / Causes / Risk factors / Prevention)
- AKC, VCA, Preventive Vet, Queen Creek Vet for pet-specific consumer comms
- Plain Language guidelines (PLAIN): https://digital.gov/guides/plain-language
- Academic: PMC3771166 (patient-centered communication), PMC3318988 (5-step methodology for adapting patient health info to <5th grade readability)
