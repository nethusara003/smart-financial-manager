import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth, getAuthToken } from "../services/apiClient";
import { queryKeys } from "./queryKeys";

function sortTransactionsByDate(transactions) {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    if (dateB !== dateA) {
      return dateB - dateA;
    }

    const createdA = new Date(a.createdAt || a.date).getTime();
    const createdB = new Date(b.createdAt || b.date).getTime();
    return createdB - createdA;
  });
}

async function parseApiError(response, fallbackMessage) {
  const payload = await response.json().catch(() => null);
  return payload?.message || fallbackMessage;
}

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
  const transactions = Array.isArray(data) ? data : [];
  return sortTransactionsByDate(transactions);
}

function useInvalidateTransactions() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
  };
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

export function useCreateTransaction() {
  const invalidateTransactions = useInvalidateTransactions();

  return useMutation({
    mutationFn: async (transactionData) => {
      const response = await fetchWithAuth("/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to add transaction");
        throw new Error(message);
      }

      return response.json().catch(() => null);
    },
    onSuccess: invalidateTransactions,
  });
}

export function useUpdateTransaction() {
  const invalidateTransactions = useInvalidateTransactions();

  return useMutation({
    mutationFn: async ({ transactionId, transactionData }) => {
      const response = await fetchWithAuth(`/transactions/${transactionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to update transaction");
        throw new Error(message);
      }

      return response.json().catch(() => null);
    },
    onSuccess: invalidateTransactions,
  });
}

export function useDeleteTransaction() {
  const invalidateTransactions = useInvalidateTransactions();

  return useMutation({
    mutationFn: async (transactionId) => {
      const response = await fetchWithAuth(`/transactions/${transactionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to delete transaction");
        throw new Error(message);
      }

      return response.json().catch(() => null);
    },
    onSuccess: invalidateTransactions,
  });
}
