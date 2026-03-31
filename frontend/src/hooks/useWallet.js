import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth, getAuthToken } from "../services/apiClient";
import { queryKeys } from "./queryKeys";

const DEFAULT_WALLET_BALANCE = {
  balance: 0,
  availableBalance: 0,
  pendingBalance: 0,
  currency: "LKR",
  status: "active",
  lastUpdated: null,
};

async function fetchWalletBalance() {
  const token = getAuthToken();

  if (!token) {
    return DEFAULT_WALLET_BALANCE;
  }

  const response = await fetchWithAuth("/wallet/balance");

  if (response.status === 401) {
    return DEFAULT_WALLET_BALANCE;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch wallet balance (${response.status})`);
  }

  const payload = await response.json();

  if (!payload?.success || !payload.wallet) {
    return DEFAULT_WALLET_BALANCE;
  }

  return {
    balance: Number(payload.wallet.balance || 0),
    availableBalance: Number(payload.wallet.availableBalance || 0),
    pendingBalance: Number(payload.wallet.pendingBalance || 0),
    currency: payload.wallet.currency || "LKR",
    status: payload.wallet.status || "active",
    lastUpdated: payload.wallet.lastUpdated || null,
  };
}

async function parseApiError(response, fallbackMessage) {
  const payload = await response.json().catch(() => null);
  return payload?.message || fallbackMessage;
}

async function fetchWalletTransactions({ limit = 10, page = 1, type = "" } = {}) {
  const token = getAuthToken();

  if (!token) {
    return [];
  }

  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("page", String(page));
  if (type) {
    params.set("type", type);
  }

  const response = await fetchWithAuth(`/wallet/transactions?${params.toString()}`);

  if (response.status === 401) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch wallet transactions (${response.status})`);
  }

  const payload = await response.json();
  return Array.isArray(payload?.transactions) ? payload.transactions : [];
}

function useInvalidateWallet() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
  };
}

export function useWalletBalance({ enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.wallet.balance,
    queryFn: fetchWalletBalance,
    enabled,
    placeholderData: DEFAULT_WALLET_BALANCE,
  });
}

export function useWalletTransactions({ limit = 10, page = 1, type = "", enabled = true } = {}) {
  const scope = `${limit}-${page}-${type || "all"}`;

  return useQuery({
    queryKey: queryKeys.wallet.transactions(scope),
    queryFn: () => fetchWalletTransactions({ limit, page, type }),
    enabled,
    placeholderData: [],
  });
}

export function useInitializeWallet() {
  const invalidateWallet = useInvalidateWallet();

  return useMutation({
    mutationFn: async () => {
      const response = await fetchWithAuth("/wallet/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to initialize wallet");
        throw new Error(message);
      }

      return response.json().catch(() => null);
    },
    onSuccess: invalidateWallet,
  });
}

export function useAddFunds() {
  const invalidateWallet = useInvalidateWallet();

  return useMutation({
    mutationFn: async ({ amount, paymentMethod, cardLast4 }) => {
      const response = await fetchWithAuth("/wallet/add-funds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount, paymentMethod, cardLast4 }),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to add funds");
        throw new Error(message);
      }

      return response.json();
    },
    onSuccess: invalidateWallet,
  });
}

export function useWithdrawFunds() {
  const invalidateWallet = useInvalidateWallet();

  return useMutation({
    mutationFn: async ({ amount, bankAccount }) => {
      const response = await fetchWithAuth("/wallet/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount, bankAccount }),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to withdraw funds");
        throw new Error(message);
      }

      return response.json();
    },
    onSuccess: invalidateWallet,
  });
}
