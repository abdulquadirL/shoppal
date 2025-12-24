"use client";

import { Button, Card, CardContent } from "@/app/components/ui";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";

export default function CustomerDashboard() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["customer-orders"],
    queryFn: async () => {
      const res = await axios.get("/api/orders?me=true");
      return res.data;
    },
  });

  if (isLoading) return <p>Loading orders...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>

      {orders.length === 0 && <p>No orders yet.</p>}

      {orders.map((order: any) => (
        <Card key={order.id}>
          <CardContent className="flex justify-between items-center py-4">
            <div>
              <p className="font-medium">Order #{order.id.slice(0, 6)}</p>
              <p className="text-sm text-muted-foreground">
                Status: {order.status}
              </p>
            </div>

            <Link href={`/customer/dashboard/orders/${order.id}`}>
              <Button variant="outline">Track</Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
