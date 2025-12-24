// import { prisma } from "@/lib/prisma";


// async function main() {
//   // Create Markets
//   const market1 = await prisma.market.create({
//     data: { name: "Central Market", lat: 6.5244, lng: 3.3792 },
//   });

//   const market2 = await prisma.market.create({
//     data: { name: "Lagos Island Market", lat: 6.455, lng: 3.390 },
//   });

//   // Create Shoppers
//   const shopper1 = await prisma.shopper.create({
//     data: { name: "Alice Shopper", email: "alice@shop.com", lat: 6.525, lng: 3.380, marketId: market1.id },
//   });

//   const shopper2 = await prisma.shopper.create({
//     data: { name: "Bob Shopper", email: "bob@shop.com", lat: 6.456, lng: 3.392, marketId: market2.id },
//   });

//   // Create Customers
//   const customer1 = await prisma.customer.create({
//     data: { name: "Charlie Customer", email: "charlie@customer.com" },
//   });

//   const customer2 = await prisma.customer.create({
//     data: { name: "Diana Customer", email: "diana@customer.com" },
//   });

//   // Create Orders (unassigned initially)
//   const order1 = await prisma.order.create({
//     data: {
//       customerId: customer1.id,
//       marketId: market1.id,
//       lat: 6.526,
//       lng: 3.381,
//       status: "PENDING",
//     },
//   });

//   const order2 = await prisma.order.create({
//     data: {
//       customerId: customer2.id,
//       marketId: market2.id,
//       lat: 6.457,
//       lng: 3.391,
//       status: "PENDING",
//     },
//   });

//   console.log("Seed data created:");
//   console.log({ market1, market2, shopper1, shopper2, customer1, customer2, order1, order2 });
// }

// main()
//   .catch((e) => console.error(e))
//   .finally(async () => {
//     await prisma.$disconnect();
//   });


import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { UserRole, OrderStatus } from "@prisma/client";

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // --------------------
  // USERS
  // --------------------

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@shoppal.com" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@shoppal.com",
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  const shopperUser = await prisma.user.upsert({
    where: { email: "alice@shop.com" },
    update: {},
    create: {
      name: "Alice Shopper",
      email: "alice@shop.com",
      passwordHash: hashedPassword,
      role: UserRole.SHOPPER,
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: "charlie@customer.com" },
    update: {},
    create: {
      name: "Charlie Customer",
      email: "charlie@customer.com",
      passwordHash: hashedPassword,
      role: UserRole.CUSTOMER,
    },
  });

  // --------------------
  // MARKETS
  // --------------------

  const centralMarket = await prisma.market.upsert({
    where: { name: "Central Market", id: "" },
    update: {},
    create: {
      name: "Central Market",
      lat: 6.5244,
      lng: 3.3792,
    },
  });

  // --------------------
  // SHOPPER PROFILE
  // --------------------

  const shopper = await prisma.shopper.upsert({
    where: { email: shopperUser.email },
    update: {},
    create: {
      name: shopperUser.name!,
      email: shopperUser.email!,
      lat: 6.525,
      lng: 3.38,
      isAvailable: false,
      marketId: centralMarket.id,
    },
  });

  // --------------------
  // CUSTOMER PROFILE
  // --------------------

  const customer = await prisma.customer.upsert({
    where: { email: customerUser.email },
    update: {},
    create: {
      name: customerUser.name!,
      email: customerUser.email!,
    },
  });

  // --------------------
  // ASSIGNED ORDER
  // --------------------

  const order = await prisma.order.upsert({
    where: { id: "seed-assigned-order" },
    update: {},
    create: {
      id: "seed-assigned-order",
      customerId: customer.id,
      shopperId: shopper.id,
      marketId: centralMarket.id,
      lat: 6.526,
      lng: 3.381,
      status: OrderStatus.SHOPPER_ASSIGNED,
      shopSession: "order:seed-assigned-order",
      items: {
        create: [
          { product: "Beans (2kg)", quantity: 1 },
          { product: "Palm Oil", quantity: 1 },
        ],
      },
    },
  });

  console.log("✅ Seed completed");
  console.table({
    admin: adminUser.email,
    shopper: shopperUser.email,
    customer: customerUser.email,
    order: order.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
