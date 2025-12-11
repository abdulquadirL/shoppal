import {prisma} from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function createUser({ name, email, phone, password, role = "CUSTOMER" }: any) {
  const hash = await bcrypt.hash(password, 10);
  return prisma.user.create({ data: { name, email, phone, passwordHash: hash, role } });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}
