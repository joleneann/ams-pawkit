# Pawkit technical vocabulary

A reference glossary of 64 technical terms a non-technical builder will
encounter while working in this codebase. Each term has:

- **What.** A one-sentence definition.
- **Pawkit.** Where it shows up in your codebase, with a concrete file or
  feature reference.
- **Follow-up.** A prompt you can paste back into Claude Code to dig deeper.

Drafted 2026-05-17 against the v3.1 hi-fi mockup, `apps/dashboard/`,
`apps/petparent/`, `supabase/migrations/`, `scripts/seed-50-pets.mjs`, and
the design / voice / premium-feel docs.

---

## UI patterns

### 1. Modal
**What.** A full-screen-blocking dialog that opens on top of the current view; the user must dismiss or complete it before the underlying page is interactive.
**Pawkit.** The Fur-match Override sheet (`mockups/parent-app-source/screens-settings.jsx`, `OverrideSheetBase`) is a modal. Dashboard uses shadcn's `Dialog` primitive at `apps/dashboard/components/ui/dialog.tsx`.
**Follow-up.** *"List every modal in apps/dashboard/, which use shadcn's Dialog vs hand-rolled, and what triggers each."*

### 2. Card
**What.** A self-contained rectangular surface that groups related content.
**Pawkit.** Every Broadcast (`pk-bcast`), Timeline row (`pk-tl-card`), and Inbox row (`pk-ibx-row`) is a card. Pawkit cards use inner-light + radius tokens (`--radius-xl` 14px for page cards, `--radius-lg` 12px for banners).
**Follow-up.** *"List every card-shaped surface in primitives.css and group them by Pawkit radius token. Flag any that don't match."*

### 3. Toast notification
**What.** A small, transient message that appears for a few seconds then disappears on its own.
**Pawkit.** The "Couldn't send. Will retry in a moment." pill in `screens-misc.jsx` `ErrorAnatomies` is a toast. Note: `pk-magic-toast` is named "toast" but is actually a take-over modal panel; legacy naming.
**Follow-up.** *"When does Pawkit's voice spec say to use a toast vs a banner vs a system bubble inside a thread?"*

### 4. Skeleton / loading state
**What.** A grey placeholder that mimics the shape of content while real data loads, so the page doesn't flash empty then snap into existence.
**Pawkit.** `docs/premium-feel/states.md` defines Pawkit's loading rules. The shadcn `Skeleton` primitive at `apps/dashboard/components/ui/skeleton.tsx` is the building block. Inbox row skeletons should match the actual `pk-ibx-row` height so layout doesn't shift on data arrival.
**Follow-up.** *"Sketch skeleton placeholders for every Pawkit list view (inbox, broadcasts, vaccinations, invoices). What shapes and how many rows?"*

### 5. Empty state
**What.** What the user sees when there's nothing to show: zero pets, zero broadcasts, zero messages.
**Pawkit.** Voice rule: "one italic sentence, calm absence" (per `docs/premium-feel/states.md`). Examples in `microcopy/parent-en.md` Section 15: "No visits yet." / "No vaccinations on file yet." / "No invoices yet." / "No messages from Dr Sagar yet." Anti-pattern: a celebratory "You're all caught up!" with emoji.
**Follow-up.** *"Audit every empty state in the parent app and dashboard for voice consistency. Anywhere it gets wordy or exclaimed, propose the calmer rewrite."*

---

## UX and flows

