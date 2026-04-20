const AUTH_TOKEN_KEY = "token";
const AUTH_USER_KEY = "user";
const AUTH_GUEST_KEY = "guest";
const AUTH_KEYS = [AUTH_TOKEN_KEY, AUTH_USER_KEY, AUTH_GUEST_KEY];

function normalizeStoredValue(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (value === "null" || value === "undefined" || value === "") {
    return null;
  }

  return value;
}

function readItem(storage, key) {
  return normalizeStoredValue(storage.getItem(key));
}

function hasToken(storage) {
  return Boolean(readItem(storage, AUTH_TOKEN_KEY));
}

function parseStoredUser(rawUser) {
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

function readAuthSnapshotFrom(storage) {
  const token = readItem(storage, AUTH_TOKEN_KEY);
  const user = parseStoredUser(readItem(storage, AUTH_USER_KEY));
  const isGuest = readItem(storage, AUTH_GUEST_KEY) === "true";

  return {
    token,
    user,
    isGuest,
  };
}

function serializeUser(user) {
  if (!user) {
    return null;
  }

  if (typeof user === "string") {
    return user;
  }

  try {
    return JSON.stringify(user);
  } catch {
    return null;
  }
}

function removeAuthKeyEverywhere(key) {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

export function clearAuthStorage() {
  AUTH_KEYS.forEach(removeAuthKeyEverywhere);
}

export function getStoredToken() {
  return readItem(sessionStorage, AUTH_TOKEN_KEY) || readItem(localStorage, AUTH_TOKEN_KEY);
}

export function getStoredAuthSnapshot() {
  const sessionAuth = readAuthSnapshotFrom(sessionStorage);
  if (sessionAuth.token && sessionAuth.user) {
    return sessionAuth;
  }

  const localAuth = readAuthSnapshotFrom(localStorage);
  if (localAuth.token && localAuth.user) {
    return localAuth;
  }

  if (sessionAuth.isGuest) {
    return sessionAuth;
  }

  if (localAuth.isGuest) {
    return localAuth;
  }

  return {
    token: null,
    user: null,
    isGuest: false,
  };
}

export function storeAuthenticatedSession({ token, user, rememberMe = false }) {
  clearAuthStorage();

  const targetStorage = rememberMe ? localStorage : sessionStorage;
  const serializedUser = serializeUser(user);

  if (token) {
    targetStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  if (serializedUser) {
    targetStorage.setItem(AUTH_USER_KEY, serializedUser);
  }
}

export function storeGuestSession({ token, rememberMe = false }) {
  clearAuthStorage();

  const targetStorage = rememberMe ? localStorage : sessionStorage;

  if (token) {
    targetStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  targetStorage.setItem(AUTH_GUEST_KEY, "true");
}

export function setStoredUser(user) {
  const serializedUser = serializeUser(user);
  if (!serializedUser) {
    removeAuthKeyEverywhere(AUTH_USER_KEY);
    return;
  }

  const targetStorage = hasToken(sessionStorage)
    ? sessionStorage
    : hasToken(localStorage)
      ? localStorage
      : localStorage;

  const otherStorage = targetStorage === localStorage ? sessionStorage : localStorage;

  targetStorage.setItem(AUTH_USER_KEY, serializedUser);
  targetStorage.removeItem(AUTH_GUEST_KEY);
  otherStorage.removeItem(AUTH_USER_KEY);
  otherStorage.removeItem(AUTH_GUEST_KEY);
}
