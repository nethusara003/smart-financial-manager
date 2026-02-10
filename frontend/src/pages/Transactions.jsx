import React, { useEffect, useState } from "react";
import TransactionForm from "../components/TransactionForm";
import { useCurrency } from "../context/CurrencyContext";
import {
  Search,
  Filter,
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  Edit,
  Trash2,
  Download,
  BarChart3,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  SlidersHorizontal,
  RefreshCw,
  DollarSign,
  AlertCircle,
  X
} from "lucide-react";

/* ================= CATEGORY BADGES ================= */

const CATEGORY_CONFIG = {
  // Expense categories
  food: { icon: "🍔", className: "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200", color: "emerald" },
  transport: { icon: "🚗", className: "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200", color: "blue" },
  rent: { icon: "🏠", className: "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-200", color: "yellow" },
  utilities: { icon: "⚡", className: "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200", color: "blue" },
  entertainment: { icon: "🎮", className: "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-orange-200", color: "orange" },
  healthcare: { icon: "🏥", className: "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200", color: "red" },
  education: { icon: "🎓", className: "bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 border-teal-200", color: "teal" },
  shopping: { icon: "🛍", className: "bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border-rose-200", color: "rose" },
  subscriptions: { icon: "📦", className: "bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border-slate-200", color: "slate" },
  // Income categories
  salary: { icon: "💼", className: "bg-gradient-to-r from-success-50 to-success-100 text-success-700 border-success-200", color: "success" },
  freelance: { icon: "💻", className: "bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 border-teal-200", color: "teal" },
  business: { icon: "🏢", className: "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border-primary-200", color: "primary" },
  investment: { icon: "📈", className: "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200", color: "emerald" },
  gift: { icon: "🎁", className: "bg-gradient-to-r from-fuchsia-50 to-fuchsia-100 text-fuchsia-700 border-fuchsia-200", color: "fuchsia" },
  "other income": { icon: "💰", className: "bg-gradient-to-r from-success-50 to-success-100 text-success-700 border-success-200", color: "success" },
  "other expense": { icon: "📊", className: "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200", color: "gray" },
  default: { icon: "📌", className: "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border-gray-200", color: "gray" },
};

const getBadge = (category) => {
  if (!category) return CATEGORY_CONFIG.default;
  return (
    CATEGORY_CONFIG[category.toLowerCase()] ||
    CATEGORY_CONFIG.default
  );
};

