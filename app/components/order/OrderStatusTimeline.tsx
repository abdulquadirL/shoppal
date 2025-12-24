"use client";

import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { OrderStatus } from "@/types/order";

export interface OrderStatusUpdate {
  orderId: string;
  status: OrderStatus;
  updatedAt: string;
}

interface OrderStatusTimelineProps {
  orderId: string;
  socket: Socket | null;
}

export default function OrderStatusTimeline({
  orderId,
  socket,
}: OrderStatusTimelineProps) {
  const [timeline, setTimeline] = useState<OrderStatusUpdate[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Join the order room for real-time updates
    socket.emit("join_order", orderId);

    // Listen for status updates
    const handleStatusUpdate = (update: OrderStatusUpdate) => {
      setTimeline((prev) => [...prev, update]);
    };

    socket.on("order_status_update", handleStatusUpdate);

    // Cleanup listener on unmount
    return () => {
      socket.off("order_status_update", handleStatusUpdate);
    };
  }, [orderId, socket]);

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-md shadow-sm bg-white">
      <h3 className="text-lg font-semibold">Order Timeline</h3>
      {timeline.length === 0 ? (
        <p className="text-gray-500">No updates yet</p>
      ) : (
        <ul className="space-y-1">
          {timeline.map((update, idx) => (
            <li key={idx} className="flex justify-between items-center">
              <span className="capitalize">{update.status.replace("_", " ")}</span>
              <span className="text-xs text-gray-400">
                {new Date(update.updatedAt).toLocaleTimeString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
