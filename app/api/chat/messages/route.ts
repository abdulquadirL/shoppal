import { NextRequest } from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId");
  if (!orderId) return new Response("Missing orderId", { status: 400 });

  const messages = await prisma.chatMessage.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
  });

  return new Response(JSON.stringify(messages), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, senderId, senderRole, content, attachment } = await req.json();
    if (!orderId || !senderId) return new Response("orderId and senderId required", { status: 400 });

    const msg = await prisma.chatMessage.create({
      data: {
        orderId,
        senderId,
        senderRole: senderRole ?? "customer",
        text: content ?? null,
        attachment: attachment ?? null,
      },
    });

    // Broadcast via socket
    const io = (global as any).__ioServer;
    if (io) io.to(orderId).emit("receive_message", msg);

    return new Response(JSON.stringify(msg), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("POST /api/chat/messages error:", err);
    return new Response("Internal error", { status: 500 });
  }
}
