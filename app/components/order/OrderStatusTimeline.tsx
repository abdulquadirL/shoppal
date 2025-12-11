"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card } from "@/app/components/ui";

interface StatusUpdate {
  id: string;
  status: string;
  timestamp: string;
}

interface OrderStatusTimelineProps {
  orderId: string;
}

export function OrderStatusTimeline({ orderId }: OrderStatusTimelineProps) {
  const [timeline, setTimeline] = useState<StatusUpdate[]>([]);
  const socket = useSocket();

  useEffect(() => {
    fetch(`/api/orders/${orderId}/status`)
      .then(res => res.json())
      .then(setTimeline);
  }, [orderId]);

  useEffect(() => {

    if (!socket) return;

    socket.emit("join_order", orderId);

    const handleStatusUpdate = (update: StatusUpdate) => {
    setTimeline(prev => [...prev, update]);
  };

    socket.on("order_status_update", (update) => {
      setTimeline(prev => [...prev, update]);
    });

    return () => { 
      socket.off("order_status_update", handleStatusUpdate);
    };
  }, [orderId, socket]);

  return (
    <Card className="p-4">
      <h4 className="font-semibold mb-2">Order Timeline</h4>
      <ul className="space-y-2">
        {timeline.map(item => (
          <li key={item.id} className="flex justify-between text-sm">
            <span>{item.status}</span>
            <span className="text-gray-400">{new Date(item.timestamp).toLocaleTimeString()}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
