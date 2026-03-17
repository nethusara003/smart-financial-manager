import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";
import GuestRestricted from '../components/GuestRestricted';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  Info,
  Lightbulb,
  Target,
  DollarSign,
} from "lucide-react";

/* ================= CUSTOM TOOLTIPS ================= */

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white dark:bg-dark-surface-elevated border-2 border-gray-200 dark:border-dark-border-strong rounded-xl shadow-xl px-4 py-3">
      <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
      {payload.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: item.color }}
          ></div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">{item.name}:</span> Rs. {item.value?.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0];
  return (
    <div className="bg-white dark:bg-dark-surface-elevated border-2 border-gray-200 dark:border-dark-border-strong rounded-xl shadow-xl px-4 py-3">
      <p className="font-semibold text-gray-900 dark:text-white mb-1">{data.name}</p>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        Amount: <span className="font-semibold">Rs. {data.value?.toLocaleString()}</span>
      </p>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        Percentage: <span className="font-semibold">{data.payload.percentage}%</span>
      </p>
    </div>
  );
};

const AnalyticsHub = ({ auth }) => {
  const { formatCurrency } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [transactions, setTransactions] = useState([]);
  const [timeScope, setTimeScope] = useState("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

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

  /* ================= DATE BASE ================= */

  const today = new Date();
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();

  /* ================= TIME SCOPE FILTERING ================= */

  const scopedTransactions = useMemo(() => {
    const now = new Date();
    
    if (timeScope === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return transactions.filter(t => new Date(t.date) >= weekAgo);
    } else if (timeScope === "month") {
      return transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      });
    } else if (timeScope === "year") {
      return transactions.filter(t => new Date(t.date).getFullYear() === thisYear);
    } else {
      return transactions;
    }
  }, [transactions, timeScope, thisMonth, thisYear]);

  /* ================= BASIC CALCULATIONS ================= */

  const totalIncome = useMemo(() => 
    scopedTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0),
    [scopedTransactions]
  );

  const totalExpense = useMemo(() =>
    scopedTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0),
    [scopedTransactions]
  );

  const netSavings = useMemo(() => totalIncome - totalExpense, [totalIncome, totalExpense]);
  const savingsRate = useMemo(() => 
    totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0,
    [totalIncome, netSavings]
  );

  /* ================= TREND DATA (DYNAMIC BASED ON TIME SCOPE) ================= */

  const trendTitle = useMemo(() => {
    switch(timeScope) {
      case 'week': return 'Weekly Financial Trend';
      case 'month': return 'Monthly Financial Trend';
      case 'year': return 'Yearly Financial Trend';
      default: return 'Financial Trend Overview';
    }
  }, [timeScope]);

  const monthlyTrend = useMemo(() => {
    const now = new Date();
    const trendData = {};
    const periods = [];
    
    if (timeScope === 'week') {
      // Daily data for past 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        
        periods.push(dateKey);
        trendData[dateKey] = { label, income: 0, expense: 0, savings: 0 };
      }
      
      scopedTransactions.forEach(t => {
        const dateKey = new Date(t.date).toISOString().split('T')[0];
        if (trendData[dateKey]) {
          const amount = Number(t.amount || 0);
          if (t.type === 'income') trendData[dateKey].income += amount;
          else if (t.type === 'expense') trendData[dateKey].expense += amount;
        }
      });
    } else if (timeScope === 'month') {
      // Daily data for current month
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = now.getDate();
      
      for (let day = 1; day <= today; day++) {
        const date = new Date(year, month, day);
        const dateKey = date.toISOString().split('T')[0];
        const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        periods.push(dateKey);
        trendData[dateKey] = { label, income: 0, expense: 0, savings: 0 };
      }
      
      scopedTransactions.forEach(t => {
        const dateKey = new Date(t.date).toISOString().split('T')[0];
        if (trendData[dateKey]) {
          const amount = Number(t.amount || 0);
          if (t.type === 'income') trendData[dateKey].income += amount;
          else if (t.type === 'expense') trendData[dateKey].expense += amount;
        }
      });
    } else if (timeScope === 'year') {
      // Monthly data for current year - show all 12 months
      const year = now.getFullYear();
      const currentMonth = now.getMonth();
      
      // Show all 12 months for complete yearly view
      for (let month = 0; month < 12; month++) {
        const date = new Date(year, month, 1);
        const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
        const label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        periods.push(monthKey);
        trendData[monthKey] = { label, income: 0, expense: 0, savings: 0 };
      }
      
      // Only populate data for past/current months
      scopedTransactions.forEach(t => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (trendData[monthKey]) {
          const amount = Number(t.amount || 0);
          if (t.type === 'income') trendData[monthKey].income += amount;
          else if (t.type === 'expense') trendData[monthKey].expense += amount;
        }
      });
    } else {
      // All time: last 12 months monthly data
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        
        periods.push(monthKey);
        trendData[monthKey] = { label, income: 0, expense: 0, savings: 0 };
      }
      
      scopedTransactions.forEach(t => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (trendData[monthKey]) {
          const amount = Number(t.amount || 0);
          if (t.type === 'income') trendData[monthKey].income += amount;
          else if (t.type === 'expense') trendData[monthKey].expense += amount;
        }
      });
    }
    
    return periods.map(key => {
      const data = trendData[key];
      data.savings = data.income - data.expense;
      return data;
    });
  }, [scopedTransactions, timeScope]);

  /* ================= CATEGORY BREAKDOWN ================= */

  const expenseByCategory = useMemo(() => {
    const categoryMap = {};
    
    scopedTransactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        const cat = t.category || "Other";
        categoryMap[cat] = (categoryMap[cat] || 0) + Number(t.amount || 0);
      });

    const total = Object.values(categoryMap).reduce((sum, val) => sum + val, 0);

    return Object.entries(categoryMap)
      .map(([category, amount]) => ({
        name: category,
        value: amount,
        percentage: total > 0 ? ((amount / total) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.value - a.value);
  }, [scopedTransactions]);

  const incomeByCategory = useMemo(() => {
    const categoryMap = {};
    
    scopedTransactions
      .filter(t => t.type === "income")
      .forEach(t => {
        const cat = t.category || "Other";
        categoryMap[cat] = (categoryMap[cat] || 0) + Number(t.amount || 0);
      });

    const total = Object.values(categoryMap).reduce((sum, val) => sum + val, 0);

    return Object.entries(categoryMap)
      .map(([category, amount]) => ({
        name: category,
        value: amount,
        percentage: total > 0 ? ((amount / total) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.value - a.value);
  }, [scopedTransactions]);

  /* ================= TOP CATEGORIES ================= */

  const topExpenseCategories = useMemo(() => expenseByCategory.slice(0, 5), [expenseByCategory]);
  const topIncomeCategories = useMemo(() => incomeByCategory.slice(0, 5), [incomeByCategory]);

  /* ================= PATTERN DATA (DYNAMIC BASED ON TIME SCOPE) ================= */

  const patternTitle = useMemo(() => {
    switch(timeScope) {
      case 'week': return 'Daily Transaction Analysis';
      case 'month': return 'Weekly Transaction Analysis';
      case 'year': return 'Monthly Transaction Analysis';
      default: return 'Transaction Pattern Analysis';
    }
  }, [timeScope]);

  const dailyPattern = useMemo(() => {
    const now = new Date();
    
    if (timeScope === 'week') {
      // Show last 7 days
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const fullDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        days.push({ 
          day: `${dayName} ${date.getDate()}`,
          label: dayName,
          dateKey: date.toISOString().split('T')[0],
          income: 0, 
          expense: 0, 
          count: 0 
        });
      }
      
      scopedTransactions.forEach(t => {
        const dateKey = new Date(t.date).toISOString().split('T')[0];
        const dayData = days.find(d => d.dateKey === dateKey);
        if (dayData) {
          const amount = Number(t.amount || 0);
          if (t.type === 'income') dayData.income += amount;
          else if (t.type === 'expense') dayData.expense += amount;
          dayData.count++;
        }
      });
      
      return days;
    } else if (timeScope === 'month') {
      // Show weeks of current month
      const year = now.getFullYear();
      const month = now.getMonth();
      const today = now.getDate();
      
      const weeks = [
        { day: 'Week 1', label: 'Days 1-7', start: 1, end: 7, income: 0, expense: 0, count: 0 },
        { day: 'Week 2', label: 'Days 8-14', start: 8, end: 14, income: 0, expense: 0, count: 0 },
        { day: 'Week 3', label: 'Days 15-21', start: 15, end: 21, income: 0, expense: 0, count: 0 },
        { day: 'Week 4', label: 'Days 22-28', start: 22, end: 28, income: 0, expense: 0, count: 0 },
        { day: 'Week 5', label: 'Days 29+', start: 29, end: 31, income: 0, expense: 0, count: 0 }
      ];
      
      scopedTransactions.forEach(t => {
        const date = new Date(t.date);
        const day = date.getDate();
        const weekData = weeks.find(w => day >= w.start && day <= w.end);
        if (weekData) {
          const amount = Number(t.amount || 0);
          if (t.type === 'income') weekData.income += amount;
          else if (t.type === 'expense') weekData.expense += amount;
          weekData.count++;
        }
      });
      
      // Only return weeks that have passed or current week
      return weeks.filter(w => w.start <= today);
    } else if (timeScope === 'year') {
      // Show 12 months of current year
      const year = now.getFullYear();
      const currentMonth = now.getMonth();
      
      const months = [];
      for (let month = 0; month < 12; month++) {
        const date = new Date(year, month, 1);
        months.push({
          day: date.toLocaleDateString('en-US', { month: 'short' }),
          monthKey: `${year}-${String(month + 1).padStart(2, '0')}`,
          income: 0,
          expense: 0,
          count: 0
        });
      }
      
      scopedTransactions.forEach(t => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthData = months.find(m => m.monthKey === monthKey);
        if (monthData) {
          const amount = Number(t.amount || 0);
          if (t.type === 'income') monthData.income += amount;
          else if (t.type === 'expense') monthData.expense += amount;
          monthData.count++;
        }
      });
      
      return months;
    } else {
      // All time: Show last 12 months
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.push({
          day: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          monthKey,
          income: 0,
          expense: 0,
          count: 0
        });
      }
      
      scopedTransactions.forEach(t => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthData = months.find(m => m.monthKey === monthKey);
        if (monthData) {
          const amount = Number(t.amount || 0);
          if (t.type === 'income') monthData.income += amount;
          else if (t.type === 'expense') monthData.expense += amount;
          monthData.count++;
        }
      });
      
      return months;
    }
  }, [scopedTransactions, timeScope]);

  /* ================= CHART COLORS ================= */

  const EXPENSE_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9'
  ];

  const INCOME_COLORS = [
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
  ];

  /* ================= TABS CONFIGURATION ================= */

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'Complete financial analytics dashboard'
    },
    {
      id: 'trend',
      label: 'Financial Trend',
      icon: TrendingUp,
      description: '6-month income, expense & savings analysis'
    },
    {
      id: 'expenses',
      label: 'Expense Analysis',
      icon: TrendingDown,
      description: 'Deep dive into spending patterns'
    },
    {
      id: 'income',
      label: 'Income Analysis',
      icon: DollarSign,
      description: 'Income sources breakdown'
    },
    {
      id: 'patterns',
      label: 'Spending Patterns',
      icon: Calendar,
      description: 'Weekly spending behavior analysis'
    }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  /* ================= RENDER CONTENT ================= */

  const renderInsightCard = (title, content, IconComponent) => (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-3">
        <div className="bg-blue-100 dark:bg-blue-800/30 p-2 rounded-lg">
          <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">{content}</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Description */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-start gap-4">
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <Info className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Financial Analytics Overview</h3>
                  <p className="text-blue-100 leading-relaxed">
                    This comprehensive dashboard provides a holistic view of your financial health. Monitor your income streams, 
                    track spending patterns, and gain actionable insights into your financial behavior. The analytics engine 
                    processes your transaction history to deliver real-time metrics and trend analysis, helping you make 
                    informed financial decisions.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <TrendingUp className="w-8 h-8" />
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Income</span>
                </div>
                <p className="text-3xl font-bold">{formatCurrency(totalIncome)}</p>
                <p className="text-green-100 text-sm mt-1">Total earned</p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <TrendingDown className="w-8 h-8" />
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Expenses</span>
                </div>
                <p className="text-3xl font-bold">{formatCurrency(totalExpense)}</p>
                <p className="text-red-100 text-sm mt-1">Total spent</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <Wallet className="w-8 h-8" />
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{savingsRate}%</span>
                </div>
                <p className="text-3xl font-bold">{formatCurrency(netSavings)}</p>
                <p className="text-blue-100 text-sm mt-1">Net savings</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <Activity className="w-8 h-8" />
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Count</span>
                </div>
                <p className="text-3xl font-bold">{scopedTransactions.length}</p>
                <p className="text-purple-100 text-sm mt-1">Transactions</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Monthly Trend */}
              <div className="bg-white dark:bg-dark-surface-primary rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-border-strong">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  {trendTitle}
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrend}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                      <XAxis dataKey="label" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" name="Income" />
                      <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" name="Expense" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Expense Pie */}
              <div className="bg-white dark:bg-dark-surface-primary rounded-xl p-6 shadow-lg border border-gray-200 dark:border-dark-border-strong">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-red-600" />
                  Expense Distribution
                </h3>
                {expenseByCategory.length === 0 ? (
                  <div className="h-80 flex items-center justify-center">
                    <p className="text-gray-500">No expense data available</p>
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseByCategory}
                          cx="50%"
                          cy="45%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          strokeWidth={2}
                          stroke="#fff"
                        >
                          {expenseByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
                          wrapperStyle={{ fontSize: '12px' }}
                          formatter={(value, entry) => `${value} (${entry.payload.percentage}%)`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'trend':
        return (
          <div className="space-y-6">
            {/* Description */}
            <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-700 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-start gap-4">
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{trendTitle} Analysis</h3>
                  <p className="text-emerald-100 leading-relaxed mb-4">
                    {timeScope === 'week' && 'This trend analysis tracks your daily financial activity over the past week, revealing short-term patterns in income and spending. Perfect for monitoring recent financial behavior and making quick adjustments.'}
                    {timeScope === 'month' && 'This trend analysis tracks your daily financial activity throughout the current month, showing how income and expenses fluctuate day by day. Ideal for understanding your monthly cash flow patterns.'}
                    {timeScope === 'year' && 'This trend analysis tracks your monthly financial trajectory throughout the current year, revealing seasonal patterns in income generation and spending behavior. Excellent for annual financial planning and goal tracking.'}
                    {timeScope === 'all' && 'This comprehensive trend analysis tracks your financial trajectory over the past year, revealing long-term patterns in income generation, spending behavior, and savings accumulation. The multi-dimensional area chart provides a clear visual representation of cash flow dynamics.'}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs text-emerald-200 mb-1">Income Trend</p>
                      <p className="text-sm font-semibold">Green area shows earnings over time</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs text-emerald-200 mb-1">Expense Trend</p>
                      <p className="text-sm font-semibold">Red area indicates spending patterns</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs text-emerald-200 mb-1">Gap Analysis</p>
                      <p className="text-sm font-semibold">Distance between lines shows savings</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInsightCard(
                "What to Look For",
                "Consistent upward trend in income indicates financial growth. Widening gap between income and expenses suggests improving savings rate. Watch for sudden spikes or drops that may need attention.",
                Lightbulb
              )}
              {renderInsightCard(
                "Actionable Insights",
                "If expenses are trending close to income, consider budget optimization. If income shows volatility, explore ways to create more stable revenue streams. Use this data to set realistic financial goals.",
                Target
              )}
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-dark-surface-primary rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-dark-border-strong">
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                    <XAxis dataKey="label" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} />
                    <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" name="Income" />
                    <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" name="Expense" />
                    <Area type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSavings)" name="Savings" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-400 font-medium mb-1">Average Monthly Income</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                  {formatCurrency(monthlyTrend.reduce((sum, m) => sum + m.income, 0) / 6)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-5 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium mb-1">Average Monthly Expenses</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-300">
                  {formatCurrency(monthlyTrend.reduce((sum, m) => sum + m.expense, 0) / 6)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-400 font-medium mb-1">Average Monthly Savings</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                  {formatCurrency(monthlyTrend.reduce((sum, m) => sum + m.savings, 0) / 6)}
                </p>
              </div>
            </div>
          </div>
        );

      case 'expenses':
        return (
          <div className="space-y-6">
            {/* Description */}
            <div className="bg-gradient-to-br from-rose-600 via-red-700 to-pink-700 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-start gap-4">
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Expense Distribution Analysis</h3>
                  <p className="text-rose-100 leading-relaxed mb-4">
                    Understanding where your money goes is fundamental to financial wellness. This comprehensive expense breakdown 
                    categorizes your spending into distinct segments, revealing consumption patterns and highlighting areas where 
                    you can optimize. The pie chart visualization makes it easy to identify major expense categories at a glance, 
                    while percentage distributions help you understand spending priorities.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs text-rose-200 mb-1">Category Breakdown</p>
                      <p className="text-sm font-semibold">Each slice represents spending in different areas of your life</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs text-rose-200 mb-1">Optimization Opportunity</p>
                      <p className="text-sm font-semibold">Identify largest slices for potential savings opportunities</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInsightCard(
                "50/30/20 Rule",
                "Ideally, 50% should go to needs, 30% to wants, and 20% to savings. Compare your distribution to this benchmark to assess financial health.",
                Info
              )}
              {renderInsightCard(
                "Red Flags",
                "If any single category exceeds 40% of total expenses (except housing), consider rebalancing. Multiple small categories may indicate lack of budgeting focus.",
                Lightbulb
              )}
              {renderInsightCard(
                "Take Action",
                "Target the top 2-3 expense categories for optimization. Even small reductions in major categories can significantly boost savings.",
                Target
              )}
            </div>

            {/* Chart and Top Categories */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="bg-white dark:bg-dark-surface-primary rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-dark-border-strong">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expense Distribution</h3>
                {expenseByCategory.length === 0 ? (
                  <div className="h-96 flex items-center justify-center">
                    <p className="text-gray-500">No expense data available</p>
                  </div>
                ) : (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseByCategory}
                          cx="50%"
                          cy="45%"
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          strokeWidth={2}
                          stroke="#fff"
                        >
                          {expenseByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
                          wrapperStyle={{ fontSize: '12px' }}
                          formatter={(value, entry) => `${value} (${entry.payload.percentage}%)`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Top Categories */}
              <div className="bg-white dark:bg-dark-surface-primary rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-dark-border-strong">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Expense Categories</h3>
                <div className="space-y-4">
                  {topExpenseCategories.length === 0 ? (
                    <p className="text-gray-500">No expense data available</p>
                  ) : (
                    topExpenseCategories.map((cat, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(cat.value)}</div>
                            <div className="text-xs text-gray-500">{cat.percentage}%</div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${cat.percentage}%`,
                              backgroundColor: EXPENSE_COLORS[index],
                              boxShadow: `0 0 10px ${EXPENSE_COLORS[index]}60`
                            }}
                          ></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'income':
        return (
          <div className="space-y-6">
            {/* Description */}
            <div className="bg-gradient-to-br from-emerald-600 via-green-700 to-teal-700 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-start gap-4">
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Income Sources Analysis</h3>
                  <p className="text-emerald-100 leading-relaxed mb-4">
                    A healthy financial portfolio includes diverse income streams. This analysis breaks down your earnings by 
                    source, helping you understand income stability and dependency. Whether salary, freelance work, investments, 
                    or passive income, each source contributes uniquely to your financial security. Diversification reduces risk 
                    and creates opportunities for financial growth.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs text-emerald-200 mb-1">Primary vs Secondary</p>
                      <p className="text-sm font-semibold">Identify your main income source and supplementary earnings</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs text-emerald-200 mb-1">Growth Opportunities</p>
                      <p className="text-sm font-semibold">Smaller slices represent areas for potential income expansion</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInsightCard(
                "Diversification Benefits",
                "Multiple income sources provide financial resilience. If one stream is disrupted, others continue supporting you. Aim for at least 2-3 distinct income categories.",
                Info
              )}
              {renderInsightCard(
                "Risk Assessment",
                "If one category exceeds 80% of total income, you're highly dependent on that source. Consider developing alternative revenue streams to reduce financial risk.",
                Lightbulb
              )}
              {renderInsightCard(
                "Growth Strategy",
                "Focus on scaling your most profitable income sources while exploring new opportunities. Even small side income can significantly boost financial security over time.",
                Target
              )}
            </div>

            {/* Chart and Top Sources */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="bg-white dark:bg-dark-surface-primary rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-dark-border-strong">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Income Distribution</h3>
                {incomeByCategory.length === 0 ? (
                  <div className="h-96 flex items-center justify-center">
                    <p className="text-gray-500">No income data available</p>
                  </div>
                ) : (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={incomeByCategory}
                          cx="50%"
                          cy="45%"
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          strokeWidth={2}
                          stroke="#fff"
                        >
                          {incomeByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
                          wrapperStyle={{ fontSize: '12px' }}
                          formatter={(value, entry) => `${value} (${entry.payload.percentage}%)`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Top Income Sources */}
              <div className="bg-white dark:bg-dark-surface-primary rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-dark-border-strong">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Income Sources</h3>
                <div className="space-y-4">
                  {topIncomeCategories.length === 0 ? (
                    <p className="text-gray-500">No income data available</p>
                  ) : (
                    topIncomeCategories.map((cat, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(cat.value)}</div>
                            <div className="text-xs text-gray-500">{cat.percentage}%</div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${cat.percentage}%`,
                              backgroundColor: INCOME_COLORS[index],
                              boxShadow: `0 0 10px ${INCOME_COLORS[index]}60`
                            }}
                          ></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'patterns':
        return (
          <div className="space-y-6">
            {/* Description */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-start gap-4">
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{patternTitle} Analysis</h3>
                  <p className="text-indigo-100 leading-relaxed mb-4">
                    {timeScope === 'week' && 'Track your daily financial activities over the past week. This detailed view reveals how your spending and income fluctuate day by day, helping you identify specific dates with unusual activity and understand your short-term financial behavior patterns.'}
                    {timeScope === 'month' && 'Your financial behavior varies throughout the month. This weekly breakdown reveals spending patterns across different periods of the month, helping you identify high-spend weeks and opportunities for better budget control throughout the billing cycle.'}
                    {timeScope === 'year' && 'Your financial behavior varies across different months of the year. This monthly analysis reveals seasonal spending patterns, helping you identify high-expense periods, plan for recurring annual costs, and understand how your finances evolve throughout the year.'}
                    {timeScope === 'all' && 'This comprehensive temporal analysis reveals long-term spending patterns over the past year, helping you identify seasonal trends, peak spending periods, and opportunities for better budget control across extended timeframes.'}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs text-indigo-200 mb-1">
                        {timeScope === 'week' ? 'Daily Breakdown' : timeScope === 'month' ? 'Weekly Breakdown' : 'Monthly Breakdown'}
                      </p>
                      <p className="text-sm font-semibold">
                        {timeScope === 'week' ? 'Compare spending patterns across each day' : timeScope === 'month' ? 'Compare spending patterns across weeks' : 'Compare spending patterns across months'}
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs text-indigo-200 mb-1">
                        {timeScope === 'week' ? 'Peak Days' : timeScope === 'month' ? 'Peak Weeks' : 'Peak Months'}
                      </p>
                      <p className="text-sm font-semibold">
                        {timeScope === 'week' ? 'Identify which days see highest activity' : timeScope === 'month' ? 'Identify which weeks see highest activity' : 'Identify which months see highest activity'}
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs text-indigo-200 mb-1">Behavioral Insights</p>
                      <p className="text-sm font-semibold">
                        {timeScope === 'week' ? 'Understand daily spending habits' : timeScope === 'month' ? 'Understand weekly spending cycles' : 'Understand seasonal spending trends'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInsightCard(
                "Pattern Recognition",
                timeScope === 'week' 
                  ? "Daily patterns reveal immediate spending habits. Weekend spending often increases due to leisure activities, while weekdays may show routine expenses. Track these micro-patterns for better daily budgeting."
                  : timeScope === 'month'
                  ? "Weekly patterns show spending cycles throughout the month. The first week often has bill payments, while later weeks may show variable discretionary spending. Understanding these cycles helps with cash flow management."
                  : "Monthly patterns reveal seasonal spending trends. Holiday months, vacation periods, and annual expenses create predictable peaks. Use these insights for yearly financial planning and saving strategies.",
                Lightbulb
              )}
              {renderInsightCard(
                "Optimization Strategy",
                timeScope === 'week'
                  ? "If certain days consistently show high spending, be mindful and plan purchases. Consider spreading large expenses across lower-spend days to maintain balanced daily cash flow."
                  : timeScope === 'month'
                  ? "If certain weeks consistently show high spending, plan ahead with budgets and spending limits. Consider scheduling major purchases during historically lower-spend weeks to maintain balance."
                  : "If certain months consistently show high spending, prepare by increasing savings in advance. Schedule major purchases or expenses strategically to avoid compounding costs during peak months.",
                Target
              )}
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-dark-surface-primary rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-dark-border-strong">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{patternTitle}</h3>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyPattern}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                    <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} />
                    <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} name="Income" />
                    <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} name="Expense" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Day Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dailyPattern.map((day, index) => (
                <div key={index} className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                  <p className="text-sm font-bold text-purple-900 dark:text-purple-300 mb-2">{day.day}</p>
                  <p className="text-xs text-purple-700 dark:text-purple-400">Transactions: {day.count}</p>
                  <p className="text-xs text-purple-700 dark:text-purple-400">Net: {formatCurrency(day.income - day.expense)}</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (auth?.isGuest) {
    return <GuestRestricted featureName="Analytics" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          {/* Page Title */}
          <div className="py-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Financial Analytics
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Deep insights and comprehensive analysis of your financial data
                </p>
              </div>
              <select
                value={timeScope}
                onChange={(e) => setTimeScope(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <option value="week">Last Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 whitespace-nowrap transition-all ${
                    isActive
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{tab.label}</div>
                    {isActive && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 hidden lg:block">
                        {tab.description}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default AnalyticsHub;
