import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || './data/simtrack.db';

// Statically scope path to avoid Turbopack build warnings
const resolvedPath = path.isAbsolute(DB_PATH)
  ? DB_PATH
  : path.resolve(process.cwd(), DB_PATH);

const dir = path.dirname(resolvedPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Reuse a single connection across hot reloads in dev.
declare global {
  // eslint-disable-next-line no-var
  var __simtrackDb: Database.Database | undefined;
}

function getDatabase(): Database.Database {
  if (global.__simtrackDb) {
    return global.__simtrackDb;
  }

  const instance = new Database(resolvedPath);

  // Safely execute PRAGMA statements inside try/catch to avoid build-time I/O errors
  try {
    instance.pragma('journal_mode = WAL');
  } catch (e) {
    console.warn('Failed to set WAL journal mode during build, falling back:', e);
  }

  instance.pragma('foreign_keys = ON');

  instance.exec(`
    CREATE TABLE IF NOT EXISTS shipments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracking_number TEXT NOT NULL UNIQUE,
      order_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      customer_name TEXT,
      carrier TEXT NOT NULL DEFAULT 'CUSTOM',
      origin_city TEXT NOT NULL,
      origin_state TEXT NOT NULL,
      destination_city TEXT NOT NULL,
      destination_state TEXT NOT NULL,
      ship_date TEXT NOT NULL,
      estimated_delivery_date TEXT NOT NULL,
      current_status TEXT NOT NULL DEFAULT 'PROCESSING',
      current_location TEXT NOT NULL DEFAULT '',
      auto_progression INTEGER NOT NULL DEFAULT 1,
      update_interval_days INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tracking_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shipment_id INTEGER NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      location TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      event_date TEXT NOT NULL,
      event_time TEXT NOT NULL DEFAULT '09:00',
      event_order INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_events_shipment ON tracking_events(shipment_id, event_order);
    CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number);
    CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id);

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Default settings (e.g. tracking number format template)
  const defaultSettings: Record<string, string> = {
    tracking_format: 'RR{10}US',
  };
  const insertSetting = instance.prepare(
    'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)'
  );
  for (const [k, v] of Object.entries(defaultSettings)) {
    insertSetting.run(k, v);
  }

  if (process.env.NODE_ENV !== 'production') {
    global.__simtrackDb = instance;
  }

  return instance;
}

export const db: Database.Database = getDatabase();
