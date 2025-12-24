export type Message = {
  id?: string;
  orderId: string;
  senderId: string;
  senderRole: "customer" | "shopper" | "system";
  text?: string | null;
  attachment?: string | null;
  audio?: string | null;
  createdAt?: string;
  readBy?: string[];
};


