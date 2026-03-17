import React, { useEffect, useState, useMemo } from "react";
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
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUpIcon,
  Target,
  Percent,
  Activity,
  Zap,
  Download,
  Filter,
  ChevronDown,
} from "lucide-react";

/* ================= CUSTOM TOOLTIPS ================= */

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-light-surface-primary dark:bg-dark-surface-elevated border-2 border-light-border-default dark:border-dark-border-strong rounded-xl shadow-premium dark:shadow-elevated-dark px-4 py-3">
      <p className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">{label}</p>
      {payload.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: item.color }}
          ></div>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
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
    <div className="bg-light-surface-primary dark:bg-dark-surface-elevated border-2 border-light-border-default dark:border-dark-border-strong rounded-xl shadow-premium dark:shadow-elevated-dark px-4 py-3">
      <p className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">{data.name}</p>
      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
        Amount: <span className="font-semibold">Rs. {data.value?.toLocaleString()}</span>
      </p>
      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
        Percentage: <span className="font-semibold">{data.payload.percentage}%</span>
      </p>
    </div>
  );
};

const Analytics = ({ auth }) => {
  const { formatCurrency } = useCurrency();
  const [transactions, setTransactions] = useState([]);
  const [timeScope, setTimeScope] = useState("month");
  const [loading, setLoading] = useState(true);

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
      return transactions; // all time
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
      case 'week': return 'Daily Transaction Pattern';
      case 'month': return 'Weekly Transaction Pattern';
      case 'year': return 'Monthly Transaction Pattern';
      default: return 'Transaction Pattern';
    }
  }, [timeScope]);

  const patternSubtitle = useMemo(() => {
    switch(timeScope) {
      case 'week': return 'Last 7 days breakdown';
      case 'month': return 'Weekly breakdown';
      case 'year': return 'Monthly breakdown';
      default: return 'Transaction breakdown';
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

  /* ================= FINANCIAL HEALTH SCORE ================= */

  const healthScore = useMemo(() => {
    let score = 0;
    
    // Savings rate (0-40 points)
    if (savingsRate >= 20) score += 40;
    else if (savingsRate >= 10) score += 30;
    else if (savingsRate >= 0) score += 20;
    else score += 0;

    // Transaction consistency (0-30 points)
    const hasRegularIncome = totalIncome > 0;
    const expenseToIncomeRatio = totalIncome > 0 ? (totalExpense / totalIncome) : 1;
    
    if (hasRegularIncome && expenseToIncomeRatio < 0.7) score += 30;
    else if (hasRegularIncome && expenseToIncomeRatio < 0.9) score += 20;
    else if (hasRegularIncome) score += 10;

    // Diversification (0-30 points)
    const categoryCount = expenseByCategory.length;
    if (categoryCount >= 5) score += 30;
    else if (categoryCount >= 3) score += 20;
    else if (categoryCount >= 1) score += 10;

    return Math.min(100, score);
  }, [savingsRate, totalIncome, totalExpense, expenseByCategory.length]);

  const healthStatus = useMemo(() => {
    if (healthScore >= 80) return { label: "Excellent", color: "text-success-600", bgColor: "bg-success-500" };
    if (healthScore >= 60) return { label: "Good", color: "text-primary-600", bgColor: "bg-primary-500" };
    if (healthScore >= 40) return { label: "Fair", color: "text-warning-600", bgColor: "bg-warning-500" };
    return { label: "Needs Improvement", color: "text-danger-600", bgColor: "bg-danger-500" };
  }, [healthScore]);

  /* ================= CHART COLORS ================= */

  const EXPENSE_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9'
  ];

  const INCOME_COLORS = [
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
  ];

  /* ================= AVERAGE TRANSACTION SIZE ================= */

  const avgIncome = useMemo(() => {
    const incomeTransactions = scopedTransactions.filter(t => t.type === "income");
    return incomeTransactions.length > 0 ? (totalIncome / incomeTransactions.length) : 0;
  }, [scopedTransactions, totalIncome]);

  const avgExpense = useMemo(() => {
    const expenseTransactions = scopedTransactions.filter(t => t.type === "expense");
    return expenseTransactions.length > 0 ? (totalExpense / expenseTransactions.length) : 0;
  }, [scopedTransactions, totalExpense]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  // Block guest users
  if (auth?.isGuest) {
    return <GuestRestricted featureName="Analytics" />;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Premium Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-dark-bg-primary dark:via-dark-surface-elevated dark:to-dark-surface-secondary rounded-2xl p-6 shadow-xl dark:shadow-elevated-dark border border-blue-500/20 dark:border-blue-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/10 dark:bg-blue-500/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/20 dark:border-blue-500/20 shadow-lg">
                <BarChart3 className="w-5 h-5 text-white dark:text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold text-white dark:bg-gradient-to-r dark:from-blue-400 dark:via-blue-300 dark:to-blue-500 dark:bg-clip-text dark:text-transparent">Financial Analytics</h1>
            </div>
            <p className="text-white/80 dark:text-blue-200/60 text-sm ml-14">Deep insights into your financial journey</p>
          </div>
          
          <div className="flex items-center gap-2.5">
            <select
              value={timeScope}
              onChange={(e) => setTimeScope(e.target.value)}
              className="bg-white bg-opacity-20 backdrop-blur-sm text-white text-sm border-2 border-white border-opacity-30 rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-opacity-50 transition-all cursor-pointer"
            >
              <option value="week" className="text-gray-900">Last 7 Days</option>
              <option value="month" className="text-gray-900">This Month</option>
              <option value="year" className="text-gray-900">This Year</option>
              <option value="all" className="text-gray-900">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Financial Health Score - Compact Professional Version */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-dark-surface-primary dark:to-dark-bg-primary rounded-xl p-4 shadow-card dark:shadow-glow-gold border border-gray-200 dark:border-dark-border-strong transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.01] hover:shadow-xl dark:hover:shadow-glow-gold">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Financial Health Score
            </h3>
            <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-0.5">Overall wellness assessment</p>
          </div>
          <div className={`px-2.5 py-1 rounded-full font-semibold text-xs ${healthStatus.color} bg-opacity-10 border`} style={{ backgroundColor: healthStatus.bgColor + '20', borderColor: healthStatus.bgColor + '40' }}>
            {healthStatus.label}
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Compact Circular Progress */}
          <div className="flex-shrink-0">
            <div className="relative w-28 h-28">
              <svg className="transform -rotate-90 w-28 h-28">
                <circle
                  cx="56"
                  cy="56"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-dark-surface-secondary"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(healthScore * 314) / 100} 314`}
                  className="text-green-500 dark:text-blue-400 transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{healthScore}</span>
                <span className="text-[10px] text-gray-500 dark:text-dark-text-tertiary font-medium">/ 100</span>
              </div>
            </div>
          </div>

          {/* Compact Score Breakdown */}
          <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                <span className="text-[11px] font-medium text-gray-600 dark:text-dark-text-tertiary">Savings Rate</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{savingsRate}%</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Wallet className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span className="text-[11px] font-medium text-gray-600 dark:text-dark-text-tertiary">Income Stability</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{totalIncome > 0 ? 'Good' : 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <PieChartIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span className="text-[11px] font-medium text-gray-600 dark:text-dark-text-tertiary">Spending Diversity</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{expenseByCategory.length} categories</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Target className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                <span className="text-[11px] font-medium text-gray-600 dark:text-dark-text-tertiary">Budget Control</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {totalExpense <= totalIncome ? 'On Track' : 'Overspending'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-success-500 to-success-600 rounded-xl p-4 shadow-lg border border-success-400/20 transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.03] hover:shadow-2xl dark:hover:shadow-glow-cyan-strong hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-2 rounded-lg">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="bg-success-700 bg-opacity-50 px-2.5 py-0.5 rounded-full">
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="w-2.5 h-2.5 text-white" />
                  <span className="text-xs font-semibold text-white">Income</span>
                </div>
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-2xl font-bold text-white">{formatCurrency(totalIncome)}</p>
              <p className="text-success-100 text-xs">Avg: {formatCurrency(avgIncome || 0)}</p>
            </div>
          </div>
        </div>

        {/* Total Expense */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-danger-500 to-danger-600 rounded-xl p-4 shadow-lg border border-danger-400/20 transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.03] hover:shadow-2xl dark:hover:shadow-glow-cyan-strong hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-2 rounded-lg">
                <TrendingDown className="w-4 h-4 text-white" />
              </div>
              <div className="bg-danger-700 bg-opacity-50 px-2.5 py-0.5 rounded-full">
                <div className="flex items-center gap-1">
                  <ArrowDownRight className="w-2.5 h-2.5 text-white" />
                  <span className="text-xs font-semibold text-white">Expense</span>
                </div>
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-2xl font-bold text-white">{formatCurrency(totalExpense)}</p>
              <p className="text-danger-100 text-xs">Avg: {formatCurrency(avgExpense || 0)}</p>
            </div>
          </div>
        </div>

        {/* Net Savings */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600 rounded-xl p-4 shadow-lg border border-blue-400/20 dark:border-blue-500/30 transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.03] hover:shadow-2xl dark:hover:shadow-glow-blue hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-2 rounded-lg">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <div className={`px-2.5 py-0.5 rounded-full ${netSavings >= 0 ? 'bg-success-500 bg-opacity-50' : 'bg-danger-500 bg-opacity-50'}`}>
                <span className="text-xs font-semibold text-white">
                  {netSavings >= 0 ? '+' : ''}{savingsRate}%
                </span>
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-2xl font-bold text-white dark:text-blue-300">{formatCurrency(netSavings)}</p>
              <p className="text-white/80 dark:text-blue-200/60 text-xs">Net Savings</p>
            </div>
          </div>
        </div>

        {/* Transaction Count */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-dark-surface-elevated dark:to-dark-surface-primary rounded-xl p-4 shadow-lg border border-indigo-400/20 dark:border-blue-500/20 transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.03] hover:shadow-2xl dark:hover:shadow-glow-blue hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-2 rounded-lg">
                <Activity className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-2xl font-bold text-white dark:text-blue-300">{scopedTransactions.length}</p>
              <p className="text-white/80 dark:text-blue-200/60 text-xs">Total Transactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Monthly Trend Line Chart */}
        <div className="bg-white dark:bg-dark-surface-primary rounded-xl p-4 shadow-lg dark:shadow-card-dark border border-gray-200 dark:border-dark-border-strong transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.01] hover:shadow-xl dark:hover:shadow-glow-blue">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUpIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                {trendTitle}
              </h3>
              <p className="text-xs text-gray-600 dark:text-dark-text-secondary mt-0.5">Income, Expenses & Savings over time</p>
            </div>
          </div>
          <div className="h-72">
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
                  <filter id="shadow" height="130%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                    <feOffset dx="0" dy="2" result="offsetblur"/>
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.2"/>
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="label" stroke="#6b7280" style={{ fontSize: '11px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  fill="url(#colorIncome)"
                  strokeWidth={2.5}
                  name="Income"
                  filter="url(#shadow)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  fill="url(#colorExpense)"
                  strokeWidth={2.5}
                  name="Expense"
                  filter="url(#shadow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Pie Chart */}
        <div className="bg-white dark:bg-dark-surface-primary rounded-xl p-4 shadow-lg dark:shadow-card-dark border border-gray-200 dark:border-dark-border-strong transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.01] hover:shadow-xl dark:hover:shadow-glow-gold">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                Expense Distribution
              </h3>
              <p className="text-xs text-gray-600 dark:text-dark-text-secondary mt-0.5">Breakdown by category</p>
            </div>
          </div>
          {expenseByCategory.length === 0 ? (
            <div className="h-72 flex items-center justify-center">
              <p className="text-gray-600 dark:text-dark-text-secondary text-sm">No expense data available</p>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="45%"
                    outerRadius={85}
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
                    height={30}
                    wrapperStyle={{ fontSize: '11px' }}
                    formatter={(value, entry) => `${value} (${entry.payload.percentage}%)`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Income Category Pie Chart */}
        <div className="bg-white dark:bg-dark-surface-primary rounded-xl p-4 shadow-lg dark:shadow-card-dark border border-gray-200 dark:border-dark-border-strong transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.01] hover:shadow-xl dark:hover:shadow-glow-gold">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                Income Sources
              </h3>
              <p className="text-xs text-gray-600 dark:text-dark-text-secondary mt-0.5">Breakdown by category</p>
            </div>
          </div>
          {incomeByCategory.length === 0 ? (
            <div className="h-72 flex items-center justify-center">
              <p className="text-gray-600 dark:text-dark-text-secondary text-sm">No income data available</p>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeByCategory}
                    cx="50%"
                    cy="45%"
                    outerRadius={85}
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
                    height={30}
                    wrapperStyle={{ fontSize: '11px' }}
                    formatter={(value, entry) => `${value} (${entry.payload.percentage}%)`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Daily Spending Pattern */}
        <div className="bg-white dark:bg-dark-surface-primary rounded-xl p-4 shadow-lg dark:shadow-card-dark border border-gray-200 dark:border-dark-border-strong transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.01] hover:shadow-xl dark:hover:shadow-glow-blue">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                {patternTitle}
              </h3>
              <p className="text-xs text-gray-600 dark:text-dark-text-secondary mt-0.5">{patternSubtitle}</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyPattern}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '11px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Expense Categories */}
        <div className="bg-white dark:bg-dark-surface-primary rounded-xl p-4 shadow-lg dark:shadow-card-dark border border-gray-200 dark:border-dark-border-strong transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.01] hover:shadow-xl dark:hover:shadow-glow-gold">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400" />
            Top Expense Categories
          </h3>
          <div className="space-y-3">
            {topExpenseCategories.length === 0 ? (
              <p className="text-gray-600 dark:text-dark-text-secondary text-sm">No expense data available</p>
            ) : (
              topExpenseCategories.map((cat, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 dark:text-dark-text-secondary">{cat.name}</span>
                    <div className="text-right">
                      <div className="text-xs font-bold text-gray-900 dark:text-dark-text-primary">{formatCurrency(cat.value)}</div>
                      <div className="text-xs text-gray-500 dark:text-dark-text-tertiary">{cat.percentage}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-surface-secondary rounded-full h-1.5 overflow-hidden shadow-inner">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500 shadow-sm"
                      style={{
                        inlineSize: `${cat.percentage}%`,
                        backgroundColor: EXPENSE_COLORS[index],
                        boxShadow: `0 0 8px ${EXPENSE_COLORS[index]}40`
                      }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Income Categories */}
        <div className="bg-white dark:bg-dark-surface-primary rounded-xl p-4 shadow-lg dark:shadow-card-dark border border-gray-200 dark:border-dark-border-default transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.01] hover:shadow-xl dark:hover:shadow-glow-gold">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
            Top Income Sources
          </h3>
          <div className="space-y-3">
            {topIncomeCategories.length === 0 ? (
              <p className="text-gray-600 dark:text-dark-text-secondary text-sm">No income data available</p>
            ) : (
              topIncomeCategories.map((cat, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 dark:text-dark-text-secondary">{cat.name}</span>
                    <div className="text-right">
                      <div className="text-xs font-bold text-gray-900 dark:text-white">{formatCurrency(cat.value)}</div>
                      <div className="text-xs text-gray-500 dark:text-dark-text-tertiary">{cat.percentage}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-surface-secondary rounded-full h-1.5 overflow-hidden shadow-inner">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500 shadow-sm"
                      style={{
                        inlineSize: `${cat.percentage}%`,
                        backgroundColor: INCOME_COLORS[index],
                        boxShadow: `0 0 8px ${INCOME_COLORS[index]}40`
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
};

export default Analytics;
