import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth, getAuthToken } from "../services/apiClient";
import { queryKeys } from "./queryKeys";

async function parseApiError(response, fallbackMessage) {
  const payload = await response.json().catch(() => null);
  return payload?.message || fallbackMessage;
}

async function fetchBudgetsWithSpending() {
  const token = getAuthToken();

  if (!token) {
    return [];
  }

  const response = await fetchWithAuth("/budgets/with-spending");

  if (response.status === 401) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch budgets (${response.status})`);
  }

  const data = await response.json();
  return Array.isArray(data?.budgets) ? data.budgets : [];
}

function useInvalidateBudgets() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
  };
}

export function useBudgetsWithSpending({ enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.budgets.withSpending,
    queryFn: fetchBudgetsWithSpending,
    enabled,
    placeholderData: [],
  });
}

export function useCreateBudget() {
  const invalidateBudgets = useInvalidateBudgets();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await fetchWithAuth("/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to save budget");
        throw new Error(message);
      }

      return response.json().catch(() => null);
    },
    onSuccess: invalidateBudgets,
  });
}

export function useUpdateBudget() {
  const invalidateBudgets = useInvalidateBudgets();

  return useMutation({
    mutationFn: async ({ budgetId, payload }) => {
      const response = await fetchWithAuth(`/budgets/${budgetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to update budget");
        throw new Error(message);
      }

      return response.json().catch(() => null);
    },
    onSuccess: invalidateBudgets,
  });
}

export function useDeleteBudget() {
  const invalidateBudgets = useInvalidateBudgets();

  return useMutation({
    mutationFn: async (budgetId) => {
      const response = await fetchWithAuth(`/budgets/${budgetId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to delete budget");
        throw new Error(message);
      }

      return response.json().catch(() => null);
    },
    onSuccess: invalidateBudgets,
  });
}
