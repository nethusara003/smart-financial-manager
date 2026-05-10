import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth, getAuthToken } from "../services/apiClient";
import { getStoredAuthSnapshot } from "../utils/authStorage";
import { queryKeys } from "./queryKeys";

const EMPTY_INSIGHT_RESPONSE = {
  success: false,
  message: "No data available",
};

async function requestInsights(endpoint, fallbackMessage) {
  const token = getAuthToken();

  // If there is no token, or the token belongs to a guest session,
  // return a friendly empty response instead of calling protected APIs.
  if (!token) {
    return {
      ...EMPTY_INSIGHT_RESPONSE,
      message: "Authentication required",
    };
  }

  const { isGuest } = getStoredAuthSnapshot();
  if (isGuest) {
    return {
      ...EMPTY_INSIGHT_RESPONSE,
      message: "Guest sessions do not have persisted insight data",
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
    // Forecast data is expensive to compute — cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useFinancialHealthScore(months = 1, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.insights.financialHealth(months),
    queryFn: () => requestInsights(`/financial-health/score?months=${months}`, "Failed to fetch health score"),
    enabled,
    placeholderData: EMPTY_INSIGHT_RESPONSE,
    // Health score is expensive to compute — cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useBudgetRecommendations(months = 1, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.insights.budgetRecommendations(months),
    queryFn: () => requestInsights(`/recommendations/budget?months=${months}`, "Failed to fetch recommendations"),
    enabled,
    placeholderData: EMPTY_INSIGHT_RESPONSE,
    // Recommendations are moderately expensive — cache for 3 minutes
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
