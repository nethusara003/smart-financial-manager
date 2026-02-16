import React, { useState, useEffect, useCallback } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import GuestRestricted from '../components/GuestRestricted';
import {
  Repeat,
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  Film,
  Briefcase,
  Home,
  Wifi,
  Heart,
  Clock,
  AlertCircle,
  Filter,
  X
} from 'lucide-react';

const Recurring = ({ auth }) => {
  const { formatCurrency } = useCurrency();

  // Helper function to get icon component from name (defined before useState)
  const getIconComponent = useCallback((iconName) => {
    const icons = {
      'Briefcase': Briefcase,
      'Film': Film,
      'Home': Home,
      'Wifi': Wifi,
      'Heart': Heart,
      'TrendingUp': TrendingUp,
      'DollarSign': DollarSign,
      'Repeat': Repeat
    };
    return icons[iconName] || Repeat;
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [filterType, setFilterType] = useState('all'); // all, income, expense
  const [recurringItems, setRecurringItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: 'expense',
    category: 'subscription',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    icon: 'Repeat',
    color: 'cyan'
  });

  // Fetch recurring transactions from API
  const fetchRecurringTransactions = useCallback(async () => {
    if (auth?.isGuest) {
      setRecurringItems([]);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/recurring', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const itemsWithIcons = data.map(item => ({
          ...item,
          nextDate: new Date(item.nextDate),
          icon: getIconComponent(item.iconName)
        }));
        setRecurringItems(itemsWithIcons);
      } else {
        console.error('Failed to fetch recurring transactions');
        setRecurringItems([]);
      }
    } catch (error) {
      console.error('Error fetching recurring transactions:', error);
      setRecurringItems([]);
    } finally {
      setLoading(false);
    }
  }, [auth, getIconComponent]);

  // Load data when component mounts
  useEffect(() => {
    fetchRecurringTransactions();
  }, [fetchRecurringTransactions]);

  const getFilteredItems = () => {
    if (filterType === 'all') return recurringItems;
    return recurringItems.filter(item => item.type === filterType);
  };

  const filteredItems = getFilteredItems();

  const totalRecurringIncome = recurringItems
    .filter(item => item.type === 'income' && item.active)
    .reduce((sum, item) => sum + item.amount, 0);

  const totalRecurringExpense = recurringItems
    .filter(item => item.type === 'expense' && item.active)
    .reduce((sum, item) => sum + item.amount, 0);

  const netRecurring = totalRecurringIncome - totalRecurringExpense;

  const getDaysUntil = (date) => {
    const today = new Date();
    const target = new Date(date);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getFrequencyBadge = (frequency) => {
    const badges = {
      daily: { label: 'Daily', color: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/20' },
      weekly: { label: 'Weekly', color: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/20' },
      monthly: { label: 'Monthly', color: 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 border-success-200 dark:border-success-500/30' },
      yearly: { label: 'Yearly', color: 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300 border-warning-200 dark:border-warning-500/30' }
    };
    return badges[frequency] || badges.monthly;
  };

  const handleDelete = (id) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/recurring/${itemToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setRecurringItems(recurringItems.filter(item => item._id !== itemToDelete));
        setShowDeleteModal(false);
        setItemToDelete(null);
      } else {
        console.error('Failed to delete recurring transaction');
      }
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      amount: item.amount.toString(),
      type: item.type,
      category: item.category,
      frequency: item.frequency,
      startDate: item.nextDate.toISOString().split('T')[0],
      icon: item.iconName || 'Repeat',
      color: item.color
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const iconComponents = {
      'Briefcase': Briefcase,
      'Film': Film,
      'Home': Home,
      'Wifi': Wifi,
      'Heart': Heart,
      'TrendingUp': TrendingUp,
      'DollarSign': DollarSign,
      'Repeat': Repeat
    };

    const payload = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      frequency: formData.frequency,
      nextDate: formData.startDate,
      iconName: formData.icon,
      color: formData.color
    };

    try {
      const token = localStorage.getItem('token');

      if (editingItem) {
        // Update existing item
        const response = await fetch(`http://localhost:5000/api/recurring/${editingItem._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const updatedItem = await response.json();
          setRecurringItems(recurringItems.map(item =>
            item._id === editingItem._id
              ? {
                  ...updatedItem,
                  nextDate: new Date(updatedItem.nextDate),
                  icon: iconComponents[updatedItem.iconName] || Repeat
                }
              : item
          ));
        } else {
          console.error('Failed to update recurring transaction');
          return;
        }
      } else {
        // Add new item
        const response = await fetch('http://localhost:5000/api/recurring', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const newItem = await response.json();
          setRecurringItems([...recurringItems, {
            ...newItem,
            nextDate: new Date(newItem.nextDate),
            icon: iconComponents[newItem.iconName] || Repeat
          }]);
        } else {
          console.error('Failed to create recurring transaction');
          return;
        }
      }

      // Reset form
      setShowModal(false);
      setEditingItem(null);
      setFormData({
        name: '',
        amount: '',
        type: 'expense',
        category: 'subscription',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        icon: 'Repeat',
        color: 'cyan'
      });
    } catch (error) {
      console.error('Error saving recurring transaction:', error);
    }
  };

  // Block guest users
  if (auth?.isGuest) {
    return <GuestRestricted featureName="Recurring Transactions" />;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">Loading recurring transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-dark-bg-primary dark:via-dark-surface-elevated dark:to-dark-surface-secondary rounded-2xl p-6 shadow-xl dark:shadow-elevated-dark border border-blue-500/20 dark:border-blue-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/10 dark:bg-blue-500/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/20 dark:border-blue-500/20 shadow-lg">
                  <Repeat className="w-5 h-5 text-white dark:text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-white dark:bg-gradient-to-r dark:from-blue-400 dark:via-blue-300 dark:to-blue-500 dark:bg-clip-text dark:text-transparent">Recurring Transactions</h1>
              </div>
              <p className="text-white/80 dark:text-blue-200/60 text-sm ml-14">Automate your regular income and expenses</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white rounded-lg font-semibold shadow-lg shadow-blue-200 dark:shadow-glow-blue hover:shadow-xl dark:hover:shadow-glow-blue transition-all duration-200 flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Recurring
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Recurring Income */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-success-500 to-success-600 rounded-xl p-4 shadow-lg border border-success-400/20 transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.03] hover:shadow-2xl dark:hover:shadow-glow-cyan-strong hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg border border-white/30">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="bg-success-700/50 px-2.5 py-0.5 rounded-full border border-white/20">
                <span className="text-xs font-semibold text-white">Income</span>
              </div>
            </div>
            <p className="text-success-100 text-xs font-medium mb-1">Monthly Income</p>
            <h2 className="text-2xl font-bold text-white mb-1">
              {formatCurrency(totalRecurringIncome)}
            </h2>
            <p className="text-success-200 text-xs">Recurring sources</p>
          </div>
        </div>

        {/* Total Recurring Expenses */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-danger-500 to-danger-600 rounded-xl p-4 shadow-lg border border-danger-400/20 transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.03] hover:shadow-2xl dark:hover:shadow-glow-cyan-strong hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg border border-white/30">
                <TrendingDown className="w-4 h-4 text-white" />
              </div>
              <div className="bg-danger-700/50 px-2.5 py-0.5 rounded-full border border-white/20">
                <span className="text-xs font-semibold text-white">Expense</span>
              </div>
            </div>
            <p className="text-danger-100 text-xs font-medium mb-1">Monthly Expenses</p>
            <h2 className="text-2xl font-bold text-white mb-1">
              {formatCurrency(totalRecurringExpense)}
            </h2>
            <p className="text-danger-200 text-xs">Auto-debits & bills</p>
          </div>
        </div>

        {/* Net Recurring */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-dark-surface-elevated dark:via-dark-surface-elevated dark:to-dark-bg-tertiary rounded-xl p-4 shadow-lg border border-blue-500/30 dark:border-blue-500/50 transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.03] hover:shadow-2xl dark:hover:shadow-glow-blue hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 dark:from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white/20 dark:bg-blue-500/20 backdrop-blur-sm p-2 rounded-lg border border-white/30 dark:border-blue-400/30">
                <Repeat className="w-4 h-4 text-white dark:text-blue-300" />
              </div>
              <div className={`px-2.5 py-0.5 rounded-full border border-white/20 ${netRecurring >= 0 ? 'bg-success-500/50' : 'bg-danger-500/50'}`}>
                <span className="text-xs font-semibold text-white">
                  {netRecurring >= 0 ? 'Positive' : 'Negative'}
                </span>
              </div>
            </div>
            <p className="text-white/90 dark:text-blue-100 text-xs font-medium mb-1">Net Recurring</p>
            <h2 className={`text-2xl font-bold mb-1 ${netRecurring >= 0 ? 'text-white dark:text-blue-300' : 'text-danger-100'}`}>
              {formatCurrency(netRecurring)}
            </h2>
            <p className="text-white/70 dark:text-blue-200/70 text-xs">Monthly surplus</p>
          </div>
        </div>
      </div>

      {/* Filter and List */}
      <div className="bg-light-surface-secondary dark:bg-dark-surface-primary rounded-xl p-4 shadow-premium dark:shadow-card-dark border border-light-border-default dark:border-dark-border-strong transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.01] hover:shadow-2xl dark:hover:shadow-glow-blue">
        {/* Header with Filters */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-100 dark:bg-blue-500/10 p-2 rounded-lg border border-blue-200 dark:border-blue-500/20">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary">Active Recurring Items</h3>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{filteredItems.length} transactions scheduled</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary" />
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All', count: recurringItems.length },
                { value: 'income', label: 'Income', count: recurringItems.filter(i => i.type === 'income').length },
                { value: 'expense', label: 'Expense', count: recurringItems.filter(i => i.type === 'expense').length }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setFilterType(filter.value)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                    filterType === filter.value
                      ? 'bg-blue-500 dark:bg-blue-500 text-white shadow-md dark:shadow-glow-blue'
                      : 'bg-light-surface-hover dark:bg-dark-surface-hover text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-accent dark:hover:bg-dark-surface-elevated'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recurring Items List */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-blue-100 dark:bg-blue-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-200 dark:border-blue-500/20">
                <Repeat className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">No recurring transactions in this category</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const IconComponent = item.icon;
              const daysUntil = getDaysUntil(item.nextDate);
              const frequencyBadge = getFrequencyBadge(item.frequency);
              const isIncome = item.type === 'income';

              return (
                <div
                  key={item._id}
                  className={`group relative overflow-hidden rounded-lg border-2 p-3 transition-all duration-300 hover:shadow-lg ${
                    isIncome
                      ? 'border-success-200 dark:border-success-500/30 bg-gradient-to-r from-success-50/50 to-white dark:from-success-900/10 dark:to-dark-surface-primary hover:border-success-300'
                      : 'border-danger-200 dark:border-danger-500/30 bg-gradient-to-r from-danger-50/50 to-white dark:from-danger-900/10 dark:to-dark-surface-primary hover:border-danger-300'
                  }`}
                >
                  {/* Left accent bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${isIncome ? 'bg-success-500' : 'bg-danger-500'}`}></div>

                  <div className="flex items-center gap-3 pl-2">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      isIncome
                        ? 'bg-gradient-to-br from-success-100 to-success-200 dark:from-success-900/30 dark:to-success-800/20'
                        : 'bg-gradient-to-br from-danger-100 to-danger-200 dark:from-danger-900/30 dark:to-danger-800/20'
                    }`}>
                      <IconComponent className={`w-4 h-4 ${isIncome ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary truncate">
                          {item.name}
                        </h4>
                        <div className={`px-1.5 py-0.5 rounded border ${frequencyBadge.color} flex-shrink-0`}>
                          <p className="text-[10px] font-semibold">
                            {frequencyBadge.label}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        <span className="capitalize">{item.category}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Next: {item.nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        {daysUntil <= 7 && (
                          <>
                            <span>•</span>
                            <span className={`font-semibold ${daysUntil <= 3 ? 'text-warning-600 dark:text-warning-400' : 'text-light-text-tertiary dark:text-dark-text-tertiary'}`}>
                              {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil}d`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                      <p className={`text-base font-bold ${isIncome ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
                      </p>
                      <p className="text-[10px] text-light-text-tertiary dark:text-dark-text-tertiary">
                        /{item.frequency}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover rounded-lg transition-colors"
                        title="Edit recurring transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-light-text-secondary dark:text-dark-text-secondary" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
                        title="Delete recurring transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-danger-600 dark:text-danger-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upcoming This Week */}
        <div className="bg-light-surface-secondary dark:bg-dark-surface-primary rounded-xl p-4 shadow-premium dark:shadow-card-dark border border-light-border-default dark:border-dark-border-strong transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.02] hover:shadow-2xl dark:hover:shadow-glow-blue">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="bg-warning-100 dark:bg-warning-900/30 p-2 rounded-lg border border-warning-200 dark:border-warning-500/30">
              <AlertCircle className="w-4 h-4 text-warning-600 dark:text-warning-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary">Upcoming This Week</h3>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Due in next 7 days</p>
            </div>
          </div>
          <div className="space-y-2">
            {filteredItems
              .filter(item => getDaysUntil(item.nextDate) <= 7 && getDaysUntil(item.nextDate) >= 0)
              .slice(0, 3)
              .map(item => {
                const IconComponent = item.icon;
                return (
                  <div key={item._id} className="flex items-center justify-between p-2 rounded-lg bg-light-bg-accent dark:bg-dark-surface-secondary border border-light-border-subtle dark:border-dark-border-default">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-3.5 h-3.5 text-light-text-secondary dark:text-dark-text-secondary" />
                      <span className="text-xs font-medium text-light-text-primary dark:text-dark-text-primary">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">{formatCurrency(item.amount)}</span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Total Monthly Impact */}
        <div className="bg-light-surface-secondary dark:bg-dark-surface-primary rounded-xl p-4 shadow-premium dark:shadow-card-dark border border-light-border-default dark:border-dark-border-strong transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.02] hover:shadow-2xl dark:hover:shadow-glow-blue">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="bg-blue-100 dark:bg-blue-500/10 p-2 rounded-lg border border-blue-200 dark:border-blue-500/20">
              <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary">Active Items</h3>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Scheduled transactions</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                {recurringItems.filter(i => i.active).length}
              </p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                recurring items
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {recurringItems.filter(i => i.type === 'income').length}↑ / {recurringItems.filter(i => i.type === 'expense').length}↓
              </p>
              <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">Income/Expense</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-light-surface-primary dark:bg-dark-surface-primary rounded-2xl shadow-2xl dark:shadow-[0_0_50px_rgba(59,130,246,0.3)] border border-light-border-default dark:border-blue-500/30 max-w-md w-full transform transition-all duration-300 animate-slide-up">
            <div className="p-6 border-b border-light-border-subtle dark:border-dark-border-default">
              <div className="flex items-center gap-3">
                <div className="bg-danger-100 dark:bg-danger-900/30 p-3 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-danger-600 dark:text-danger-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">Delete Recurring Transaction</h3>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">This action cannot be undone</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-light-text-primary dark:text-dark-text-primary mb-6">
                Are you sure you want to delete this recurring transaction? This will permanently remove it from your scheduled transactions.
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
          <div className="bg-light-surface-primary dark:bg-dark-surface-primary rounded-2xl shadow-2xl dark:shadow-[0_0_50px_rgba(59,130,246,0.3)] border border-light-border-default dark:border-blue-500/30 max-w-2xl w-full my-8 transform transition-all duration-300 animate-slide-up">
            <div className="p-6 border-b border-light-border-subtle dark:border-dark-border-default">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-500/10 p-3 rounded-xl">
                    <Repeat className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                      {editingItem ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
                    </h3>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      {editingItem ? 'Update your scheduled transaction' : 'Schedule a new transaction'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    setFormData({
                      name: '',
                      amount: '',
                      type: 'expense',
                      category: 'subscription',
                      frequency: 'monthly',
                      startDate: new Date().toISOString().split('T')[0],
                      icon: 'Repeat',
                      color: 'cyan'
                    });
                  }}
                  className="p-2 hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Transaction Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                    Transaction Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-light-bg-accent dark:bg-dark-surface-secondary border border-light-border-default dark:border-dark-border-strong rounded-lg text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., Netflix Subscription"
                    required
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2.5 bg-light-bg-accent dark:bg-dark-surface-secondary border border-light-border-default dark:border-dark-border-strong rounded-lg text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2.5 bg-light-bg-accent dark:bg-dark-surface-secondary border border-light-border-default dark:border-dark-border-strong rounded-lg text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-light-bg-accent dark:bg-dark-surface-secondary border border-light-border-default dark:border-dark-border-strong rounded-lg text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="subscription">Subscription</option>
                    <option value="salary">Salary</option>
                    <option value="housing">Housing</option>
                    <option value="utilities">Utilities</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="health">Health</option>
                    <option value="investment">Investment</option>
                  </select>
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-4 py-2.5 bg-light-bg-accent dark:bg-dark-surface-secondary border border-light-border-default dark:border-dark-border-strong rounded-lg text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                {/* Start Date */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                    Next Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-light-bg-accent dark:bg-dark-surface-secondary border border-light-border-default dark:border-dark-border-strong rounded-lg text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                    Icon
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-2.5 bg-light-bg-accent dark:bg-dark-surface-secondary border border-light-border-default dark:border-dark-border-strong rounded-lg text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="Repeat">Repeat</option>
                    <option value="Briefcase">Briefcase</option>
                    <option value="Film">Film</option>
                    <option value="Home">Home</option>
                    <option value="Wifi">Wifi</option>
                    <option value="Heart">Heart</option>
                    <option value="TrendingUp">Trending Up</option>
                    <option value="DollarSign">Dollar Sign</option>
                  </select>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                    Color Theme
                  </label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-4 py-2.5 bg-light-bg-accent dark:bg-dark-surface-secondary border border-light-border-default dark:border-dark-border-strong rounded-lg text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="primary">Primary</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="danger">Danger</option>
                    <option value="cyan">Cyan</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    setFormData({
                      name: '',
                      amount: '',
                      type: 'expense',
                      category: 'subscription',
                      frequency: 'monthly',
                      startDate: new Date().toISOString().split('T')[0],
                      icon: 'Repeat',
                      color: 'cyan'
                    });
                  }}
                  className="flex-1 px-4 py-2.5 bg-light-bg-accent dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary rounded-lg font-semibold hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-all duration-200 border border-light-border-default dark:border-dark-border-strong"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white rounded-lg font-semibold shadow-lg shadow-blue-200 dark:shadow-glow-blue hover:shadow-xl dark:hover:shadow-glow-blue transition-all duration-200"
                >
                  {editingItem ? 'Update' : 'Add'} Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recurring;
