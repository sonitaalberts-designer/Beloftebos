# BelofteBos Farmhouse Inn

A Next.js App Router / React / TypeScript hospitality application, with Tailwind and shadcn primitives. The Sites deployment uses Vinext on Cloudflare Workers. PostgreSQL/Supabase is supported through the server-only repository adapter; the private review site uses persistent D1 and R2 without requiring external account credentials.

## What works

- Responsive editorial guest site, original supplied logo, real property photographs, six editable journal articles, room pages, filtering and accessible gallery lightbox.
- Persistent booking requests, availability search, atomic overlap prevention, cancellation/move/status actions, idempotency keys, guest records and audit events.
- Function enquiries and management. Confirmed functions atomically block selected rooms; conflicting bookings reject the whole change.
- Email/password administrators, HttpOnly sessions, rate limits, protected server routes, one-time setup, reset flow and account disablement.
- CMS for rooms, room photos, gallery, journal, FAQs, verified reviews, meals and website settings. Image uploads use R2.
- Booking calendar with month/week/list modes, source/status styling, detail drawer, CSV export and manual blocks.
- ICS import/export, room mapping, secret references, fail-safe sync, scheduler endpoint and extension interface. No OTA availability is scraped and no live API integration is claimed.
- Branded transactional mail templates and persistent outbox. Real delivery requires configured Resend credentials and verified sender.
- SSR titles/descriptions, canonical URLs, Open Graph, Twitter cards, Article/LodgingBusiness/FAQ/Breadcrumb/WebSite JSON-LD, sitemap and robots.

## Run locally

Use Node 22.13+ and npm. `npm ci`, `npm run build`, apply SQL migrations using the local Wrangler commands below, then `npm run dev`. A local `.dev.vars` can hold server credentials and is ignored by Git. Never commit it.

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_initial.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_seed.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0003_function_blocks.sql
```

`/admin` requires email/password. First-time setup requires the private `ADMIN_SETUP_TOKEN`. Set your own password (minimum 14 characters). Remove the setup token after provisioning. No default admin password is shipped.

## Supabase deployment

Apply `db/postgresql.sql` to a new Supabase project, then configure server-side `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Do not expose the service role key in browser code. RLS is enabled with no anonymous/authenticated table access; all operations go through validated server endpoints. The service role executes the reservation functions.

Switching providers does not copy data automatically. Export/migrate operational records before changing credentials; do not change providers on a live property without a coordinated migration. The PostgreSQL schema has been prepared but cannot be applied to the client's project until its connection is supplied. Production verification against the chosen Supabase project remains a launch requirement.

## OTA safety

ICS is polling, not a two-way channel manager. It cannot guarantee instantaneous consistency with independent external sites. Database locks prevent local double bookings. Stale/error feeds disable direct booking for mapped rooms. Invalid imports retain all previous blocks. All-day DTSTART/DTEND and UID are required; timed and recurring events are rejected, not silently misinterpreted. Up to 1,000 events / 2 MB per feed are supported.

Enter secret **environment variable names** (for example `BOOKING_ICAL_URL`) in admin Integrations. Enter actual private feed URLs in the deployment environment. Allowlist their exact HTTPS hostnames with `CALENDAR_ALLOWED_HOSTS`; redirects are rejected. Confirm property/unit mapping. Configure an external scheduler for POST `/api/cron` with the `CRON_SECRET` bearer token. API adapters require the actual channel's approved API contract and credentials; the current adapter supports calendars only.

Availability export: `/api/calendar/ROOM_ID?token=ICAL_EXPORT_TOKEN`. Feed entries expose only “Unavailable”, dates and opaque IDs; no guest contact data is exported. Treat the feed token as secret. Do not create import/export feedback loops. Coordinate exclusive room allocation or a suitable channel manager before enabling direct bookings alongside OTA sales.

## Launch inputs still required

Room names/configuration/capacity/rates approved by the client; check-in/out and cancellation/payment policies; reviewed privacy retention details; Supabase configuration if selected; verified email sender; actual per-unit OTA feeds/API credentials; scheduler; domain; optional analytics IDs; confirmed WhatsApp preference. Nothing substitutes invented values for these items.

Direct online reservations default to off. External booking links and saved enquiries work independently. No card payment is collected; confirmation and payment status are managed by staff. Public booking requests reserve inventory as PENDING until staff confirms or cancels them.

## Validation

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `python3 tests/database.test.py`
- `node tests/http-smoke.mjs` and `node tests/content-smoke.mjs` against an isolated local database with `work/test-auth.json`. These use clearly labelled test data. Do not run against production.

Booking conflict, adjacent-date, cancellation, move and concurrent write tests cover the actual database triggers. HTTP tests cover secure routes, room persistence, simultaneous booking requests, functions, calendar fail-safe behavior, forms, CMS, uploads and SEO. Live Resend delivery, external channel credentials and real Supabase deployment require those services and must be verified before launch.
