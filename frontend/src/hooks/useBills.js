import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth, getAuthToken } from "../services/apiClient";
import { queryKeys } from "./queryKeys";

async function parseApiError(response, fallbackMessage) {
  const payload = await response.json().catch(() => null);
  return payload?.message || fallbackMessage;
}

async function fetchBills() {
  const token = getAuthToken();

  if (!token) {
    return [];
  }

  const response = await fetchWithAuth("/bills");

  if (response.status === 401) {
    return [];
  }

  if (!response.ok) {
    const message = await parseApiError(response, `Failed to fetch bills (${response.status})`);
    throw new Error(message);
  }

  const payload = await response.json();
  return Array.isArray(payload?.bills) ? payload.bills : [];
}

function useInvalidateBills() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.bills.all });
  };
}

export function useBills({ enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.bills.list,
    queryFn: fetchBills,
    enabled,
    placeholderData: [],
  });
}

export function useCreateBill() {
  const invalidateBills = useInvalidateBills();

  return useMutation({
    mutationFn: async (billData) => {
      const response = await fetchWithAuth("/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(billData),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to create bill");
        throw new Error(message);
      }

      return response.json().catch(() => null);
    },
    onSuccess: invalidateBills,
  });
}

export function useUpdateBill() {
  const invalidateBills = useInvalidateBills();

  return useMutation({
    mutationFn: async ({ billId, billData }) => {
      const response = await fetchWithAuth(`/bills/${billId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(billData),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to update bill");
        throw new Error(message);
      }

      return response.json().catch(() => null);
    },
    onSuccess: invalidateBills,
  });
}

export function useDeleteBill() {
  const invalidateBills = useInvalidateBills();

  return useMutation({
    mutationFn: async (billId) => {
      const response = await fetchWithAuth(`/bills/${billId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to delete bill");
        throw new Error(message);
      }

      return response.json().catch(() => null);
    },
    onSuccess: invalidateBills,
  });
}

export function useMarkBillPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ billId, createTransaction = true }) => {
      const response = await fetchWithAuth(`/bills/${billId}/mark-paid`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ createTransaction }),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to mark bill as paid");
        throw new Error(message);
      }

      return response.json().catch(() => null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
    },
  });
}
