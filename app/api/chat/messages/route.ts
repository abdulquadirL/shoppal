import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const orderId = new URL(req.url).searchParams.get("orderId");
  if (!orderId) return new Response("Missing orderId", { status: 400 });

  const messages = await prisma.chatMessage.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
  });

  return Response.json(
    messages.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    }))
  );
}
