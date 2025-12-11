import {prisma} from "@/lib/prisma";

function toRad(v: number){ return v * Math.PI / 180; }
function haversine(lat1:number, lng1:number, lat2:number, lng2:number) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export async function assignNearestShopper(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");

  const { customerLatitude: lat, customerLongitude: lng, storeId } = order;

  // fetch available shoppers with locations in same market (store's market logic depends on your schema)
  const sessions = await prisma.shopperLocation.findMany({
    where: { /* add market filter if available */ },
  });

  const available = sessions.map(s => ({
    ...s,
    distance: haversine(lat, lng, s.latitude, s.longitude)
  })).sort((a,b) => a.distance - b.distance);

  if (!available.length) return null;
  const chosen = available[0];

  // atomic update — use transaction
  await prisma.$transaction([
    prisma.user.update({ where: { id: chosen.userId }, data: { /* mark busy if you store that */ } }),
    prisma.order.update({ where: { id: orderId }, data: { shopperId: chosen.userId, status: "SHOPPER_ASSIGNED" } })
  ]);

  // return chosen shopper + distance
  return chosen;
}
