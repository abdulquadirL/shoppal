
// types/socket.ts

import { Message } from "@/types/chat";

/* =======================
   Client → Server Events
======================= */
export interface ClientToServerEvents {
  join_order: (orderId: string) => void;
  send_message: (message: Message) => void;
  typing: (orderId: string) => void;
  stop_typing: (orderId: string) => void;
  order_accept: (payload: {
    orderId: string;
    expiresIn: number;
  }) => void;
  order_reject: (orderId: string) => void;
}

/* =======================
   Server → Client Events
======================= */
export interface ServerToClientEvents {
  receive_message: (message: Message) => void;
  typing: (userId: string) => void;
  stop_typing: (userId: string) => void;
  order_assigned: (payload: { orderId: string; shopperId: string }) => void;
  order_offer: (payload: {
    orderId: string;
    expiresIn: number;
  }) => void;
  order_status_update: (update: {
    status: string;
    timestamp: string;
  }) => void;
}
