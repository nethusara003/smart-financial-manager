import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth, getAuthToken } from "../services/apiClient";
import { queryKeys } from "./queryKeys";

const EMPTY_INSIGHT_RESPONSE = {
  success: false,
  message: "No data available",
};

async function requestInsights(endpoint, fallbackMessage) {
  const token = getAuthToken();

  if (!token) {
    return {
      ...EMPTY_INSIGHT_RESPONSE,
      message: "Authentication required",
    };
  }

  const response = await fetchWithAuth(endpoint);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    // Some insight endpoints return a structured success=false payload with non-2xx codes.
    if (payload?.success === false) {
      return payload;
    }

    throw new Error(payload?.message || `${fallbackMessage} (${response.status})`);
  }

  return payload || EMPTY_INSIGHT_RESPONSE;
}

export function useExpenseForecast(months = 3, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.insights.expenseForecast(months),
    queryFn: () => requestInsights(`/forecasting/expenses?months=${months}`, "Failed to generate forecast"),
    enabled,
    placeholderData: EMPTY_INSIGHT_RESPONSE,
  });
}

export function useFinancialHealthScore(months = 1, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.insights.financialHealth(months),
    queryFn: () => requestInsights(`/financial-health/score?months=${months}`, "Failed to fetch health score"),
    enabled,
    placeholderData: EMPTY_INSIGHT_RESPONSE,
  });
}

export function useBudgetRecommendations(months = 1, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.insights.budgetRecommendations(months),
    queryFn: () => requestInsights(`/recommendations/budget?months=${months}`, "Failed to fetch recommendations"),
    enabled,
    placeholderData: EMPTY_INSIGHT_RESPONSE,
  });
}
