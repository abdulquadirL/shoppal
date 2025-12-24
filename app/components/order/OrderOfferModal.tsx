"use client";

import { useEffect, useState } from "react";
import { acceptOrder, rejectOrder } from "@/lib/orderAction";
import { OrderOffer } from "@/hooks/useOrderOffer";
import { Button } from "../ui";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";

interface Props {
  offer: OrderOffer;
  onClose: () => void;
}

export default function OrderOfferModal({ offer, onClose }: Props) {
  const [timeLeft, setTimeLeft] = useState(offer.expiresIn);
  const [loading, setLoading] = useState(false);

  // countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // auto reject
  useEffect(() => {
    if (timeLeft <= 0) {
      rejectOrder(offer.orderId).finally(onClose);
    }
  }, [timeLeft, offer.orderId, onClose]);

  const handleAccept = async () => {
    setLoading(true);
    await acceptOrder(offer.orderId);
    onClose();
  };

  const handleReject = async () => {
    setLoading(true);
    await rejectOrder(offer.orderId);
    onClose();
  };

  return (
    <Dialog open>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <h2 className="text-lg font-semibold">New Order Available</h2>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You have <span className="font-bold">{timeLeft}s</span> to respond
          </p>

          <div className="flex gap-3">
            <Button
              className="flex-1"
              onClick={handleAccept}
              disabled={loading}
            >
              Accept
            </Button>

            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleReject}
              disabled={loading}
            >
              Reject
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
