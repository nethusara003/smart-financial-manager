import { clearAuthStorage, getStoredToken } from "../utils/authStorage";

const DEFAULT_API_BASE_URL = "/api";

const envApiUrl = import.meta.env.VITE_API_URL;

export const API_BASE_URL = (envApiUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, "");

let unauthorizedHandled = false;

export function resetUnauthorizedHandling() {
  unauthorizedHandled = false;
}

function handleUnauthorizedResponse() {
  if (typeof window === "undefined") {
    return;
  }

  clearAuthStorage();

  if (unauthorizedHandled) {
    return;
  }

  unauthorizedHandled = true;

  try {
    window.dispatchEvent(new CustomEvent("auth:session-expired"));
  } catch {
    // Ignore event dispatch failures and continue with redirect.
  }

  if (window.location.pathname !== "/login") {
    window.location.replace("/login?reason=session-expired");
  }
}

export function apiUrl(path = "") {
  if (!path) {
    return API_BASE_URL;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function getAuthToken() {
  const token = getStoredToken();
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

export async function parseResponseBody(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  const text = await response.text().catch(() => "");
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function extractErrorMessage(payload, fallbackMessage) {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message;
    }

    if (typeof payload.error === "string" && payload.error.trim()) {
      return payload.error;
    }
  }

  return fallbackMessage;
}

function normalizeRequestBody(body, headers) {
  if (body === undefined || body === null) {
    return { body: undefined, headers };
  }

  if (
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    typeof body === "string"
  ) {
    return { body, headers };
  }

  return {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };
}

function buildRequestOptions(options = {}) {
  const { auth = true, headers = {}, body, ...rest } = options;
  const mergedHeaders = auth ? getAuthHeaders(headers) : { ...headers };
  const { body: normalizedBody, headers: normalizedHeaders } = normalizeRequestBody(body, mergedHeaders);

  return {
    ...rest,
    headers: normalizedHeaders,
    body: normalizedBody,
  };
}

export async function request(path, options = {}) {
  const { fallbackMessage = "Request failed" } = options;
  const response = await fetch(apiUrl(path), buildRequestOptions(options));
  const payload = await parseResponseBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorizedResponse();
    }

    const error = new Error(extractErrorMessage(payload, fallbackMessage));
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export async function fetchWithAuth(path, options = {}) {
  const response = await fetch(apiUrl(path), buildRequestOptions({ ...options, auth: true }));

  if (response.status === 401) {
    handleUnauthorizedResponse();
  }

  return response;
}
