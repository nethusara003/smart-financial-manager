import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth, getAuthToken } from "../services/apiClient";
import { queryKeys } from "./queryKeys";

const EMPTY_FEEDBACK_RESULT = {
  feedbacks: [],
  stats: null,
};

async function parseApiError(response, fallbackMessage) {
  const payload = await response.json().catch(() => null);
  return payload?.message || fallbackMessage;
}

async function fetchFeedbackList({ type = "all", sort = "recent" } = {}) {
  const token = getAuthToken();

  if (!token) {
    return EMPTY_FEEDBACK_RESULT;
  }

  const params = new URLSearchParams();
  params.set("type", type);
  params.set("sort", sort);

  const response = await fetchWithAuth(`/feedback?${params.toString()}`);

  if (response.status === 401) {
    return EMPTY_FEEDBACK_RESULT;
  }

  if (!response.ok) {
    const message = await parseApiError(response, `Failed to fetch feedback (${response.status})`);
    throw new Error(message);
  }

  const payload = await response.json();

  return {
    feedbacks: Array.isArray(payload?.feedbacks) ? payload.feedbacks : [],
    stats: payload?.stats || null,
  };
}

export function useFeedbackList({ type = "all", sort = "recent", enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.feedback.list({ type, sort }),
    queryFn: () => fetchFeedbackList({ type, sort }),
    enabled,
    placeholderData: EMPTY_FEEDBACK_RESULT,
  });
}

function useInvalidateFeedback() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.feedback.all });
  };
}

export function useCreateFeedback() {
  const invalidateFeedback = useInvalidateFeedback();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await fetchWithAuth("/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to submit feedback");
        throw new Error(message);
      }

      return response.json();
    },
    onSuccess: invalidateFeedback,
  });
}

export function useUpdateFeedback() {
  const invalidateFeedback = useInvalidateFeedback();

  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const response = await fetchWithAuth(`/feedback/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to update feedback");
        throw new Error(message);
      }

      return response.json();
    },
    onSuccess: invalidateFeedback,
  });
}

export function useDeleteFeedback() {
  const invalidateFeedback = useInvalidateFeedback();

  return useMutation({
    mutationFn: async (id) => {
      const response = await fetchWithAuth(`/feedback/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to delete feedback");
        throw new Error(message);
      }

      return response.json();
    },
    onSuccess: invalidateFeedback,
  });
}

export function useMarkFeedbackHelpful() {
  const invalidateFeedback = useInvalidateFeedback();

  return useMutation({
    mutationFn: async (id) => {
      const response = await fetchWithAuth(`/feedback/${id}/helpful`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to update helpful vote");
        throw new Error(message);
      }

      return response.json();
    },
    onSuccess: invalidateFeedback,
  });
}
