

import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { reassignOrder } from "@/lib/reassignOrder";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = params.id;
  const { shopperId } = await req.json();

  // Mark shopper available again
  await prisma.shopper.update({
    where: { id: shopperId },
    data: { isAvailable: true },
  });

  // Trigger reassignment
  await reassignOrder(orderId);

  return NextResponse.json({ success: true });
}
