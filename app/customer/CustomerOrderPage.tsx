"use client";
import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { LiveMapTracker } from "@/app/components/map/LiveMapTracker";
import { OrderStatusTimeline } from "../components/order/OrderStatusTimeline";

type Order = {
  id: string;
  customerId: string;
  shopperId?: string;
  lat: number;
  lng: number;
  status: string;
  shop_session: string;
};

export default function CustomerOrderDemo() {
  const [order, setOrder] = useState<Order | null>(null);
  const customerId = "charlie-customer"; // Replace with seeded ID
  const socket = useSocket(customerId);

  useEffect(() => {
  // Ensure the customerId exists before fetching
  if (!customerId) return;

  const loadOrder = async () => {
    try {
      const res = await fetch(`/api/orders?customerId=${customerId}`);
      const data = await res.json();

      // Guard against empty response
      if (Array.isArray(data) && data.length > 0) {
        setOrder(data[0]);
      } else {
        setOrder(null);
      }
    } catch (err) {
      console.error("Failed to load order:", err);
    }
  };

  loadOrder();

  if (!socket) return;

  const handleAssigned = (updatedOrder: Order) => {
    setOrder(updatedOrder);
    console.log("Shopper assigned:", updatedOrder.shopperId);
  };

  socket.on("order_assigned", handleAssigned);

  // Cleanup
  return () => {
    socket.off("order_assigned", handleAssigned);
  };
}, [socket, customerId]);


  const handleMatchShopper = async () => {
    if (!order) return;
    const res = await fetch("/api/orders/match", {
      method: "POST",
      body: JSON.stringify({ orderId: order.id }),
    });
    const updated = await res.json();
    setOrder(updated);
  };

  if (!order) return <div>Loading order...</div>;

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">Customer Demo: Track Your Order</h1>

      <OrderStatusTimeline status={order.status as any} />

      <LiveMapTracker sessionId={order.shop_session} />

      <button
        className="bg-blossom-green text-white py-2 px-4 rounded mt-4"
        onClick={handleMatchShopper}
      >
        Assign Closest Shopper
      </button>

      <p className="mt-2">
        Assigned Shopper: {order.shopperId ? order.shopperId : "Not assigned yet"}
      </p>
    </div>
  );
}
