import React, { useState, useEffect } from "react";
import { useCurrency } from "../context/CurrencyContext";
import GuestRestricted from '../components/GuestRestricted';
import { 
  PieChart, 
  Target, 
  TrendingDown, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  Percent,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  ShoppingCart,
  Home,
  Utensils,
  Car,
  Heart,
  Smartphone,
  Film,
  Briefcase,
  X
} from "lucide-react";

const Budgets = ({ auth }) => {
  const { formatCurrency } = useCurrency();
  const [budgets, setBudgets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly',
    alertThreshold: 80,
    icon: 'ShoppingCart',
    color: 'cyan'
  });

  const categoryIcons = {
    ShoppingCart: ShoppingCart,
    Home: Home,
    Utensils: Utensils,
    Car: Car,
    Heart: Heart,
    Smartphone: Smartphone,
    Film: Film,
    Briefcase: Briefcase,
    DollarSign: DollarSign
  };

  const categoryColors = {
    cyan: { bg: 'bg-blue-100 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/20' },
    success: { bg: 'bg-success-100 dark:bg-success-900/30', text: 'text-success-600 dark:text-success-400', border: 'border-success-200 dark:border-success-500/30' },
    warning: { bg: 'bg-warning-100 dark:bg-warning-900/30', text: 'text-warning-600 dark:text-warning-400', border: 'border-warning-200 dark:border-warning-500/30' },
    danger: { bg: 'bg-danger-100 dark:bg-danger-900/30', text: 'text-danger-600 dark:text-danger-400', border: 'border-danger-200 dark:border-danger-500/30' },
    primary: { bg: 'bg-blue-100 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/20' }
  };

  useEffect(() => {
    fetchTransactions();
    fetchBudgets();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgets = () => {
    const stored = localStorage.getItem("budgets");
    if (stored) {
      setBudgets(JSON.parse(stored));
    }
  };

  const saveBudgets = (newBudgets) => {
    localStorage.setItem("budgets", JSON.stringify(newBudgets));
    setBudgets(newBudgets);
  };

  const calculateSpent = (category, period) => {
    const now = new Date();
    const filtered = transactions.filter(t => {
      const tDate = new Date(t.date);
      const categoryMatch = t.category.toLowerCase() === category.toLowerCase();
      
      if (period === 'monthly') {
        return categoryMatch && 
               tDate.getMonth() === now.getMonth() && 
               tDate.getFullYear() === now.getFullYear() &&
               t.type === 'expense';
      } else if (period === 'weekly') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return categoryMatch && tDate >= weekAgo && t.type === 'expense';
      }
      return categoryMatch && t.type === 'expense';
    });

    return filtered.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newBudget = {
      id: editingBudget?.id || Date.now(),
      ...formData,
      limit: Number(formData.limit),
      createdAt: editingBudget?.createdAt || new Date().toISOString()
    };

    const updatedBudgets = editingBudget
      ? budgets.map(b => b.id === editingBudget.id ? newBudget : b)
      : [...budgets, newBudget];

    saveBudgets(updatedBudgets);
    setShowModal(false);
    setEditingBudget(null);
    setFormData({
      category: '',
      limit: '',
      period: 'monthly',
      alertThreshold: 80,
      icon: 'ShoppingCart',
      color: 'cyan'
    });
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData(budget);
    setShowModal(true);
  };

  const handleDelete = (budget) => {
    setBudgetToDelete(budget);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (budgetToDelete) {
      saveBudgets(budgets.filter(b => b.id !== budgetToDelete.id));
      setShowDeleteModal(false);
      setBudgetToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setBudgetToDelete(null);
  };

  const getTotalBudget = () => budgets.reduce((sum, b) => sum + b.limit, 0);
  const getTotalSpent = () => budgets.reduce((sum, b) => sum + calculateSpent(b.category, b.period), 0);
  const getOverBudgetCount = () => budgets.filter(b => {
    const spent = calculateSpent(b.category, b.period);
    return spent > b.limit;
  }).length;

    if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 dark:border-blue-400 border-t-transparent"></div>
          <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary font-medium">Loading budgets...</p>
        </div>
      </div>
    );
  }

  // Block guest users
  if (auth?.isGuest) {
    return <GuestRestricted featureName="Budgets" />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-dark-bg-primary via-dark-bg-secondary to-dark-bg-tertiary rounded-2xl p-8 shadow-elevated dark:shadow-elevated-dark border border-dark-border-strong/30">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-500/20 dark:bg-blue-500/20 backdrop-blur-sm p-3 rounded-xl border border-blue-500/30 dark:border-blue-500/30 shadow-md dark:shadow-glow-blue">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-light-text-primary to-light-text-secondary dark:from-white dark:to-blue-300 bg-clip-text text-transparent">Budget Management</h1>
                <p className="text-light-text-secondary dark:text-blue-200/80 text-lg">Control spending with smart category limits</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 dark:shadow-glow-blue hover:shadow-xl dark:hover:shadow-glow-blue-strong transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Budget
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-light-surface-secondary dark:bg-dark-surface-primary rounded-2xl p-6 shadow-premium dark:shadow-card-dark border border-light-border-default dark:border-dark-border-strong transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.02] hover:shadow-2xl dark:hover:shadow-glow-blue-strong">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 dark:bg-blue-500/10 p-3 rounded-xl border border-blue-200 dark:border-blue-500/20">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Budget</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{formatCurrency(getTotalBudget())}</p>
            </div>
          </div>
        </div>

        <div className="bg-light-surface-secondary dark:bg-dark-surface-primary rounded-2xl p-6 shadow-premium dark:shadow-card-dark border border-light-border-default dark:border-dark-border-strong transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.02] hover:shadow-2xl dark:hover:shadow-glow-blue-strong">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-warning-100 dark:bg-warning-900/30 p-3 rounded-xl border border-warning-200 dark:border-warning-500/30">
              <TrendingDown className="w-5 h-5 text-warning-600 dark:text-warning-400" />
            </div>
            <div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Spent</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{formatCurrency(getTotalSpent())}</p>
            </div>
          </div>
        </div>

        <div className="bg-light-surface-secondary dark:bg-dark-surface-primary rounded-2xl p-6 shadow-premium dark:shadow-card-dark border border-light-border-default dark:border-dark-border-strong transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.02] hover:shadow-2xl dark:hover:shadow-glow-blue-strong">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-xl border ${getOverBudgetCount() > 0 ? 'bg-danger-100 dark:bg-danger-900/30 border-danger-200 dark:border-danger-500/30' : 'bg-success-100 dark:bg-success-900/30 border-success-200 dark:border-success-500/30'}`}>
              {getOverBudgetCount() > 0 ? (
                <AlertCircle className="w-5 h-5 text-danger-600 dark:text-danger-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-success-600 dark:text-success-400" />
              )}
            </div>
            <div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Over Budget</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{getOverBudgetCount()} / {budgets.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget List */}
      {budgets.length === 0 ? (
        <div className="bg-light-surface-secondary dark:bg-dark-surface-primary rounded-2xl p-12 text-center shadow-premium dark:shadow-card-dark border border-light-border-default dark:border-dark-border-strong transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.01] hover:shadow-2xl dark:hover:shadow-glow-blue-strong">
          <div className="bg-blue-100 dark:bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-blue-500/20">
            <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">No Budgets Yet</h3>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">Create your first budget to start tracking spending limits</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 dark:shadow-glow-blue hover:shadow-xl transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {budgets.map(budget => {
            const spent = calculateSpent(budget.category, budget.period);
            const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
            const isOverBudget = spent > budget.limit;
            const isNearLimit = percentage >= budget.alertThreshold && !isOverBudget;
            const IconComponent = categoryIcons[budget.icon] || ShoppingCart;
            const colors = categoryColors[budget.color] || categoryColors.cyan;

            return (
              <div
                key={budget.id}
                className="bg-light-surface-secondary dark:bg-dark-surface-primary rounded-2xl p-6 shadow-premium dark:shadow-card-dark border border-light-border-default dark:border-dark-border-strong transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.02] hover:shadow-2xl dark:hover:shadow-glow-blue-strong group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`${colors.bg} p-3 rounded-xl border ${colors.border}`}>
                      <IconComponent className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">{budget.category}</h3>
                      <div className="flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        <Calendar className="w-3 h-3" />
                        <span className="capitalize">{budget.period}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="p-2 hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget)}
                      className="p-2 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-danger-600 dark:text-danger-400" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">Spent</p>
                      <p className={`text-2xl font-bold ${isOverBudget ? 'text-danger-600 dark:text-danger-400' : 'text-light-text-primary dark:text-dark-text-primary'}`}>
                        {formatCurrency(spent)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">Budget</p>
                      <p className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
                        {formatCurrency(budget.limit)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                        {percentage.toFixed(1)}% used
                      </span>
                      <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                        {formatCurrency(budget.limit - spent)} left
                      </span>
                    </div>
                    <div className="w-full bg-light-bg-accent dark:bg-dark-surface-secondary rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          isOverBudget
                            ? 'bg-gradient-to-r from-danger-500 to-danger-600'
                            : isNearLimit
                            ? 'bg-gradient-to-r from-warning-500 to-warning-600'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {isOverBudget ? (
                    <div className="flex items-center gap-2 p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-500/30 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-danger-600 dark:text-danger-400" />
                      <span className="text-sm font-medium text-danger-700 dark:text-danger-300">
                        Over budget by {formatCurrency(spent - budget.limit)}
                      </span>
                    </div>
                  ) : isNearLimit ? (
                    <div className="flex items-center gap-2 p-3 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-500/30 rounded-xl">
                      <Zap className="w-4 h-4 text-warning-600 dark:text-warning-400" />
                      <span className="text-sm font-medium text-warning-700 dark:text-warning-300">
                        Approaching limit ({budget.alertThreshold}% threshold)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-500/30 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-success-600 dark:text-success-400" />
                      <span className="text-sm font-medium text-success-700 dark:text-success-300">
                        Within budget
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Budget Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-light-surface-secondary dark:bg-dark-surface-primary rounded-2xl shadow-elevated dark:shadow-elevated-dark border border-light-border-default dark:border-dark-border-strong w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-light-border-default dark:border-dark-border-strong flex items-center justify-between sticky top-0 bg-light-surface-secondary dark:bg-dark-surface-primary z-10">
              <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                {editingBudget ? 'Edit Budget' : 'Create New Budget'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingBudget(null);
                  setFormData({
                    category: '',
                    limit: '',
                    period: 'monthly',
                    alertThreshold: 80,
                    icon: 'ShoppingCart',
                    color: 'cyan'
                  });
                }}
                className="p-2 hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 transition-all\"
                  placeholder="e.g., Groceries, Transport, Entertainment"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                  Budget Limit
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 transition-all\"
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                    Time Period
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 transition-all\"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                    Alert Threshold (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.alertThreshold}
                    onChange={(e) => setFormData({ ...formData, alertThreshold: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-light-border-default dark:border-dark-border-default bg-light-surface-primary dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 transition-all\"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
                  Icon
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(categoryIcons).map(([key, IconComponent]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: key })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.icon === key
                          ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                          : 'border-light-border-default dark:border-dark-border-default hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                    >
                      {React.createElement(IconComponent, {
                        className: `w-6 h-6 mx-auto ${formData.icon === key ? 'text-blue-600 dark:text-blue-400' : 'text-light-text-secondary dark:text-dark-text-secondary'}`
                      })}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
                  Color Theme
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(categoryColors).map(([key, { bg, border }]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: key })}
                      className={`p-4 rounded-xl border-2 transition-all ${bg} ${
                        formData.color === key
                          ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 dark:ring-blue-500/20'
                          : `${border} hover:border-blue-300 dark:hover:border-blue-700`
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full mx-auto" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBudget(null);
                  }}
                  className="flex-1 px-6 py-3 border border-light-border-default dark:border-dark-border-default text-light-text-primary dark:text-dark-text-primary rounded-xl font-semibold hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 dark:shadow-glow-blue hover:shadow-xl transition-all"
                >
                  {editingBudget ? 'Update Budget' : 'Create Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Premium Delete Budget Confirmation Modal */}
      {showDeleteModal && budgetToDelete && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-light-surface-primary dark:bg-dark-surface-primary rounded-2xl shadow-2xl dark:shadow-[0_0_50px_rgba(37,99,235,0.3)] border border-light-border-default dark:border-blue-500/30 max-w-md w-full transform transition-all duration-300 animate-slide-up">
            <div className="p-6 border-b border-light-border-subtle dark:border-dark-border-default">
              <div className="flex items-center gap-3">
                <div className="bg-danger-100 dark:bg-danger-900/30 p-3 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-danger-600 dark:text-danger-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">Delete Budget</h3>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">This action cannot be undone</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6 bg-light-bg-accent dark:bg-dark-surface-secondary rounded-xl p-4 border border-light-border-default dark:border-dark-border-default">
                <div className="flex items-center gap-3 mb-3">
                  {(() => {
                    const IconComponent = categoryIcons[budgetToDelete.icon];
                    return IconComponent ? <IconComponent className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" /> : null;
                  })()}
                  <h4 className="font-bold text-light-text-primary dark:text-dark-text-primary capitalize">{budgetToDelete.category}</h4>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-light-border-subtle dark:border-dark-border-default">
                  <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Budget Limit</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(budgetToDelete.limit)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Period</span>
                  <span className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary capitalize">{budgetToDelete.period}</span>
                </div>
              </div>

              <p className="text-sm text-light-text-primary dark:text-dark-text-primary mb-6">
                Are you sure you want to delete this budget? This will permanently remove the spending limit for this category.
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
    </div>
  );
};

export default Budgets;
