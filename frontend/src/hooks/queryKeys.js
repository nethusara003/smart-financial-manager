export const queryKeys = {
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
