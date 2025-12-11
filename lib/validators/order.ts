import { z } from "zod";

export const createOrderSchema = z.object({
  customerId: z.string().cuid(),
  storeId: z.string().cuid(),
  items: z.array(z.object({
    productId: z.string().cuid(),
    quantity: z.number().int().min(1),
  })),
  customerAddress: z.string().min(5),
  customerLatitude: z.number(),
  customerLongitude: z.number(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
