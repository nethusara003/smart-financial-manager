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

// Goals API Functions
export async function getGoals() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/goals`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch goals");
  }

  return res.json();
}

export async function createGoal(goalData) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/goals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(goalData),
  });

  if (!res.ok) {
    throw new Error("Failed to create goal");
  }

  return res.json();
}

export async function updateGoal(goalId, goalData) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/goals/${goalId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(goalData),
  });

  if (!res.ok) {
    throw new Error("Failed to update goal");
  }

  return res.json();
}

export async function deleteGoal(goalId) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/goals/${goalId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete goal");
  }

  return res.json();
}

export async function addContribution(goalId, amount) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/goals/${goalId}/contribute`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount }),
  });

  if (!res.ok) {
    throw new Error("Failed to add contribution");
  }

  return res.json();
}
