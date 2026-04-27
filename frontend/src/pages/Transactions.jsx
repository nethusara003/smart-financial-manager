import React, { useState } from "react";
import TransactionForm from "../components/TransactionForm";
import { useCurrency } from "../context/CurrencyContext";
import GuestRestricted from '../components/GuestRestricted';
import { ContextMenu, InlineEditor, useToast } from "../components/ui";
import { useDeleteTransaction, useTransactions } from "../hooks/useTransactions";
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
  X,
  Receipt,
  MoreVertical
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
  "loan payment": { icon: "🏦", className: "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200", color: "purple" },
  wallet_topup: { icon: "💳", className: "bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border-indigo-200", color: "indigo" },
  wallet_withdrawal: { icon: "🏧", className: "bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-700 border-cyan-200", color: "cyan" },
  wallet_transfer_sent: { icon: "↗", className: "bg-gradient-to-r from-violet-50 to-violet-100 text-violet-700 border-violet-200", color: "violet" },
  wallet_transfer_received: { icon: "↘", className: "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200", color: "emerald" },
  wallet_transfer_reversal_in: { icon: "↩", className: "bg-gradient-to-r from-lime-50 to-lime-100 text-lime-700 border-lime-200", color: "lime" },
  wallet_transfer_reversal_out: { icon: "↪", className: "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200", color: "amber" },
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

const isWalletOnlyMovement = (tx) => {
  const category = String(tx?.category || "").toLowerCase();
  return tx?.scope === "wallet" || category.startsWith("wallet_transfer") || tx?.isTransfer;
};

const isProtectedSystemEntry = (tx) =>
  Boolean(
    tx?.systemManaged ||
      tx?.isTransfer ||
      String(tx?.category || "").toLowerCase().startsWith("wallet_")
  );

const SCOPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "savings", label: "Savings" },
  { value: "wallet", label: "Wallet" },
];

