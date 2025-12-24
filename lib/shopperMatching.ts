import {prisma} from "@/lib/prisma";

export async function findNearestShopper(
  marketId: string,
  lat: number,
  lng: number
) {
  const shoppers = await prisma.shopper.findMany({
    where: {
      marketId,
      isAvailable: true,
    },
  });

  if (!shoppers.length) return null;

  const distance = (a: any) =>
    Math.sqrt((a.lat - lat) ** 2 + (a.lng - lng) ** 2);

  return shoppers.sort((a, b) => distance(a) - distance(b))[0];
}
