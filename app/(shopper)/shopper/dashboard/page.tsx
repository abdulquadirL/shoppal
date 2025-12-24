
"use client";

import { Button, Card, CardContent } from "@/app/components/ui";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";

export default function ShopperDashboard() {
  const { data } = useQuery({
    queryKey: ["shopper-orders"],
    queryFn: async () => {
      const res = await axios.get("/api/shopper/orders");
      return res.data;
    },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Active Orders</h1>

      {data?.active?.length === 0 && <p>No active orders.</p>}

      {data?.active?.map((order: any) => (
        <Card key={order.id}>
          <CardContent className="flex justify-between items-center py-4">
            <div>
              <p className="font-medium">Order #{order.id.slice(0, 6)}</p>
              <p className="text-sm">Status: {order.status}</p>
            </div>

            <Link href={`/shopper/dashboard/orders/${order.id}`}>
              <Button>Open</Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
