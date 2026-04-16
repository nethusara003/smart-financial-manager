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
  otpDefaults: {
    phoneNumber: "",
    email: "",
    preferredChannel: "sms",
    emailOnlyMode: false,
  },
  savedRecipientsCount: 0,
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

const EMPTY_TRANSFER_USER_RESULTS = [];
const EMPTY_TRANSFER_DETAILS = null;
const EMPTY_TRANSFER_CONTACTS = [];
const EMPTY_TRANSFER_FEASIBILITY = {
  canTransfer: false,
  reasons: [],
  risk: { score: 0, level: "low", shouldRequirePin: false },
  impact: null,
  suggestions: [],
  requiresOtp: true,
  otpDeliveryHint: "email",
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
    requirePinAbove: Number(payload?.limits?.requirePinAbove || 1000),
    otpDefaults: payload?.otpDefaults || { phoneNumber: "", email: "", preferredChannel: "sms" },
    savedRecipientsCount: Number(payload?.savedRecipientsCount || 0),
  };
}

async function fetchSavedTransferContacts() {
  const token = getAuthToken();

  if (!token) {
    return EMPTY_TRANSFER_CONTACTS;
  }

  const response = await fetchWithAuth("/transfers/contacts");

  if (response.status === 401) {
    return EMPTY_TRANSFER_CONTACTS;
  }

  if (!response.ok) {
    const message = await parseApiError(response, `Failed to fetch saved contacts (${response.status})`);
    throw new Error(message);
  }

  const payload = await response.json();
  return Array.isArray(payload?.contacts) ? payload.contacts : EMPTY_TRANSFER_CONTACTS;
}

async function fetchTransferFeasibility({ receiverId, amount, description, scheduledFor }) {
  const token = getAuthToken();

  if (!token || !receiverId || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return EMPTY_TRANSFER_FEASIBILITY;
  }

  const response = await fetchWithAuth("/transfers/check-feasibility", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      receiverId,
      amount: Number(amount),
      description,
      scheduledFor: scheduledFor || undefined,
    }),
  });

  if (response.status === 401) {
    return EMPTY_TRANSFER_FEASIBILITY;
  }

  if (!response.ok) {
    const message = await parseApiError(response, `Failed to check transfer feasibility (${response.status})`);
    throw new Error(message);
  }

  const payload = await response.json();

  return {
    canTransfer: Boolean(payload?.canTransfer),
    reasons: Array.isArray(payload?.reasons) ? payload.reasons : [],
    risk: payload?.risk || EMPTY_TRANSFER_FEASIBILITY.risk,
    impact: payload?.impact || null,
    suggestions: Array.isArray(payload?.suggestions) ? payload.suggestions : [],
    requiresOtp: Boolean(payload?.requiresOtp ?? true),
    otpDeliveryHint: payload?.otpDeliveryHint || "email",
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

async function searchTransferUsers(query) {
  const token = getAuthToken();

  if (!token || !query || query.trim().length < 2) {
    return EMPTY_TRANSFER_USER_RESULTS;
  }

  const params = new URLSearchParams();
  params.set("query", query.trim());

  const response = await fetchWithAuth(`/transfers/search-users?${params.toString()}`);

  if (response.status === 401) {
    return EMPTY_TRANSFER_USER_RESULTS;
  }

  if (!response.ok) {
    const message = await parseApiError(response, `Failed to search users (${response.status})`);
    throw new Error(message);
  }

  const payload = await response.json();
  return Array.isArray(payload?.users) ? payload.users : EMPTY_TRANSFER_USER_RESULTS;
}

async function fetchTransferDetails(transferId) {
  const token = getAuthToken();

  if (!token || !transferId) {
    return EMPTY_TRANSFER_DETAILS;
  }

  const response = await fetchWithAuth(`/transfers/${transferId}`);

  if (response.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const message = await parseApiError(response, `Failed to fetch transfer details (${response.status})`);
    throw new Error(message);
  }

  const payload = await response.json();
  return payload?.transfer || EMPTY_TRANSFER_DETAILS;
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

export function useTransferDetails(transferId, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.transfers.detail(transferId),
    queryFn: () => fetchTransferDetails(transferId),
    enabled: enabled && Boolean(transferId),
    placeholderData: EMPTY_TRANSFER_DETAILS,
  });
}

export function useTransferUserSearch(query, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.transfers.userSearch(query || ""),
    queryFn: () => searchTransferUsers(query),
    enabled: enabled && Boolean(query) && query.trim().length >= 2,
    placeholderData: EMPTY_TRANSFER_USER_RESULTS,
  });
}

export function useSavedTransferContacts({ enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.transfers.contacts,
    queryFn: fetchSavedTransferContacts,
    enabled,
    placeholderData: EMPTY_TRANSFER_CONTACTS,
  });
}

export function useTransferFeasibility(
  { receiverId, amount, description, scheduledFor },
  { enabled = true } = {}
) {
  return useQuery({
    queryKey: queryKeys.transfers.feasibility({
      receiverId,
      amount: Number(amount || 0),
      scheduledFor: scheduledFor || "",
    }),
    queryFn: () => fetchTransferFeasibility({ receiverId, amount, description, scheduledFor }),
    enabled: enabled && Boolean(receiverId) && Number(amount) > 0,
    placeholderData: EMPTY_TRANSFER_FEASIBILITY,
  });
}

export function useInitiateTransfer() {
  const queryClient = useQueryClient();
  const invalidateTransfers = useInvalidateTransfers();

  return useMutation({
    mutationFn: async ({ receiverIdentifier, amount, description, otpSessionId, otpCode, saveRecipient, scheduledFor }) => {
      const response = await fetchWithAuth("/transfers/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverIdentifier,
          amount,
          description,
          otpSessionId,
          otpCode,
          saveRecipient: Boolean(saveRecipient),
          scheduledFor: scheduledFor || undefined,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.transfers.contacts });
    },
  });
}

export function useSendTransferOtp() {
  return useMutation({
    mutationFn: async ({ phoneNumber, savePhone, fallbackEmail }) => {
      const response = await fetchWithAuth("/transfers/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          savePhone: Boolean(savePhone),
          fallbackEmail,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message = payload?.message || "Failed to send verification code";
        const error = new Error(message);
        if (payload?.requiresEmailInput) {
          error.requiresEmailInput = true;
        }
        if (payload?.fallbackReason?.code) {
          error.fallbackReasonCode = payload.fallbackReason.code;
        }
        if (payload?.fallbackReason?.message) {
          error.fallbackReasonMessage = payload.fallbackReason.message;
        }
        throw error;
      }

      return payload || {};
    },
  });
}

export function useCancelTransfer() {
  const queryClient = useQueryClient();
  const invalidateTransfers = useInvalidateTransfers();

  return useMutation({
    mutationFn: async ({ transferId, reason }) => {
      const response = await fetchWithAuth(`/transfers/${transferId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to cancel transfer");
        throw new Error(message);
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      invalidateTransfers();
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      if (variables?.transferId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.transfers.detail(variables.transferId) });
      }
    },
  });
}

export function useReverseTransfer() {
  const queryClient = useQueryClient();
  const invalidateTransfers = useInvalidateTransfers();

  return useMutation({
    mutationFn: async ({ transferId, reason, transferPin }) => {
      const response = await fetchWithAuth(`/transfers/${transferId}/reverse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason, transferPin }),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to reverse transfer");
        throw new Error(message);
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      invalidateTransfers();
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      if (variables?.transferId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.transfers.detail(variables.transferId) });
      }
    },
  });
}
