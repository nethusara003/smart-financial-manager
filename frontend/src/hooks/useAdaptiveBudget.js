import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth, getAuthToken } from "../services/apiClient";
import { queryKeys } from "./queryKeys";

const EMPTY_BUDGET_PROFILE = {
  currency: "LKR",
  monthlySalary: null,
  savingsPercentage: 20,
};

async function parseApiError(response, fallbackMessage) {
  const payload = await response.json().catch(() => null);
  return payload?.message || fallbackMessage;
}

async function fetchBudgetProfile() {
  const token = getAuthToken();

  if (!token) {
    return EMPTY_BUDGET_PROFILE;
  }

  const response = await fetchWithAuth("/users/profile");

  if (response.status === 401) {
    return EMPTY_BUDGET_PROFILE;
  }

  if (!response.ok) {
    const message = await parseApiError(response, `Failed to load budget settings (${response.status})`);
    throw new Error(message);
  }

  const payload = await response.json();
  const user = payload?.user || {};

  return {
    currency: user.currency || "LKR",
    monthlySalary: user.monthlySalary,
    savingsPercentage: user.savingsPercentage ?? 20,
  };
}

async function fetchAdaptiveBudgetStatus() {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  const response = await fetchWithAuth("/budgets/status");

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    const message = await parseApiError(response, `Failed to load adaptive budget status (${response.status})`);
    throw new Error(message);
  }

  return response.json();
}

async function fetchAdaptiveBudgetAnalysis() {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  const response = await fetchWithAuth("/budgets/analysis");

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    const message = await parseApiError(response, `Failed to load adaptive budget analysis (${response.status})`);
    throw new Error(message);
  }

  return response.json();
}

export function useAdaptiveBudgetSettings({ enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.settings.budgetProfile,
    queryFn: fetchBudgetProfile,
    enabled,
    placeholderData: EMPTY_BUDGET_PROFILE,
  });
}

export function useAdaptiveBudgetStatus({ enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.budgets.status,
    queryFn: fetchAdaptiveBudgetStatus,
    enabled,
  });
}

export function useAdaptiveBudgetAnalysis({ enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.budgets.analysis,
    queryFn: fetchAdaptiveBudgetAnalysis,
    enabled,
  });
}

export function useUpdateAdaptiveBudgetSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ monthlySalary, savingsPercentage, currency }) => {
      const response = await fetchWithAuth("/users/budget-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ monthlySalary, savingsPercentage, currency }),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to update budget settings");
        throw new Error(message);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.budgetProfile });
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.profile });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.status });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.analysis });
    },
  });
}
