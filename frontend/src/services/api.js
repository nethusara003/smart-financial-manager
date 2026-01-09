const API_URL = "http://localhost:5000/api";

export async function getTransactions() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/transactions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch transactions");
  }

  return res.json();
}
