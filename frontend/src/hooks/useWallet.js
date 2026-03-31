import { useQuery } from "@tanstack/react-query";
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

export function useWalletBalance({ enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.wallet.balance,
    queryFn: fetchWalletBalance,
    enabled,
    placeholderData: DEFAULT_WALLET_BALANCE,
  });
}
