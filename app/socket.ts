import { prisma } from "@/lib/prisma";
import { Server as IOServer, Socket } from "socket.io";
import type { DefaultEventsMap } from "socket.io/dist/typed-events";

// Extend globalThis typing
declare global {
  var __ioServer: IOServer | undefined;
}

export function initIO() {
  if (global.__ioServer) return global.__ioServer;

  const io = new IOServer({
    path: "/api/socket",
    cors: { origin: "*", methods: ["GET", "POST"] }, // restrict in production
  });

  global.__ioServer = io;

  io.on("connection", (socket) => {
  socket.on("send_message", async (msg) => {
    await prisma.chatMessage.create({ data: msg });
    io.to(msg.orderId).emit("receive_message", msg);
  });

    // Join order session (room)
    socket.on("join_session", ({ sessionId }) => {
      if (!sessionId) return;
      socket.join(sessionId);
      socket.to(sessionId).emit("user_joined", { userId: socket.data.userId, socketId: socket.id });
    });

    // Chat: send message
    socket.on("send_message", (payload: { sessionId: string; senderId: string; text?: string; attachment?: string }) => {
      if (!payload.sessionId) return;
      const msg = {
        ...payload,
        createdAt: new Date().toISOString(),
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };
      io.to(payload.sessionId).emit("receive_message", msg);
    });

    // Typing indicator
    socket.on("typing", ({ sessionId, userId, isTyping = true }) => {
      if (!sessionId) return;
      socket.to(sessionId).emit("typing", { userId, isTyping });
    });

    // Read receipt
    socket.on("read_message", async ({ messageId, userId }) => {
    const msg = await prisma.chatMessage.update({
      where: { id: messageId },
      data: { readBy: { push: userId } },
    });
    io.to(msg.orderId).emit("message_read", { messageId, userId });
  });

    // Shopper location updates
    socket.on("location_update", ({ sessionId, lat, lng }) => {
      if (!sessionId) return;
      io.to(sessionId).emit("location_update", { lat, lng, timestamp: new Date().toISOString() });
      // optionally persist to DB
    });

    socket.on("typing", (payload) => socket.to(payload.orderId).emit("typing", payload));
    socket.on("stop_typing", (payload) => socket.to(payload.orderId).emit("stop_typing", payload));


    // Order events (server can also emit via getIO())
    socket.on("join_shopper_room", ({ shopperId }) => {
      if (!shopperId) return;
      socket.join(`shopper_${shopperId}`);
    });

    socket.on("disconnect", (reason) => {
      console.log("[socket] disconnected", socket.id, reason);
    });
  });

  return io;
}

export function getIO() {
  return global.__ioServer;
}
