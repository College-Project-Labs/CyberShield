import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import type { Transaction } from "../../api/types";

export default function AlertCenter(){
  return useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const response = await api.get<Transaction[]>("/alerts");
      return response.data;
    },
  });
}