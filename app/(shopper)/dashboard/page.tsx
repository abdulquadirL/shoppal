"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { ChatPanel } from "@/app/components/chat/ChatPanel";
import { LiveMapTracker } from "@/app/components/map/LiveMapTracker";
import { OrderStatusTimeline } from "@/app/components/order/OrderStatusTimeline";
import { Button, Card } from "@/app/components/ui";

interface Order {
  id: string;
  status: string;
  customerId?: string;
  location: { lat: number; lng: number };
}

export default function ShopperDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const socket = useSocket();

  useEffect(() => {
    fetch("/api/orders?shopper=true")
      .then(res => res.json())
      .then(setOrders);
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("order_assigned", (updatedOrder: Order) => {
      setOrders(prev =>
        prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o))
      );

        return () => socket.off("order_assigned");
  }, );
    }, [socket]);

  


  const handlePickOrder = (orderId: string) => {
    fetch(`/api/orders/${orderId}/assign`, { method: "POST" });
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 p-4">
      <div className="flex flex-col w-full lg:w-1/3 space-y-4">
        {orders.map(order => (
          <Card key={order.id} className="cursor-pointer">
            <div className="flex justify-between items-center">
              <span>Order #{order.id}</span>
              <span className="text-sm text-gray-500">{order.status}</span>
            </div>
            {order.status === "pending" && (
              <Button
                className="mt-2"
                onClick={() => handlePickOrder(order.id)}
              >
                Pick Order
              </Button>
            )}
            <Button className="mt-1" onClick={() => setSelectedOrder(order)}>
              View Details
            </Button>
          </Card>
        ))}
      </div>

      {selectedOrder && (
        <div className="flex-1 flex flex-col gap-4">
          <div className="h-64">
            <LiveMapTracker order={selectedOrder} />
          </div>
          <OrderStatusTimeline orderId={selectedOrder.id} />
          <div className="flex-1">
            <ChatPanel
              orderId={selectedOrder.id}
              currentUserId="shopper-1" // replace with auth session
            />
          </div>
        </div>
      )}
    </div>
  );
}
