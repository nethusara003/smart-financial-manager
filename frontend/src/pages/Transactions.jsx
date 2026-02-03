import React, { useEffect, useState } from "react";
import TransactionForm from "../components/TransactionForm";

/* ================= CATEGORY BADGES ================= */

const CATEGORY_CONFIG = {
  food: { icon: "🍔", className: "bg-green-100 text-green-700" },
  transport: { icon: "🚗", className: "bg-purple-100 text-purple-700" },
  rent: { icon: "🏠", className: "bg-yellow-100 text-yellow-700" },
  utilities: { icon: "💡", className: "bg-indigo-100 text-indigo-700" },
  entertainment: { icon: "🎮", className: "bg-orange-100 text-orange-700" },
  healthcare: { icon: "🏥", className: "bg-pink-100 text-pink-700" },
  education: { icon: "🎓", className: "bg-cyan-100 text-cyan-700" },
  shopping: { icon: "🛍", className: "bg-rose-100 text-rose-700" },
  subscriptions: { icon: "📦", className: "bg-slate-100 text-slate-700" },
  salary: { icon: "💼", className: "bg-blue-100 text-blue-700" },
  freelance: { icon: "🧑‍💻", className: "bg-teal-100 text-teal-700" },
  investment: { icon: "📈", className: "bg-emerald-100 text-emerald-700" },
  gift: { icon: "🎁", className: "bg-fuchsia-100 text-fuchsia-700" },
  default: { icon: "📌", className: "bg-gray-100 text-gray-600" },
};

const getBadge = (category) => {
  if (!category) return CATEGORY_CONFIG.default;
  return (
    CATEGORY_CONFIG[category.toLowerCase()] ||
    CATEGORY_CONFIG.default
  );
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [month, setMonth] = useState("All");
  const [type, setType] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  /* ================= FETCH ================= */

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  /* ================= DELETE ================= */

  const deleteTransaction = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTransactions();
    } catch {
      alert("Failed to delete transaction");
    }
  };

  /* ================= FILTER ================= */

  const filteredTransactions = transactions.filter((tx) => {
    const txMonth = new Date(tx.date).getMonth() + 1;
    const monthMatch =
      month === "All" ? true : txMonth === Number(month);
    const typeMatch =
      type === "All" ? true : tx.type === type;
    return monthMatch && typeMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Transactions
          </h1>
          <p className="text-sm text-gray-500">
            View and manage your financial records
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTx(null);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-500"
        >
          + Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border shadow-sm flex gap-4">
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="All">All Months</option>
          {[...Array(12)].map((_, i) => (
            <option key={i} value={i + 1}>
              {new Date(0, i).toLocaleString("default", {
                month: "long",
              })}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="All">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading transactions...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No transactions found.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => {
                const badge = getBadge(tx.category);
                return (
                  <tr
                    key={tx._id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {tx.type}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}
                      >
                        {badge.icon} {tx.category}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-medium ${
                        tx.type === "income"
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      Rs. {tx.amount}
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingTx(tx);
                          setShowModal(true);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteTransaction(tx._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="font-semibold">
                {editingTx ? "Edit Transaction" : "Add Transaction"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingTx(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <TransactionForm
                initialData={editingTx}
                onSuccess={() => {
                  setShowModal(false);
                  setEditingTx(null);
                  fetchTransactions();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
