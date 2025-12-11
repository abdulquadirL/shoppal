import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { getIO } from "@/app/socket";
import { getDistance } from "@/lib/utils/distance";


export async function POST(req: NextRequest) {
  const { orderId } = await req.json();

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Fetch available shoppers in the same market
  const shoppers = await prisma.shopper.findMany({
    where: { marketId: order.marketId, isAvailable: true },
  });

  if (!shoppers.length) return NextResponse.json({ error: "No available shoppers" }, { status: 400 });

  // Sort shoppers by distance
  const sorted = shoppers
    .map((s) => ({
      ...s,
      distance: getDistance( order.lat, order.lng, s.lat, s.lng ),
    }))
    .sort((a, b) => a.distance - b.distance);

  const assignedShopper = sorted[0];

  // Assign shopper to order
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { shopperId: assignedShopper.id, status: "SHOPPER_ASSIGNED" },
  });

  // Mark shopper as unavailable
  await prisma.shopper.update({
    where: { id: assignedShopper.id },
    data: { isAvailable: false },
  });

  // Broadcast to WebSocket
  const io = getIO();
  if (io) {
    if (updatedOrder.shop_session) io.to(updatedOrder.shop_session).emit("order_assigned", updatedOrder);
    io.to(`shopper_${assignedShopper.id}`).emit("order_assigned", updatedOrder);
  }

  return NextResponse.json(updatedOrder);
}
