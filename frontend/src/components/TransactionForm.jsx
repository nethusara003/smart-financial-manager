import { useEffect, useState } from "react";

function TransactionForm({
  onAdded,
  editingTransaction,
  onCancelEdit,
}) {
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // Fill form when editing
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setAmount(editingTransaction.amount);
      setNote(editingTransaction.note || "");
    }
  }, [editingTransaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const url = editingTransaction
      ? `http://localhost:5000/api/transactions/${editingTransaction._id}`
      : "http://localhost:5000/api/transactions";

    const method = editingTransaction ? "PUT" : "POST";

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

    if (res.ok) {
      setCategory("");
      setAmount("");
      setNote("");
      onAdded();
      if (editingTransaction) onCancelEdit();
    } else {
      alert("Failed to save transaction");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
      <h3>{editingTransaction ? "Edit Transaction" : "Add Transaction"}</h3>

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <br />

      <input
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />

      <br />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <br />

      <input
        placeholder="Note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <br />

      <button type="submit">
        {editingTransaction ? "Update" : "Add"}
      </button>

      {editingTransaction && (
        <button
          type="button"
          onClick={onCancelEdit}
          style={{ marginLeft: "10px" }}
        >
          Cancel
        </button>
      )}
    </form>
  );
}

export default TransactionForm;
