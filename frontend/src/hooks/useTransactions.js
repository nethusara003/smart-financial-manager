import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth, getAuthToken } from "../services/apiClient";
import { queryKeys } from "./queryKeys";

async function fetchTransactions() {
  const token = getAuthToken();

  if (!token) {
    return [];
  }

  const response = await fetchWithAuth("/transactions");

  if (response.status === 401) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch transactions (${response.status})`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export function useTransactions({ enabled = true, refetchInterval = false } = {}) {
  return useQuery({
    queryKey: queryKeys.transactions.list,
    queryFn: fetchTransactions,
    enabled,
    placeholderData: [],
    refetchInterval,
  });
}
