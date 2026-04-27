import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#00C49F", "#FF8042"];

function IncomeExpenseChart({ income, expense }) {
  const data = [
    { name: "Income", value: income },
    { name: "Expense", value: expense },
  ];

  // Hide chart if no data
  if (income === 0 && expense === 0) {
    return <p>No data to display chart</p>;
  }

  return (
    <div style={{ width: "100%", height: 300 }}>
      <h3>Income vs Expense</h3>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={120}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default IncomeExpenseChart;

