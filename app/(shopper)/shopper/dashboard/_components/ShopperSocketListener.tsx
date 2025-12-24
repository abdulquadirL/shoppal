"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket-client";

export default function ShopperSocketListener() {
  useEffect(() => {
    socket.on("order_assigned", ({ orderId, shopperId }) => {
      console.log("Assigned to order:", orderId);

      // later:
      // router.push(`/shopper/orders/${orderId}`);
      // toast.success("New order assigned!");
    });

    return () => {
      socket.off("order_assigned");
    };
  }, []);

  return null; // no UI needed
}
