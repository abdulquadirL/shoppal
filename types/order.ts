// /types/order.ts

export type OrderStatus =
  | "PENDING"
  | "AWAITING_ACCEPTANCE"
  | "SHOPPER_ASSIGNED"
  | "PICKING"
  | "DELIVERING"
  | "DELIVERED";

export type SenderRole = "CUSTOMER" | "SHOPPER" | "SYSTEM";

export interface Customer {
  id: string;
  name: string;
  email: string;
}

export interface Shopper {
  id: string;
  name: string;
  email: string;
  lat: number;
  lng: number;
  isAvailable: boolean;
  marketId: string;
}

export interface Market {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  product: string;
  quantity: number;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderRole: SenderRole;
  text?: string;
  attachment?: string | null;
  createdAt: string;
  readBy: string[];
}

export interface Order {
  id: string;
  customerId: string;
  shopperId?: string;
  marketId: string;
  shop_session?: string;
  status: OrderStatus;
  lat: number;
  lng: number;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  shopper?: Shopper;
  market: Market;
  items: OrderItem[];
  chatMessages: ChatMessage[];
}

export interface OrderStatusUpdate {
  orderId: string;
  status: OrderStatus;
  updatedAt: string;
}