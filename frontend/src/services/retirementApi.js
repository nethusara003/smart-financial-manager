import { request } from "./apiClient";

export function calculateRetirement(payload) {
  return request("/retirement/calculate", {
    method: "POST",
    body: payload,
    fallbackMessage: "Failed to calculate retirement projection",
  });
}

export function simulateRetirement(payload) {
  return request("/retirement/simulate", {
    method: "POST",
    body: payload,
    fallbackMessage: "Failed to run retirement simulation",
  });
}

export function adviseRetirement(payload) {
  return request("/retirement/advise", {
    method: "POST",
    body: payload,
    fallbackMessage: "Failed to generate retirement advice",
  });
}

export function listRetirementPlans() {
  return request("/retirement/plans", {
    method: "GET",
    fallbackMessage: "Failed to load saved retirement plans",
  });
}

export function saveRetirementPlan(payload) {
  return request("/retirement/plans", {
    method: "POST",
    body: payload,
    fallbackMessage: "Failed to save retirement plan",
  });
}

export function refreshRetirementPlan(planId) {
  return request(`/retirement/plans/${encodeURIComponent(planId)}/refresh`, {
    method: "POST",
    fallbackMessage: "Failed to refresh retirement plan",
  });
}
