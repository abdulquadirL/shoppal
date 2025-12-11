import { Message } from "@/types/chat";

export interface ClientToServerEvents {
  send_message: (msg: Message) => void;
  read_message: ({ messageId, userId }: { messageId: string; userId: string }) => void;
  typing: (payload: { orderId: string; userId: string }) => void;
  stop_typing: (payload: { orderId: string; userId: string }) => void;
  join_order: (orderId: string) => void;
}

export interface ServerToClientEvents {
  receive_message: (msg: Message) => void;
  message_read: ({ messageId, userId }: { messageId: string; userId: string }) => void;
  typing: (payload: { userId: string }) => void;
  stop_typing: (payload: { userId: string }) => void;
  order_assigned: (order: any) => void;
  order_status_update: (update: { id: string; status: string; timestamp: string }) => void;
  shopper_location: ({ lat, lng }: { lat: number; lng: number }) => void;
}
