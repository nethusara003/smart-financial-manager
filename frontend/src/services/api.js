import { request } from "./apiClient.js";

function buildQueryString(filters = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    params.append(key, value);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

const get = (path, fallbackMessage) => request(path, { fallbackMessage });
const post = (path, body, fallbackMessage) =>
  request(path, { method: "POST", body, fallbackMessage });
const put = (path, body, fallbackMessage) =>
  request(path, { method: "PUT", body, fallbackMessage });
const remove = (path, fallbackMessage) =>
  request(path, { method: "DELETE", fallbackMessage });

export function getTransactions() {
  return get("/transactions", "Failed to fetch transactions");
}

export function getGoals() {
  return get("/goals", "Failed to fetch goals");
}

export function createGoal(goalData) {
  return post("/goals", goalData, "Failed to create goal");
}

export function updateGoal(goalId, goalData) {
  return put(`/goals/${goalId}`, goalData, "Failed to update goal");
}

export function deleteGoal(goalId) {
  return remove(`/goals/${goalId}`, "Failed to delete goal");
}

export function addContribution(goalId, amount) {
  return put(`/goals/${goalId}/contribute`, { amount }, "Failed to add contribution");
}

export function getLoans(filters = {}) {
  return get(`/loans${buildQueryString(filters)}`, "Failed to fetch loans");
}

export function getLoanById(loanId) {
  return get(`/loans/${loanId}`, "Failed to fetch loan details");
}

export function createLoan(loanData) {
  return post("/loans", loanData, "Failed to create loan");
}

export function updateLoan(loanId, loanData) {
  return put(`/loans/${loanId}`, loanData, "Failed to update loan");
}

export function deleteLoan(loanId) {
  return remove(`/loans/${loanId}`, "Failed to delete loan");
}

export function calculateEMI(principal, interestRate, tenure) {
  return post(
    "/loans/calculate-emi",
    { principal, interestRate, tenure },
    "Failed to calculate EMI"
  );
}

export function getAmortizationSchedule(loanId) {
  return get(`/loans/${loanId}/amortization`, "Failed to fetch amortization schedule");
}

export function recordLoanPayment(loanId, paymentData) {
  return post(`/loans/${loanId}/payments`, paymentData, "Failed to record payment");
}

export const recordPayment = recordLoanPayment;

export function getLoanPayments(loanId) {
  return get(`/loans/${loanId}/payments`, "Failed to fetch payment history");
}

export function simulateExtraPayment(loanId, extraAmount, frequency) {
  return post(
    `/loans/${loanId}/simulate-extra-payment`,
    { extraAmount, frequency },
    "Failed to simulate extra payment"
  );
}

export function getEarlyPayoffAmount(loanId) {
  return get(`/loans/${loanId}/early-payoff`, "Failed to calculate early payoff amount");
}

export function processPrepayment(loanId, amount, notes) {
  return post(`/loans/${loanId}/prepayment`, { amount, notes }, "Failed to process prepayment");
}

export function getLoansSummary() {
  return get("/loans/analytics/summary", "Failed to fetch loans summary");
}

export function getOverdueLoans() {
  return get("/loans/analytics/overdue", "Failed to fetch overdue loans");
}

export function compareLoans(offers) {
  return post("/loans/compare", { offers }, "Failed to compare loans");
}
