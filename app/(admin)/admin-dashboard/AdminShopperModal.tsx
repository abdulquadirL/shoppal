"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import { Button } from "@/app/components/ui";
import { Dialog, DialogTrigger } from "@/app/components/ui/dialog";
import { DialogContent } from "@radix-ui/react-dialog";


type Shopper = {
  id: string;
  name: string;
};

export default function AssignShopperModal({ orderId }: { orderId: string }) {
  const [shoppers, setShoppers] = useState<Shopper[]>([]);

  useEffect(() => {
    axios.get("/api/admin/shoppers").then((res) => setShoppers(res.data));
  }, []);

  async function assign(shopperId: string) {
    await axios.post(`/api/orders/${orderId}/assign`, { shopperId });
  }

  return (
    <Dialog>
      <DialogTrigger >
        <Button size="sm" variant="outline">
          Assign
        </Button>
      </DialogTrigger>

      <DialogContent>
        <h3 className="font-medium mb-3">Assign Shopper</h3>

        <div className="space-y-2">
          {shoppers.map((s) => (
            <Button
              key={s.id}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => assign(s.id)}
            >
              {s.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
