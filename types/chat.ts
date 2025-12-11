export type SenderRole = "customer" | "shopper" | "system";

export interface Message {
  readBy: string[];
  id: string;
  orderId: string;
  senderId: string;
  senderRole: SenderRole;
  text?: string | null;
  attachment?: string | null;
  createdAt: string;
  
}
