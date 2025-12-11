import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { getIO } from "@/app/socket";

export async function POST(req: NextRequest) {
  const { orderId, shopperId } = await req.json();

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { shopperId, status: "SHOPPER_ASSIGNED" },
  });

  const io = getIO();
  if (io) {
    // notify customer session
    io.to(order.shop_session).emit("order_assigned", { orderId, shopperId });

    // notify shopper directly
    io.to(`shopper_${shopperId}`).emit("order_assigned", { orderId });
  }

  return NextResponse.json(order);
}
