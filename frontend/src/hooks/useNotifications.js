import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth, getAuthToken } from "../services/apiClient";
import { queryKeys } from "./queryKeys";

const EMPTY_NOTIFICATIONS = {
  notifications: [],
  unreadCount: 0,
};

async function fetchNotifications({ unreadOnly = false } = {}) {
  const token = getAuthToken();

  if (!token) {
    return EMPTY_NOTIFICATIONS;
  }

  const endpoint = unreadOnly ? "/notifications?unreadOnly=true" : "/notifications";
  const response = await fetchWithAuth(endpoint);

  if (response.status === 401) {
    return EMPTY_NOTIFICATIONS;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch notifications (${response.status})`);
  }

  const data = await response.json();

  return {
    notifications: data.notifications || [],
    unreadCount: data.unreadCount || 0,
  };
}

function useInvalidateNotifications() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  };
}

export function useNotifications({ unreadOnly = false, enabled = true, refetchInterval = false } = {}) {
  return useQuery({
    queryKey: queryKeys.notifications.list(unreadOnly ? "unread" : "all"),
    queryFn: () => fetchNotifications({ unreadOnly }),
    enabled,
    placeholderData: EMPTY_NOTIFICATIONS,
    refetchInterval,
  });
}

export function useUnreadNotificationCount({ enabled = true, refetchInterval = false } = {}) {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: async () => {
      const data = await fetchNotifications({ unreadOnly: true });
      return data.unreadCount;
    },
    enabled,
    placeholderData: 0,
    refetchInterval,
  });
}

export function useMarkNotificationAsRead() {
  const invalidateNotifications = useInvalidateNotifications();

  return useMutation({
    mutationFn: async (notificationId) => {
      const response = await fetchWithAuth(`/notifications/${notificationId}/read`, {
        method: "PATCH",
      });

      if (response.status === 401) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read (${response.status})`);
      }

      return response.json().catch(() => null);
    },
    onSuccess: invalidateNotifications,
  });
}

export function useMarkAllNotificationsAsRead() {
  const invalidateNotifications = useInvalidateNotifications();

  return useMutation({
    mutationFn: async () => {
      const response = await fetchWithAuth("/notifications/read-all", {
        method: "PATCH",
      });

      if (response.status === 401) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to mark all notifications as read (${response.status})`);
      }

      return response.json().catch(() => null);
    },
    onSuccess: invalidateNotifications,
  });
}

export function useDeleteNotification() {
  const invalidateNotifications = useInvalidateNotifications();

  return useMutation({
    mutationFn: async (notificationId) => {
      const response = await fetchWithAuth(`/notifications/${notificationId}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to delete notification (${response.status})`);
      }

      return response.json().catch(() => null);
    },
    onSuccess: invalidateNotifications,
  });
}

export function useClearReadNotifications() {
  const invalidateNotifications = useInvalidateNotifications();

  return useMutation({
    mutationFn: async () => {
      const response = await fetchWithAuth("/notifications", {
        method: "DELETE",
      });

      if (response.status === 401) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to clear notifications (${response.status})`);
      }

      return response.json().catch(() => null);
    },
    onSuccess: invalidateNotifications,
  });
}
