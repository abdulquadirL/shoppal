
import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import type { ServerToClientEvents, ClientToServerEvents } from "@/types/socket";

export function useSocket() {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL!);
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return socket;
}
