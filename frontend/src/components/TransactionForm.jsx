import React, { useEffect, useState } from "react";

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
        ? `http://localhost:5000/api/transactions/${initialData._id}`
        : "http://localhost:5000/api/transactions";

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
        throw new Error("Failed to save transaction");
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
      <h2 className="text-lg font-semibold text-gray-800">
        {isEditMode ? "Edit Transaction" : "Add Transaction"}
      </h2>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Transaction Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="w-full border rounded-lg px-3 py-2"
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
        <label className="block text-sm font-medium mb-1">
          Amount (Rs.)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Note (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows="2"
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
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
