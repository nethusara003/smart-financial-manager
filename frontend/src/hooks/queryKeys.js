export const queryKeys = {
  admin: {
    all: ["admin"],
    users: ["admin", "users"],
    analyticsOverview: ["admin", "analyticsOverview"],
    auditLogs: ["admin", "auditLogs"],
    userTransactions: (userId) => ["admin", "userTransactions", userId],
  },
  bills: {
    all: ["bills"],
    list: ["bills", "list"],
    upcoming: (days = 7) => ["bills", "upcoming", days],
  },
  wallet: {
    all: ["wallet"],
    balance: ["wallet", "balance"],
    transactions: (scope = "default") => ["wallet", "transactions", scope],
  },
  transfers: {
    all: ["transfers"],
    limits: ["transfers", "limits"],
    history: ({ type = "all", status = "all" } = {}) => ["transfers", "history", type, status],
    detail: (transferId) => ["transfers", "detail", transferId],
    userSearch: (query = "") => ["transfers", "userSearch", query],
  },
  budgets: {
    all: ["budgets"],
    withSpending: ["budgets", "withSpending"],
  },
  recurring: {
    all: ["recurring"],
    list: (type = "all") => ["recurring", "list", type],
  },
  transactions: {
    all: ["transactions"],
    list: ["transactions", "list"],
  },
  notifications: {
    all: ["notifications"],
    list: (scope = "all") => ["notifications", "list", scope],
    unreadCount: ["notifications", "unreadCount"],
  },
  settings: {
    all: ["settings"],
    profile: ["settings", "profile"],
    transferPinStatus: ["settings", "transferPinStatus"],
  },
  feedback: {
    all: ["feedback"],
    list: ({ type = "all", sort = "recent" } = {}) => ["feedback", "list", type, sort],
  },
  insights: {
    all: ["insights"],
    expenseForecast: (months = 3) => ["insights", "expenseForecast", months],
    financialHealth: (months = 1) => ["insights", "financialHealth", months],
    budgetRecommendations: (months = 1) => ["insights", "budgetRecommendations", months],
  },
};
