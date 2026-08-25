# SimTrack — Simulated Package Tracking System

An internal, simulated package tracking system for an e‑commerce store: an
authenticated admin dashboard for creating "shipments," an automatic route +
timeline generator, and a public `/track/{trackingNumber}` page for
customers.

**This system is 100% simulated.** It does not connect to UPS, FedEx, USPS,
DHL, or any real carrier API. "Carrier style" only changes the visual label
and the shape of the fake tracking number — no tracking data shown anywhere
in this app is real.

---

## Why SQLite instead of Supabase/Postgres

The brief's preferred stack was Next.js + TypeScript + Tailwind +
Supabase/Postgres. This build keeps Next.js/TypeScript/Tailwind but swaps
Supabase for a **local SQLite database** (`better-sqlite3`), because:

- It needs zero external accounts, API keys, or provisioning — `npm install`
  and it runs, including on a machine with no internet access.
- It's a genuine persistent, relational, server-side database (not
  in-memory), so it satisfies "use a real persistent database."
- The data layer (`src/lib/repository.ts`, `src/lib/db.ts`) is a thin,
  isolated layer. Swapping it for Supabase/Postgres later is a matter of
  replacing those two files with `@supabase/supabase-js` calls — the schema,
  API routes, and UI don't need to change.

If you do want Postgres/Supabase in production, see "Migrating to Postgres"
below.

---

## Features

- **Admin dashboard**: shipment counts by status, recent shipments list.
- **Create Shipment**: enter only origin/destination city+state, ship date,
  and estimated delivery date — SimTrack generates a unique tracking number,
  a geographically logical route (via a small internal
  region/hub lookup, e.g. Dallas → Atlanta hub → Miami), and a full event
  timeline, all in one save.
- **Automatic status**: the customer-facing status/location is recalculated
  from today's date every time the tracking page or dashboard loads — no
  manual daily updates required. Toggle "Automatic" vs "Manual" per shipment.
- **Full manual editing**: edit/add/delete/reorder any tracking event,
  regenerate the whole route, regenerate the tracking number, edit any
  shipment field.
- **Public tracking page** (`/track/{trackingNumber}`): tracking number,
  carrier style, status, current location, origin/destination, dates,
  progress bar, full timeline.
- **Search & filter**: by tracking number, order ID, product name, or status.
- **Configurable tracking-number format** (admin settings page).
- **Authenticated admin area**: cookie-based session (JWT), middleware
  protects `/admin/*` pages and the admin API routes. The public tracking
  page and its API route require no auth.
- **Server-side validation** (zod) on every write endpoint, including the
  public tracking-number lookup.

---

## Getting started

```bash
npm install
cp .env.example .env.local
# edit .env.local: set ADMIN_USERNAME, ADMIN_PASSWORD, and a random SESSION_SECRET

npm run seed     # creates the demo "Dallas -> Miami / Zero Turn Mower" shipment
npm run dev      # http://localhost:3000
```

Visit `http://localhost:3000` for the public site, `/admin` for the
dashboard (login with the credentials from `.env.local`).

The seed script prints the demo tracking number and its public URL, e.g.
`/track/RR4827391055US`.

### Environment variables

| Variable | Description |
|---|---|
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password (plain string compared server-side; rotate/protect this like any credential) |
| `SESSION_SECRET` | Long random string used to sign the admin session JWT |
| `DATABASE_PATH` | Path to the SQLite file (default `./data/simtrack.db`, auto-created) |

### Production build

```bash
npm run build
npm start
```

Deploy anywhere that runs a persistent Node.js process (e.g. a VM, Render,
Railway, Fly.io). Because `better-sqlite3` needs a writable local disk and a
long-lived process, this app is **not** a great fit for stateless/serverless
platforms (e.g. Vercel's default serverless functions) unless you switch the
data layer to Postgres/Supabase first — see below.

---

## Migrating to Postgres/Supabase

1. Create a Supabase project and run the SQL in `db/schema.sql` (mirrors the
   `CREATE TABLE` statements in `src/lib/db.ts`) via the Supabase SQL editor.
2. Replace `src/lib/db.ts` with a Supabase client (`@supabase/supabase-js`),
   using `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (server-only, never
   exposed to the browser).
3. Update `src/lib/repository.ts` to use Supabase queries instead of
   `better-sqlite3` prepared statements. The function signatures can stay the
   same, so no other file needs to change.

---

## Project structure

```
src/
  app/
    page.tsx                        landing page + tracking search
    track/[trackingNumber]/page.tsx public tracking page
    admin/                          admin dashboard (protected)
      login/page.tsx
      page.tsx                     dashboard
      shipments/page.tsx           list/search/filter
      shipments/new/page.tsx       create shipment
      shipments/[id]/page.tsx      edit shipment + timeline
      settings/page.tsx            tracking number format
    api/
      auth/login, auth/logout
      shipments/                   CRUD + events + route/tracking regen
      track/[trackingNumber]       public read-only lookup
  components/                       shared UI (icons, timeline, progress bar, etc.)
  lib/
    db.ts                           SQLite connection + schema
    repository.ts                   data access layer
    routeGenerator.ts                simulated route + timeline generator
    trackingNumber.ts               simulated tracking number generator
    statusEngine.ts                 date -> current status/location logic
    auth.ts                         session cookie helpers
    validation.ts                   zod schemas
  middleware.ts                     protects /admin and admin API routes
scripts/seed.ts                     demo shipment seeder
```

## Database schema

**shipments**: id, tracking_number (unique), order_id, product_name,
customer_name, carrier, origin_city, origin_state, destination_city,
destination_state, ship_date, estimated_delivery_date, current_status,
current_location, auto_progression, update_interval_days, created_at,
updated_at.

**tracking_events**: id, shipment_id (FK, cascade delete), status, location,
city, state, description, event_date, event_time, event_order, created_at.

**settings**: key/value store, currently holding the tracking-number format
template.

## Security notes

- Admin pages and admin API routes are protected by `src/middleware.ts`,
  which verifies a signed session cookie before allowing access.
- The public tracking API validates and sanitizes the tracking number
  server-side before querying the database.
- No database credentials or secrets are ever sent to the browser — all
  database access happens in server-side API routes.
- `ADMIN_PASSWORD` is a plain comparison suitable for a single internal
  admin account; for multiple admins or higher assurance, swap in bcrypt
  password hashes stored in the database instead of an env var.
