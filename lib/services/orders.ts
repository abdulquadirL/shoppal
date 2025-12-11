import {prisma} from "@/lib/prisma";
import { nanoid } from "nanoid";
import { CreateOrderInput } from "../validators/order";


export async function createOrder(input: CreateOrderInput) {
  // calculate total amount
  const productIds = input.items.map(i => i.productId);
  const products = await prisma.orderItem.findMany({
    where: { id: { in: productIds } }
  });

  const total = input.items.reduce((sum, it) => {
    const p = products.find(x => x.id === it.productId);
    return sum + (p ? p.price * it.quantity : 0);
  }, 0);

  const shop_session = `sess_${nanoid(10)}`;

  const order = await prisma.order.create({
    data: {
      customerId: input.customerId,
      storeId: input.storeId,
      totalAmount: total,
      customerAddress: input.customerAddress,
      customerLatitude: input.customerLatitude,
      customerLongitude: input.customerLongitude,
      shop_session,
      items: {
        create: input.items.map(it => ({ productId: it.productId, quantity: it.quantity, price: 0 })) // price filled later or via relation
      }
    },
    include: { items: true }
  });

  return order;
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { 
        items: { 
            include: { product: true }
         },
         customer: true, 
         shopper: true, 
         store: true
         }
  });
}
