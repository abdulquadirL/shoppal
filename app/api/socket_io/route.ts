// app/api/socket_io/route.ts
import { NextRequest } from "next/server";
import { Server } from "socket.io";
import { createServer } from "http";
import prisma from "@/lib/prisma";

export const runtime = "nodejs"; // ensure Node runtime

export default async function handler(req: NextRequest) {
  // Next.js provides access to the underlying node server socket
  // This route should be called once to initialize Socket.IO; it exits immediately
  // (When using Next dev, HMR might re-run; we guard against re-init.)

  // @ts-ignore - Next's res object available via experimental edge/route handlers differs; use global
  // We'll initialize on globalThis to avoid duplicate initializations.
  // NOTE: For Vercel serverless, Socket.IO persistent process won't work — use a dedicated socket server service.
  // This approach works for self-hosted or Node environment.
  // Importantly, this route will be invoked from the client (fetch), which triggers initialization.

  // We need access to the raw http server; Next.js exposes it at (res as any).socket.server in older setups.
  // In App Router, we can attach to globalThis.
  // We'll implement a safe initializer:

  if ((globalThis as any).__ioInitialized) {
    return new Response("Socket.IO already running", { status: 200 });
  }

  const server = (globalThis as any).__ioServer as Server | undefined;

  // Create a bare-bones HTTP server and attach Socket.IO to it via a Server instance using existing socket
  // For Next.js route handlers we don't have direct access to the Node `res.socket.server` object the same way
  // as pages/api. For practical dev, call this route and it will create a standalone Socket.IO server that listens
  // on the same port via global `io` (works in local dev / custom server). If you deploy to serverless (Vercel),
  // use an external socket host (Pusher, Supabase Realtime, Ably, or a dedicated socket server).

  // initialize Socket.IO on globalThis so it persists across HMR in dev
  const io = new Server({
    // path can be /api/socket_io and matched client-side
    path: "/api/socket_io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  }) as Server;

  // Save on global for dev
  (globalThis as any).__ioServer = io;
  (globalThis as any).__ioInitialized = true;

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Join an order room
    socket.on("join_order", async ({ orderId, userId }: { orderId: string; userId?: string }) => {
      if (!orderId) return;
      socket.join(orderId);
      // Optionally mark user presence
      socket.to(orderId).emit("user_joined", { userId, socketId: socket.id });
    });

    // Chat messages: persist then broadcast
    socket.on(
      "send_message",
      async (payload: {
        orderId: string;
        senderId: string;
        senderRole: string; // 'customer' | 'shopper'
        text?: string;
        attachment?: string;
        meta?: any;
      }) => {
        try {
          const msg = await prisma.chatMessage.create({
            data: {
              orderId: payload.orderId,
              senderId: payload.senderId,
              senderRole: payload.senderRole,
              text: payload.text ?? null,
              attachment: payload.attachment ?? null,
              meta: payload.meta ?? {},
            },
          });

          // Broadcast saved message to room
          io.to(payload.orderId).emit("receive_message", msg);
        } catch (err) {
          console.error("Failed to persist chat message", err);
          socket.emit("error", { message: "Failed to save message" });
        }
      }
    );

    // Typing indicator
    socket.on("typing", ({ orderId, senderId, isTyping }: { orderId: string; senderId: string; isTyping: boolean }) => {
      socket.to(orderId).emit("typing", { senderId, isTyping });
    });

    // Read receipt: mark message as read by user
    socket.on("read_messages", async ({ orderId, userId }: { orderId: string; userId: string }) => {
      // naive: mark all messages readBy adding userId
      try {
        // fetch unread messages and update their readBy (this is simplistic)
        const msgs = await prisma.chatMessage.findMany({
          where: {
            orderId,
            NOT: {
              readBy: {
                equals: null,
              },
            },
          },
        });

        // better approach: store read markers per message or a separate table
        // for demo, emit read event
        io.to(orderId).emit("messages_read", { userId, timestamp: Date.now() });
      } catch (err) {
        console.error("Error marking messages read", err);
      }
    });

    // Shopper location updates can be sent over socket as separate events (we already implemented)
    socket.on("location_update", ({ orderId, lat, lng }: { orderId: string; lat: number; lng: number }) => {
      io.to(orderId).emit("location_changed", { lat, lng, timestamp: Date.now() });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected", socket.id);
    });
  });

  return new Response("Socket.IO initialized", { status: 200 });
}
