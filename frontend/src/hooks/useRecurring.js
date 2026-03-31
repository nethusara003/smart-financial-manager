import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth, getAuthToken } from "../services/apiClient";
import { queryKeys } from "./queryKeys";

async function parseApiError(response, fallbackMessage) {
  const payload = await response.json().catch(() => null);
  return payload?.message || fallbackMessage;
}

async function fetchRecurringTransactions({ type = "" } = {}) {
  const token = getAuthToken();

  if (!token) {
    return [];
  }

  const params = new URLSearchParams();
  if (type) {
    params.set("type", type);
  }

  const query = params.toString();
  const path = query ? `/recurring?${query}` : "/recurring";
  const response = await fetchWithAuth(path);

  if (response.status === 401) {
    return [];
  }

  if (!response.ok) {
    const message = await parseApiError(response, `Failed to fetch recurring transactions (${response.status})`);
    throw new Error(message);
  }

  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
}

function useInvalidateRecurring() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.recurring.all });
  };
}

export function useRecurringTransactions({ enabled = true, type = "" } = {}) {
  return useQuery({
    queryKey: queryKeys.recurring.list(type || "all"),
    queryFn: () => fetchRecurringTransactions({ type }),
    enabled,
    placeholderData: [],
  });
}

export function useCreateRecurringTransaction() {
  const invalidateRecurring = useInvalidateRecurring();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await fetchWithAuth("/recurring", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to create recurring transaction");
        throw new Error(message);
      }

      return response.json().catch(() => null);
    },
    onSuccess: invalidateRecurring,
  });
}

export function useUpdateRecurringTransaction() {
  const invalidateRecurring = useInvalidateRecurring();

  return useMutation({
    mutationFn: async ({ recurringId, payload }) => {
      const response = await fetchWithAuth(`/recurring/${recurringId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to update recurring transaction");
        throw new Error(message);
      }

      return response.json().catch(() => null);
    },
    onSuccess: invalidateRecurring,
  });
}

export function useDeleteRecurringTransaction() {
  const invalidateRecurring = useInvalidateRecurring();

  return useMutation({
    mutationFn: async (recurringId) => {
      const response = await fetchWithAuth(`/recurring/${recurringId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to delete recurring transaction");
        throw new Error(message);
      }

      return response.json().catch(() => null);
    },
    onSuccess: invalidateRecurring,
  });
}
