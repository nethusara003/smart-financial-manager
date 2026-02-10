import React, { useState, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import * as goalAPI from '../services/api';
import {
  Target,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Home,
  Plane,
  GraduationCap,
  Heart,
  Briefcase,
  PiggyBank,
  Calendar,
  DollarSign,
  Trophy,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  MoreVertical
} from 'lucide-react';

const Goals = () => {
  const { formatCurrency } = useCurrency();
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, completed, overdue
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [contributionGoal, setContributionGoal] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: new Date().toISOString().split('T')[0],
    category: 'savings',
    icon: 'PiggyBank',
    color: 'primary'
  });

  // Load goals from API
  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await goalAPI.getGoals();
      // Convert date strings back to Date objects and map icons
      const processedGoals = data.map(goal => ({
        ...goal,
        id: goal._id,
        targetDate: new Date(goal.targetDate),
        icon: getIconComponent(goal.icon)
      }));
      setGoals(processedGoals);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      PiggyBank,
      Home,
      Plane,
      GraduationCap,
      Briefcase,
      Heart,
      Target,
      TrendingUp
    };
    return iconMap[iconName] || PiggyBank;
  };

  // Calculate statistics
  const getGoalStats = () => {
    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

    return {
      active: activeGoals.length,
      completed: completedGoals.length,
      total: goals.length,
      totalTarget,
      totalSaved,
      overallProgress
    };
  };

  const stats = getGoalStats();

  // Calculate progress for a goal
  const getProgress = (goal) => {
    return Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
  };

  // Check if goal is overdue
  const isOverdue = (goal) => {
    const today = new Date();
    return goal.targetDate < today && goal.status !== 'completed';
  };

  // Get days remaining
  const getDaysRemaining = (targetDate) => {
    const today = new Date();
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filter goals
  const getFilteredGoals = () => {
    if (filterStatus === 'all') return goals;
    if (filterStatus === 'completed') return goals.filter(g => g.status === 'completed');
    if (filterStatus === 'overdue') return goals.filter(g => isOverdue(g));
    return goals.filter(g => g.status === 'active' && !isOverdue(g));
  };

  const filteredGoals = getFilteredGoals();

  const handleDelete = (goal) => {
    setGoalToDelete(goal);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (goalToDelete) {
      try {
        await goalAPI.deleteGoal(goalToDelete._id || goalToDelete.id);
        setGoals(goals.filter(g => g.id !== goalToDelete.id));
        setGoalToDelete(null);
        setShowDeleteModal(false);
      } catch (err) {
        console.error('Failed to delete goal:', err);
        setError(err.message);
      }
    }
  };

  const cancelDelete = () => {
    setGoalToDelete(null);
    setShowDeleteModal(false);
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate.toISOString().split('T')[0],
      category: goal.category,
      icon: goal.icon.name || 'PiggyBank',
      color: goal.color
    });
    setShowModal(true);
  };

  const handleSaveGoal = async () => {
    try {
      const goalData = {
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0,
        targetDate: formData.targetDate,
        category: formData.category,
        icon: formData.icon,
        color: formData.color,
        priority: 'medium',
        status: 'active'
      };

      if (editingGoal) {
        // Update existing goal
        const updatedGoal = await goalAPI.updateGoal(editingGoal._id || editingGoal.id, goalData);
        setGoals(goals.map(g => 
          g.id === editingGoal.id
            ? {
                ...updatedGoal,
                id: updatedGoal._id,
                targetDate: new Date(updatedGoal.targetDate),
                icon: getIconComponent(updatedGoal.icon)
              }
            : g
        ));
      } else {
        // Add new goal
        const newGoal = await goalAPI.createGoal(goalData);
        const processedGoal = {
          ...newGoal,
          id: newGoal._id,
          targetDate: new Date(newGoal.targetDate),
          icon: getIconComponent(newGoal.icon)
        };
        setGoals([...goals, processedGoal]);
      }
      
      setShowModal(false);
      setEditingGoal(null);
    } catch (err) {
      console.error('Failed to save goal:', err);
      setError(err.message);
    }
  };

  const cancelEdit = () => {
    setShowModal(false);
    setEditingGoal(null);
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: new Date().toISOString().split('T')[0],
      category: 'savings',
      icon: 'PiggyBank',
      color: 'primary'
    });
  };

  const handleAddContribution = async (goalId, amount) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      const updatedGoal = await goalAPI.addContribution(goal._id || goal.id, amount);
      
      setGoals(goals.map(g => 
        g.id === goalId 
          ? { 
              ...g, 
              currentAmount: updatedGoal.currentAmount,
              status: updatedGoal.status
            }
          : g
      ));
    } catch (err) {
      console.error('Failed to add contribution:', err);
      setError(err.message);
    }
  };

  const openContributionModal = (goal) => {
    setContributionGoal(goal);
    setContributionAmount('');
    setShowContributionModal(true);
  };

  const confirmContribution = async () => {
    if (contributionGoal && contributionAmount && !isNaN(contributionAmount)) {
      await handleAddContribution(contributionGoal.id, parseFloat(contributionAmount));
      setShowContributionModal(false);
      setContributionGoal(null);
      setContributionAmount('');
    }
  };

  const cancelContribution = () => {
    setShowContributionModal(false);
    setContributionGoal(null);
    setContributionAmount('');
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-dark-bg-primary via-dark-bg-secondary to-dark-bg-tertiary dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-tertiary rounded-xl p-5 shadow-elevated dark:shadow-elevated-dark border border-dark-border-strong/30">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="bg-blue-500/20 dark:bg-blue-500/20 backdrop-blur-sm p-2 rounded-lg border border-blue-500/30 dark:border-blue-500/30 shadow-md dark:shadow-glow-blue">
                <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">Financial Goals</h1>
            </div>
            <p className="text-light-text-secondary dark:text-blue-200/80 text-sm ml-11">Track and achieve your financial aspirations</p>
          </div>
          <button
            onClick={() => {
              setEditingGoal(null);
              setFormData({
                name: '',
                targetAmount: '',
                currentAmount: '',
                targetDate: new Date().toISOString().split('T')[0],
                category: 'savings',
                icon: 'PiggyBank',
                color: 'primary'
              });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 dark:bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg dark:shadow-glow-blue transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Add Goal
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Progress */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600 rounded-xl p-4 shadow-card dark:shadow-glow-blue border border-blue-400/20 dark:border-blue-400/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
          <div className="flex items-start justify-between mb-2">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg border border-white/30">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div className="bg-primary-700/50 px-2 py-0.5 rounded-full">
              <span className="text-xs font-semibold text-white">{stats.overallProgress}%</span>
            </div>
          </div>
          <p className="text-primary-100 text-xs font-medium mb-1">Overall Progress</p>
          <h2 className="text-2xl font-bold text-white">{formatCurrency(stats.totalSaved)}</h2>
          <p className="text-primary-200 text-xs mt-0.5">of {formatCurrency(stats.totalTarget)}</p>
        </div>

        {/* Active Goals */}
        <div className="bg-gradient-to-br from-success-500 to-success-600 rounded-xl p-4 shadow-card transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
          <div className="flex items-start justify-between mb-2">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg border border-white/30">
              <Target className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-success-100 text-xs font-medium mb-1">Active Goals</p>
          <h2 className="text-2xl font-bold text-white">{stats.active}</h2>
          <p className="text-success-200 text-xs mt-0.5">In progress</p>
        </div>

        {/* Completed Goals */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-500 dark:to-green-600 rounded-xl p-4 shadow-card dark:shadow-glow-green transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
          <div className="flex items-start justify-between mb-2">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg border border-white/30">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-success-100 dark:text-success-100 text-xs font-medium mb-1">Completed</p>
          <h2 className="text-2xl font-bold text-white">{stats.completed}</h2>
          <p className="text-success-200 dark:text-success-200 text-xs mt-0.5">Achievements</p>
        </div>

        {/* Total Goals */}
        <div className="bg-gradient-to-br from-gray-700 to-gray-800 dark:from-dark-surface-secondary dark:to-dark-surface-elevated rounded-xl p-4 shadow-card transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
          <div className="flex items-start justify-between mb-2">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg border border-white/30">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-gray-300 text-xs font-medium mb-1">Total Goals</p>
          <h2 className="text-2xl font-bold text-white">{stats.total}</h2>
          <p className="text-gray-400 text-xs mt-0.5">All time</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-light-surface-secondary dark:bg-dark-surface-primary rounded-xl p-4 shadow-premium dark:shadow-card-dark border border-light-border-default dark:border-dark-border-strong">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">Filter:</span>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All Goals', count: goals.length },
              { value: 'active', label: 'Active', count: stats.active },
              { value: 'completed', label: 'Completed', count: stats.completed },
              { value: 'overdue', label: 'Overdue', count: goals.filter(g => isOverdue(g)).length }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  filterStatus === filter.value
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

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 bg-light-surface-secondary dark:bg-dark-surface-primary rounded-xl p-8 text-center shadow-premium dark:shadow-card-dark border border-light-border-default dark:border-dark-border-strong">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-3"></div>
            <p className="text-light-text-secondary dark:text-dark-text-secondary font-medium">Loading goals...</p>
          </div>
        ) : error ? (
          <div className="col-span-2 bg-light-surface-secondary dark:bg-dark-surface-primary rounded-xl p-8 text-center shadow-premium dark:shadow-card-dark border border-light-border-default dark:border-dark-border-strong">
            <AlertCircle className="w-12 h-12 text-danger-500 mx-auto mb-3" />
            <p className="text-danger-600 dark:text-danger-400 font-medium">Failed to load goals</p>
            <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm mt-1">{error}</p>
            <button
              onClick={loadGoals}
              className="mt-3 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Retry
            </button>
          </div>
        ) : filteredGoals.length === 0 ? (
          <div className="col-span-2 bg-light-surface-secondary dark:bg-dark-surface-primary rounded-xl p-8 text-center shadow-premium dark:shadow-card-dark border border-light-border-default dark:border-dark-border-strong">
            <Target className="w-12 h-12 text-light-text-disabled dark:text-dark-text-disabled mx-auto mb-3" />
            <p className="text-light-text-secondary dark:text-dark-text-secondary font-medium">No goals in this category</p>
            <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm mt-1">Start by creating a new financial goal</p>
          </div>
        ) : (
          filteredGoals.map((goal) => {
            const IconComponent = goal.icon;
            const progress = getProgress(goal);
            const daysRemaining = getDaysRemaining(goal.targetDate);
            const isGoalOverdue = isOverdue(goal);
            const isCompleted = goal.status === 'completed';

            return (
              <div
                key={goal.id}
                className={`group bg-light-surface-secondary dark:bg-dark-surface-primary rounded-xl p-4 shadow-premium dark:shadow-card-dark border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl dark:hover:shadow-glow-gold ${
                  isCompleted
                    ? 'border-success-200 dark:border-success-500/30'
                    : isGoalOverdue
                    ? 'border-danger-200 dark:border-danger-500/30'
                    : 'border-light-border-default dark:border-dark-border-strong'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${
                      isCompleted
                        ? 'from-success-100 to-success-200 dark:from-success-900/30 dark:to-success-800/30'
                        : isGoalOverdue
                        ? 'from-danger-100 to-danger-200 dark:from-danger-900/30 dark:to-danger-800/30'
                        : 'from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30'
                    } border ${
                      isCompleted
                        ? 'border-success-200 dark:border-success-500/30'
                        : isGoalOverdue
                        ? 'border-danger-200 dark:border-danger-500/30'
                        : 'border-primary-200 dark:border-primary-500/30'
                    }`}>
                      <IconComponent className={`w-5 h-5 ${
                        isCompleted
                          ? 'text-success-600 dark:text-success-400'
                          : isGoalOverdue
                          ? 'text-danger-600 dark:text-danger-400'
                          : 'text-primary-600 dark:text-primary-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-light-text-primary dark:text-dark-text-primary">{goal.name}</h3>
                      <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">{goal.category}</p>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  {isCompleted && (
                    <div className="px-2 py-1 rounded-full bg-success-100 dark:bg-success-900/30 border border-success-200 dark:border-success-500/30">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-success-600 dark:text-success-400" />
                        <span className="text-xs font-semibold text-success-700 dark:text-success-400">Completed</span>
                      </div>
                    </div>
                  )}
                  {isGoalOverdue && !isCompleted && (
                    <div className="px-2 py-1 rounded-full bg-danger-100 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-500/30">
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-danger-600 dark:text-danger-400" />
                        <span className="text-xs font-semibold text-danger-700 dark:text-danger-400">Overdue</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Amount Info */}
                <div className="mb-3">
                  <div className="flex items-baseline justify-between mb-1">
                    <div>
                      <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-0.5">Current Amount</p>
                      <p className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">{formatCurrency(goal.currentAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-0.5">Target</p>
                      <p className="text-base font-bold text-light-text-primary dark:text-dark-text-primary">{formatCurrency(goal.targetAmount)}</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">Progress</span>
                    <span className={`text-xs font-bold ${
                      isCompleted
                        ? 'text-success-600 dark:text-success-400'
                        : progress >= 75
                        ? 'text-success-600 dark:text-success-400'
                        : progress >= 50
                        ? 'text-warning-600 dark:text-warning-400'
                        : 'text-primary-600 dark:text-primary-400'
                    }`}>
                      {progress}%
                    </span>
                  </div>
                  <div className="relative h-2 bg-light-bg-accent dark:bg-dark-surface-secondary rounded-full overflow-hidden">
                    <div 
                      className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-success-500 to-success-600'
                          : progress >= 75
                          ? 'bg-gradient-to-r from-success-500 to-success-600'
                          : progress >= 50
                          ? 'bg-gradient-to-r from-warning-500 to-warning-600'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600'
                      }`}
                      style={{ 
                        width: `${progress}%`,
                        boxShadow: isCompleted ? '0 0 8px rgba(34, 197, 94, 0.4)' : progress >= 75 ? '0 0 8px rgba(34, 197, 94, 0.4)' : '0 0 8px rgba(6, 182, 212, 0.4)'
                      }}
                    />
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between mb-3 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{goal.targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  {!isCompleted && (
                    <span className={`font-semibold ${
                      isGoalOverdue
                        ? 'text-danger-600 dark:text-danger-400'
                        : daysRemaining <= 30
                        ? 'text-warning-600 dark:text-warning-400'
                        : 'text-light-text-secondary dark:text-dark-text-secondary'
                    }`}>
                      {isGoalOverdue
                        ? `${Math.abs(daysRemaining)}d overdue`
                        : `${daysRemaining}d remaining`
                      }
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {!isCompleted && (
                    <button
                      onClick={() => openContributionModal(goal)}
                      className="flex-1 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-1.5"
                      title="Add contribution"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Add Contribution
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(goal)}
                    className="p-2 rounded-lg bg-light-surface-hover dark:bg-dark-surface-hover hover:bg-light-bg-accent dark:hover:bg-dark-surface-elevated transition-colors"
                    title="Edit goal"
                  >
                    <Edit2 className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
                  </button>
                  <button
                    onClick={() => handleDelete(goal)}
                    className="p-2 rounded-lg bg-light-surface-hover dark:bg-dark-surface-hover hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors group/delete"
                    title="Delete goal"
                  >
                    <Trash2 className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary group-hover/delete:text-danger-600 dark:group-hover/delete:text-danger-400" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Premium Edit/Add Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-light-surface-primary dark:bg-dark-surface-primary rounded-2xl shadow-2xl dark:shadow-glow-gold border border-light-border-default dark:border-dark-border-strong w-full max-w-md transform animate-scale-in">
            {/* Modal Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600 rounded-t-2xl p-6">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
              <div className="relative flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg border border-white/30">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {editingGoal ? 'Edit Goal' : 'Add New Goal'}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Goal Name */}
              <div>
                <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-light-border-default dark:border-dark-border-default bg-light-surface-secondary dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter goal name"
                />
              </div>

              {/* Target Amount */}
              <div>
                <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                  Target Amount
                </label>
                <input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-light-border-default dark:border-dark-border-default bg-light-surface-secondary dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter target amount"
                />
              </div>

              {/* Current Amount */}
              <div>
                <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                  Current Amount
                </label>
                <input
                  type="number"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-light-border-default dark:border-dark-border-default bg-light-surface-secondary dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter current amount"
                />
              </div>

              {/* Target Date */}
              <div>
                <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                  Target Date
                </label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-light-border-default dark:border-dark-border-default bg-light-surface-secondary dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-light-border-default dark:border-dark-border-default bg-light-surface-secondary dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="savings">Savings</option>
                  <option value="housing">Housing</option>
                  <option value="travel">Travel</option>
                  <option value="education">Education</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={cancelEdit}
                className="flex-1 px-4 py-3 rounded-lg border border-light-border-default dark:border-dark-border-default text-light-text-primary dark:text-dark-text-primary bg-light-surface-secondary dark:bg-dark-surface-secondary hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGoal}
                disabled={!formData.name || !formData.targetAmount}
                className="flex-1 px-4 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:hover:shadow-md"
              >
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Delete Confirmation Modal */}
      {showDeleteModal && goalToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-light-surface-primary dark:bg-dark-surface-primary rounded-2xl shadow-2xl border border-light-border-default dark:border-dark-border-strong w-full max-w-md transform animate-scale-in">
            {/* Modal Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-danger-500 to-danger-600 dark:from-danger-600/90 dark:to-danger-700 rounded-t-2xl p-6">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
              <div className="relative flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg border border-white/30">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Confirm Delete</h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-light-text-primary dark:text-dark-text-primary text-base leading-relaxed">
                Are you sure you want to delete the goal{' '}
                <span className="font-bold text-danger-600 dark:text-danger-400">"{goalToDelete.name}"</span>?
              </p>
              <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mt-2">
                This action cannot be undone. All progress data will be permanently lost.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-3 rounded-lg border border-light-border-default dark:border-dark-border-default text-light-text-primary dark:text-dark-text-primary bg-light-surface-secondary dark:bg-dark-surface-secondary hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 rounded-lg bg-danger-500 hover:bg-danger-600 text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Add Contribution Modal */}
      {showContributionModal && contributionGoal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-light-surface-primary dark:bg-dark-surface-primary rounded-2xl shadow-2xl border border-light-border-default dark:border-dark-border-strong w-full max-w-md transform animate-scale-in">
            {/* Modal Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-success-500 to-success-600 dark:from-success-600/90 dark:to-success-700 rounded-t-2xl p-6">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
              <div className="relative flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg border border-white/30">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Add Contribution</h3>
                  <p className="text-white/80 text-sm">{contributionGoal.name}</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-4">
                <div className="flex justify-between text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">
                  <span>Current: {formatCurrency(contributionGoal.currentAmount)}</span>
                  <span>Target: {formatCurrency(contributionGoal.targetAmount)}</span>
                </div>
                <div className="w-full bg-light-bg-secondary dark:bg-dark-surface-secondary rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-success-500 to-success-600"
                    style={{ width: `${Math.min((contributionGoal.currentAmount / contributionGoal.targetAmount) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                    Contribution Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary" />
                    <input
                      type="number"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-light-border-default dark:border-dark-border-default bg-light-surface-secondary dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary focus:ring-2 focus:ring-success-500 focus:border-transparent transition-all duration-200"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                    Remaining to goal: {formatCurrency(contributionGoal.targetAmount - contributionGoal.currentAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={cancelContribution}
                className="flex-1 px-4 py-3 rounded-lg border border-light-border-default dark:border-dark-border-default text-light-text-primary dark:text-dark-text-primary bg-light-surface-secondary dark:bg-dark-surface-secondary hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmContribution}
                disabled={!contributionAmount || isNaN(contributionAmount) || parseFloat(contributionAmount) <= 0}
                className="flex-1 px-4 py-3 rounded-lg bg-success-500 hover:bg-success-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:hover:shadow-md flex items-center justify-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Add Contribution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
