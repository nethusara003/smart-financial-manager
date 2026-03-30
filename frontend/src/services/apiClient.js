const DEFAULT_API_BASE_URL = "http://localhost:5000/api";

const envApiUrl = import.meta.env.VITE_API_URL;

export const API_BASE_URL = (envApiUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, "");

export function apiUrl(path = "") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function getAuthToken() {
  const token = localStorage.getItem("token");
  if (!token || token === "null" || token === "undefined") {
    return null;
  }

  return token;
}

export function getAuthHeaders(extraHeaders = {}) {
  const token = getAuthToken();

  if (!token) {
    return { ...extraHeaders };
  }

  return {
    ...extraHeaders,
    Authorization: `Bearer ${token}`,
  };
}

export function fetchWithAuth(path, options = {}) {
  const { headers = {}, ...rest } = options;

  return fetch(apiUrl(path), {
    ...rest,
    headers: getAuthHeaders(headers),
  });
}
