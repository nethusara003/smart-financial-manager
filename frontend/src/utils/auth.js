export function getAuth() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || !user) return null;

  try {
    return {
      token,
      user: JSON.parse(user),
    };
  } catch {
    return null;
  }
}

export function isAdmin() {
  const auth = getAuth();
  return auth?.user?.role === "admin" || auth?.user?.role === "super_admin";
}
