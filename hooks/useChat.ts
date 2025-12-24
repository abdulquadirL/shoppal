"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Message } from "@/types/chat";
import { useSocket } from "./useSocket";

export function useChat(orderId: string, userId: string) {
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    axios
      .get(`/api/chat/messages?orderId=${orderId}`)
      .then((r) => setMessages(r.data));
  }, [orderId]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("join_order", orderId);

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", () => setTyping(true));
    socket.on("stop_typing", () => setTyping(false));

    return () => {
      socket.off("receive_message");
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [socket, orderId]);

  function send(msg: Message) {
    socket?.emit("send_message", msg);
  }

  return { messages, send, typing };
}
