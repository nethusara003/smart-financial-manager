import React, { useEffect, useState } from "react";
import TransactionForm from "../components/TransactionForm";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [month, setMonth] = useState("All");
  const [type, setType] = useState("All");

  const [showModal, setShowModal] = useState(false);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setTransactions(data);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Transactions
          </h1>
          <p className="text-sm text-gray-500">
            View and manage your financial records
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-500 transition"
        >
          + Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-wrap gap-4">
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
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
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="All">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 text-sm">
            Loading transactions...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">
            No transactions found for the selected filters.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx._id} className="border-t">
                  <td className="px-4 py-3">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {tx.type}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {tx.category}
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">
          Add Transaction
        </h2>
        <button
          onClick={() => setShowModal(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        <TransactionForm
          onSuccess={() => {
            setShowModal(false);
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
