import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import type { Transaction } from "../../api/types.ts";

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await api.get<Transaction[]>("/transactions");
      return response.data;
    },
  });
}