const Transactions = () => {
  const { formatCurrency } = useCurrency();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [month, setMonth] = useState("All");
  const [type, setType] = useState("All");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [txToDelete, setTxToDelete] = useState(null);

  /* ================= FETCH ================= */

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

  useEffect(() => {
    fetchTransactions();
  }, []);

  /* ================= DELETE ================= */

  const handleDeleteClick = (tx) => {
    setTxToDelete(tx);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!txToDelete) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/transactions/${txToDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTransactions();
      setShowDeleteModal(false);
      setTxToDelete(null);
    } catch {
      alert("Failed to delete transaction");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTxToDelete(null);
  };

  /* ================= FILTER ================= */

  const filteredTransactions = transactions.filter((tx) => {
    // Search filter
    const searchMatch = searchTerm === "" || 
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.note && tx.note.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Month filter
    const txMonth = new Date(tx.date).getMonth() + 1;
    const monthMatch = month === "All" ? true : txMonth === Number(month);
    
    // Type filter
    const typeMatch = type === "All" ? true : tx.type === type;
    
    // Category filter
    const categoryMatch = category === "All" ? true : tx.category === category;
    
    return searchMatch && monthMatch && typeMatch && categoryMatch;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'amount':
        aValue = Number(a.amount);
        bValue = Number(b.amount);
        break;
      case 'category':
        aValue = a.category.toLowerCase();
        bValue = b.category.toLowerCase();
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      default: // date
        aValue = new Date(a.date);
        bValue = new Date(b.date);
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Calculate statistics
  const stats = {
    total: filteredTransactions.length,
    income: filteredTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + Number(tx.amount), 0),
    expense: filteredTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + Number(tx.amount), 0),
    incomeCount: filteredTransactions.filter(tx => tx.type === 'income').length,
    expenseCount: filteredTransactions.filter(tx => tx.type === 'expense').length
  };
  
  const balance = stats.income - stats.expense;

  // Get unique categories for filter
  const uniqueCategories = [...new Set(transactions.map(tx => tx.category))].sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg-primary via-light-surface-primary to-light-bg-accent dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-tertiary p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header with enhanced styling */}
        <div className="bg-light-surface-secondary dark:bg-dark-surface-primary rounded-xl shadow-premium dark:shadow-card-dark border border-light-border-default dark:border-dark-border-strong p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-6 rounded-full bg-gradient-to-b from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 dark:shadow-glow-blue"></div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-light-text-primary to-light-text-secondary dark:from-white dark:to-blue-300 bg-clip-text text-transparent">
                  Transaction Management
                </h1>
              </div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-medium ml-4">
                Track, analyze and manage all your financial activities
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-sm ${
                  showFilters 
                    ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-200 dark:shadow-glow-blue' 
                    : 'bg-light-surface-hover dark:bg-dark-surface-hover text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-accent dark:hover:bg-dark-surface-elevated border border-light-border-default dark:border-dark-border-default'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
              <button
                onClick={() => {
                  setEditingTx(null);
                  setShowModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-success-500 to-emerald-600 hover:from-success-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-success-200 dark:shadow-success-900/20 flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Transaction
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Transactions */}
          <div className="bg-light-surface-secondary dark:bg-dark-surface-primary rounded-xl p-4 shadow-lg dark:shadow-card-dark border border-light-border-default dark:border-dark-border-strong hover:shadow-xl dark:hover:shadow-glow-gold transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-500/10 dark:to-blue-500/20 border border-blue-200 dark:border-blue-500/20">
                <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">Total Transactions</p>
                <p className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">{stats.total}</p>
              </div>
            </div>
          </div>

          {/* Total Income */}
          <div className="bg-light-surface-secondary dark:bg-dark-surface-primary rounded-xl p-4 shadow-lg dark:shadow-card-dark border border-light-border-default dark:border-dark-border-strong hover:shadow-xl dark:hover:shadow-glow-gold transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-success-100 to-success-200 dark:from-success-900/30 dark:to-success-800/30 border border-success-200 dark:border-success-500/30">
                <TrendingUp className="w-4 h-4 text-success-600 dark:text-success-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">Total Income</p>
                <p className="text-xl font-bold text-success-600 dark:text-success-400">{formatCurrency(stats.income)}</p>
                <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">{stats.incomeCount} transactions</p>
              </div>
            </div>
          </div>

          {/* Total Expense */}
          <div className="bg-light-surface-secondary dark:bg-dark-surface-primary rounded-xl p-4 shadow-lg dark:shadow-card-dark border border-light-border-default dark:border-dark-border-strong hover:shadow-xl dark:hover:shadow-glow-gold transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-danger-100 to-danger-200 dark:from-danger-900/30 dark:to-danger-800/30 border border-danger-200 dark:border-danger-500/30">
                <TrendingDown className="w-4 h-4 text-danger-600 dark:text-danger-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">Total Expense</p>
                <p className="text-xl font-bold text-danger-600 dark:text-danger-400">{formatCurrency(stats.expense)}</p>
                <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">{stats.expenseCount} transactions</p>
              </div>
            </div>
          </div>

          {/* Net Balance */}
          <div className="bg-light-surface-secondary dark:bg-dark-surface-primary rounded-xl p-4 shadow-lg dark:shadow-card-dark border border-light-border-default dark:border-dark-border-strong hover:shadow-xl dark:hover:shadow-glow-gold transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg border ${
                balance >= 0 
                  ? 'bg-gradient-to-br from-success-100 to-success-200 dark:from-success-900/30 dark:to-success-800/30 border-success-200 dark:border-success-500/30' 
                  : 'bg-gradient-to-br from-warning-100 to-warning-200 dark:from-warning-900/30 dark:to-warning-800/30 border-warning-200 dark:border-warning-500/30'
              }`}>
                <DollarSign className={`w-4 h-4 ${
                  balance >= 0 ? 'text-success-600 dark:text-success-400' : 'text-warning-600 dark:text-warning-400'
                }`} />
              </div>
              <div>
                <p className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">Net Balance</p>
                <p className={`text-xl font-bold ${
                  balance >= 0 ? 'text-success-600 dark:text-success-400' : 'text-warning-600 dark:text-warning-400'
                }`}>
                  {formatCurrency(Math.abs(balance))}
                </p>
                <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                  {balance >= 0 ? 'Positive' : 'Negative'} balance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        {showFilters && (
          <div className="bg-light-surface-secondary dark:bg-dark-surface-primary rounded-xl shadow-premium dark:shadow-card-dark border border-light-border-default dark:border-dark-border-strong p-4 animate-in">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary">Filter & Search</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-light-text-primary dark:text-dark-text-primary mb-1.5">Search</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary" />
                  <input
                    type="text"
                    placeholder="Search by category or note..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary rounded-lg text-sm focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Month Filter */}
              <div>
                <label className="block text-xs font-medium text-light-text-primary dark:text-dark-text-primary mb-1.5">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-3 py-2.5 border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary rounded-lg text-sm focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                >
                  <option value="All">All Months</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={i + 1}>
                      {new Date(0, i).toLocaleString("default", { month: "long" })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-xs font-medium text-light-text-primary dark:text-dark-text-primary mb-1.5">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2.5 border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary rounded-lg text-sm focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                >
                  <option value="All">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-medium text-light-text-primary dark:text-dark-text-primary mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary rounded-lg text-sm focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                >
                  <option value="All">All Categories</option>
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-light-border-default dark:border-dark-border-default">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-light-text-primary dark:text-dark-text-primary">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2.5 py-1.5 border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary rounded-lg text-sm focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="category">Category</option>
                  <option value="type">Type</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-2.5 py-1.5 bg-light-surface-hover dark:bg-dark-surface-hover text-light-text-primary dark:text-dark-text-primary rounded-lg text-sm hover:bg-light-bg-accent dark:hover:bg-dark-surface-elevated border border-light-border-default dark:border-dark-border-default transition-colors"
                >
                  {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                </button>
              </div>
              
              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setMonth('All');
                  setType('All');
                  setCategory('All');
                  setSortBy('date');
                  setSortOrder('desc');
                }}
                className="px-3 py-1.5 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary text-sm transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Transaction Table */}
        <div className="bg-light-surface-secondary dark:bg-dark-surface-primary rounded-xl shadow-premium dark:shadow-card-dark border border-light-border-default dark:border-dark-border-strong overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-light-bg-accent to-light-surface-hover dark:from-dark-surface-elevated dark:to-dark-surface-secondary border-b border-light-border-default dark:border-dark-border-strong">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary">
                Transactions ({sortedTransactions.length})
              </h3>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary text-sm transition-colors flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
              <p className="mt-3 text-light-text-secondary dark:text-dark-text-secondary font-medium text-sm">Loading transactions...</p>
            </div>
          ) : sortedTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-light-surface-hover dark:bg-dark-surface-hover flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-light-text-tertiary dark:text-dark-text-tertiary" />
              </div>
              <p className="text-light-text-secondary dark:text-dark-text-secondary font-medium text-sm">No transactions found</p>
              <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-xs mt-1">Try adjusting your filters or add your first transaction</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-light-bg-accent dark:bg-dark-surface-elevated border-b border-light-border-default dark:border-dark-border-strong">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-light-text-primary dark:text-dark-text-primary">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-light-text-primary dark:text-dark-text-primary">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-light-text-primary dark:text-dark-text-primary">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-light-text-primary dark:text-dark-text-primary">Note</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-light-text-primary dark:text-dark-text-primary">Amount</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-light-text-primary dark:text-dark-text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border-default dark:divide-dark-border-default">
                  {sortedTransactions.map((tx) => {
                    const badge = getBadge(tx.category);
                    const isIncome = tx.type === 'income';
                    
                    return (
                      <tr
                        key={tx._id}
                        className="hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover transition-colors group"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-light-text-tertiary dark:text-dark-text-tertiary" />
                            <span className="text-sm text-light-text-primary dark:text-dark-text-primary font-medium">
                              {new Date(tx.date).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isIncome 
                              ? 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 border border-success-200 dark:border-success-500/30'
                              : 'bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400 border border-danger-200 dark:border-danger-500/30'
                          }`}>
                            {isIncome ? (
                              <ArrowUpRight className="w-2.5 h-2.5" />
                            ) : (
                              <ArrowDownLeft className="w-2.5 h-2.5" />
                            )}
                            {tx.type}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.className}`}>
                            <span>{badge.icon}</span>
                            {tx.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary max-w-xs truncate">
                            {tx.note || <span className="text-light-text-tertiary dark:text-dark-text-tertiary italic">No note</span>}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-base font-bold ${
                            isIncome ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
                          }`}>
                            {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingTx(tx);
                                setShowModal(true);
                              }}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Edit transaction"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(tx)}
                              className="p-1.5 text-danger-600 dark:text-danger-400 hover:text-danger-800 dark:hover:text-danger-300 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
                              title="Delete transaction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Premium Delete Confirmation Modal */}
        {showDeleteModal && txToDelete && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-light-surface-primary dark:bg-dark-surface-primary rounded-2xl shadow-2xl dark:shadow-[0_0_50px_rgba(59,130,246,0.3)] border border-light-border-default dark:border-blue-500/30 max-w-md w-full transform transition-all duration-300 animate-slide-up">
              <div className="p-6 border-b border-light-border-subtle dark:border-dark-border-default">
                <div className="flex items-center gap-3">
                  <div className="bg-danger-100 dark:bg-danger-900/30 p-3 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-danger-600 dark:text-danger-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">Delete Transaction</h3>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">This action cannot be undone</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6 bg-light-bg-accent dark:bg-dark-surface-secondary rounded-xl p-4 border border-light-border-default dark:border-dark-border-default">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Category</span>
                    <span className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary">{txToDelete.category}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Type</span>
                    <span className={`text-sm font-bold ${
                      txToDelete.type === 'income' 
                        ? 'text-success-600 dark:text-success-400' 
                        : 'text-danger-600 dark:text-danger-400'
                    }`}>{txToDelete.type}</span>
                  </div>
                  <div className="pt-2 border-t border-light-border-subtle dark:border-dark-border-default">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Amount</span>
                      <span className={`text-xl font-bold ${
                        txToDelete.type === 'income' 
                          ? 'text-success-600 dark:text-success-400' 
                          : 'text-danger-600 dark:text-danger-400'
                      }`}>{formatCurrency(txToDelete.amount)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-light-text-primary dark:text-dark-text-primary mb-6">
                  Are you sure you want to delete this transaction? This will permanently remove it from your records.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-2.5 bg-light-bg-accent dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary rounded-lg font-semibold hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-all duration-200 border border-light-border-default dark:border-dark-border-strong"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-danger-500 to-danger-600 hover:from-danger-600 hover:to-danger-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Premium Edit/Add Transaction Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-light-surface-primary dark:bg-dark-surface-primary rounded-2xl w-full max-w-2xl shadow-2xl dark:shadow-[0_0_50px_rgba(59,130,246,0.3)] border border-light-border-default dark:border-blue-500/30 max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slide-up">
              <div className="sticky top-0 z-10 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 dark:from-dark-bg-secondary dark:via-dark-surface-elevated dark:to-dark-bg-secondary px-6 py-5 border-b border-blue-200 dark:border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/20 dark:bg-blue-500/20 p-2.5 rounded-xl border border-blue-500/30 dark:border-blue-500/30">
                      {editingTx ? <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-light-text-primary to-light-text-secondary dark:from-white dark:to-blue-300 bg-clip-text text-transparent">
                        {editingTx ? "Edit Transaction" : "Add New Transaction"}
                      </h2>
                      <p className="text-xs text-light-text-secondary dark:text-blue-200/80">
                        {editingTx ? "Update your transaction details" : "Record a new financial activity"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingTx(null);
                    }}
                    className="p-2 hover:bg-blue-200/50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <TransactionForm
                  initialData={editingTx}
                  onSuccess={() => {
                    setShowModal(false);
                    setEditingTx(null);
                    fetchTransactions();
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
