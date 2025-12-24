// import { Server } from "socket.io";
// import {prisma} from "@/lib/prisma";
// import {
//   ServerToClientEvents,
//   ClientToServerEvents,
// } from "@/types/socket";

// let io: Server<ClientToServerEvents, ServerToClientEvents> | null = null;

// export function initIO(server: any) {
//   if (io) return io;

//   io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
//     path: "/api/socket",
//     cors: { origin: "*" },
//   });

//   io.on("connection", (socket) => {
//     /* Join order room */
//     socket.on("join_order", (orderId) => {
//       socket.join(orderId);
//     });

//     /* Send message */
//     socket.on("send_message", async (msg) => {
//       const saved = await prisma.chatMessage.create({
//         data: {
//           orderId: msg.orderId,
//           senderId: msg.senderId,
//           senderRole: msg.senderRole,
//           text: msg.text,
//           attachment: msg.attachment,
//           readBy: [msg.senderId],
//         },
//       });

//       io!.to(msg.orderId).emit("receive_message", {
//         ...saved,
//         createdAt: saved.createdAt.toISOString(),
//       });
//     });

//     /* Typing */
//     socket.on("typing", (orderId) => {
//       socket.to(orderId).emit("typing", socket.id);
//     });

//     socket.on("stop_typing", (orderId) => {
//       socket.to(orderId).emit("stop_typing", socket.id);
//     });
//   });

//   return io;
// }


import { Server as IOServer } from "socket.io";

let io: IOServer | null = null;

export function initSocket(server: any) {
  if (!io) {
    io = new IOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
  }
  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

export default {
  initSocket,
  getIO,
};
