import { NextRequest } from "next/server";
import {prisma} from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { messageId, userId } = await req.json();
    if (!messageId || !userId) return new Response("Missing params", { status: 400 });

    const msg = await prisma.chatMessage.update({
      where: { id: messageId },
      data: { readBy: { push: userId } },
    });

    // Broadcast to all clients in the room
    const io = (global as any).__ioServer;
    if (io) io.to(msg.orderId).emit("message_read", { messageId, userId });

    return new Response(JSON.stringify(msg), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("POST /api/chat/read error:", err);
    return new Response("Internal error", { status: 500 });
  }
}
