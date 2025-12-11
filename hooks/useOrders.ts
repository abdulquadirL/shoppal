"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export interface Order {
  id: string;
  status: string;
  customerId?: string;
  shopperId?: string;
  location: { lat: number; lng: number };
  items?: { id: string; name: string; quantity: number }[];
}

export function useOrder(id: string) {
  return useQuery<Order, Error>({
    queryKey: ["order", id], 
    queryFn: async () => {
    const { data } = await axios.get(`/api/orders/${id}`);
    return data;
  },
  enabled: !!id,
});
}

export function useCreateOrder() {
  const qc = useQueryClient();

  return useMutation<Order, Error, Partial<Order>>({
    mutationFn: async (payload) => {
    const { data } = await axios.post("/api/orders", payload);
    return data;
  }, 
  
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["orders"]
    }),
  });

}

export function useAssignNearest(orderId:string) {
  const qc = useQueryClient();

  return useMutation<Order, Error>({
    mutationFn: async () => {
    const { data } = await axios.post(`/api/orders/${orderId}/assign`);
    return data;
  }, 
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["order", orderId]}),
  },
)
}





export function useOrders(filter?: { customer?: boolean; shopper?: boolean }) {
  return useQuery<Order[], Error>({
    queryKey: ["orders", filter], 
    queryFn: async () => {
    const params = new URLSearchParams();
    if (filter?.customer) params.append("customer", "true");
    if (filter?.shopper) params.append("shopper", "true");

    const { data } = await axios.get(`/api/orders?${params.toString()}`);
    return data
  },
  
});
}