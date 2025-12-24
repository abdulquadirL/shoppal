// lib/matching/findEligibleShoppers.ts
import { prisma } from "@/lib/prisma";
import { haversineDistance } from "@/lib/geo";

export async function findEligibleShoppers(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { market: true },
  });

  if (!order) throw new Error("Order not found");

  const shoppers = await prisma.shopper.findMany({
    where: {
      marketId: order.marketId,
      isAvailable: true,
    },
  });

  return shoppers
    .map((shopper: { lat: number; lng: number; }) => ({
      shopper,
      distance: haversineDistance(
        order.lat,
        order.lng,
        shopper.lat,
        shopper.lng
      ),
    }))
    .sort((a: { distance: number; }, b: { distance: number; }) => a.distance - b.distance);
}
