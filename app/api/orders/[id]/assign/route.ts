import { NextRequest } from "next/server";
import { assignNearestShopper } from "@/lib/services/matching";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const assigned = await assignNearestShopper(params.id);
  if (!assigned) return Response.json({ ok: false, message: "No shoppers available" }, { status: 200 });
  // broadcast via socket if available
  const io = (global as any).__ioServer;
  if (io) io.to(`order_${params.id}`).emit("shopper_assigned", assigned);
  return Response.json({ ok: true, assigned });
}
