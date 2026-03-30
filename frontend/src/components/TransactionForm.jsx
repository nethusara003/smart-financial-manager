import React, { useEffect, useState } from "react";
import { apiUrl } from "../services/apiClient";

/* ================= CATEGORY DEFINITIONS ================= */

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Gift",
  "Other Income",
];

const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Rent",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Education",
  "Shopping",
  "Subscriptions",
  "Other Expense",
];

const TransactionForm = ({ onSuccess, initialData }) => {
  const isEditMode = Boolean(initialData?._id);

  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= PREFILL FORM WHEN EDITING ================= */

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setCategory(initialData.category);
      setAmount(initialData.amount);
      setNote(initialData.note || "");
    }
  }, [initialData]);

  /* ================= RESET CATEGORY WHEN TYPE CHANGES (ADD MODE ONLY) ================= */

  useEffect(() => {
    if (!isEditMode) {
      setCategory("");
    }
  }, [type, isEditMode]);

  const categories =
    type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const url = isEditMode
        ? apiUrl(`/transactions/${initialData._id}`)
        : apiUrl("/transactions");

      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          category,
          amount: Number(amount),
          note,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save transaction");
      }

      onSuccess?.();

      // Reset only after ADD
      if (!isEditMode) {
        setType("expense");
        setCategory("");
        setAmount("");
        setNote("");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
        {isEditMode ? "Edit Transaction" : "Add Transaction"}
      </h2>

      {/* Type */}
      <div>
        <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
          Transaction Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-4 py-2.5 bg-light-bg-accent dark:bg-dark-surface-secondary border border-light-border-default dark:border-dark-border-strong rounded-lg text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="w-full px-4 py-2.5 bg-light-bg-accent dark:bg-dark-surface-secondary border border-light-border-default dark:border-dark-border-strong rounded-lg text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="" disabled>
            Select category
          </option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
          Amount (Rs.)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="w-full px-4 py-2.5 bg-light-bg-accent dark:bg-dark-surface-secondary border border-light-border-default dark:border-dark-border-strong rounded-lg text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="0.00"
        />
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
          Note (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows="3"
          className="w-full px-4 py-2.5 bg-light-bg-accent dark:bg-dark-surface-secondary border border-light-border-default dark:border-dark-border-strong rounded-lg text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          placeholder="Add a note about this transaction..."
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-success-500 to-emerald-600 hover:from-success-600 hover:to-emerald-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? isEditMode
              ? "Saving..."
              : "Adding..."
            : isEditMode
            ? "Save Changes"
            : "Add Transaction"}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
