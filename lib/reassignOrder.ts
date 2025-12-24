import {prisma} from "@/lib/prisma";
import { getIO } from "@/app/socket";
import { findNearestShopper } from "@/lib/shopperMatching";

export async function reassignOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { market: true },
  });

  if (!order || order.shopperId) return;

  const shopper = await findNearestShopper(order.marketId, order.lat, order.lng);
  if (!shopper) return;

  const io = getIO();

  io.to(`shopper:${shopper.id}`).emit("order_offer", {
    orderId,
    expiresIn: 20,
  });
}
