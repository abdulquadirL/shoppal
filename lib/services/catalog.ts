import {prisma} from "@/lib/prisma";

export async function listStores() {
  return prisma.store.findMany({ orderBy: { name: "asc" } });
}

export async function listProductsByStore(storeId: string) {
  return prisma.product.findMany({ where: { storeId } });
}
