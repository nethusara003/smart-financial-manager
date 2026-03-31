import { useMutation } from "@tanstack/react-query";
import { fetchWithAuth } from "../services/apiClient";

async function parseApiError(response, fallbackMessage) {
  const payload = await response.json().catch(() => null);
  return payload?.message || fallbackMessage;
}

export function useGenerateSampleData() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetchWithAuth("/sample-data/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to generate sample data");
        throw new Error(message);
      }

      return response.json();
    },
  });
}

export function useGenerateSmartBudget() {
  return useMutation({
    mutationFn: async ({ category, lookbackMonths = 1 }) => {
      const response = await fetchWithAuth("/budgets/smart-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category, lookbackMonths }),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to analyze spending");
        throw new Error(message);
      }

      return response.json();
    },
  });
}

export function useGenerateBudgetsFromIncome() {
  return useMutation({
    mutationFn: async ({ monthlyIncome, maxLookbackMonths = 3 }) => {
      const response = await fetchWithAuth("/budgets/generate-from-income", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ monthlyIncome, maxLookbackMonths }),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to generate budgets");
        throw new Error(message);
      }

      return response.json();
    },
  });
}

export function useCreateBudget() {
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
        const message = await parseApiError(response, "Failed to save budgets");
        throw new Error(message);
      }

      return response.json();
    },
  });
}
