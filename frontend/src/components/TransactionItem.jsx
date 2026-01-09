function TransactionItem({ transaction, onEdit, onDelete }) {
  return (
    <li>
      {transaction.category} — {transaction.amount} ({transaction.type})

      <button
        style={{ marginLeft: "10px" }}
        onClick={() => onEdit(transaction)}   // ✅ REQUIRED
      >
        Edit
      </button>

      <button
        style={{
          marginLeft: "5px",
          background: "red",
          color: "white",
        }}
        onClick={() => onDelete(transaction._id)}
      >
        Delete
      </button>
    </li>
  );
}

export default TransactionItem;
