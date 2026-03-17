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

// Loan API Functions
export async function getLoans(filters = {}) {
  const token = localStorage.getItem("token");
  const queryParams = new URLSearchParams(filters).toString();
  const url = queryParams ? `${API_URL}/loans?${queryParams}` : `${API_URL}/loans`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch loans");
  }

  return res.json();
}

export async function getLoanById(loanId) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/loans/${loanId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch loan details");
  }

  return res.json();
}

export async function createLoan(loanData) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/loans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(loanData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create loan");
  }

  return res.json();
}

export async function updateLoan(loanId, loanData) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/loans/${loanId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(loanData),
  });

  if (!res.ok) {
    throw new Error("Failed to update loan");
  }

  return res.json();
}

export async function deleteLoan(loanId) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/loans/${loanId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete loan");
  }

  return res.json();
}

export async function calculateEMI(principal, interestRate, tenure) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/loans/calculate-emi`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ principal, interestRate, tenure }),
  });

  if (!res.ok) {
    throw new Error("Failed to calculate EMI");
  }

  return res.json();
}

export async function getAmortizationSchedule(loanId) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/loans/${loanId}/amortization`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch amortization schedule");
  }

  return res.json();
}

export async function recordLoanPayment(loanId, paymentData) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/loans/${loanId}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(paymentData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to record payment");
  }

  return res.json();
}

// Alias for compatibility
export const recordPayment = recordLoanPayment;

export async function getLoanPayments(loanId) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/loans/${loanId}/payments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch payment history");
  }

  return res.json();
}

export async function simulateExtraPayment(loanId, extraAmount, frequency) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/loans/${loanId}/simulate-extra-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ extraAmount, frequency }),
  });

  if (!res.ok) {
    throw new Error("Failed to simulate extra payment");
  }

  return res.json();
}

export async function getEarlyPayoffAmount(loanId) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/loans/${loanId}/early-payoff`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to calculate early payoff amount");
  }

  return res.json();
}

export async function processPrepayment(loanId, amount, notes) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/loans/${loanId}/prepayment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount, notes }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to process prepayment");
  }

  return res.json();
}

export async function getLoansSummary() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/loans/analytics/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch loans summary");
  }

  return res.json();
}

export async function getOverdueLoans() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/loans/analytics/overdue`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch overdue loans");
  }

  return res.json();
}

export async function compareLoans(offers) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/loans/compare`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ offers }),
  });

  if (!res.ok) {
    throw new Error("Failed to compare loans");
  }

  return res.json();
}
