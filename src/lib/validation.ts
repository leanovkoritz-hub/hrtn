import { z } from 'zod';

export const carrierEnum = z.enum(['UPS', 'FEDEX', 'USPS', 'DHL', 'CUSTOM']);
export const statusEnum = z.enum(['PROCESSING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION']);

const usState = z
  .string()
  .trim()
  .min(2)
  .max(20);

const dateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

export const createShipmentSchema = z.object({
  order_id: z.string().trim().min(1).max(64),
  product_name: z.string().trim().min(1).max(200),
  customer_name: z.string().trim().max(200).optional().nullable(),
  carrier: carrierEnum.default('CUSTOM'),
  origin_city: z.string().trim().min(1).max(100),
  origin_state: usState,
  destination_city: z.string().trim().min(1).max(100),
  destination_state: usState,
  ship_date: dateStr,
  estimated_delivery_date: dateStr,
  auto_progression: z.boolean().default(true),
  update_interval_days: z.number().int().min(1).max(14).default(1),
  custom_tracking_number: z.string().trim().max(40).optional().nullable(),
});

export const updateShipmentSchema = createShipmentSchema.partial().extend({
  current_status: statusEnum.optional(),
  current_location: z.string().trim().max(150).optional(),
});

export const trackingEventSchema = z.object({
  status: z.string().trim().min(1).max(80),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(20),
  description: z.string().trim().max(400).optional().default(''),
  event_date: dateStr,
  event_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .default('09:00'),
});

export const reorderEventsSchema = z.object({
  order: z.array(z.number().int()),
});
