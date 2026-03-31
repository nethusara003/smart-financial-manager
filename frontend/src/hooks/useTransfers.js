import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth, getAuthToken } from "../services/apiClient";
import { queryKeys } from "./queryKeys";

const EMPTY_TRANSFER_LIMITS = {
  singleTransfer: 0,
  daily: 0,
  monthly: 0,
  dailyRemaining: 0,
  monthlyRemaining: 0,
  requirePinAbove: 1000,
};

const EMPTY_TRANSFER_HISTORY = {
  transfers: [],
  stats: {
    totalSent: 0,
    totalReceived: 0,
    transferCount: 0,
  },
  pagination: null,
};

async function parseApiError(response, fallbackMessage) {
  const payload = await response.json().catch(() => null);
  return payload?.message || fallbackMessage;
}

async function fetchTransferLimits() {
  const token = getAuthToken();

  if (!token) {
    return EMPTY_TRANSFER_LIMITS;
  }

  const response = await fetchWithAuth("/transfers/my-limits");

  if (response.status === 401) {
    return EMPTY_TRANSFER_LIMITS;
  }

  if (!response.ok) {
    const message = await parseApiError(response, `Failed to fetch transfer limits (${response.status})`);
    throw new Error(message);
  }

  const payload = await response.json();

  return {
    singleTransfer: Number(payload?.limits?.singleTransfer || 0),
    daily: Number(payload?.limits?.daily || 0),
    monthly: Number(payload?.limits?.monthly || 0),
    dailyRemaining: Number(payload?.remaining?.today || 0),
    monthlyRemaining: Number(payload?.remaining?.thisMonth || 0),
    requirePinAbove: 1000,
  };
}

async function fetchMyTransfers({ type = "all", status = "all" } = {}) {
  const token = getAuthToken();

  if (!token) {
    return EMPTY_TRANSFER_HISTORY;
  }

  const params = new URLSearchParams();
  if (type && type !== "all") {
    params.set("type", type);
  }
  if (status && status !== "all") {
    params.set("status", status);
  }

  const endpoint = params.toString()
    ? `/transfers/my-transfers?${params.toString()}`
    : "/transfers/my-transfers";

  const response = await fetchWithAuth(endpoint);

  if (response.status === 401) {
    return EMPTY_TRANSFER_HISTORY;
  }

  if (!response.ok) {
    const message = await parseApiError(response, `Failed to fetch transfers (${response.status})`);
    throw new Error(message);
  }

  const payload = await response.json();

  return {
    transfers: Array.isArray(payload?.transfers) ? payload.transfers : [],
    stats: payload?.stats || EMPTY_TRANSFER_HISTORY.stats,
    pagination: payload?.pagination || null,
  };
}

function useInvalidateTransfers() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all });
  };
}

export function useTransferLimits({ enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.transfers.limits,
    queryFn: fetchTransferLimits,
    enabled,
    placeholderData: EMPTY_TRANSFER_LIMITS,
  });
}

export function useMyTransfers({ type = "all", status = "all", enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.transfers.history({ type, status }),
    queryFn: () => fetchMyTransfers({ type, status }),
    enabled,
    placeholderData: EMPTY_TRANSFER_HISTORY,
  });
}

export function useInitiateTransfer() {
  const queryClient = useQueryClient();
  const invalidateTransfers = useInvalidateTransfers();

  return useMutation({
    mutationFn: async ({ receiverIdentifier, amount, description, transferPin }) => {
      const response = await fetchWithAuth("/transfers/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverIdentifier,
          amount,
          description,
          transferPin,
        }),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Transfer failed");
        throw new Error(message);
      }

      return response.json();
    },
    onSuccess: () => {
      invalidateTransfers();
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
    },
  });
}
