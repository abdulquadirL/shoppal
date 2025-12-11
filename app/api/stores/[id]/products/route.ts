// app/api/stores/[id]/products/route.ts
import { listProductsByStore } from "@/lib/services/catalog";
export async function GET(req: Request, { params }: any) {
  return Response.json(await listProductsByStore(params.id));
}
