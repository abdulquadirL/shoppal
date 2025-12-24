// lib/matching/assignOrder.ts
import { prisma } from "@/lib/prisma";
import { findEligibleShoppers } from "./findEligibleShoppers";
import { io } from "../socket";

const ASSIGN_TIMEOUT = 20_000; // 20 seconds

export async function assignOrder(orderId: string) {
  const candidates = await findEligibleShoppers(orderId);

  for (const { shopper } of candidates) {
    const accepted = await offerToShopper(orderId, shopper.id);
    if (accepted) return true;
  }

  return false;
}

function offerToShopper(orderId: string, shopperId: string): Promise<boolean> {
  return new Promise(async (resolve) => {
    // Notify shopper
    io.to(`shopper:${shopperId}`).emit("order_offer", {
      orderId,
      expiresIn: 20,
    });

    const timeout = setTimeout(() => {
      cleanup();
      resolve(false);
    }, ASSIGN_TIMEOUT);

    function cleanup() {
      clearTimeout(timeout);
      io.off("order_accept", onAccept);
      io.off("order_reject", onReject);
    }

    async function onAccept(payload: { orderId: string; shopperId: string }) {
      if (payload.orderId !== orderId) return;

      cleanup();

      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: {
            shopperId,
            status: "SHOPPER_ASSIGNED",
          },
        }),
        prisma.shopper.update({
          where: { id: shopperId },
          data: { isAvailable: false },
        }),
      ]);

      io.to(`order:${orderId}`).emit("order_assigned", {
        orderId,
        shopperId,
      });

      resolve(true);
    }

    function onReject(payload: { orderId: string }) {
      if (payload.orderId !== orderId) return;
      cleanup();
      resolve(false);
    }

    io.once("order_accept", onAccept);
    io.once("order_reject", onReject);
  });
}

