import { Card, CardContent } from "@/app/components/ui";
import { prisma } from "@/lib/prisma";

export default async function StatsCards() {
  const [orders, shoppers] = await Promise.all([
    prisma.order.count(),
    prisma.shopper.count(),
  ]);

  const pending = await prisma.order.count({
    where: { status: "PENDING" },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Stat title="Total Orders" value={orders} />
      <Stat title="Pending Orders" value={pending} />
      <Stat title="Total Shoppers" value={shoppers} />
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
