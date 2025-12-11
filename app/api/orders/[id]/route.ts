import { getOrderById } from "@/lib/services/orders";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const order = await getOrderById(params.id);
  if (!order) return new Response("Not found", { status: 404 });
  return Response.json(order);
}
