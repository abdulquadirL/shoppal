import { Server } from "socket.io";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@/types/socket";

export const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents
>({
  cors: { origin: "*" },
});
