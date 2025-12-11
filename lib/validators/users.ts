import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(["CUSTOMER", "SHOPPER", "ADMIN"]).optional(),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;