### 6. Happy path vs unhappy path
**What.** Happy = everything works (photo uploads, fur-match runs, Pet Page appears). Unhappy = it fails (offline, server error, validation, file too big, vet hasn't replied).
**Pawkit.** The fur-match ceremony (Empty → Sampling → Magic Moment → Transformed → Steady) is the happy path. Unhappy paths are `OfflineState` and `ErrorAnatomies` in `screens-misc.jsx`, plus the closed-thread redirect in `ThreadClosed`.
**Follow-up.** *"Walk me through every unhappy path in the parent app: photo upload fails, thread closed when I tap reply, Marathi font fails. What's drawn vs missing?"*

### 7. Responsive design
**What.** Layout that adapts to screen size.
**Pawkit.** Pawkit explicitly isn't responsive: dashboard desktop-only locked, parent app mobile-only Expo. The exception is `PublicWebView` in `screens-broadcasts.jsx`: the share landing page must work from phone or laptop browsers because non-Pawkit users land there.
**Follow-up.** *"PublicWebView is the only surface that needs responsive layout. What breakpoints, and what happens below 360px?"*

### 8. Optimistic UI
**What.** Show the result of an action immediately, before the server confirms. Revert if the server says no.
**Pawkit.** Comes in Day-4 build. When the parent taps "send" on a thread, the bubble should appear instantly even before the Supabase insert completes. The `OfflineState` mockup is a flavor of this: bubbles with "will send when online" stamp.
**Follow-up.** *"How should optimistic-send work in the parent-app thread composer? What's the rollback UX if the Supabase insert fails?"*

### 9. Error boundaries
**What.** A React wrapper that catches crashes in its subtree and shows a fallback instead of taking the whole app down.
**Pawkit.** Not wired yet. Each top-level tab (Broadcasts, Community, Pets, Inbox, Shop) should sit inside its own ErrorBoundary so a Vaccinations crash doesn't black out the app.
**Follow-up.** *"Where in the Day-4 build plan should I add ErrorBoundary wrappers, and what fallback UI should each show given Pawkit's calm voice?"*

### 10. Form validation
**What.** Checking user input against rules before submitting (required fields, format, length) and showing the error inline next to the offending field.
**Pawkit.** Onboarding Step 2 has 5 required fields (Name, Species, Breed, Gender, Birthday) per `screens-onboarding.jsx`. Inline error pattern is the `① Inline form error` anatomy in `ErrorAnatomies`: italic Ink line with warning icon under the field, never blocking. Phone-number validation is the canonical example: "Looks short. Indian numbers are 10 digits."
**Follow-up.** *"For every form in Pawkit (onboarding, settings free-text fields, broadcast composer), list the validation rules and the inline-error copy per `microcopy/parent-en.md` voice."*

### 11. Push notifications
**What.** OS-level messages that reach the user even when the app is closed (FCM on Android, APNs on iOS).
**Pawkit.** Master Settings has a single toggle: "Vaccinations, broadcasts, vet replies." (key `settings.notifs.push.sub` in `microcopy/parent-en.md`). v0 needs FCM wired in the EAS preview build; the dashboard publishes a notification when (a) a broadcast goes live, (b) Sagar replies in a thread, (c) a vaccination falls inside the reminder window.
**Follow-up.** *"Draft the FCM setup steps for apps/petparent: which Expo plugin, which Supabase function fires the send, and what payload shape lets us deep-link straight to the relevant thread or broadcast."*

### 12. Deep linking and Universal Links
**What.** A URL that opens the right screen inside your app instead of the browser. "Universal Links" = the iOS/Android-verified flavor that bypasses the browser entirely.
**Pawkit.** Share-broadcast flow: `pawkit.app/broadcasts/monsoon-ears` should open `PublicWebView` for non-installed users and deep-link into the in-app reader for installed users. The "Open in app" link in `PublicWebView` (line 273 of `screens-broadcasts.jsx`) is the deep-link trigger. Expo handles this via `expo-linking`.
**Follow-up.** *"Sketch the deep-link routing for the parent app. What URL paths route to which screens, and how does the OS know to open Pawkit vs the browser?"*

---

## Network and realtime

### 13. WebSockets
**What.** A persistent two-way connection between client and server that lets either side push messages without re-asking.
**Pawkit.** Supabase Realtime (WebSockets under the hood) is the fit for thread message delivery: when Dr Sagar replies in Gabby's thread, the parent app gets the new bubble pushed in real time. Not wired yet.
**Follow-up.** *"Show me Supabase Realtime's Postgres Changes feature and how I'd subscribe to new rows in messages for a specific thread_id."*

### 14. Polling
**What.** Asking the server "anything new?" on a fixed interval instead of holding a persistent connection.
**Pawkit.** Fallback if Realtime fails. The dashboard Active inbox count badge could poll every 60s; the parent app's open-window banner could poll daily.
**Follow-up.** *"For each Pawkit screen that shows clinic-side state to the parent, decide: Realtime, polling, or neither. One-sentence justification each."*

### 15. Debounce
**What.** "Wait until the user stops typing for N ms, then run my code." Used for keystroke-driven work.
**Pawkit.** Dashboard search field ("Search pets, parents, phone numbers" per `microcopy/admin.md`) needs ~300ms debounce so we don't query Supabase per keystroke.
**Follow-up.** *"What's the right debounce ms for each text input in Pawkit (search, free-text settings, broadcast composer)? Reusable React hook?"*

### 16. Throttle
**What.** "Run my code at most once every N ms even if the trigger fires constantly." Used for scroll, drag, gestures.
**Pawkit.** Press-and-hold switcher (`SwitcherActive` in `screens-pet-page.jsx`) could throttle pointer-position updates as the user drags across avatars: 16ms (60fps) keeps the highlight tracking the finger.
**Follow-up.** *"Debounce vs throttle in plain English, and which fits the press-and-hold switcher vs the dashboard search field?"*

### 17. CDN and image optimization
**What.** A Content Delivery Network serves files from a server near the user. Image optimization = serving the right size, format (WebP/AVIF), and quality for each device.
**Pawkit.** Three CDNs in play: Unsplash CDN (mockup placeholders for pet/broadcast photos), Supabase Storage CDN (production pet photos in `pet-photos` bucket), Google Fonts CDN (Inter + Lora + Noto Sans Devanagari). When real photos replace Unsplash, Next.js `<Image>` component on the dashboard and `expo-image` on the parent app should handle resizing automatically. Indian mobile network reality: serve 800px max for cover photos, not 4K originals.
**Follow-up.** *"Audit every image in Pawkit (Unsplash placeholders, Supabase Storage assets, broadcast covers, pet avatars). For each, set the right CDN, format, max width, and cache TTL."*

---

## Auth and access control

### 18. Authentication vs authorization
**What.** Authentication = "who are you?" (login). Authorization = "what are you allowed to do?" (permissions).
**Pawkit.** Supabase Auth handles authentication (phone OTP, returns JWT). RLS policies in `supabase/migrations/0006_storage_rls.sql` handle authorization. The `pets.clinical_lock` trigger is also authz (parent can't edit locked fields).
**Follow-up.** *"Walk through fetching Gabby's invoices end-to-end. Where does authn happen, where does authz check household_id, which file enforces it?"*

### 19. JWT (JSON Web Token)
**What.** A signed string the server hands back after login. You include it with every request to prove identity.
**Pawkit.** Supabase issues JWTs after phone-OTP auth. The token contains `user_id` and `role`. RLS policies use `auth.uid()` (decoded from the JWT) to check "is this row in your household?".
**Follow-up.** *"Show a sample Pawkit JWT payload decoded, and explain which claim each RLS policy in 0006_storage_rls.sql checks."*

### 20. Session vs token
**What.** Session = the server remembers you (server-side state, cookie ID). Token = stateless, you carry proof of identity in every request.
**Pawkit.** Token-based. Phone has the JWT; the server doesn't store login state. Stateless and horizontally scalable, but logout means the client throws away the token (no server-side force-revoke without extra infra).
**Follow-up.** *"What's the trade-off Pawkit accepts going token-only? What can't I do with sessions, and is any of it relevant for v0?"*

### 21. Row-Level Security (RLS)
**What.** A Postgres feature where every query is automatically filtered by a per-row policy. Even if your client code accidentally asks for all messages, the database only returns the rows the current user is allowed to see.
**Pawkit.** RLS is Pawkit's entire authorization model. `supabase/migrations/0006_storage_rls.sql` defines the storage policies; the earlier migrations (likely `0001` or `0002`) define table policies. The pattern: every row has `household_id` or `clinic_id`, and the policy checks `auth.uid()` against a join to `users.household_id`. Storage buckets like `messages-images` use `(storage.foldername(name))[1] = household_id::text` to gate by folder path.
**Follow-up.** *"Walk through every RLS policy in supabase/migrations/ in plain English. For each, who can read, who can write, and what column is the gate."*

### 22. Service role key vs anon key
**What.** Supabase issues two API keys per project. The **anon key** is the public key shipped in client apps; RLS is enforced on top of it. The **service role key** is a server-only key that bypasses RLS entirely; never ship it to the browser or mobile app.
**Pawkit.** `scripts/seed-50-pets.mjs` reads `SUPABASE_SERVICE_ROLE_KEY` from env (line ~40) because seeding 50 households needs to bypass RLS. The dashboard and parent app use `SUPABASE_ANON_KEY` (env var prefixed `NEXT_PUBLIC_` for the dashboard, so it can ship to the browser). Mixing these up = either RLS is bypassed in client code (security hole) or the seed script can't insert (function failure).
**Follow-up.** *"Confirm where each Supabase key is read in the codebase. Are any service-role usages accidentally inside client-shippable bundles?"*

---

## Next.js and React

### 23. Server vs client component
**What.** Server = renders on the server, can hit DB directly, no interactivity. Client = `"use client"` directive, runs in the browser, has state and event handlers.
**Pawkit.** Dashboard pages in `apps/dashboard/app/(dashboard)/` default to server components. `inbox/page.tsx` is server (fetches threads from Supabase); `inbox-client.tsx` is client (awaiting-bar interactivity, tab clicks).
**Follow-up.** *"For every file in apps/dashboard/app/(dashboard)/, tell me whether it's a server or client component, and why each split was made."*

### 24. State management
**What.** How the app tracks "what's currently happening." Local state = inside one component. Global state = shared across many.
**Pawkit.** Parent app's "which pet is active" is global state (switcher writes, Pet Page and Inbox read). "Is the Add-a-pet form open" is local. Day-4 build will likely use Zustand for parent-app global state.
**Follow-up.** *"Map every piece of state in the parent app: what's local, what's global, what comes from Supabase. Suggest where each lives during Day-4 build."*

### 25. Hydration
**What.** After the server sends static HTML, React in the browser attaches event handlers to make it interactive. A mismatch (server says X, client renders Y) is a bug.
**Pawkit.** Dashboard only. Expo doesn't hydrate this way. Risk: server renders a timestamp ("8:42 pm Mon") but client locale differs from server's. Mitigate by formatting on the server in ISO and converting client-side.
**Follow-up.** *"Find every place apps/dashboard/ formats dates/times and flag hydration-mismatch risk. Inbox row timestamps especially."*

### 26. Lazy loading
**What.** Don't load until needed: images on scroll, components on route visit, modules on feature use.
**Pawkit.** Broadcast cover photos (`BROADCAST_PHOTOS` in `chrome.jsx`) should lazy-load. Pet avatars in inbox should preload (small, all visible). Override sheet's 10 fur tokens can defer until sheet opens.
**Follow-up.** *"Audit every image in the parent app: which preloads, which lazy-loads. Consider Indian mobile network conditions."*

### 27. Caching
**What.** Storing a copy of expensive-to-fetch data so future requests are instant.
**Pawkit.** Pet photos in `pet-photos` bucket are public-read, need far-future cache headers. Fur-match algorithm output should cache per-photo. Dashboard Pets list should React Query cache for ~30s.
**Follow-up.** *"Where in supabase/ do I set cache headers on public buckets, and what TTL is right for pet-photos vs broadcast-covers vs messages-images?"*

---

## Backend API and integrations

### 28. Rate limiting
**What.** Server-side cap on requests per time window. Exceed it → 429.
**Pawkit.** Sarvam Translate hit this on 2026-05-12 (225 single-string calls). Locked workflow now batches per surface area (8 batches for `parent-en.md`). Logged in `feedback_batched_api` memory.
**Follow-up.** *"What's Sarvam Translate's exact rate limit and per-request payload size? Find it in their docs and update decisions-log.md."*

### 29. CRUD
**What.** Create, Read, Update, Delete.
**Pawkit.** Pet Page: Create (Onboarding Step 2), Read (Pet Page fetch), Update (change cover photo). Delete is absent: pets become memorial, never deleted. Messages are Create + Read only.
**Follow-up.** *"For each table in docs/schema.md, list which CRUD ops are allowed and to which role. Flag deletes intentionally missing."*

### 30. REST
**What.** API style where URLs are resources and HTTP verbs are actions.
**Pawkit.** Supabase auto-generates a REST API from your schema. `GET /rest/v1/pets?id=eq.:id&select=*` reads a pet. Your code uses the JS client wrapper (`supabase.from('pets').select('*').eq('id', petId)`) rather than raw REST.
**Follow-up.** *"Show one Supabase JS call from apps/dashboard/ and the actual REST URL it produces."*

### 31. GraphQL
**What.** Alternative to REST. Client asks for exactly the fields it wants in one query.
**Pawkit.** Doesn't use GraphQL. Supabase ships a GraphQL endpoint but the project picked REST + JS client for simplicity.
**Follow-up.** *"Would GraphQL reduce round-trips on the Pet Page? Sketch the trade-off using Gabby's page (cover + name + subline + 5 timeline cards + 1 banner)."*

### 32. Middleware
**What.** Code between request and handler. Auth checks, logging, rate limiting, redirects.
**Pawkit.** `apps/dashboard/middleware.ts` (if present) gates routes by auth state. Supabase Edge Functions can act as middleware. RLS policies are middleware running inside the database.
**Follow-up.** *"Does apps/dashboard/ have a middleware.ts? Walk me through what it does, or where it should live and what it should do."*

### 33. Environment variables
**What.** Config values that change between dev/staging/prod, stored outside the code.
**Pawkit.** `apps/dashboard/.env.local` holds `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY`. `NEXT_PUBLIC_` prefix = safe to ship to browser.
**Follow-up.** *"Inventory every env var Pawkit needs across dashboard + parent app + Supabase + Sarvam. Group as safe-to-leak vs secret. Confirm no secrets are exposed in apps/dashboard/."*

### 34. Edge Functions
**What.** Server-side code that runs at the CDN edge (close to users), spinning up on demand. Used for proxying third-party APIs (you don't want your Sarvam API key shipped in the parent-app bundle), webhook receivers, scheduled jobs.
**Pawkit.** Sarvam Audio and Sarvam Translate calls should go through Supabase Edge Functions so the API key stays server-side. Functions live at `supabase/functions/<name>/index.ts` and deploy via `supabase functions deploy`. The parent app calls a Pawkit-hosted function; the function calls Sarvam.
**Follow-up.** *"Sketch the Edge Function file structure for the Sarvam Translate batched-call pattern. What goes in `supabase/functions/sarvam-translate/index.ts`, and how does the dashboard invoke it?"*

---

## Database

### 35. Migrations
**What.** Versioned SQL files describing schema changes. Apply in order to re-create the DB from scratch.
**Pawkit.** `supabase/migrations/0001_init_schema.sql` through `0006_storage_rls.sql`. Apply via `pnpm db:push`.
**Follow-up.** *"Walk through what each migration adds in plain English. Flag destructive ones and their data-loss implications."*

### 36. Foreign keys
**What.** A column in one table that references the primary key of another.
**Pawkit.** `messages.pet_id` → `pets.id`. `pets.household_id` → `households.id`. Schema diagram in `docs/schema.md`. RLS leans on these FKs to gate by household.
**Follow-up.** *"Draw the full foreign-key graph for Pawkit's schema. Which tables are leaves and which are roots?"*

### 37. Indexes
**What.** A data structure that makes lookups by a column fast. Without indexes, every query scans the whole table.
**Pawkit.** `messages` needs indexes on `pet_id`, `thread_id`, `created_at DESC`. The `pets.clinical_lock` trigger also benefits from indexed lookups.
**Follow-up.** *"Audit docs/schema.md for missing indexes. List the dashboard + parent-app queries per table and confirm there's an index for the WHERE/ORDER BY columns."*

### 38. Database triggers and RPC functions
**What.** **Triggers** = SQL code that runs automatically when a row is inserted/updated/deleted. **RPC functions** = SQL functions you can call from the client through Supabase (e.g. `supabase.rpc('open_followup_window', {pet_id})`).
**Pawkit.** The `pets.clinical_lock` rule (per `CLAUDE.md`, schema patch 6 in `0001_init_schema.sql`) is a trigger: when a clinical visit row is inserted, the trigger sets `pets.locked = true` so the parent UI hides edit affordances. Future RPC candidate: a `publish_broadcast(broadcast_id)` function that atomically updates status + sends FCM + writes a publish log.
**Follow-up.** *"Walk through the pets.clinical_lock trigger logic in supabase/migrations/0001_init_schema.sql. What table fires it, what conditions, what columns get updated?"*

### 39. Generated types
**What.** TypeScript types automatically generated from your database schema, so the client code knows exactly which columns each table has and their types.
**Pawkit.** `packages/db-types/src/database.types.ts` holds the generated types. Run `pnpm db:types` (which calls `supabase gen types typescript ...`) after every migration to refresh. The dashboard imports these types so `supabase.from('pets').select('*')` knows the shape of the row. (This is the file with the stray `<claude-code-hint>` tag we fixed earlier.)
**Follow-up.** *"After running pnpm db:types, walk me through one type in `packages/db-types/src/database.types.ts` and show how the dashboard uses it for type safety on a query."*

### 40. Transactions and atomic operations
**What.** A group of database operations that either all succeed or all fail together. Prevents half-applied state when something errors mid-way.
**Pawkit.** Creating an invoice is a transaction: insert into `invoices` + 3-5 rows into `line_items`, all-or-nothing. If the line-items insert fails, you don't want a dangling invoice header. Closing a follow-up window + sending the "window closed" system bubble should also be atomic. Postgres `BEGIN` / `COMMIT` or Supabase RPC functions wrap these.
**Follow-up.** *"List every multi-row write path in Pawkit (invoice + line items, broadcast + audience, etc). For each, decide: client-side sequence, server transaction, or RPC."*

### 41. Soft delete and memorial state
**What.** Instead of `DELETE FROM pets WHERE id = ?` (hard delete), mark the row with a status column (`deleted_at` timestamp, or `memorial = true`). The data stays in the DB; queries filter it out by default.
**Pawkit.** Pawkit doesn't hard-delete pets. When a pet passes, they get marked memorial and the Pet Page renders with sable cover + grayscale photo + italic "A very good dog." subtitle (`MemorialPetPage` in `screens-pet-page.jsx`). Threads stay reachable; the inbox row gets the wings badge. Same pattern for households if a parent leaves: mark inactive, keep records, the vet's clinical history doesn't get holes.
**Follow-up.** *"What columns does each Pawkit table need to support soft delete? Look at pets, households, users, messages, threads. Should anything in v0 actually hard-delete?"*

### 42. System of Record (SoR)
**What.** The single source of truth for a piece of data. If two systems disagree about Gabby's vaccination dates, the SoR wins.
**Pawkit.** Per `CLAUDE.md`: VetBuddy is the nominal SoR for AMS clinical records (where Sagar currently writes notes). Pawkit v0 reads from VetBuddy and displays. The strategic question is whether Pawkit eventually becomes the SoR or stays a viewer; this affects whether parents can request edits, whether the dashboard becomes the primary entry surface for clinical notes, etc. Today: VetBuddy is canon, Pawkit is the parent-facing window into it.
**Follow-up.** *"What's the data-flow between VetBuddy and Pawkit in v0? Where does sync happen, how often, and what happens if VetBuddy is unreachable?"*

### 43. UUID
**What.** Universally Unique Identifier: a 128-bit random string like `7fbea79d-abee-4cdd-b960-513343f03094`. Used as primary keys when you want IDs generated client-side, no collision, no enumeration risk.
**Pawkit.** Every Pawkit primary key is a UUID. `scripts/seed-50-pets.mjs` uses `randomUUID()` for `householdId`, `parentId`, `petId`, `threadId`, etc. Compared to auto-increment integers, UUIDs let you generate IDs in the client before insert (optimistic UI), and they don't leak "we have 1,247 pets" via URL probing.
**Follow-up.** *"Why does Pawkit use UUIDs over auto-increment integers? Where does randomUUID() get called, and what's the trade-off on DB index size?"*

---

## Concurrency and async work

### 44. Race conditions
**What.** Two operations modifying the same data at the same time; the final state depends on which finishes first.
**Pawkit.** Two clinic staff both clicking "Send" on the same draft broadcast → naive code creates two rows. Guard: status column (`draft` → `publishing` → `published`) with `WHERE status = 'draft'` in the UPDATE.
**Follow-up.** *"List every Pawkit write path where two actors could collide. Sketch the race and the guard for each (status column, advisory lock, upsert)."*

### 45. Idempotency
**What.** An operation is idempotent if doing it twice has the same effect as once.
**Pawkit.** Sarvam Translate calls should be idempotent: retry on glitch shouldn't create duplicate translation rows. Include an idempotency key (hash of EN payload), reject duplicates. Supabase upsert with `on_conflict` gives idempotent inserts.
**Follow-up.** *"Tag every API call Pawkit makes (Supabase inserts, Sarvam, uploads) as idempotent or not. For non-idempotent ones, suggest a strategy."*

### 46. Webhooks
**What.** Server-to-server push. Your app gives a URL; the other service POSTs to it on events.
**Pawkit.** Sarvam Audio could webhook back when async transcription is done. Stripe-style webhooks aren't relevant (no online payments). Supabase Auth could webhook on signup; v0 doesn't need it.
**Follow-up.** *"What webhooks would Pawkit benefit from in v1+? Sarvam, partner pharmacy, social engine notifications. Sketch a webhook handler table schema."*

### 47. Cron jobs
**What.** Code that runs on a schedule.
**Pawkit.** Daily 9am Pune-time reminder push ("Gabby's DHPPi+L4 booster is due tomorrow"). Nightly "close any open follow-up windows past their close_at." Supabase has `pg_cron`; alternatively Vercel Cron calling an Edge Function.
**Follow-up.** *"List every scheduled job Pawkit needs. For each, suggest pg_cron vs Vercel Cron and what time/frequency."*

### 48. Queues
**What.** A backlog of work items waiting to be processed asynchronously.
**Pawkit.** Fur-match algorithm should queue: parent uploads photo, response returns immediately, match runs in background, pet row updates when done. Supabase doesn't ship a queue; build with `pg_net` + a `jobs` table + worker Edge Function.
**Follow-up.** *"Design a simple queue inside Supabase (jobs table + worker Edge Function) for the fur-match job. What columns, and how does a worker claim a job atomically?"*

### 49. Retry / backoff
**What.** Failed API call → wait and try again. Exponential backoff doubles the wait each retry (1s, 2s, 4s, 8s).
**Pawkit.** Sarvam calls should retry with backoff on 5xx and 429. Cap 3-5 retries. Don't retry on 4xx other than 429. Parent-app composer should auto-retry sending on flaky networks before showing OfflineState.
**Follow-up.** *"Write a reusable retryWithBackoff(fn, opts) helper for the Sarvam client. What options should it expose?"*

---

## Data presentation

### 50. Pagination
**What.** Load N records, then "load more" for the next N.
**Pawkit.** Dashboard inbox at AMS scale (50 seed pets, hundreds in real use) needs paginated thread fetch. Parent-app inbox is bounded by pets-per-household so it stays small. Broadcast list grows; pagination once 20+.
**Follow-up.** *"For each long list in Pawkit (admin inbox, broadcast feed, vaccination history, invoice history), pick a pagination strategy: offset, cursor, or infinite-scroll."*

### 51. Search vs filter
**What.** Search = free-text across multiple fields. Filter = narrow by structured criteria.
**Pawkit.** Dashboard inbox has both: search field + Active/Replied filter tabs. Parent-app Vaccinations tab has Upcoming/Past filters; no search (small list).
**Follow-up.** *"On the dashboard inbox, what query does the search field hit, and how is it different from the Active/Replied filter? Both as Supabase JS calls."*

---

## Observability

### 52. Logging
**What.** Writing what happened to a persistent log.
**Pawkit.** Edge Functions log to Supabase's Logs view. The seed script logs which case_type is in which language. Dashboard should log failed Sarvam calls, broadcast publish events, RLS denials. Don't log PII.
**Follow-up.** *"What should Pawkit log on dashboard vs parent app vs Supabase? Where do the logs go, and how do I view them?"*

### 53. Monitoring
**What.** Watching live system health: error rates, response times, queue depth.
**Pawkit.** Supabase dashboard shows DB CPU, connections, slow queries. Vercel shows function performance. v0 doesn't need more; v1+ add Sentry for error tracking.
**Follow-up.** *"Cheapest monitoring stack for Pawkit v1+ that catches dashboard crashes, parent-app crashes, slow Supabase queries, Sarvam outages? Free tiers preferred."*

### 54. Telemetry / product analytics
**What.** Tracking what users do in your product (not whether the system is healthy): which screens they visit, which buttons they tap, drop-off points. Tools like PostHog, Mixpanel, Amplitude.
**Pawkit.** Different from logging (system events) and monitoring (system health). Examples for v1+: how many parents tap "Open thread" on the open-window banner? What's the time between fur-match Sampling and the user closing the app? Do parents who use the switcher add more pets than parents who use Settings → Add a pet? v0 demo doesn't need this; v1+ acquisition decisions do.
**Follow-up.** *"Sketch the first 10 events Pawkit should track in v1+. Map each to a question we can't answer without telemetry."*

---

## Product management

### 55. Feature flags
**What.** A config switch that turns a feature on/off without re-deploying.
**Pawkit.** Not wired. Day-4+ could use an env-var like `NEXT_PUBLIC_FEATURE_COMMUNITY=false`. A `feature_flags` table (`name`, `enabled_for_clinic_ids`) supports per-clinic rollout when Pawkit expands beyond AMS.
**Follow-up.** *"Sketch a minimum feature-flag system for Pawkit v0 (table schema, where flags are read, how dashboard + parent app pick them up). Use Community + Shop tabs as the example."*

### 56. A/B tests
**What.** Show variant A to half your users, variant B to the other half, measure which wins.
**Pawkit.** Not v0 territory. One clinic, one demo. A/B kicks in at 10+ clinics when optimizing acquisition.
**Follow-up.** *"At what scale does A/B testing make sense for Pawkit? What's the first experiment and on which metric?"*

---

## Platform and project structure

### 57. Monorepo and workspaces
**What.** Multiple related projects (apps, shared packages) live in one git repo, managed by a workspace tool (pnpm workspaces, Yarn workspaces, npm workspaces) and often a task runner (Turborepo, Nx).
**Pawkit.** Pawkit is a pnpm + Turborepo monorepo. Apps live in `apps/dashboard/` and `apps/petparent/`. Shared packages live in `packages/design-tokens/` (the tokens.css + Tailwind preset) and `packages/db-types/` (generated Supabase types). `pnpm-workspace.yaml` at the root declares which folders are workspaces. `turbo.json` declares task pipelines (build, type-check, dev). The hi-fi mockup source folder at `mockups/parent-app-source/` is NOT a workspace package; it's a standalone editing surface.
**Follow-up.** *"Walk through pnpm-workspace.yaml and turbo.json. What runs in parallel, what's the dependency graph, and how does pnpm type-check know which packages to check?"*

### 58. Design tokens
**What.** Brand values (colors, type sizes, spacing, radii, motion durations) stored as named variables in one place, consumed by every UI surface. Change the token, every surface updates.
**Pawkit.** `packages/design-tokens/src/tokens.css` is the source of truth (mirrored in the mockup's `tokens.css`). Defines: 4 structural neutrals (canvas, rail-tint, ink, ink-soft, ink-faint), 4 berry tones, 10 fur tokens (milk → sable), type scale (`--text-xxs` 10 → `--text-display` 48), spacing, radii, motion easing. Locked rule: no arbitrary `text-[Npx]`, only token values. Mauve-only since 2026-05-14.
**Follow-up.** *"Walk through every token in packages/design-tokens/src/tokens.css. For each, where in the dashboard or parent app does it get used?"*

### 59. Internationalization (i18n) and locale
**What.** Code structure that lets the same UI render in multiple languages and number/date formats. The user's "locale" (e.g. `en-IN`, `mr-IN`) determines which translation set + formats to use.
**Pawkit.** EN+MR (Marathi) is foundational, not an afterthought. `microcopy/parent-en.md` holds the English source; `parent-mr.md` will hold the Sarvam-translated Marathi. The `:lang(mr)` CSS selector in `tokens.css` bumps font size +1px in Devanagari for legibility. Per-card EN/MR toggle in broadcasts is a user-level override per surface. ~30% of demo inbox seed data is Marathi to show the bilingual experience naturally.
**Follow-up.** *"How will Pawkit load microcopy at runtime? JSON files in apps/petparent/locales/? A Supabase table? When the user toggles language, what updates and what doesn't?"*

### 60. Accessibility (a11y)
**What.** Designing so people with disabilities can use your app: screen readers, large text, color contrast, keyboard navigation, touch target sizes. Standard reference: WCAG 2.x.
**Pawkit.** ~20% of AMS pet parents are low-literacy per `CLAUDE.md` AMS facts. Pawkit responses: icon-only bottom nav (with `aria-label` per tab so screen readers announce "Broadcasts" / "Community" / etc., captured in `microcopy/parent-en.md` Section 1), large tap targets (44x44 minimum, see button + icon-btn sizes), high-contrast Ink-on-canvas text, no color-only signaling (the Berry-tinted active tab also has a 2px top accent so colorblind users see it). Memorial wings badge has `aria-label="Memorial: {pet}"` so a blind parent hears it.
**Follow-up.** *"Audit the parent app v3.1 mockup for a11y gaps. WCAG AA level. Specifically check: aria-labels on all icon-only controls, contrast ratios on Berry-on-canvas combinations, tap target sizes on switcher avatars."*

### 61. Storage buckets
**What.** Object storage (think S3): you upload files; the service stores them and gives you URLs to fetch them. Supabase Storage is the Pawkit flavor. "Bucket" = a top-level container (like a top-level folder), each with its own access rules.
**Pawkit.** Four buckets per `supabase/migrations/0006_storage_rls.sql`: `pet-photos` (public-read, authenticated-write), `broadcast-covers` (public-read, vet-only-write), `messages-images` (RLS-by-household via path prefix `<household_id>/<filename>`), `messages-videos` (same). Clinic staff get SELECT-only carve-outs into the per-household message buckets so the dashboard can show what parents sent.
**Follow-up.** *"Walk through the path-prefix RLS on messages-images in 0006_storage_rls.sql. How does (storage.foldername(name))[1] work, and what happens if someone uploads to the wrong folder?"*

### 62. Bundle size and code splitting
**What.** Bundle size = total JS/CSS shipped to the browser/phone. Code splitting = breaking that bundle into pieces so the user only downloads what they need for the current screen.
**Pawkit.** Indian mobile network reality means every kilobyte matters on `apps/petparent/`. Parent app should code-split per tab: visiting Inbox shouldn't download Broadcasts code. Next.js does this per-route by default on the dashboard. Watch out for: importing the whole Phosphor icon set (use tree-shakable imports), accidentally bundling the design-canvas tooling into the production app, large CSS from unused shadcn primitives.
**Follow-up.** *"What's the parent app's expected bundle size, and how do I measure it? Recommend tools (expo-bundle-analyzer or similar) and a target ceiling for v0 demo."*

### 63. EAS build, APK, and OTA updates
**What.** **EAS** (Expo Application Services) builds your Expo app into a native APK (Android) or IPA (iOS). The APK gets sideloaded onto the demo phone. **OTA updates** push JS-only changes to installed apps without re-submitting to the store.
**Pawkit.** Locked delivery path per `CLAUDE.md` and `docs/decisions-log.md` 2026-05-13: `eas build --profile preview --platform android` produces a release APK installed on the demo phone at least T-2 days before Sagar's pitch. Expo Go is the dev-time iteration tool (~15min EAS rebuild per change is too slow for active dev), but never on the demo phone. The APK is frozen at build time; no SDK mismatch can break it on demo morning. OTA updates not used in v0 demo path (release APK is the source of truth).
**Follow-up.** *"Walk through the full EAS preview build command, where credentials come from, where the resulting APK lands, and how I install it on the demo phone."*

### 64. Timezone handling
**What.** Pune is UTC+5:30. Storing timestamps as UTC in the DB then converting to local time on display is the standard pattern. Mixing the two layers (storing local time, displaying UTC) creates date-shift bugs around midnight.
**Pawkit.** Seed dates in `scripts/seed-50-pets.mjs` use UTC via `Date.UTC(...)` (line 440 area: `WINDOW_START = new Date(Date.UTC(2025, 0, 1))`). Display formats must convert to `Asia/Kolkata` so "Today · 8:12 am" reflects Pune time, not the server's TZ. The 9am-9pm Mon-Sat clinic hours are Pune-local; cron jobs that fire at "9am" need an explicit TZ.
**Follow-up.** *"Audit every date/time format in Pawkit (inbox row timestamps, banner 'until' dates, invoice issue date, cron triggers). For each, confirm UTC storage + Asia/Kolkata display."*

---

## How to use this list

Copy any **follow-up prompt** verbatim into a new message and Claude Code
will dig into that one term against the actual codebase. The prompts are
phrased to read cold, without needing the project context attached.

A few terms above point at files that don't exist yet (composer
optimistic-send, ErrorBoundary wrappers, feature-flag table, Edge
Functions for Sarvam, FCM setup). Those are Day-4 build work. The
follow-up prompts for those are good things to paste when the build phase
starts.

## Cross-references

- Brand and design discipline: `docs/brand-system.md`,
  `docs/premium-feel/INDEX.md`
- Architecture: `docs/architecture.md`
- Schema: `docs/schema.md`
- Build plan: `docs/build-order.md`
- Microcopy: `microcopy/parent-en.md`, `microcopy/admin.md`
- Mockup (current): `mockups/parent-app-hifi.html`,
  source at `mockups/parent-app-source/`
- Locked decisions: `docs/decisions-log.md`
- Reusable tooling and pinned versions: `docs/reusable-tooling.md`
