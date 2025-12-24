import { NextRequest } from "next/server";
import {prisma} from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { orderId, userId } = await req.json();

  await prisma.chatMessage.updateMany({
    where: {
      orderId,
      NOT: { readBy: { has: userId } },
    },
    data: {
      readBy: { push: userId },
    },
  });

  return Response.json({ ok: true });
}
