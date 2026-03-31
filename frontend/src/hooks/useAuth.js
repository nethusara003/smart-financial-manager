import { useMutation } from "@tanstack/react-query";
import { apiUrl, fetchWithAuth, getAuthToken } from "../services/apiClient";

async function parseApiError(response, fallbackMessage) {
  const payload = await response.json().catch(() => null);
  return payload?.message || fallbackMessage;
}

export function useLogin() {
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const response = await fetch(apiUrl("/users/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Login failed");
        throw new Error(message);
      }

      return response.json();
    },
  });
}

export function useGuestLogin() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(apiUrl("/users/guest-login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to create guest session");
        throw new Error(message);
      }

      return response.json();
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async ({ name, email, password }) => {
      const response = await fetch(apiUrl("/users/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Registration failed");
        throw new Error(message);
      }

      return response.json();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async ({ email }) => {
      const response = await fetch(apiUrl("/users/forgot-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Failed to send reset link");
        throw new Error(message);
      }

      return response.json();
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ token, newPassword }) => {
      const response = await fetch(apiUrl("/users/reset-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Password reset failed");
        throw new Error(message);
      }

      return response.json();
    },
  });
}

export async function fetchCurrentUserProfile() {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  const response = await fetchWithAuth("/users/profile");

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to load user profile");
    throw new Error(message);
  }

  const payload = await response.json();
  return payload?.user || null;
}
