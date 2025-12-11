import { prisma } from "@/lib/prisma";


async function main() {
  // Create Markets
  const market1 = await prisma.market.create({
    data: { name: "Central Market", lat: 6.5244, lng: 3.3792 },
  });

  const market2 = await prisma.market.create({
    data: { name: "Lagos Island Market", lat: 6.455, lng: 3.390 },
  });

  // Create Shoppers
  const shopper1 = await prisma.shopper.create({
    data: { name: "Alice Shopper", email: "alice@shop.com", lat: 6.525, lng: 3.380, marketId: market1.id },
  });

  const shopper2 = await prisma.shopper.create({
    data: { name: "Bob Shopper", email: "bob@shop.com", lat: 6.456, lng: 3.392, marketId: market2.id },
  });

  // Create Customers
  const customer1 = await prisma.customer.create({
    data: { name: "Charlie Customer", email: "charlie@customer.com" },
  });

  const customer2 = await prisma.customer.create({
    data: { name: "Diana Customer", email: "diana@customer.com" },
  });

  // Create Orders (unassigned initially)
  const order1 = await prisma.order.create({
    data: {
      customerId: customer1.id,
      marketId: market1.id,
      lat: 6.526,
      lng: 3.381,
      status: "PENDING",
      shop_session: "session-1",
    },
  });

  const order2 = await prisma.order.create({
    data: {
      customerId: customer2.id,
      marketId: market2.id,
      lat: 6.457,
      lng: 3.391,
      status: "PENDING",
      shop_session: "session-2",
    },
  });

  console.log("Seed data created:");
  console.log({ market1, market2, shopper1, shopper2, customer1, customer2, order1, order2 });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
