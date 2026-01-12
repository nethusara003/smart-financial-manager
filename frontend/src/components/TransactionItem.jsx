function TransactionItem({ transaction, onEdit, onDelete }) {
  return (
    <li
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 12px",
        marginBottom: "8px",
        borderRadius: "8px",
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
      }}
    >
      {/* LEFT: Transaction info */}
      <div>
        <strong>{transaction.category}</strong>
        <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
          {transaction.type.toUpperCase()} • {transaction.amount}
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div style={{ display: "flex", gap: "6px" }}>
        <button className="btn btn-edit btn-sm" onClick={() => onEdit(transaction)}>
  Edit
</button>

<button className="btn btn-danger btn-sm" onClick={() => onDelete(transaction._id)}>
  Delete
</button>

      </div>
    </li>
  );
}

export default TransactionItem;
