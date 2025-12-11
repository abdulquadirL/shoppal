import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId, latitude, longitude } = await req.json();
  const updated = await prisma.shopperLocation.upsert({
    where: { userId },
    update: { latitude, longitude },
    create: { userId, latitude, longitude },
  });
  return NextResponse.json(updated);
}
