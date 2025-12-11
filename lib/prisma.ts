import { PrismaClient } from "@/generated/client/client"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query' ], accelerateUrl: process.env.PRISMA_ACCELERATE_URL || undefined, adapter: process.env.PRISMA_ACCELERATE_SECRET || undefined,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma