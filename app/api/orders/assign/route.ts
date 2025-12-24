// app/api/orders/assign/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Haversine formula to calculate distance between two coordinates
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) return NextResponse.json({ error: "orderId is required" }, { status: 400 });

    // Fetch order with market info
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { market: true },
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Find all available shoppers in the order's market
    const shoppers = await prisma.shopper.findMany({
      where: { marketId: order.marketId, isAvailable: true },
    });

    if (!shoppers.length)
      return NextResponse.json({ error: "No available shoppers in this market" }, { status: 400 });

    // Sort shoppers by proximity
    const nearest = shoppers
      .map((s) => ({ ...s, distance: getDistance(order.lat, order.lng, s.lat, s.lng) }))
      .sort((a, b) => a.distance - b.distance)[0];

    // Assign shopper
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { shopperId: nearest.id, status: "SHOPPER_ASSIGNED" },
    });

    // Mark shopper as unavailable
    await prisma.shopper.update({
      where: { id: nearest.id },
      data: { isAvailable: false },
    });

    // Emit real-time event via global Socket.IO server
    const io = (global as any).__ioServer;
    if (io) {
      io.to(orderId).emit("order_assigned", updatedOrder);
      io.to(nearest.id).emit("assigned_order", updatedOrder);
    }

    return NextResponse.json(updatedOrder);
  } catch (err) {
    console.error("Error in assign order route:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
