import { prisma } from "@/lib/prisma";
import { assignShopper } from "./matchShopper";
import { io } from "@/lib/socket";

const ACCEPT_TIMEOUT_MS = 30_000; // 30 seconds

export async function startAcceptanceTimer(orderId: string) {
  setTimeout(async () => {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) return;

    if (order.status === "AWAITING_ACCEPTANCE") {
      // Release current shopper
      if (order.shopperId) {
        await prisma.shopper.update({
          where: { id: order.shopperId },
          data: { isAvailable: true },
        });
      }

      // Clear assignment
      await prisma.order.update({
        where: { id: orderId },
        data: { shopperId: null },
      });

      // Try reassign
      const reassigned = await assignShopper(orderId);

      if (!reassigned) {
        io.emit("order_unassigned", { orderId });
      }
    }
  }, ACCEPT_TIMEOUT_MS);
}
