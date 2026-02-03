import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  /* ================= FETCH ================= */

  useEffect(() => {
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

    fetchTransactions();
  }, []);

  /* ================= FILTER ================= */

  const monthlyTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const income = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const expense = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  let insightMessage = "";

if (income === 0 && expense === 0) {
  insightMessage =
    "No transactions have been recorded for this period yet.";
} else if (income > expense) {
  insightMessage =
    "Your income exceeds your expenses this period. Good financial discipline.";
} else if (expense > income) {
  insightMessage =
    "Your expenses exceed your income this period. Consider reviewing your spending.";
} else {
  insightMessage =
    "Your income and expenses are balanced this period.";
}


  const balance = income - expense;
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

  

  /* ================= CATEGORY ANALYSIS ================= */

  const categoryTotals = {};
  monthlyTransactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const key = t.category || "Other";
      categoryTotals[key] =
        (categoryTotals[key] || 0) + Number(t.amount || 0);
    });

  const topCategory = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const topCategoryPercent =
    topCategory && expense > 0
      ? ((topCategory[1] / expense) * 100).toFixed(1)
      : 0;

  /* ================= STATUS & INSIGHTS ================= */

  let status = "Stable";
  let statusColor = "text-emerald-600";

  if (income === 0 || expense > income || savingsRate < 5) {
    status = "Risk";
    statusColor = "text-red-600";
  } else if (savingsRate < 20) {
    status = "Caution";
    statusColor = "text-orange-500";
  }

 const insights = [];

if (income === 0 && expense === 0) {
  insights.push(
    "📭 No transactions have been recorded for this period yet."
  );
}


  
if (income > 0 || expense > 0) {
  if (expense > income) {
    insights.push("⚠️ Expenses exceeded income this month.");
  }

  if (savingsRate < 20 && income > 0) {
    insights.push("⚠️ Savings rate is below the recommended 20%.");
  }

  if (topCategoryPercent > 50) {
    insights.push(
      `⚠️ ${topCategory[0]} accounts for ${topCategoryPercent}% of total expenses.`
    );
  }
}


  if (savingsRate < 20 && income > 0) {
    insights.push("⚠️ Savings rate is below the recommended 20%.");
  }

  if (topCategoryPercent > 50) {
    insights.push(
      `⚠️ ${topCategory[0]} accounts for ${topCategoryPercent}% of total expenses.`
    );
  }

 if (insights.length === 0 && (income > 0 || expense > 0)) {
  insights.push("✅ Your finances are well balanced this month.");
}


  /* ================= PDF EXPORT ================= */

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Smart Finance", 14, 18);
    doc.setFontSize(11);
    doc.text(
      `Monthly Financial Report — ${new Date(year, month).toLocaleString(
        "default",
        { month: "long" }
      )} ${year}`,
      14,
      26
    );

    doc.setFontSize(12);
    doc.text("Executive Summary", 14, 40);
    doc.setFontSize(11);
    doc.text(`Income: Rs. ${income}`, 14, 48);
    doc.text(`Expense: Rs. ${expense}`, 14, 56);
    doc.text(`Net Balance: Rs. ${balance}`, 14, 64);
    doc.text(`Savings Rate: ${savingsRate}%`, 14, 72);
    doc.text(`Status: ${status}`, 14, 80);

    doc.setFontSize(12);
    doc.text("Key Insights", 14, 96);
    insights.forEach((i, idx) => {
      doc.setFontSize(10);
      doc.text(`• ${i}`, 16, 104 + idx * 8);
    });

    autoTable(doc, {
      startY: 120,
      head: [["Date", "Type", "Category", "Amount (Rs.)", "Note"]],
      body: monthlyTransactions.map((t) => [
        new Date(t.date).toLocaleDateString(),
        t.type,
        t.category || "-",
        t.amount,
        t.note || "-",
      ]),
      headStyles: { fillColor: [30, 41, 59], textColor: 255 },
      styles: { fontSize: 9 },
    });

    doc.save(`financial-report-${month + 1}-${year}.pdf`);
  };

  if (loading) return <p>Loading reports…</p>;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Reports</h1>
        <p className="text-sm text-gray-500">
          Monthly financial performance summary
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl border shadow-sm flex gap-4">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {[...Array(12)].map((_, i) => (
            <option key={i} value={i}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {[year, year - 1, year - 2].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <button
          onClick={exportPDF}
          className="ml-auto px-4 py-2 bg-gray-800 text-white rounded-lg text-sm"
        >
          Export PDF
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border">
          <p className="text-sm text-gray-500">Income</p>
          <p className="text-xl font-semibold text-emerald-600">
            Rs. {income}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border">
          <p className="text-sm text-gray-500">Expense</p>
          <p className="text-xl font-semibold text-red-500">
            Rs. {expense}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border">
          <p className="text-sm text-gray-500">Savings Rate</p>
          <p className="text-xl font-semibold">
            {savingsRate}%
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border">
          <p className="text-sm text-gray-500">Status</p>
          <p className={`text-xl font-semibold ${statusColor}`}>
            {status}
          </p>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="font-medium mb-3">Key Insights</h3>
        <ul className="text-sm space-y-2">
          {insights.map((i, idx) => (
            <li key={idx}>{i}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Reports;
