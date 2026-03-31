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
