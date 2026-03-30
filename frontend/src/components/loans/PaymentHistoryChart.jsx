import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const PaymentHistoryChart = ({ payments, schedule, loan }) => {
  const { formatCurrency: formatFullCurrency, currency } = useCurrency();
  
  // Format for axis ticks (compact format)
  const formatCurrency = (value) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return `${currency.symbol}${(value / 1000000).toFixed(1)}M`;
    } else if (absValue >= 1000) {
      return `${currency.symbol}${(value / 1000).toFixed(0)}K`;
    }
    return `${currency.symbol}${value.toFixed(0)}`;
  };
  
  // Prepare data for payment history line chart
  const paymentHistoryData = payments.map((payment, index) => ({
    payment: index + 1,
    date: new Date(payment.paymentDate).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    principal: payment.principalPaid,
    interest: payment.interestPaid,
    balance: payment.remainingBalance,
    total: payment.paymentAmount
  }));

  // Prepare data for amortization breakdown (showing first 24 payments or all if less)
  const amortizationData = schedule.slice(0, 24).map(item => ({
    month: item.paymentNumber,
    principal: item.principalAmount,
    interest: item.interestAmount,
    balance: item.remainingBalance
  }));

  // Prepare data for pie chart (total principal vs interest)
  const totalInterest = loan.totalAmount - loan.principalAmount;
  const pieData = [
    { name: 'Principal Amount', value: loan.principalAmount, color: '#3b82f6' },
    { name: 'Total Interest', value: totalInterest, color: '#f59e0b' }
  ];

  // Prepare data for paid vs remaining
  const paidAmount = loan.principalAmount - loan.remainingBalance;
  const progressData = [
    { name: 'Paid', value: paidAmount, color: '#10b981' },
    { name: 'Remaining', value: loan.remainingBalance, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Payment History Line Chart */}
      {payments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Payment History Trend
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={paymentHistoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                tickFormatter={formatCurrency}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value) => formatFullCurrency(value)}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="principal" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Principal Paid"
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="interest" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Interest Paid"
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Remaining Balance"
                dot={{ r: 4 }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Amortization Breakdown Bar Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          EMI Breakdown (First 24 Months)
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={amortizationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              label={{ value: 'Payment Number', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              stroke="#9ca3af"
              tickFormatter={formatCurrency}
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value) => formatFullCurrency(value)}
            />
            <Legend />
            <Bar dataKey="principal" fill="#3b82f6" name="Principal" />
            <Bar dataKey="interest" fill="#f59e0b" name="Interest" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Notice how the principal portion increases and interest decreases over time
        </p>
      </div>

      {/* Pie Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Cost Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Total Loan Cost Breakdown
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatFullCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Repayment Progress */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Repayment Progress
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={progressData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {progressData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatFullCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Area Chart for Balance Over Time */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Outstanding Balance Projection
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={amortizationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9ca3af"
              tickFormatter={formatCurrency}
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value) => formatFullCurrency(value)}
            />
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="#8b5cf6" 
              fill="#8b5cf6" 
              fillOpacity={0.6}
              name="Outstanding Balance"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PaymentHistoryChart;
