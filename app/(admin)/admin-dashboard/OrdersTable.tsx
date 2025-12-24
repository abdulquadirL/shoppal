import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import AssignShopperModal from "./AdminShopperModal";


export default async function OrdersTable() {
  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      shopper: true,
      market: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-3 text-left">Order</th>
            <th>Customer</th>
            <th>Market</th>
            <th>Status</th>
            <th>Shopper</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t">
              <td className="p-3">{order.id.slice(0, 6)}</td>
              <td>{order.customer.name}</td>
              <td>{order.market.name}</td>
              <td>
                <Badge variant="outline">{order.status}</Badge>
              </td>
              <td>
                {order.shopper?.name ?? (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </td>
              <td>
                <AssignShopperModal orderId={order.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
