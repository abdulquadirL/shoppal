"use client";

import { useParams } from "next/navigation";

import axios from "axios";
import OrderStatusTimeline from "@/app/components/order/OrderStatusTimeline";
import { useOrder } from "@/hooks/useOrders";
import { Button } from "@/app/components/ui";
import ChatPanel from "@/app/components/chat/ChatPanel";

export default function ShopperOrderPage() {
  const { id } = useParams();
  const { data: order } = useOrder(id as string);

  if (!order) return <p>Loading...</p>;

  async function advanceStatus(status: string) {
    await axios.post(`/api/orders/${order.id}/status`, { status });
  }

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <OrderStatusTimeline orderId={order.id} socket={null} />

        <div className="flex gap-2">
          <Button onClick={() => advanceStatus("PICKING")}>Start Picking</Button>
          <Button onClick={() => advanceStatus("DELIVERING")}>Delivering</Button>
          <Button onClick={() => advanceStatus("DELIVERED")}>Delivered</Button>
        </div>
      </div>

      <ChatPanel orderId={order.id} />
    </div>
  );
}
