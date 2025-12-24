//import { prisma } from "./prisma";
import { prisma } from "./prisma";
import { getDistance } from "./utils/distance";

export async function assignShopper(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });
  if (!order) throw new Error("Order not found");

  const shoppers = await prisma.shopper.findMany({
    where: {
      marketId: order.marketId,
      isAvailable: true,
    },
  });

  if (!shoppers.length) return null;

  const ranked = shoppers
    .map((s: {
        id: any; lat: number; lng: number; 
}) => ({
      shopper: s,
      distance: getDistance(order.lat, order.lng, s.lat, s.lng),
    }))
    .sort((a: { distance: number; }, b: { distance: number; }) => a.distance - b.distance);

  const selected = ranked[0].shopper;

  return prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: {
        shopperId: selected.id,
        status: "AWAITING_ACCEPTANCE",
        shopSession: `order_${orderId}`,
      },
    }),
    prisma.shopper.update({
      where: { id: selected.id },
      data: { isAvailable: false },
    }),
  ]);
}
