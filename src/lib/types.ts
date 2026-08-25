export type CarrierStyle = 'UPS' | 'FEDEX' | 'USPS' | 'DHL' | 'CUSTOM';

export type ShipmentStatus =
  | 'PROCESSING'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'EXCEPTION';

export interface Shipment {
  id: number;
  tracking_number: string;
  order_id: string;
  product_name: string;
  customer_name: string | null;
  carrier: CarrierStyle;
  origin_city: string;
  origin_state: string;
  destination_city: string;
  destination_state: string;
  ship_date: string; // ISO date (yyyy-mm-dd)
  estimated_delivery_date: string; // ISO date
  current_status: ShipmentStatus;
  current_location: string;
  auto_progression: 0 | 1;
  update_interval_days: number;
  created_at: string;
  updated_at: string;
}

export interface TrackingEvent {
  id: number;
  shipment_id: number;
  status: string;
  location: string;
  city: string;
  state: string;
  description: string;
  event_date: string; // ISO date
  event_time: string; // HH:MM
  event_order: number;
  created_at: string;
}

export interface ShipmentWithEvents extends Shipment {
  events: TrackingEvent[];
}
