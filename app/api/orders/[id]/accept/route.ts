

import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { getIO } from "@/app/socket";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = params.id;
  const { shopperId } = await req.json();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: { status: true, shopperId: true },
      });

      if (!order || order.status !== "PENDING" || order.shopperId) {
        throw new Error("Order already assigned");
      }

      // Assign shopper
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          shopperId,
          status: "SHOPPER_ASSIGNED",
        },
      });

      // Mark shopper unavailable
      await tx.shopper.update({
        where: { id: shopperId },
        data: { isAvailable: false },
      });

      return updatedOrder;
    });

    const io = getIO();

    // Notify customer
    io.to(`order:${orderId}`).emit("order_assigned", {
      orderId,
      shopperId,
    });

    // Notify shopper
    io.to(`shopper:${shopperId}`).emit("order_accepted", {
      orderId,
    });

    // Timeline update
    io.to(`order:${orderId}`).emit("order_status_update", {
      status: "SHOPPER_ASSIGNED",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Order already assigned" },
      { status: 409 }
    );
  }
}
