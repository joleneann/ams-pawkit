# Supabase Configuration

## Project (created by user, May 4)

- **Project ID:** `pevofxnfjcvmamdcfkus`
- **Dashboard:** https://supabase.com/dashboard/project/pevofxnfjcvmamdcfkus
- **API URL:** `https://pevofxnfjcvmamdcfkus.supabase.co`
- **Region:** `ap-northeast-1` (Tokyo). Verified via Supabase MCP 2026-05-17. Mumbai (`ap-south-1`) migration deferred to post-demo per `docs/decisions-log.md`.

## Local CLI link

Once Supabase CLI is installed:

```bash
supabase login
supabase link --project-ref pevofxnfjcvmamdcfkus
```

Verifies the link by running `supabase status`.

## Environment variables

NEVER commit secrets to the repo. The three required env vars live in
`.env.local` per app:

| Variable | Where used | Source |
|---|---|---|
| `SUPABASE_URL` | Both apps + seed | `https://pevofxnfjcvmamdcfkus.supabase.co` |
| `SUPABASE_ANON_KEY` | Both apps (client-side) | Dashboard, Settings, API, `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Seed scripts ONLY | Dashboard, Settings, API, `service_role` `secret` |

Locations:
- `apps/dashboard/.env.local`: `SUPABASE_URL` + `SUPABASE_ANON_KEY` (Next.js
  requires `NEXT_PUBLIC_` prefix for client exposure:
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `apps/petparent/.env.local`: `EXPO_PUBLIC_SUPABASE_URL`,
  `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Expo prefix convention)
- `supabase/.env.local`: `SUPABASE_SERVICE_ROLE_KEY` (seed scripts only,
  never imported into app code)

A committable template lives at `.env.example` in the project root with the
variable names but no values.

## Migrations workflow

```bash
# Apply all pending migrations from supabase/migrations/ to the cloud project
supabase db push

# Pull schema from cloud back to local migration files (use sparingly)
supabase db pull

# Generate TypeScript types for the database (run after every migration push)
supabase gen types typescript --project-id pevofxnfjcvmamdcfkus > packages/db-types/src/database.types.ts
```

## RLS smoke test pattern

After every migration push, verify RLS is on:

```bash
pnpm db:test:anon       # MUST FAIL: anon key cannot SELECT pets without a session
pnpm db:test:service    # MUST SUCCEED: service-role bypasses RLS
```

The two tests live in `supabase/scripts/test-rls.ts`. They both connect, run
a `select count(*) from pets`, and assert the expected outcome.

## Storage buckets (created via dashboard or CLI)

- **`pet-photos`**: public read, authenticated write. Used by fur-match
  upload flow on parent app.
- **`messages-images`**: private, RLS by household. Used by parent message
  photo attachments (Patch 8).
- **`messages-videos`**: private, RLS by household. Used by parent message
  video attachments (Patch 8, locked 2026-05-08).
- **`broadcast-covers`**: public read, vet-only write. Used by Broadcast
  cover images (optional per broadcast; structured-content broadcasts per
  Patch 9 shape may include a cover image).

## Notes
- Storage free tier: 1 GB. Synthetic seed (~200 photos at ~200 KB) is around
  40 MB, well under cap.
- Database free tier: 500 MB. Schema plus seed (~200 pets, 600-800 visits)
  is comfortably under.
- Auth provider for v0: NONE (parent identity pre-seeded for demo per Parent
  Flows decision May 2). No SMS, no Google, no email magic link. When auth
  is needed in v1+, configure under Authentication, Providers in dashboard.
