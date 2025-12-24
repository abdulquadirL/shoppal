"use client";

import ChatPanel from "@/app/components/chat/ChatPanel";
import OrderStatusTimeline from "@/app/components/order/OrderStatusTimeline";
import { useOrder } from "@/hooks/useOrders";
import { useParams } from "next/navigation";



export default function CustomerOrderPage() {
  const { id } = useParams();
  const { data: order } = useOrder(id as string);

  if (!order) return <p>Loading...</p>;

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <OrderStatusTimeline orderId={order.id} socket={null} />
      <ChatPanel orderId={order.id} />
    </div>
  );
}
