import { customAlphabet } from 'nanoid';
import { db } from './db';

const digits = customAlphabet('0123456789', 10);
const alphanum = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 10);

/**
 * Generates a SIMULATED tracking number. This does not correspond to any
 * real carrier's numbering scheme or checksum algorithm - it only mimics the
 * general look of one for the chosen visual carrier style.
 *
 * The format is configurable via the `settings` table (key: tracking_format).
 * Supported tokens in the format string:
 *   {10} -> 10 random digits
 *   {N}  -> N random digits (any number)
 *   {A10} / {AN} -> N random alphanumeric characters
 * Any other characters are passed through literally.
 */
export function getTrackingFormat(): string {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('tracking_format') as
    | { value: string }
    | undefined;
  return row?.value ?? 'RR{10}US';
}

export function setTrackingFormat(format: string) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .run('tracking_format', format);
}

function renderFormat(format: string): string {
  return format.replace(/\{(A?)(\d+)\}/g, (_match, isAlpha: string, lenStr: string) => {
    const len = parseInt(lenStr, 10);
    return isAlpha ? alphanum(len) : digits(len);
  });
}

const CARRIER_TEMPLATES: Record<string, string> = {
  UPS: '1Z{A6}{A2}{8}',
  FEDEX: '{12}',
  USPS: '94{20}',
  DHL: '{10}',
  CUSTOM: 'RR{10}US',
};

export function generateTrackingNumber(carrierStyle?: string): string {
  const configuredFormat = getTrackingFormat();
  const format = carrierStyle && CARRIER_TEMPLATES[carrierStyle] && configuredFormat === 'RR{10}US'
    ? CARRIER_TEMPLATES[carrierStyle]
    : configuredFormat;

  let candidate = renderFormat(format);
  let attempts = 0;
  const exists = db.prepare('SELECT 1 FROM shipments WHERE tracking_number = ?');
  while (exists.get(candidate) && attempts < 25) {
    candidate = renderFormat(format);
    attempts += 1;
  }
  return candidate;
}