const Transactions = ({ auth }) => {
  const toast = useToast();
  const { formatCurrency } = useCurrency();
  const [scopeFilter, setScopeFilter] = useState("all");
  const {
    data: transactions = [],
    isLoading: loading,
    error: transactionsError,
  } = useTransactions({ scope: scopeFilter });
  const deleteTransactionMutation = useDeleteTransaction();
  const [searchTerm, setSearchTerm] = useState("");
  const [month, setMonth] = useState("All");
  const [type, setType] = useState("All");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingTx, setEditingTx] = useState(null);
  const [txToDelete, setTxToDelete] = useState(null);

  /* ================= DELETE ================= */

  const handleDeleteClick = (tx) => {
    setTxToDelete(tx);
    setActiveAction("delete");
    setActiveMenuId(null);
  };

  const confirmDelete = async () => {
    if (!txToDelete) return;

    try {
      await deleteTransactionMutation.mutateAsync(txToDelete._id);
      setActiveAction(null);
      setTxToDelete(null);
      toast.success("Transaction deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete transaction");
    }
  };

  const cancelDelete = () => {
    setActiveAction(null);
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
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        // If dates are the same, use createdAt as tiebreaker
        if (aValue === bValue) {
          aValue = new Date(a.createdAt || a.date).getTime();
          bValue = new Date(b.createdAt || b.date).getTime();
        }
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Calculate statistics
  const statsSourceTransactions =
    scopeFilter === "wallet"
      ? filteredTransactions
      : filteredTransactions.filter((tx) => !isWalletOnlyMovement(tx));

  const statsScopeLabel = scopeFilter === "wallet" ? "Wallet" : "Savings";
  const tableScopeLabel =
    scopeFilter === "all"
      ? "All"
      : scopeFilter === "wallet"
      ? "Wallet"
      : "Savings";

  const stats = {
    total: filteredTransactions.length,
    income: statsSourceTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + Number(tx.amount), 0),
    expense: statsSourceTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + Number(tx.amount), 0),
    incomeCount: statsSourceTransactions.filter(tx => tx.type === 'income').length,
    expenseCount: statsSourceTransactions.filter(tx => tx.type === 'expense').length
  };
  
  const balance = stats.income - stats.expense;

  // Get unique categories for filter
  const uniqueCategories = [...new Set(transactions.map(tx => tx.category))].sort();

  // Block guest users
  if (auth?.isGuest) {
    return <GuestRestricted featureName="Transactions" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg-primary via-light-surface-primary to-light-bg-accent dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-tertiary p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-dark-bg-primary dark:via-dark-surface-elevated dark:to-dark-surface-secondary rounded-2xl p-6 shadow-xl dark:shadow-elevated-dark border border-blue-500/20 dark:border-blue-500/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/10 dark:bg-blue-500/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/20 dark:border-blue-500/20 shadow-lg">
                  <Receipt className="w-5 h-5 text-white dark:text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-white dark:bg-gradient-to-r dark:from-blue-400 dark:via-blue-300 dark:to-blue-500 dark:bg-clip-text dark:text-transparent">
                  Transaction Management
                </h1>
              </div>
              <p className="text-white/80 dark:text-blue-200/60 text-sm ml-14">
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
                  setActiveAction("create");
                }}
                data-testid="open-add-transaction-button"
                className="px-4 py-2 bg-gradient-to-r from-success-500 to-emerald-600 hover:from-success-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-success-200 dark:shadow-success-900/20 flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Transaction
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {transactionsError && (
          <div className="rounded-xl border border-danger-200 dark:border-danger-500/30 bg-danger-50 dark:bg-danger-900/20 px-4 py-3 text-sm text-danger-700 dark:text-danger-200">
            {transactionsError.message || "Failed to load transactions."}
          </div>
        )}

        <div className="bg-light-surface-secondary dark:bg-dark-surface-primary rounded-xl p-3 shadow-lg dark:shadow-card-dark border border-light-border-default dark:border-dark-border-strong">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">
              <Eye className="w-3.5 h-3.5" />
              Scope View
            </div>
            <div className="inline-flex rounded-lg border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary p-1">
              {SCOPE_OPTIONS.map((option) => {
                const isActive = scopeFilter === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setScopeFilter(option.value)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white shadow"
                        : "text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          {scopeFilter === "all" && (
            <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-light-text-tertiary dark:text-dark-text-tertiary">
              <AlertCircle className="h-3.5 w-3.5" />
              KPI cards stay savings-focused in All view to avoid wallet-transfer inflation.
            </p>
          )}
        </div>

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
                <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">{stats.incomeCount} {statsScopeLabel.toLowerCase()} transactions</p>
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
                <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">{stats.expenseCount} {statsScopeLabel.toLowerCase()} transactions</p>
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
                Transactions ({sortedTransactions.length}) - {tableScopeLabel} Scope
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
                    const walletOnly = isWalletOnlyMovement(tx);
                    const protectedEntry = isProtectedSystemEntry(tx);
                    
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
                          {walletOnly && (
                            <p className="mt-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">Wallet movement</p>
                          )}
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
                          <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {protectedEntry ? (
                              <span className="text-[11px] font-medium text-light-text-tertiary dark:text-dark-text-tertiary">
                                Auto record
                              </span>
                            ) : (
                              <ContextMenu
                                isOpen={activeMenuId === tx._id}
                                onOpenChange={(open) => setActiveMenuId(open ? tx._id : null)}
                                icon={<MoreVertical className="w-3.5 h-3.5" />}
                                buttonClassName="p-1.5"
                                items={[
                                  {
                                    key: "edit",
                                    label: "Edit Transaction",
                                    onClick: () => {
                                      setEditingTx(tx);
                                      setActiveAction("edit");
                                    },
                                  },
                                  {
                                    key: "delete",
                                    label: "Delete Transaction",
                                    onClick: () => handleDeleteClick(tx),
                                    variant: "danger",
                                  },
                                ]}
                              />
                            )}
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
        <InlineEditor
          isOpen={activeAction === "delete" && Boolean(txToDelete)}
          title="Delete Transaction"
          subtitle="This action cannot be undone"
          onClose={cancelDelete}
          className="max-w-xl"
        >
          {txToDelete && (
            <div>
              <div className="mb-6 bg-light-bg-accent dark:bg-dark-surface-secondary rounded-xl p-4 border border-light-border-default dark:border-dark-border-default">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Category</span>
                  <span className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary">{txToDelete.category}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Type</span>
                  <span className={`text-sm font-bold ${
                    txToDelete.type === 'income' ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
                  }`}>{txToDelete.type}</span>
                </div>
                <div className="pt-2 border-t border-light-border-subtle dark:border-dark-border-default">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Amount</span>
                    <span className={`text-xl font-bold ${
                      txToDelete.type === 'income' ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
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
                  disabled={deleteTransactionMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-danger-500 to-danger-600 hover:from-danger-600 hover:to-danger-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {deleteTransactionMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          )}
        </InlineEditor>

        <InlineEditor
          isOpen={activeAction === "create" || activeAction === "edit"}
          title={editingTx ? "Edit Transaction" : "Add New Transaction"}
          subtitle={editingTx ? "Update your transaction details" : "Record a new financial activity"}
          onClose={() => {
            setActiveAction(null);
            setEditingTx(null);
          }}
        >
          <TransactionForm
            key={editingTx?._id || "new-transaction"}
            initialData={editingTx}
            onSuccess={() => {
              setActiveAction(null);
              setEditingTx(null);
            }}
          />
        </InlineEditor>
      </div>
    </div>
  );
};

export default Transactions;
