import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { orderId, amount, providerRef } = await req.json();
  const payment = await prisma.payment.create({
    data: { orderId, amount, providerRef, status: "PENDING" },
  });
  return NextResponse.json(payment);
}
