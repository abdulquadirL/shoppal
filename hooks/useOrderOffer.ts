"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";

export interface OrderOffer {
  orderId: string;
  expiresIn: number;
}

export function useOrderOffer() {
  const socket = useSocket();
  const [offer, setOffer] = useState<OrderOffer | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("order_offer", (payload: OrderOffer) => {
      setOffer(payload);
    });

    return () => {
      socket.off("order_offer");
    };
  }, [socket]);

  const clearOffer = () => setOffer(null);

  return { offer, clearOffer };
}
