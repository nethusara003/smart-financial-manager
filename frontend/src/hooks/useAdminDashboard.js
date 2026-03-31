import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth, getAuthToken } from "../services/apiClient";
import { queryKeys } from "./queryKeys";

async function parseApiError(response, fallbackMessage) {
  const payload = await response.json().catch(() => null);
  return payload?.message || fallbackMessage;
}

async function fetchAdminUsers() {
  const token = getAuthToken();

  if (!token) {
    return [];
  }

  const response = await fetchWithAuth("/admin/users");

  if (response.status === 401) {
    return [];
  }

  if (!response.ok) {
    const message = await parseApiError(response, `Failed to load users (${response.status})`);
    throw new Error(message);
  }

  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
}

async function fetchAdminAnalyticsOverview() {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  const response = await fetchWithAuth("/admin/analytics/overview");

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    const message = await parseApiError(response, `Failed to load admin analytics (${response.status})`);
    throw new Error(message);
  }

  return response.json();
}

async function fetchAdminAuditLogs() {
  const token = getAuthToken();

  if (!token) {
    return [];
  }

  const response = await fetchWithAuth("/admin/audit-logs");

  if (response.status === 401) {
    return [];
  }

  if (!response.ok) {
    const message = await parseApiError(response, `Failed to load audit logs (${response.status})`);
    throw new Error(message);
  }

  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
}

async function fetchAdminUserTransactions(userId) {
  if (!userId) {
    return [];
  }

  const token = getAuthToken();

  if (!token) {
    return [];
  }

  const response = await fetchWithAuth(`/admin/users/${userId}/transactions`);

  if (response.status === 401) {
    return [];
  }

  if (!response.ok) {
    const message = await parseApiError(response, `Failed to load transactions (${response.status})`);
    throw new Error(message);
  }

  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
}

function useInvalidateAdminQueries() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
  };
}

export function useAdminUsers({ enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: fetchAdminUsers,
    enabled,
    placeholderData: [],
  });
}

export function useAdminAnalyticsOverview({ enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.admin.analyticsOverview,
    queryFn: fetchAdminAnalyticsOverview,
    enabled,
    placeholderData: null,
  });
}

export function useAdminAuditLogs({ enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.admin.auditLogs,
    queryFn: fetchAdminAuditLogs,
    enabled,
    placeholderData: [],
  });
}

export function useAdminUserTransactions(userId, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.admin.userTransactions(userId),
    queryFn: () => fetchAdminUserTransactions(userId),
    enabled: enabled && Boolean(userId),
    placeholderData: [],
  });
}

export function usePromoteUser() {
  const invalidateAdminQueries = useInvalidateAdminQueries();

  return useMutation({
    mutationFn: async (userId) => {
      const response = await fetchWithAuth(`/admin/promote/${userId}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to update user role");
        throw new Error(message);
      }

      return response.json().catch(() => null);
    },
    onSuccess: invalidateAdminQueries,
  });
}

export function useDemoteUser() {
  const invalidateAdminQueries = useInvalidateAdminQueries();

  return useMutation({
    mutationFn: async (userId) => {
      const response = await fetchWithAuth(`/admin/demote/${userId}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to update user role");
        throw new Error(message);
      }

      return response.json().catch(() => null);
    },
    onSuccess: invalidateAdminQueries,
  });
}
