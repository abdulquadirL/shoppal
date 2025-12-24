import { io } from "socket.io-client";
//import type { ServerToClientEvents, ClientToServerEvents } from "@/types/socket";

export const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});
