import {prisma} from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const notifications = await prisma.notification.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(notifications);
}
