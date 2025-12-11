"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useStores() {
  return useQuery(["stores"], async () => (await axios.get("/api/stores")).data);
}
