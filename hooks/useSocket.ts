"use client";

import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/types/socket";

export function useSocket() {
  const [socket, setSocket] = useState<
    Socket<ServerToClientEvents, ClientToServerEvents> | null
  >(null);

  useEffect(() => {
    const s = io({
      path: "/api/socket",
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return socket;
}
