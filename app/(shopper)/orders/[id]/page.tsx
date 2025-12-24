"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { Order, OrderItem } from "@/types/order";

let socket: Socket | null = null;

export default function ShopperOrderPage() {
  const { id: orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds timeout
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    // Initialize socket
    if (!socket) {
      socket = io();
    }

    // Join order room
    if (socket && orderId) {
      socket.emit("join_order", orderId);

      socket.on("order_status_update", (update: any) => {
        setOrder((prev) =>
          prev ? { ...prev, status: update.status } : prev
        );
      });

      socket.on("order_unassigned", (payload: any) => {
        alert("Order was unassigned. Reassigning...");
        setOrder(null);
      });

      socket.on("order_assigned", (payload: any) => {
        console.log("Order assigned:", payload.orderId);
      });
    }

    return () => {
      socket?.off("order_status_update");
      socket?.off("order_unassigned");
      socket?.off("order_assigned");
    };
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;

    // Fetch order details
    axios.get(`/api/orders/${orderId}`).then((res) => setOrder(res.data));
  }, [orderId]);

  // Countdown for acceptance timeout
  useEffect(() => {
    if (!order || order.status !== "AWAITING_ACCEPTANCE") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleReject(); // Auto reject on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [order]);

  const handleAccept = async () => {
    if (!orderId) return;
    try {
      const res = await axios.post(`/api/orders/${orderId}/accept`);
      setOrder(res.data);
      setAccepted(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async () => {
    if (!orderId) return;
    try {
      await axios.post(`/api/orders/${orderId}/reject`);
      setOrder(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (!order) {
    return <div className="p-4">No assigned order currently.</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Order #{order.id}</h1>
      <p>Status: {order.status}</p>
      {order.status === "AWAITING_ACCEPTANCE" && (
        <p className="text-red-600">Time left to accept: {timeLeft}s</p>
      )}

      <div className="border p-4 rounded shadow space-y-2">
        <h2 className="font-semibold">Customer Details</h2>
        <p>Name: {order.customer.name}</p>
        <p>Email: {order.customer.email}</p>
      </div>

      <div className="border p-4 rounded shadow space-y-2">
        <h2 className="font-semibold">Order Items</h2>
        {order.items.map((item: OrderItem) => (
          <div key={item.id} className="flex justify-between">
            <span>{item.product}</span>
            <span>Qty: {item.quantity}</span>
          </div>
        ))}
      </div>

      {!accepted && order.status === "AWAITING_ACCEPTANCE" && (
        <div className="flex gap-4">
          <button
            onClick={handleAccept}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Accept
          </button>
          <button
            onClick={handleReject}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Reject
          </button>
        </div>
      )}

      {/* Placeholder for ChatPanel */}
      <div className="border p-4 rounded shadow mt-6">
        <h2 className="font-semibold">Chat</h2>
        <p>Chat component will go here...</p>
      </div>
    </div>
  );
}
