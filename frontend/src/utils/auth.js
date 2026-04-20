import { getStoredAuthSnapshot } from "./authStorage";

export function getAuth() {
  const { token, user } = getStoredAuthSnapshot();

  if (!token || !user) {
    return null;
  }

  return {
    token,
    user,
  };
}

export function isAdmin() {
  const auth = getAuth();
  return auth?.user?.role === "admin" || auth?.user?.role === "super_admin";
}
