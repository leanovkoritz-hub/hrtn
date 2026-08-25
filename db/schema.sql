-- Reference schema for migrating SimTrack from SQLite to Postgres/Supabase.
-- Run this in the Supabase SQL editor (or any Postgres instance) if you
-- switch the data layer from better-sqlite3 to @supabase/supabase-js.

create table if not exists shipments (
  id bigint generated always as identity primary key,
  tracking_number text not null unique,
  order_id text not null,
  product_name text not null,
  customer_name text,
  carrier text not null default 'CUSTOM',
  origin_city text not null,
  origin_state text not null,
  destination_city text not null,
  destination_state text not null,
  ship_date date not null,
  estimated_delivery_date date not null,
  current_status text not null default 'PROCESSING',
  current_location text not null default '',
  auto_progression boolean not null default true,
  update_interval_days integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tracking_events (
  id bigint generated always as identity primary key,
  shipment_id bigint not null references shipments(id) on delete cascade,
  status text not null,
  location text not null,
  city text not null,
  state text not null,
  description text not null default '',
  event_date date not null,
  event_time text not null default '09:00',
  event_order integer not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_events_shipment on tracking_events(shipment_id, event_order);
create index if not exists idx_shipments_tracking on shipments(tracking_number);
create index if not exists idx_shipments_order on shipments(order_id);

create table if not exists settings (
  key text primary key,
  value text not null
);

insert into settings (key, value) values ('tracking_format', 'RR{10}US')
  on conflict (key) do nothing;

-- Recommended: enable Row Level Security and only allow the service role
-- (used server-side only, never in the browser) to read/write these tables,
-- since all access in SimTrack goes through server-side API routes.
alter table shipments enable row level security;
alter table tracking_events enable row level security;
alter table settings enable row level security;
