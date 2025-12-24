import { prisma } from "@/lib/prisma";
import { AuthUser, PublicUser } from "@/types/user";

/* 🔐 AUTH-ONLY QUERY */
export async function getUserForAuth(
  email: string
): Promise<AuthUser | null> {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      password: true,
    },
  });
}

/* 🌍 PUBLIC QUERY */
export async function getPublicUser(
  id: string
): Promise<PublicUser | null> {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
}
