"use client";

import { useEffect, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";

interface LiveMapTrackerProps {
  order: {
    id: string;
    location: { lat: number; lng: number };
    shopperId?: string;
    customerId?: string;
  };
}

export function LiveMapTracker({ order }: LiveMapTrackerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();

  useEffect(() => {
    if (!mapRef.current) return;

    const L = (window as any).L; // Leaflet
    const map = L.map(mapRef.current).setView([order.location.lat, order.location.lng], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    const customerMarker = L.marker([order.location.lat, order.location.lng]).addTo(map)
      .bindPopup("Customer");

    let shopperMarker: any = null;

    if (order.shopperId) {
      shopperMarker = L.marker([order.location.lat, order.location.lng], { icon: L.icon({ iconUrl: "/shopper.png", iconSize: [30, 30] }) }).addTo(map)
        .bindPopup("Shopper");
    }

    if (!socket) return;

    socket.emit("join_order", order.id);

    socket.on("shopper_location", ({ lat, lng }: { lat: number; lng: number }) => {
      if (shopperMarker) {
        shopperMarker.setLatLng([lat, lng]);
      } else {
        shopperMarker = L.marker([lat, lng], { icon: L.icon({ iconUrl: "/shopper.png", iconSize: [30, 30] }) }).addTo(map)
          .bindPopup("Shopper");
      }
    });

    return () => {
      map.remove();
      socket.off("shopper_location");
    };
  }, [order, socket]);

  return <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />;
}
