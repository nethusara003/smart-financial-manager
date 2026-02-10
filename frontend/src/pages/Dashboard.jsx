import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Calendar,
  Zap,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  CreditCard,
  Repeat,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Plus,
  Wifi,
  Smartphone,
  Home,
  ShoppingCart,
  Film,
  MoreVertical
} from "lucide-react";

// Bill Form Component
const BillForm = ({ bill, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: bill?.name || '',
    amount: bill?.amount || '',
    date: bill?.date ? new Date(bill.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    type: bill?.type || 'utility',
    category: bill?.category || 'utilities',
    frequency: bill?.frequency || 'monthly',
    icon: bill?.icon || Zap,
    color: bill?.color || 'blue'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      alert('Please enter a bill name');
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Format date properly
    const billDate = new Date(formData.date);
    
    onSave({
      ...formData,
      amount: Number(formData.amount),
      date: billDate
    });
  };

  const iconOptions = [
    { value: 'Zap', label: 'Electricity', icon: Zap, color: 'yellow' },
    { value: 'Wifi', label: 'Internet', icon: Wifi, color: 'blue' },
    { value: 'Smartphone', label: 'Mobile', icon: Smartphone, color: 'purple' },
    { value: 'Home', label: 'Rent/Housing', icon: Home, color: 'green' },
    { value: 'Film', label: 'Entertainment', icon: Film, color: 'red' },
    { value: 'ShoppingCart', label: 'Shopping', icon: ShoppingCart, color: 'orange' },
    { value: 'CreditCard', label: 'Credit Card', icon: CreditCard, color: 'blue' },
    { value: 'DollarSign', label: 'Other', icon: DollarSign, color: 'gray' }
  ];

  const handleIconChange = (iconOption) => {
    setFormData({
      ...formData,
      icon: iconOption.icon,
      color: iconOption.color
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Bill Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
            Bill Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-light-border-default dark:border-dark-border-strong bg-light-bg-accent dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="e.g., Netflix Premium"
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
            className="w-full px-4 py-2.5 rounded-lg border border-light-border-default dark:border-dark-border-strong bg-light-bg-accent dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="0.00"
          />
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
            Due Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-light-border-default dark:border-dark-border-strong bg-light-bg-accent dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all"
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
            className="w-full px-4 py-2.5 rounded-lg border border-light-border-default dark:border-dark-border-strong bg-light-bg-accent dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="utility">Utility</option>
            <option value="subscription">Subscription</option>
            <option value="rent">Rent</option>
            <option value="insurance">Insurance</option>
            <option value="loan">Loan</option>
            <option value="other">Other</option>
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
            className="w-full px-4 py-2.5 rounded-lg border border-light-border-default dark:border-dark-border-strong bg-light-bg-accent dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="weekly">Weekly</option>
            <option value="quarterly">Quarterly</option>
            <option value="one-time">One Time</option>
          </select>
        </div>

        {/* Icon Selection */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
            Icon & Color
          </label>
          <div className="grid grid-cols-4 gap-2">
            {iconOptions.map((option) => {
              const IconComponent = option.icon;
              const isSelected = formData.icon === option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleIconChange(option)}
                  className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                    isSelected
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                      : 'border-light-border-default dark:border-dark-border-default hover:border-blue-400 dark:hover:border-blue-600 bg-light-surface-primary dark:bg-dark-surface-secondary'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-light-text-secondary dark:text-dark-text-secondary'}`} />
                  <span className={`text-xs font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-lg border border-light-border-default dark:border-dark-border-default text-light-text-primary dark:text-dark-text-primary bg-light-surface-primary dark:bg-dark-surface-primary font-semibold hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors shadow-md hover:shadow-lg"
        >
          {bill ? 'Update Bill' : 'Add Bill'}
        </button>
      </div>
    </form>
  );
};

const Dashboard = ({ auth }) => {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [billFilter, setBillFilter] = useState('all'); // all, overdue, upcoming, paid
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(null); // stores bill id
  const [selectedBill, setSelectedBill] = useState(null);
  const [editingBill, setEditingBill] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showDeleteBillModal, setShowDeleteBillModal] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/transactions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptionsMenu && !event.target.closest('.options-menu-container')) {
        setShowOptionsMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOptionsMenu]);

  /* ================= KPI CALCULATIONS ================= */

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const balance = income - expense;

  const spendingRate =
    income === 0 ? 0 : Math.round((expense / income) * 100);

  /* ================= CALENDAR LOGIC ================= */
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSameDate = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Helper function to get icon component from name
  const getBillIconComponent = (iconName) => {
    const icons = {
      'Film': Film,
      'Zap': Zap,
      'Wifi': Wifi,
      'Smartphone': Smartphone,
      'Home': Home,
      'ShoppingCart': ShoppingCart,
      'CreditCard': CreditCard,
      'DollarSign': DollarSign
    };
    return icons[iconName] || Zap;
  };

  // Get storage key for bills based on user type
  const getBillsStorageKey = () => {
    if (auth?.isGuest) {
      return 'upcomingBills_guest';
    }
    const userId = JSON.parse(localStorage.getItem('user') || '{}')._id || 'default';
    return `upcomingBills_${userId}`;
  };

  // Get current user ID for tracking user changes
  const getCurrentUserId = () => {
    if (auth?.isGuest) return 'guest';
    return JSON.parse(localStorage.getItem('user') || '{}')._id || 'default';
  };

  // Load bills data for current user
  const loadUserBillsData = () => {
    const storageKey = getBillsStorageKey();
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      return JSON.parse(saved).map(bill => ({
        ...bill,
        date: new Date(bill.date),
        icon: getBillIconComponent(bill.iconName)
      }));
    }
    return []; // New users start with empty bills
  };

  // Track current user ID
  const [currentUserId, setCurrentUserId] = useState(getCurrentUserId());
  
  // Initialize state with empty array, load data in useEffect
  const [upcomingBills, setUpcomingBills] = useState([]);

  // Load bills data when component mounts or user changes
  useEffect(() => {
    const userId = getCurrentUserId();
    
    // If user changed, update state and reload data
    if (userId !== currentUserId) {
      setCurrentUserId(userId);
      setUpcomingBills(loadUserBillsData());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, currentUserId]);

  // Initial bills data load
  useEffect(() => {
    setUpcomingBills(loadUserBillsData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save bills to localStorage whenever they change
  useEffect(() => {
    const storageKey = getBillsStorageKey();
    if (upcomingBills.length === 0) return;
    
    const billsToSave = upcomingBills.map(bill => ({
      ...bill,
      date: bill.date.toISOString(),
      icon: undefined
    }));
    localStorage.setItem(storageKey, JSON.stringify(billsToSave));
  }, [upcomingBills, currentUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  const getFilteredBills = () => {
    if (billFilter === 'all') return upcomingBills;
    return upcomingBills.filter(bill => bill.status === billFilter);
  };

  const getBillStats = () => {
    const overdue = upcomingBills.filter(b => b.status === 'overdue').length;
    const upcoming = upcomingBills.filter(b => b.status === 'upcoming').length;
    const paid = upcomingBills.filter(b => b.status === 'paid').length;
    const totalDue = upcomingBills
      .filter(b => b.status !== 'paid')
      .reduce((sum, b) => sum + b.amount, 0);
    
    return { overdue, upcoming, paid, totalDue };
  };

  const billStats = getBillStats();
  const filteredBills = getFilteredBills();

  /* ================= BILL HANDLERS ================= */

  const handlePayBill = (bill) => {
    setSelectedBill(bill);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    setPaymentLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Map bill type and category to transaction category
      let transactionCategory;
      
      // First check bill type for subscriptions
      if (selectedBill.type === 'subscription') {
        transactionCategory = 'Subscriptions';
      } else {
        // Map by bill category
        const categoryMap = {
          'housing': 'Rent',
          'utilities': 'Utilities',
          'entertainment': 'Entertainment',
          'shopping': 'Shopping',
          'telecom': 'Utilities',
        };
        transactionCategory = categoryMap[selectedBill.category] || 'Other Expense';
      }

      // Create transaction for this bill payment
      const transactionData = {
        type: 'expense',
        category: transactionCategory,
        amount: selectedBill.amount,
        note: `Payment for ${selectedBill.name} - ${selectedBill.frequency} ${selectedBill.type}`,
      };

      const res = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transactionData),
      });

      if (!res.ok) {
        throw new Error("Failed to create transaction");
      }

      const newTransaction = await res.json();

      // Update bill status
      setUpcomingBills(prevBills => 
        prevBills.map(bill => 
          bill.id === selectedBill.id 
            ? { ...bill, status: 'paid' } 
            : bill
        )
      );

      // Add new transaction to the list
      setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);

      setShowPaymentModal(false);
      setSelectedBill(null);
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert("Failed to record payment. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleAddBill = () => {
    setEditingBill(null);
    setShowBillModal(true);
  };

  const handleEditBill = (bill) => {
    setEditingBill(bill);
    setShowBillModal(true);
    setShowOptionsMenu(null);
  };

  const handleDeleteBill = (billId) => {
    const bill = upcomingBills.find(b => b.id === billId);
    setBillToDelete(bill);
    setShowDeleteBillModal(true);
    setShowOptionsMenu(null);
  };

  const confirmDeleteBill = () => {
    if (billToDelete) {
      setUpcomingBills(prevBills => prevBills.filter(bill => bill.id !== billToDelete.id));
      setShowDeleteBillModal(false);
      setBillToDelete(null);
      setShowOptionsMenu(null);
    }
  };

  const cancelDeleteBill = () => {
    setShowDeleteBillModal(false);
    setBillToDelete(null);
  };

  const handleTogglePaidStatus = (billId) => {
    setUpcomingBills(prevBills => 
      prevBills.map(bill => 
        bill.id === billId 
          ? { ...bill, status: bill.status === 'paid' ? 'upcoming' : 'paid' } 
          : bill
      )
    );
    setShowOptionsMenu(null);
  };

  const handleSaveBill = (billData) => {
    if (editingBill) {
      // Update existing bill
      setUpcomingBills(prevBills => 
        prevBills.map(bill => 
          bill.id === editingBill.id 
            ? { ...bill, ...billData } 
            : bill
        )
      );
    } else {
      // Add new bill
      const newBill = {
        ...billData,
        id: Math.max(...upcomingBills.map(b => b.id), 0) + 1,
        status: 'upcoming'
      };
      setUpcomingBills(prevBills => [...prevBills, newBill]);
    }
    setShowBillModal(false);
    setEditingBill(null);
  };

  const hasEvent = (date) => {
    if (!date) return false;
    return upcomingBills.some(bill => isSameDate(new Date(bill.date), date));
  };

  /* ================= FINANCIAL HEALTH LOGIC ================= */

  let healthStatus = "Healthy";
  let insightText =
    "Your spending is within healthy limits. Keep up the good financial habits.";
  let barColor = "bg-success-500";
  let badgeColor = "bg-success-100 text-success-700";

  if (spendingRate >= 70 && spendingRate < 90) {
    healthStatus = "Watch";
    insightText =
      "Your expenses are increasing. Consider monitoring discretionary spending.";
    barColor = "bg-warning-500";
    badgeColor = "bg-warning-100 text-warning-700";
  }

  if (spendingRate >= 90) {
    healthStatus = "Critical";
    insightText =
      "Your expenses are dangerously close to your income. Immediate action is recommended.";
    barColor = "bg-danger-500";
    badgeColor = "bg-danger-100 text-danger-700";
  }

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Guest Mode Banner */}
      {auth?.isGuest && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-amber-100 dark:bg-amber-800/50 p-2 rounded-lg">
                <AlertCircle className="text-amber-600 dark:text-amber-400 w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-300 text-sm">Guest Mode - Data is Temporary</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  Create an account to save your data permanently (Limited to 50 transactions & 5 goals)
                </p>
              </div>
            </div>
            <Link 
              to="/register" 
              className="shrink-0 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm whitespace-nowrap"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}

      {/* Premium Header with Gold Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-dark-bg-primary dark:via-dark-surface-elevated dark:to-dark-surface-secondary rounded-2xl p-6 shadow-xl dark:shadow-elevated-dark border border-blue-500/20 dark:border-blue-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/10 dark:bg-blue-500/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/20 dark:border-blue-500/20 shadow-lg">
              <Wallet className="w-5 h-5 text-white dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white dark:bg-gradient-to-r dark:from-blue-400 dark:via-blue-300 dark:to-blue-500 dark:bg-clip-text dark:text-transparent">Financial Overview</h1>
          </div>
          <p className="text-white/80 dark:text-blue-200/60 text-sm ml-14">A comprehensive snapshot of your financial health</p>
        </div>
      </div>

      {/* Premium KPI Cards with Gold Accents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Income Card - Keep green but make it premium */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 dark:from-dark-surface-primary dark:to-dark-surface-secondary rounded-xl p-5 shadow-lg hover:shadow-xl border border-green-400/20 dark:border-blue-500/20 transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.02] dark:hover:shadow-glow-blue">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-blue-500/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white/20 dark:bg-green-500/10 backdrop-blur-sm p-2 rounded-lg border border-white/30 dark:border-green-500/20">
                <TrendingUp className="w-5 h-5 text-white dark:text-green-400" />
              </div>
              <div className="bg-green-700/50 dark:bg-green-500/20 px-3 py-1 rounded-full border border-white/20 dark:border-green-500/30">
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-white dark:text-green-300" />
                  <span className="text-xs font-semibold text-white dark:text-green-300">Income</span>
                </div>
              </div>
            </div>
            <p className="text-white/80 dark:text-green-200/60 text-xs font-medium mb-1">Total Income</p>
            <h2 className="text-3xl font-bold text-white dark:text-green-300 mb-1">
              {formatCurrency(income)}
            </h2>
            <p className="text-white/70 dark:text-green-200/50 text-xs">All time earnings</p>
          </div>
        </div>

        {/* Total Expense Card - Keep red but make it premium */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-red-500 via-red-600 to-rose-600 dark:from-dark-surface-primary dark:to-dark-surface-secondary rounded-xl p-5 shadow-lg hover:shadow-xl border border-red-400/20 dark:border-red-500/20 transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.02] dark:hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-red-500/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white/20 dark:bg-red-500/10 backdrop-blur-sm p-2 rounded-lg border border-white/30 dark:border-red-500/20">
                <TrendingDown className="w-5 h-5 text-white dark:text-red-400" />
              </div>
              <div className="bg-red-700/50 dark:bg-red-500/20 px-3 py-1 rounded-full border border-white/20 dark:border-red-500/30">
                <div className="flex items-center gap-1">
                  <ArrowDownRight className="w-3 h-3 text-white dark:text-red-300" />
                  <span className="text-xs font-semibold text-white dark:text-red-300">Expense</span>
                </div>
              </div>
            </div>
            <p className="text-white/80 dark:text-red-200/60 text-xs font-medium mb-1">Total Expense</p>
            <h2 className="text-3xl font-bold text-white dark:text-red-300 mb-1">
              {formatCurrency(expense)}
            </h2>
            <p className="text-white/70 dark:text-red-200/50 text-xs">All time spending</p>
          </div>
        </div>

        {/* Current Balance Card - Premium blue theme */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-dark-surface-elevated dark:to-dark-surface-primary rounded-xl p-5 shadow-lg hover:shadow-xl border border-blue-500/30 dark:border-blue-500/30 transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.02] dark:hover:shadow-glow-blue">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-blue-500/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white/20 dark:bg-blue-500/10 backdrop-blur-sm p-2 rounded-lg border border-white/30 dark:border-blue-500/20">
                <Wallet className="w-5 h-5 text-white dark:text-blue-400" />
              </div>
              <div className={`px-3 py-1 rounded-full border border-white/20 dark:border-blue-500/30 ${balance >= 0 ? 'bg-green-500/50 dark:bg-blue-500/20' : 'bg-red-500/50 dark:bg-red-500/20'}`}>
                <span className="text-xs font-semibold text-white dark:text-blue-300">
                  {balance >= 0 ? 'Positive' : 'Negative'}
                </span>
              </div>
            </div>
            <p className="text-white/80 dark:text-blue-200/60 text-xs font-medium mb-1">Current Balance</p>
            <h2 className={`text-3xl font-bold mb-1 ${balance >= 0 ? 'text-white dark:text-blue-300' : 'text-red-100 dark:text-red-300'}`}>
              {formatCurrency(balance)}
            </h2>
            <p className="text-white/70 dark:text-blue-200/50 text-xs">Net position</p>
          </div>
        </div>
      </div>

      {/* Three-Column Premium Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        
        {/* LEFT COLUMN - Spending Analysis + Actions */}
        <div className="space-y-4">
          {/* Compact Premium Spending Analysis */}
          <div className="bg-white dark:bg-dark-surface-primary rounded-xl p-4 shadow-lg dark:shadow-card-dark border border-gray-200 dark:border-dark-border-strong transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-glow-blue">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 dark:bg-blue-500/10 p-1.5 rounded-lg border border-blue-200 dark:border-blue-500/20">
                  <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Spending Analysis</h3>
                  <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">Expense ratio</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full font-semibold text-xs shadow-sm ${badgeColor} dark:bg-blue-500/20 dark:text-blue-400 dark:border dark:border-blue-500/30`}>
                {healthStatus}
              </span>
            </div>

          <div className="mb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900 dark:text-white">{spendingRate}%</span>
              <span className="text-xs text-gray-500 dark:text-dark-text-tertiary">of income</span>
            </div>
          </div>
          
          {/* Compact Visual Bar */}
          <div className="space-y-1">
            <div className="relative w-full bg-gray-100 dark:bg-dark-surface-secondary rounded-full h-2 overflow-hidden">
              <div className="absolute inset-0 flex">
                <div className="bg-success-200 dark:bg-success-500/20 w-[70%]"></div>
                <div className="bg-warning-200 dark:bg-warning-500/20 w-[20%]"></div>
                <div className="bg-danger-200 dark:bg-danger-500/20 w-[10%]"></div>
              </div>
              <div 
                className={`absolute top-0 bottom-0 ${barColor} dark:bg-gradient-to-r dark:from-blue-500 dark:to-blue-600 rounded-full transition-all duration-1000 ease-out shadow-sm`}
                style={{ width: `${Math.min(spendingRate, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 dark:text-dark-text-tertiary">
              <span>Healthy</span>
              <span>Watch</span>
              <span>Critical</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-600 dark:text-dark-text-secondary mt-2">
            {insightText}
          </p>
        </div>

          {/* Compact Action Required Card */}
          <div className="bg-white dark:bg-dark-surface-primary rounded-xl p-4 shadow-lg dark:shadow-card-dark border border-gray-200 dark:border-dark-border-strong transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-glow-blue">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-blue-100 dark:bg-blue-500/10 p-1.5 rounded-lg border border-blue-200 dark:border-blue-500/20">
                <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Action Required</h3>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Recommended next steps</p>
              </div>
            </div>

            <div className="space-y-3">
            {spendingRate >= 70 && (
              <button
                onClick={() => navigate("/analytics")}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-red-50 to-red-100 dark:from-dark-surface-secondary dark:to-dark-surface-hover hover:from-red-100 hover:to-red-200 dark:hover:from-dark-surface-hover dark:hover:to-dark-surface-elevated transition-all duration-300 group border border-red-200 dark:border-red-500/20 dark:hover:border-red-500/40"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-red-500 dark:bg-red-500/20 rounded-lg p-1.5 border border-red-600/10 dark:border-red-500/30">
                    <AlertTriangle className="w-3.5 h-3.5 text-white dark:text-red-400" />
                  </div>
                  <span className="text-xs font-medium text-red-900 dark:text-red-200">Review high-cost expense categories</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-red-600 dark:text-red-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            )}

            <button
              onClick={() => navigate("/goals")}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-dark-surface-secondary dark:to-dark-surface-hover hover:from-blue-100 hover:to-blue-200 dark:hover:from-dark-surface-hover dark:hover:to-dark-surface-elevated transition-all duration-300 group border border-blue-200 dark:border-blue-500/20 dark:hover:border-blue-500/40"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 dark:bg-blue-500/20 rounded-lg p-1.5 border border-blue-600/10 dark:border-blue-500/30">
                  <Target className="w-3.5 h-3.5 text-white dark:text-blue-400" />
                </div>
                <span className="text-xs font-medium text-blue-900 dark:text-blue-200">Set up your savings goal</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate("/recurring")}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-dark-surface-secondary dark:to-dark-surface-hover hover:from-blue-100 hover:to-blue-200 dark:hover:from-dark-surface-hover dark:hover:to-dark-surface-elevated transition-all duration-300 group border border-blue-200 dark:border-blue-500/20 dark:hover:border-blue-500/40"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 dark:bg-blue-500/20 rounded-lg p-1.5 border border-blue-600/10 dark:border-blue-500/30">
                  <Zap className="w-3.5 h-3.5 text-white dark:text-blue-400" />
                </div>
                <span className="text-xs font-medium text-blue-900 dark:text-blue-200">Optimize your subscriptions</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
      {/* End of LEFT COLUMN */}

        {/* CENTER COLUMN - Financial Calendar */}
        <div className="space-y-4">
          {/* Premium Financial Calendar */}
          <div className="bg-white dark:bg-dark-surface-primary rounded-xl p-4 shadow-lg dark:shadow-card-dark border border-gray-200 dark:border-dark-border-strong transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-glow-blue">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="bg-blue-100 dark:bg-blue-500/10 p-2 rounded-lg border border-blue-200 dark:border-blue-500/30">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Financial Calendar</h3>
                  <p className="text-xs text-gray-600 dark:text-dark-text-secondary">Upcoming bills and reminders</p>
                </div>
              </div>
            
            {/* Month Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={previousMonth}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-dark-text-secondary" />
              </button>
              <div className="text-center min-w-[120px]">
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </p>
              </div>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-dark-text-secondary" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="mb-2">
            {/* Day names header */}
            <div className="grid grid-cols-7 gap-1.5 mb-1.5">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-dark-text-tertiary py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1.5">
              {getDaysInMonth(currentDate).map((date, index) => {
                const isCurrentDay = isToday(date);
                const isSelected = isSameDate(date, selectedDate);
                const hasEventOnDay = hasEvent(date);
                
                return (
                  <button
                    key={index}
                    onClick={() => date && setSelectedDate(date)}
                    disabled={!date}
                    className={`
                      relative aspect-square rounded-lg transition-all duration-200
                      ${!date ? 'invisible' : ''}
                      ${isCurrentDay 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600 text-white font-bold shadow-md dark:shadow-glow-blue' 
                        : isSelected
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-300 font-semibold border border-blue-300 dark:border-blue-600'
                        : 'hover:bg-gray-100 dark:hover:bg-dark-surface-hover text-gray-900 dark:text-white hover:border hover:border-blue-300 dark:hover:border-blue-600/50'
                      }
                      ${hasEventOnDay && !isCurrentDay && !isSelected ? 'ring-2 ring-blue-300 dark:ring-blue-700' : ''}
                    `}
                  >
                    {date && (
                      <>
                        <span className="text-sm">{date.getDate()}</span>
                        {hasEventOnDay && !isCurrentDay && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-secondary-500"></div>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* End of CENTER COLUMN */}

        {/* RIGHT COLUMN - Bills & Obligations */}
        <div className="space-y-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-light-surface-primary via-light-surface-secondary to-light-bg-accent dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-tertiary rounded-xl p-5 shadow-premium dark:shadow-elevated-dark border border-light-border-default/50 dark:border-dark-border-strong/30">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
            
            {/* Upcoming Bills Section */}
            <div className="relative">
              {/* Header with Stats */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/20 dark:bg-blue-500/20 backdrop-blur-sm p-2.5 rounded-xl border border-blue-500/30 dark:border-blue-500/30 shadow-md dark:shadow-glow-blue">
                      <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold bg-gradient-to-r from-light-text-primary to-light-text-secondary dark:from-white dark:to-blue-300 bg-clip-text text-transparent">Bills & Obligations</h4>
                      <p className="text-xs text-light-text-secondary dark:text-blue-200/80">Track and manage your recurring payments</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleAddBill}
                    className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-glow-blue hover:shadow-xl dark:hover:shadow-glow-blue transition-all duration-200"
                    title="Add New Bill"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Stats - 2x2 Grid */}
                <div className="grid grid-cols-2 gap-2.5 mb-3">
                  <div className="group relative overflow-hidden bg-gradient-to-br from-danger-500 to-danger-600 rounded-xl p-3 shadow-lg border border-danger-400/20 transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.05] hover:shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg border border-white/30">
                          <XCircle className="w-3.5 h-3.5 text-white" />
                        </div>
                        <p className="text-xs font-semibold text-white">Overdue</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{billStats.overdue}</p>
                    </div>
                  </div>
                  
                  <div className="group relative overflow-hidden bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl p-3 shadow-lg border border-warning-400/20 transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.05] hover:shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg border border-white/30">
                          <Clock className="w-3.5 h-3.5 text-white" />
                        </div>
                        <p className="text-xs font-semibold text-white">Upcoming</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{billStats.upcoming}</p>
                    </div>
                  </div>
                  
                  <div className="group relative overflow-hidden bg-gradient-to-br from-success-500 to-success-600 rounded-xl p-3 shadow-lg border border-success-400/20 transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.05] hover:shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg border border-white/30">
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                        </div>
                        <p className="text-xs font-semibold text-white">Paid</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{billStats.paid}</p>
                    </div>
                  </div>
                  
                  <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600 rounded-xl p-3 shadow-lg border border-blue-400/20 dark:border-blue-400/20 transition-all duration-300 ease-in-out transform-gpu hover:scale-[1.05] hover:shadow-2xl dark:hover:shadow-glow-blue">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg border border-white/30">
                          <DollarSign className="w-3.5 h-3.5 text-white" />
                        </div>
                        <p className="text-xs font-semibold text-white">Total Due</p>
                      </div>
                      <p className="text-lg font-bold text-white">{formatCurrency(billStats.totalDue)}</p>
                    </div>
                  </div>
                </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="bg-blue-100 dark:bg-blue-500/10 p-1.5 rounded-lg border border-blue-200 dark:border-blue-500/20">
                  <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: 'all', label: 'All', count: upcomingBills.length },
                    { value: 'overdue', label: 'Overdue', count: billStats.overdue },
                    { value: 'upcoming', label: 'Upcoming', count: billStats.upcoming },
                    { value: 'paid', label: 'Paid', count: billStats.paid },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setBillFilter(filter.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                        billFilter === filter.value
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600 text-white border-blue-600 dark:border-blue-600 shadow-lg dark:shadow-glow-blue'
                          : 'bg-light-bg-accent dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary border-light-border-default dark:border-dark-border-strong hover:bg-light-bg-hover dark:hover:bg-dark-surface-hover'
                      }`}
                    >
                      {filter.label} <span className={billFilter === filter.value ? "opacity-90" : "opacity-60"}>({filter.count})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bills List */}
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
              {filteredBills.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-blue-100 dark:bg-blue-500/10 p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center mb-3">
                    <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm font-medium">No bills in this category</p>
                </div>
              ) : (
                filteredBills.map((bill) => {
                  const IconComponent = bill.icon;
                  const isOverdue = bill.status === 'overdue';
                  const isPaid = bill.status === 'paid';
                  const daysUntilDue = Math.ceil((bill.date - new Date()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div
                      key={bill.id}
                      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-xl dark:hover:shadow-glow-blue transform hover:-translate-y-0.5 ${
                        isOverdue
                          ? 'border-danger-200 dark:border-danger-500/40 bg-gradient-to-br from-danger-50 via-white to-danger-50/30 dark:from-danger-900/20 dark:via-dark-surface-primary dark:to-danger-900/10'
                          : isPaid
                          ? 'border-success-200 dark:border-success-500/40 bg-gradient-to-br from-success-50 via-white to-success-50/30 dark:from-success-900/20 dark:via-dark-surface-primary dark:to-success-900/10 opacity-75 hover:opacity-90'
                          : 'border-blue-200 dark:border-blue-500/40 bg-gradient-to-br from-blue-50 via-white to-blue-50/30 dark:from-blue-900/10 dark:via-dark-surface-primary dark:to-blue-900/5'
                      }`}
                    >
                      {/* Accent bar with glow effect */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 shadow-lg ${
                        isOverdue 
                          ? 'bg-gradient-to-b from-danger-500 to-danger-600 shadow-danger-500/50' 
                          : isPaid 
                          ? 'bg-gradient-to-b from-success-500 to-success-600 shadow-success-500/50' 
                          : 'bg-gradient-to-b from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600 shadow-blue-500/50 dark:shadow-blue-500/50'
                      }`}></div>

                      <div className="p-3 pl-4">
                        <div className="flex items-start gap-3">
                          {/* Premium Icon */}
                          <div className={`p-2 rounded-xl bg-gradient-to-br shadow-md flex-shrink-0 border ${
                            isOverdue
                              ? 'from-danger-100 to-danger-200 dark:from-danger-900/40 dark:to-danger-800/40 border-danger-200 dark:border-danger-500/30'
                              : isPaid
                              ? 'from-success-100 to-success-200 dark:from-success-900/40 dark:to-success-800/40 border-success-200 dark:border-success-500/30'
                              : 'from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 border-blue-200 dark:border-blue-500/30'
                          }`}>
                            <IconComponent className={`w-4 h-4 ${
                              isOverdue 
                                ? 'text-danger-600 dark:text-danger-400' 
                                : isPaid 
                                ? 'text-success-600 dark:text-success-400' 
                                : 'text-blue-600 dark:text-blue-400'
                            }`} />
                          </div>

                          {/* Bill Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary truncate">
                                    {bill.name}
                                  </h5>
                                  {isPaid && (
                                    <div className="px-2 py-0.5 rounded-full bg-success-100 dark:bg-success-900/30 border border-success-300 dark:border-success-500/40 flex-shrink-0">
                                      <p className="text-[10px] font-bold text-success-700 dark:text-success-400 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        PAID
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary capitalize">
                                  {bill.category}
                                </p>
                              </div>

                              {/* Amount - Premium */}
                              <div className="text-right flex-shrink-0">
                                <p className={`text-base font-bold leading-tight ${
                                  isOverdue 
                                    ? 'text-danger-600 dark:text-danger-400' 
                                    : isPaid 
                                    ? 'text-success-600 dark:text-success-400' 
                                    : 'text-blue-600 dark:text-blue-400'
                                }`}>
                                {formatCurrency(bill.amount)}
                                </p>
                              </div>
                            </div>

                            {/* Metadata Row */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2.5 text-xs text-light-text-tertiary dark:text-dark-text-tertiary flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {bill.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Repeat className="w-3.5 h-3.5" />
                                  {bill.frequency}
                                </span>
                                {!isPaid && (
                                  <span className={`font-bold px-2 py-0.5 rounded-full ${
                                    isOverdue 
                                      ? 'bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400' 
                                      : daysUntilDue <= 3 
                                      ? 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400'
                                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                  }`}>
                                    {isOverdue 
                                      ? `${Math.abs(daysUntilDue)}d overdue` 
                                      : `Due in ${daysUntilDue}d`
                                    }
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Premium Actions Row */}
                            <div className="flex items-center gap-2">
                              {!isPaid && (
                                <button 
                                  onClick={() => handlePayBill(bill)}
                                  className={`flex-1 px-4 py-2 rounded-lg font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg ${
                                    isOverdue
                                      ? 'bg-gradient-to-r from-danger-500 to-danger-600 hover:from-danger-600 hover:to-danger-700 text-white'
                                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white dark:shadow-glow-blue hover:dark:shadow-glow-blue'
                                  }`}
                                  title="Mark this bill as paid after completing payment outside the app"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Mark Paid
                                </button>
                              )}
                              <button 
                                onClick={() => setShowOptionsMenu(showOptionsMenu === bill.id ? null : bill.id)}
                                className="p-2 rounded-lg bg-light-bg-accent dark:bg-dark-surface-secondary hover:bg-light-bg-hover dark:hover:bg-dark-surface-hover border border-light-border-default dark:border-dark-border-strong transition-all opacity-0 group-hover:opacity-100 relative options-menu-container"
                              >
                                <MoreVertical className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
                              
                                {/* Options Dropdown */}
                                {showOptionsMenu === bill.id && (
                                  <div className="absolute right-0 top-full mt-2 w-52 bg-light-surface-primary dark:bg-dark-surface-primary rounded-xl shadow-2xl dark:shadow-glow-blue border border-light-border-default dark:border-blue-500/30 py-2 z-50 animate-fade-in">
                                    <button
                                      onClick={() => handleEditBill(bill)}
                                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-light-text-primary dark:text-dark-text-primary hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors flex items-center gap-2.5"
                                    >
                                      <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                      Edit Bill
                                    </button>
                                    <button
                                      onClick={() => handleTogglePaidStatus(bill.id)}
                                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-light-text-primary dark:text-dark-text-primary hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors flex items-center gap-2.5"
                                    >
                                      {isPaid ? (
                                        <>
                                          <XCircle className="w-4 h-4 text-warning-600 dark:text-warning-400" />
                                          Mark as Unpaid
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle className="w-4 h-4 text-success-600 dark:text-success-400" />
                                          Mark as Paid
                                        </>
                                      )}
                                    </button>
                                    <div className="h-px bg-light-border-subtle dark:bg-dark-border-default my-1"></div>
                                    <button
                                      onClick={() => handleDeleteBill(bill.id)}
                                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors flex items-center gap-2.5"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      Delete Bill
                                    </button>
                                  </div>
                                )}
                              </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
      {/* End of RIGHT COLUMN */}

      </div>
      {/* End of Three-Column Grid */}

      {/* Payment Confirmation Modal */}
      {showPaymentModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface-primary rounded-2xl shadow-xl dark:shadow-glow-gold max-w-md w-full p-6 animate-in border border-gray-200 dark:border-dark-border-strong">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Mark Bill as Paid</h3>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-dark-text-secondary mb-4">Have you completed the payment for this bill outside the app?</p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>This app tracks your bills. Complete actual payment through your bank, UPI, or payment app before confirming.</span>
                </p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-surface-secondary dark:to-dark-surface-elevated rounded-xl p-4 border border-gray-200 dark:border-dark-border-default">
                <div className="flex items-center gap-3 mb-2">
                  {selectedBill.icon && <selectedBill.icon className="w-6 h-6 text-gray-600 dark:text-dark-text-secondary" />}
                  <h4 className="font-bold text-gray-900 dark:text-white">{selectedBill.name}</h4>
                </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(selectedBill.amount)}</p>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">
                  Due: {new Date(selectedBill.date).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-lg p-3 mt-3">
                <p className="text-xs text-green-800 dark:text-green-300 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>This will create an expense transaction and update your balance automatically.</span>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedBill(null);
                }}
                disabled={paymentLoading}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-border-default text-gray-900 dark:text-white bg-white dark:bg-dark-surface-primary font-semibold hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={paymentLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-500 dark:bg-blue-500 text-white font-semibold hover:bg-blue-600 dark:hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg dark:hover:shadow-glow-blue disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {paymentLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Yes, Mark as Paid'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Bill Modal */}
      {showBillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-dark-surface-primary rounded-2xl shadow-xl dark:shadow-glow-gold max-w-2xl w-full p-6 my-8 border border-gray-200 dark:border-dark-border-strong">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {editingBill ? 'Edit Bill' : 'Add New Bill'}
            </h3>
            <BillForm 
              bill={editingBill}
              onSave={handleSaveBill}
              onCancel={() => {
                setShowBillModal(false);
                setEditingBill(null);
              }}
              formatCurrency={formatCurrency}
            />
          </div>
        </div>
      )}

      {/* Premium Delete Bill Confirmation Modal */}
      {showDeleteBillModal && billToDelete && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-light-surface-primary dark:bg-dark-surface-primary rounded-2xl shadow-2xl dark:shadow-[0_0_50px_rgba(59,130,246,0.3)] border border-light-border-default dark:border-blue-500/30 max-w-md w-full transform transition-all duration-300 animate-slide-up">
            <div className="p-6 border-b border-light-border-subtle dark:border-dark-border-default">
              <div className="flex items-center gap-3">
                <div className="bg-danger-100 dark:bg-danger-900/30 p-3 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-danger-600 dark:text-danger-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">Delete Bill</h3>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">This action cannot be undone</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6 bg-light-bg-accent dark:bg-dark-surface-secondary rounded-xl p-4 border border-light-border-default dark:border-dark-border-default">
                <div className="flex items-center gap-3 mb-3">
                  {billToDelete.icon && <billToDelete.icon className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />}
                  <h4 className="font-bold text-light-text-primary dark:text-dark-text-primary">{billToDelete.name}</h4>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-light-border-subtle dark:border-dark-border-default">
                  <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Amount</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(billToDelete.amount)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Frequency</span>
                  <span className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary capitalize">{billToDelete.frequency}</span>
                </div>
              </div>

              <p className="text-sm text-light-text-primary dark:text-dark-text-primary mb-6">
                Are you sure you want to delete this bill? This will permanently remove it from your scheduled payments.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={cancelDeleteBill}
                  className="flex-1 px-4 py-2.5 bg-light-bg-accent dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary rounded-lg font-semibold hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-all duration-200 border border-light-border-default dark:border-dark-border-strong"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteBill}
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

export default Dashboard;
