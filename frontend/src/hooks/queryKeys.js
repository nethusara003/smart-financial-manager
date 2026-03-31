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
};
