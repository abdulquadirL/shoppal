import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "../components/ui";
import { Badge } from "lucide-react";



export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const [
    ordersCount,
    customersCount,
    shoppersCount,
    activeShoppers,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.customer.count(),
    prisma.shopper.count(),
    prisma.shopper.count({ where: { isAvailable: true } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        shopper: true,
        market: true,
      },
    }),
  ]);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview & system activity
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={ordersCount} />
        <StatCard title="Customers" value={customersCount} />
        <StatCard title="Shoppers" value={shoppersCount} />
        <StatCard title="Active Shoppers" value={activeShoppers} />
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          Recent Orders
        </CardHeader>
        <CardContent className="space-y-4">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between border-b pb-3 last:border-none"
            >
              <div>
                <p className="font-medium">
                  {order.customer.name} – {order.market.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge>{order.status}</Badge>
                {order.shopper ? (
                  <Badge className="bg-green-600">
                    {order.shopper.name}
                  </Badge>
                ) : (
                  <Badge >Unassigned</Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ----------------------------------
   SMALL STAT CARD
---------------------------------- */
function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        
          {title}
        
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
