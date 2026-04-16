import React, { useState, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";
import { ContextMenu, InlineEditor, useToast } from "../components/ui";
import { useTransactions } from "../hooks/useTransactions";
import {
  useBills,
  useCreateBill,
  useDeleteBill,
  useMarkBillPaid,
  useUpdateBill,
} from "../hooks/useBills";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Calculator,
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
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
  Film
} from "lucide-react";

// Bill Form Component
const BillForm = ({ bill, onSave, onCancel }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: bill?.name || '',
    amount: bill?.amount || '',
    date: bill?.date ? new Date(bill.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    type: bill?.type || bill?.category || 'utility',
    category: bill?.category || bill?.type || 'utility',
    frequency: bill?.frequency || 'monthly',
    recurring: bill?.recurring !== undefined ? bill.recurring : true,
    icon: bill?.icon || Zap,
    color: bill?.color || 'blue'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.warning('Please enter a bill name');
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      toast.warning('Please enter a valid amount');
      return;
    }

    // Format date properly
    const billDate = new Date(formData.date);
    
    onSave({
      ...formData,
      amount: Number(formData.amount),
      date: billDate,
      // Map type to category for backend compatibility
      category: formData.type || formData.category,
      recurring: formData.recurring,
      frequency: formData.frequency
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

        {/* Recurring Checkbox */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 p-4 bg-light-bg-accent dark:bg-dark-surface-secondary rounded-lg border border-light-border-default dark:border-dark-border-strong">
            <input
              id="recurring"
              type="checkbox"
              checked={formData.recurring}
              onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
              className="w-4 h-4 text-primary-600 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 transition-all cursor-pointer"
            />
            <label
              htmlFor="recurring"
              className="flex-1 cursor-pointer select-none"
            >
              <div className="font-semibold text-light-text-primary dark:text-dark-text-primary">Recurring Bill</div>
              <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">This bill repeats automatically based on the frequency selected</div>
            </label>
          </div>
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

const toStartOfDay = (date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const toEndOfDay = (date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

const formatDateInputValue = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateInputValue = (value, endOfDay = false) => {
  const [yearRaw, monthRaw, dayRaw] = String(value).split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const parsed = endOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day, 0, 0, 0, 0);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const getPresetDateBounds = (range, referenceDate = new Date()) => {
  const now = new Date(referenceDate);
  const endDate = toEndOfDay(now);
  let startDate = toStartOfDay(now);

  switch (range) {
    case 'week': {
      startDate = toStartOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
      break;
    }
    case 'thisMonth': {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      break;
    }
    case 'thisYear': {
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      break;
    }
    case 'pastYear': {
      startDate = toStartOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 365));
      break;
    }
    default: {
      startDate = toStartOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
      break;
    }
  }

  return { startDate, endDate };
};

const Dashboard = ({ auth }) => {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const toast = useToast();

  const {
    data: transactions = [],
    isLoading: transactionsLoading,
  } = useTransactions();
  const {
    data: bills = [],
    isLoading: billsLoading,
    isError: billsLoadFailed,
  } = useBills({ enabled: !auth?.isGuest });
  const createBillMutation = useCreateBill();
  const updateBillMutation = useUpdateBill();
  const deleteBillMutation = useDeleteBill();
  const markBillPaidMutation = useMarkBillPaid();
  const loading = transactionsLoading || billsLoading;
  const [currentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeBillAction, setActiveBillAction] = useState(null);
  const [activeBillMenuId, setActiveBillMenuId] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [editingBill, setEditingBill] = useState(null);
  const [billToDelete, setBillToDelete] = useState(null);
  const defaultCustomRange = useMemo(() => getPresetDateBounds('week'), []);
  const [timeRange, setTimeRange] = useState('week');
  const [customDateRange, setCustomDateRange] = useState(defaultCustomRange);
  const [customRangeDraft, setCustomRangeDraft] = useState(defaultCustomRange);
  const [showCustomRangePanel, setShowCustomRangePanel] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcStoredValue, setCalcStoredValue] = useState(null);
  const [calcOperator, setCalcOperator] = useState(null);
  const [calcWaitingForNextValue, setCalcWaitingForNextValue] = useState(false);
  const paymentLoading = markBillPaidMutation.isPending;

  const normalizeCalculatorResult = useCallback((value) => {
    if (!Number.isFinite(value)) {
      return 'Error';
    }
    const rounded = Math.round((value + Number.EPSILON) * 1000000) / 1000000;
    return String(rounded);
  }, []);

  const formatCalculatorDisplay = useCallback((value) => {
    if (!value || value === 'Error') {
      return value || '0';
    }

    const isNegative = value.startsWith('-');
    const rawValue = isNegative ? value.slice(1) : value;
    const [wholePart, decimalPart] = rawValue.split('.');
    const safeWhole = wholePart === '' ? '0' : wholePart;
    const formattedWhole = Number(safeWhole).toLocaleString('en-US');
    const formattedValue = decimalPart !== undefined
      ? `${formattedWhole}.${decimalPart}`
      : formattedWhole;

    return isNegative ? `-${formattedValue}` : formattedValue;
  }, []);

  const evaluateCalculatorExpression = useCallback((left, right, operator) => {
    switch (operator) {
      case '+':
        return normalizeCalculatorResult(left + right);
      case '-':
        return normalizeCalculatorResult(left - right);
      case '*':
        return normalizeCalculatorResult(left * right);
      case '/':
        return right === 0 ? 'Error' : normalizeCalculatorResult(left / right);
      default:
        return normalizeCalculatorResult(right);
    }
  }, [normalizeCalculatorResult]);

  const handleCalculatorNumber = useCallback((nextValue) => {
    if (calcDisplay === 'Error') {
      setCalcDisplay(nextValue === '.' ? '0.' : nextValue);
      setCalcWaitingForNextValue(false);
      return;
    }

    if (calcWaitingForNextValue) {
      setCalcDisplay(nextValue === '.' ? '0.' : nextValue);
      setCalcWaitingForNextValue(false);
      return;
    }

    if (nextValue === '.' && calcDisplay.includes('.')) {
      return;
    }

    if (calcDisplay === '0' && nextValue !== '.') {
      setCalcDisplay(nextValue);
      return;
    }

    setCalcDisplay((prev) => `${prev}${nextValue}`);
  }, [calcDisplay, calcWaitingForNextValue]);

  const handleCalculatorOperator = useCallback((nextOperator) => {
    if (calcDisplay === 'Error') {
      setCalcDisplay('0');
      setCalcStoredValue(null);
      setCalcOperator(nextOperator);
      setCalcWaitingForNextValue(true);
      return;
    }

    const inputValue = Number(calcDisplay);

    if (calcStoredValue === null) {
      setCalcStoredValue(inputValue);
    } else if (calcOperator && !calcWaitingForNextValue) {
      const result = evaluateCalculatorExpression(calcStoredValue, inputValue, calcOperator);
      if (result === 'Error') {
        setCalcDisplay('Error');
        setCalcStoredValue(null);
        setCalcOperator(null);
        setCalcWaitingForNextValue(true);
        return;
      }

      setCalcDisplay(result);
      setCalcStoredValue(Number(result));
    }

    setCalcOperator(nextOperator);
    setCalcWaitingForNextValue(true);
  }, [calcDisplay, calcStoredValue, calcOperator, calcWaitingForNextValue, evaluateCalculatorExpression]);

  const handleCalculatorEquals = useCallback(() => {
    if (calcOperator === null || calcStoredValue === null || calcDisplay === 'Error') {
      return;
    }

    const result = evaluateCalculatorExpression(calcStoredValue, Number(calcDisplay), calcOperator);
    setCalcDisplay(result);
    setCalcStoredValue(result === 'Error' ? null : Number(result));
    setCalcOperator(null);
    setCalcWaitingForNextValue(true);
  }, [calcDisplay, calcOperator, calcStoredValue, evaluateCalculatorExpression]);

  const handleCalculatorClear = useCallback(() => {
    setCalcDisplay('0');
    setCalcStoredValue(null);
    setCalcOperator(null);
    setCalcWaitingForNextValue(false);
  }, []);

  const handleCalculatorBackspace = useCallback(() => {
    if (calcWaitingForNextValue || calcDisplay === 'Error') {
      setCalcDisplay('0');
      setCalcWaitingForNextValue(false);
      return;
    }

    setCalcDisplay((prev) => {
      if (prev.length <= 1 || (prev.length === 2 && prev.startsWith('-'))) {
        return '0';
      }
      return prev.slice(0, -1);
    });
  }, [calcDisplay, calcWaitingForNextValue]);

  const handleCalculatorPercent = useCallback(() => {
    if (calcDisplay === 'Error') {
      return;
    }
    const value = Number(calcDisplay) / 100;
    setCalcDisplay(normalizeCalculatorResult(value));
    setCalcWaitingForNextValue(true);
  }, [calcDisplay, normalizeCalculatorResult]);

  const handleCalculatorToggleSign = useCallback(() => {
    if (calcDisplay === '0' || calcDisplay === 'Error') {
      return;
    }
    setCalcDisplay((prev) => (prev.startsWith('-') ? prev.slice(1) : `-${prev}`));
  }, [calcDisplay]);

  /* ================= KPI CALCULATIONS ================= */

  const rangeOptions = [
    { value: 'week', label: 'Last 7 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'pastYear', label: 'Past Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const rangeLabelMap = {
    week: 'Last 7 days',
    thisMonth: 'This month',
    thisYear: 'This year',
    pastYear: 'Past year',
    custom: 'Custom range',
  };

  const getRangeBounds = useCallback((range) => {
    if (range === 'custom') {
      return {
        startDate: toStartOfDay(customDateRange.startDate),
        endDate: toEndOfDay(customDateRange.endDate),
      };
    }

    return getPresetDateBounds(range);
  }, [customDateRange]);

  const selectedRangeLabel = timeRange !== 'custom'
    ? (rangeLabelMap[timeRange] || 'Last 7 days')
    : `${customDateRange.startDate.toLocaleDateString()} - ${customDateRange.endDate.toLocaleDateString()}`;

  const handleTimeRangeChange = useCallback((nextRange) => {
    setTimeRange(nextRange);

    if (nextRange === 'custom') {
      setCustomRangeDraft(customDateRange);
      setShowCustomRangePanel(true);
      return;
    }

    setShowCustomRangePanel(false);
  }, [customDateRange]);

  const handleCustomDateDraftChange = useCallback((field, value) => {
    const parsed = parseDateInputValue(value, field === 'endDate');
    if (!parsed) {
      return;
    }

    setCustomRangeDraft((prev) => ({
      ...prev,
      [field]: parsed,
    }));
  }, []);

  const handleApplyCustomRange = useCallback(() => {
    const startDate = toStartOfDay(customRangeDraft.startDate);
    const endDate = toEndOfDay(customRangeDraft.endDate);

    if (startDate > endDate) {
      toast.warning('From date must be before To date');
      return;
    }

    setCustomDateRange({ startDate, endDate });
    setTimeRange('custom');
    setShowCustomRangePanel(false);
  }, [customRangeDraft.endDate, customRangeDraft.startDate, toast]);

  const handleCancelCustomRange = useCallback(() => {
    setCustomRangeDraft(customDateRange);
    setShowCustomRangePanel(false);
  }, [customDateRange]);

  const handleQuickCustomPreset = useCallback((presetValue) => {
    const presetRange = getPresetDateBounds(presetValue);
    setCustomRangeDraft(presetRange);
  }, []);

  const filteredTransactions = useMemo(() => {
    const { startDate, endDate } = getRangeBounds(timeRange);

    return transactions.filter((transaction) => {
      const txDate = new Date(transaction.date);
      return !Number.isNaN(txDate.getTime()) && txDate >= startDate && txDate <= endDate;
    });
  }, [getRangeBounds, timeRange, transactions]);

  const income = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const expense = filteredTransactions
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

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Helper function to get icon component from name
  const getBillIconComponent = useCallback((iconName) => {
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
  }, []);

  // Helper to determine bill status
  const getBillStatus = useCallback((dueDate, isPaid) => {
    if (isPaid) return 'paid';
    const now = new Date();
    const due = new Date(dueDate);
    if (due < now) return 'overdue';
    return 'upcoming';
  }, []);

  const upcomingBills = useMemo(
    () =>
      bills.map((bill) => ({
        ...bill,
        date: new Date(bill.dueDate),
        icon: getBillIconComponent(bill.category),
        status: getBillStatus(new Date(bill.dueDate), bill.isPaid),
      })),
    [bills, getBillIconComponent, getBillStatus]
  );

  /* ================= BILL HANDLERS ================= */

  const handlePayBill = (bill) => {
    setSelectedBill(bill);
    setActiveBillAction('pay');
  };

  const handleConfirmPayment = async () => {
    try {
      const billId = selectedBill?._id || selectedBill?.id;
      if (!billId) {
        throw new Error("Bill ID missing");
      }

      await markBillPaidMutation.mutateAsync({
        billId,
        createTransaction: true,
      });

      setActiveBillAction(null);
      setSelectedBill(null);
      toast.success("Bill marked as paid");
    } catch (error) {
      toast.error(error.message || "Failed to record payment. Please try again.");
    }
  };

  const handleAddBill = () => {
    setEditingBill(null);
    setActiveBillAction('create');
  };

  const handleEditBill = (bill) => {
    setEditingBill(bill);
    setActiveBillAction('edit');
  };

  const handleDeleteBill = (billId) => {
    const bill = upcomingBills.find(b => b._id === billId || b.id === billId);
    setBillToDelete(bill);
    setActiveBillAction('delete');
    setActiveBillMenuId(null);
  };

  const confirmDeleteBill = async () => {
    if (billToDelete) {
      try {
        await deleteBillMutation.mutateAsync(billToDelete._id);
        toast.success('Bill deleted successfully');
        
        setActiveBillAction(null);
        setBillToDelete(null);
        setActiveBillMenuId(null);
      } catch (error) {
        toast.error(error.message || 'Error deleting bill');
      }
    }
  };

  const cancelDeleteBill = () => {
    setActiveBillAction(null);
    setBillToDelete(null);
  };

  const handleTogglePaidStatus = async (billId) => {
    try {
      const bill = upcomingBills.find(b => b._id === billId || b.id === billId);
      if (!bill) return;

      await updateBillMutation.mutateAsync({
        billId: bill._id,
        billData: {
          isPaid: bill.status !== 'paid',
          paidDate: bill.status !== 'paid' ? new Date().toISOString() : null,
        },
      });

      toast.success(bill.status === 'paid' ? 'Bill marked as unpaid' : 'Bill status updated');
    } catch (error) {
      toast.error(error.message || 'Error toggling bill status');
    }
  };

  const handleSaveBill = async (billData) => {
    try {
      const payload = {
        name: billData.name,
        amount: billData.amount,
        category: billData.category,
        dueDate: billData.date,
        recurring: billData.recurring || false,
        frequency: billData.frequency || 'monthly',
        reminderDays: billData.reminderDays || 3,
        notes: billData.notes || ''
      };

      if (editingBill) {
        await updateBillMutation.mutateAsync({
          billId: editingBill._id,
          billData: payload,
        });
        toast.success('Bill updated successfully');
      } else {
        await createBillMutation.mutateAsync(payload);
        toast.success('Bill added successfully');
      }
      
      setActiveBillAction(null);
      setEditingBill(null);
    } catch (error) {
      toast.error(error.message || 'Error saving bill');
    }
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

  const recentTransactions = [...filteredTransactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  const selectedDateBills = selectedDate
    ? upcomingBills.filter((bill) => isSameDate(new Date(bill.date), selectedDate))
    : [];

  const activityChartData = useMemo(() => {
    const now = new Date();
    const { startDate: rangeStart, endDate: rangeEnd } = getRangeBounds(timeRange);
    const chartEnd = rangeEnd || now;

    let startDate;
    if (rangeStart) {
      startDate = new Date(rangeStart);
      startDate.setHours(0, 0, 0, 0);
    } else {
      const earliestTx = filteredTransactions
        .map((transaction) => new Date(transaction.date))
        .filter((date) => !Number.isNaN(date.getTime()))
        .sort((a, b) => a - b)[0];

      if (earliestTx) {
        startDate = new Date(earliestTx);
        startDate.setHours(0, 0, 0, 0);
      } else {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
      }
    }

    const dayWindow = Math.max(1, Math.ceil((chartEnd - startDate) / (1000 * 60 * 60 * 24)) + 1);

    const seed = Array.from({ length: dayWindow }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      return {
        key: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        net: 0,
      };
    });

    const seededMap = new Map(seed.map((entry) => [entry.key, { ...entry }]));
    filteredTransactions.forEach((transaction) => {
      const txDate = new Date(transaction.date);
      if (txDate < startDate || txDate > chartEnd) return;
      const dayKey = txDate.toISOString().slice(0, 10);
      const entry = seededMap.get(dayKey);
      if (!entry) return;

      const amount = Number(transaction.amount || 0);
      entry.net += transaction.type === 'income' ? amount : -amount;
    });

    let runningValue = 0;
    return Array.from(seededMap.values()).map((entry) => {
      runningValue += entry.net;
      return {
        ...entry,
        value: Number(runningValue.toFixed(2)),
      };
    });
  }, [filteredTransactions, getRangeBounds, timeRange]);

  const activityGrowth = useMemo(() => {
    if (activityChartData.length < 2) return 0;
    const firstValue = activityChartData[0].value;
    const lastValue = activityChartData[activityChartData.length - 1].value;
    const baseline = Math.max(Math.abs(firstValue), 1);
    return Math.round(((lastValue - firstValue) / baseline) * 100);
  }, [activityChartData]);

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
    <div className="space-y-4 animate-fade-in">
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

      {billsLoadFailed && (
        <div className="rounded-lg border border-warning-200 dark:border-warning-500/30 bg-warning-50 dark:bg-warning-500/10 px-3 py-2">
          <p className="text-xs font-medium text-warning-700 dark:text-warning-300">Bills could not be refreshed right now. Bill actions will retry automatically.</p>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-dark-border-strong bg-white dark:bg-dark-surface-primary p-4 shadow-lg dark:shadow-card-dark">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500 dark:text-dark-text-tertiary">Portfolio Snapshot</p>
            <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{formatCurrency(balance)}</p>
            <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-1">
              Savings share: {income + expense === 0 ? 0 : Math.round((Math.max(balance, 0) / (income + expense)) * 100)}% of total flow in {selectedRangeLabel.toLowerCase()}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 md:w-auto">
            <button onClick={() => navigate('/wallet')} className="px-4 py-2 rounded-lg border border-blue-300/40 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">Wallet</button>
            <button onClick={() => navigate('/transactions')} className="px-4 py-2 rounded-lg border border-blue-300/40 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">Activity</button>
            <button onClick={() => navigate('/transfers')} className="px-4 py-2 rounded-lg border border-blue-300/40 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">Transfer</button>
          </div>
        </div>
      </div>

      {/* Top Summary Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-stretch">
        <div className="xl:col-span-4 h-full bg-white dark:bg-dark-surface-primary rounded-xl p-3 shadow-lg dark:shadow-card-dark border border-gray-200 dark:border-dark-border-strong">
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Financial Summary</h2>
              <p className="text-[11px] text-gray-500 dark:text-dark-text-tertiary">{selectedRangeLabel}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 mb-1.5">
            <div className="rounded-lg border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 p-2">
              <p className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">Net Savings</p>
              <p className={`text-xs font-bold ${balance >= 0 ? 'text-blue-800 dark:text-blue-300' : 'text-red-700 dark:text-red-400'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-dark-border-default bg-gray-50 dark:bg-dark-surface-secondary p-2">
              <p className="text-[11px] text-gray-600 dark:text-dark-text-tertiary font-medium">Spend Ratio</p>
              <p className="text-xs font-bold text-gray-900 dark:text-white">{spendingRate}%</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="rounded-lg border border-green-200 dark:border-green-500/20 bg-gradient-to-r from-green-50 to-green-100/70 dark:from-green-500/10 dark:to-green-500/5 p-2">
              <p className="text-[11px] font-semibold text-green-700 dark:text-green-400">Income</p>
              <p className="text-2xl font-semibold text-green-800 dark:text-green-300 truncate">{formatCurrency(income)}</p>
            </div>
            <div className="rounded-lg border border-red-200 dark:border-red-500/20 bg-gradient-to-r from-red-50 to-red-100/70 dark:from-red-500/10 dark:to-red-500/5 p-2">
              <p className="text-[11px] font-semibold text-red-700 dark:text-red-400">Expense</p>
              <p className="text-2xl font-semibold text-red-800 dark:text-red-300 truncate">{formatCurrency(expense)}</p>
            </div>
            <div className="rounded-lg border border-blue-200 dark:border-blue-500/20 bg-gradient-to-r from-blue-50 to-blue-100/70 dark:from-blue-500/10 dark:to-blue-500/5 p-2">
              <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">Savings</p>
              <p className={`text-2xl font-semibold truncate ${balance >= 0 ? 'text-blue-800 dark:text-blue-300' : 'text-red-700 dark:text-red-400'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
          </div>
        </div>

        <div className="xl:col-span-8 bg-white dark:bg-dark-surface-primary rounded-xl p-4 shadow-lg dark:shadow-card-dark border border-gray-200 dark:border-dark-border-strong relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/70 via-transparent to-emerald-50/70 dark:from-blue-500/5 dark:to-emerald-500/5 pointer-events-none"></div>
          <div className="relative">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="bg-blue-100 dark:bg-blue-500/10 p-2 rounded-lg border border-blue-200 dark:border-blue-500/20">
                  <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Spending Analytics</h3>
                  <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">How your spending tracks against income ({selectedRangeLabel})</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={timeRange}
                  onChange={(event) => handleTimeRangeChange(event.target.value)}
                  className="px-2 py-1 rounded-lg border border-blue-200 dark:border-blue-500/30 bg-white dark:bg-dark-surface-secondary text-[11px] font-semibold text-blue-700 dark:text-blue-300"
                >
                  {rangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className={`px-2.5 py-1 rounded-full font-semibold text-xs shadow-sm ${badgeColor} dark:bg-blue-500/20 dark:text-blue-400 dark:border dark:border-blue-500/30`}>
                  {healthStatus}
                </span>
              </div>
            </div>

            {timeRange === 'custom' && showCustomRangePanel && (
              <div className="mb-3 rounded-xl border border-blue-200 dark:border-blue-500/30 bg-white dark:bg-dark-surface-secondary p-3 shadow-lg">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-text-tertiary">Custom Date Range</p>
                <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                  <button
                    type="button"
                    onClick={() => handleQuickCustomPreset('week')}
                    className="rounded-lg border border-gray-200 dark:border-dark-border-default px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-dark-text-primary dark:hover:bg-dark-surface-hover"
                  >
                    Last 7 days
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCustomPreset('thisMonth')}
                    className="rounded-lg border border-gray-200 dark:border-dark-border-default px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-dark-text-primary dark:hover:bg-dark-surface-hover"
                  >
                    This month
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCustomPreset('thisYear')}
                    className="rounded-lg border border-gray-200 dark:border-dark-border-default px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-dark-text-primary dark:hover:bg-dark-surface-hover"
                  >
                    This year
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCustomPreset('pastYear')}
                    className="rounded-lg border border-gray-200 dark:border-dark-border-default px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-dark-text-primary dark:hover:bg-dark-surface-hover"
                  >
                    Past year
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-text-tertiary">
                    From
                    <input
                      type="date"
                      value={formatDateInputValue(customRangeDraft.startDate)}
                      onChange={(event) => handleCustomDateDraftChange('startDate', event.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-200 dark:border-dark-border-default bg-white dark:bg-dark-surface-primary px-2.5 py-1.5 text-sm text-gray-800 dark:text-dark-text-primary"
                    />
                  </label>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-text-tertiary">
                    To
                    <input
                      type="date"
                      value={formatDateInputValue(customRangeDraft.endDate)}
                      onChange={(event) => handleCustomDateDraftChange('endDate', event.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-200 dark:border-dark-border-default bg-white dark:bg-dark-surface-primary px-2.5 py-1.5 text-sm text-gray-800 dark:text-dark-text-primary"
                    />
                  </label>
                </div>

                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancelCustomRange}
                    className="rounded-lg border border-gray-200 dark:border-dark-border-default px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:text-dark-text-secondary dark:hover:bg-dark-surface-hover"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyCustomRange}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-3">
              <div className="rounded-lg border border-gray-200 dark:border-dark-border-strong bg-gray-50 dark:bg-dark-surface-secondary p-2.5">
                <p className="text-[11px] font-medium text-gray-500 dark:text-dark-text-tertiary">Spending Rate</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{spendingRate}%</p>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-dark-border-strong bg-gray-50 dark:bg-dark-surface-secondary p-2.5">
                <p className="text-[11px] font-medium text-gray-500 dark:text-dark-text-tertiary">Current Savings</p>
                <p className={`text-lg font-bold ${income - expense >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-400'}`}>
                  {formatCurrency(income - expense)}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-dark-border-strong bg-gray-50 dark:bg-dark-surface-secondary p-2.5">
                <p className="text-[11px] font-medium text-gray-500 dark:text-dark-text-tertiary">Status</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{healthStatus}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-indigo-500/30 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900/60 dark:to-slate-950/50 p-2 mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">Activity Flow</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${activityGrowth >= 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'}`}>
                  {activityGrowth >= 0 ? '+' : ''}{activityGrowth}%
                </span>
              </div>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={120}>
                  <AreaChart data={activityChartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dashboardActivityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(148,163,184,0.20)" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={20} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis hide domain={["auto", "auto"]} />
                    <Tooltip
                      cursor={{ stroke: '#818cf8', strokeOpacity: 0.35, strokeWidth: 1 }}
                      contentStyle={{
                        background: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(99, 102, 241, 0.35)',
                        borderRadius: '10px',
                        color: '#e2e8f0',
                        fontSize: '11px',
                      }}
                      labelStyle={{ color: '#cbd5e1', marginBottom: '4px' }}
                      formatter={(value) => [formatCurrency(Number(value || 0)), 'Net Balance Trend']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#818cf8"
                      strokeWidth={2.2}
                      fill="url(#dashboardActivityGradient)"
                      activeDot={{ r: 4, strokeWidth: 0, fill: '#a5b4fc' }}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="relative w-full bg-gray-100 dark:bg-dark-surface-secondary rounded-full h-2.5 overflow-hidden">
                <div className="absolute inset-0 flex">
                  <div className="bg-success-200 dark:bg-success-500/20 w-[70%]"></div>
                  <div className="bg-warning-200 dark:bg-warning-500/20 w-[20%]"></div>
                  <div className="bg-danger-200 dark:bg-danger-500/20 w-[10%]"></div>
                </div>
                <div
                  className={`absolute top-0 bottom-0 ${barColor} dark:bg-gradient-to-r dark:from-blue-500 dark:to-blue-600 rounded-full transition-all duration-1000 ease-out shadow-sm`}
                  style={{ inlineSize: `${Math.min(spendingRate, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-gray-400 dark:text-dark-text-tertiary">
                <span>Healthy</span>
                <span>Watch</span>
                <span>Critical</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-dark-text-secondary pt-1">{insightText}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Three-Column Premium Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-stretch w-full">

        {/* LEFT COLUMN - Recent Activity */}
        <div className="xl:col-span-4 order-2 xl:order-2 h-full">
          <div className="h-full xl:h-[430px] bg-white dark:bg-dark-surface-primary rounded-xl p-3 shadow-lg dark:shadow-card-dark border border-gray-200 dark:border-dark-border-strong transition-all duration-300 ease-in-out transform-gpu hover:translate-y-[-2px] hover:shadow-xl dark:hover:shadow-glow-blue flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-100 dark:bg-blue-500/10 p-1.5 rounded-lg border border-blue-200 dark:border-blue-500/20">
                <DollarSign className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Latest money movement</p>
              </div>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="flex-1 min-h-0 flex items-center justify-center">
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-1.5 pr-0.5 flex-1 min-h-0 overflow-y-auto">
                {recentTransactions.map((tx) => {
                  const isIncome = tx.type === "income";
                  return (
                    <div key={tx._id} className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-light-border-default dark:border-dark-border-default bg-light-bg-accent dark:bg-dark-surface-secondary">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary truncate">{tx.category || 'Transaction'}</p>
                        <p className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary truncate">
                          {tx.note || new Date(tx.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className={`text-xs font-bold whitespace-nowrap ${isIncome ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => navigate("/transactions")}
              className="w-full mt-2 px-3 py-1.5 rounded-lg border border-light-border-default dark:border-dark-border-strong text-xs font-semibold text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-surface-hover transition-colors"
            >
              View All Transactions
            </button>
          </div>
        </div>

        {/* CENTER COLUMN - Financial Calendar */}
        <div className="xl:col-span-4 order-1 xl:order-1 h-full">
          <div className="h-full xl:h-[430px] bg-white dark:bg-dark-surface-primary rounded-xl p-3 shadow-lg dark:shadow-card-dark border border-gray-200 dark:border-dark-border-strong transition-all duration-300 ease-in-out transform-gpu hover:translate-y-[-2px] hover:shadow-xl dark:hover:shadow-glow-blue flex flex-col">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="bg-blue-100 dark:bg-blue-500/10 p-2 rounded-lg border border-blue-200 dark:border-blue-500/30">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Financial Calendar</h3>
                  <p className="text-xs text-gray-600 dark:text-dark-text-secondary">Upcoming bills and reminders</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => selectedDate && navigate(`/bills-reminders?date=${selectedDate.toISOString().split('T')[0]}`)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-300 hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="mb-1 flex-1 min-h-0 overflow-y-auto pr-0.5">
              <div className="grid grid-cols-7 gap-1 mb-1.5">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-dark-text-tertiary py-0.5">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
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
                        relative h-8 rounded-lg transition-all duration-200
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
                      {date && <span className="text-sm">{date.getDate()}</span>}
                    </button>
                  );
                })}
              </div>

              <div className="mt-1.5 pt-1.5 border-t border-gray-200 dark:border-dark-border-default">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white leading-tight">
                      {(selectedDate || new Date()).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-dark-text-tertiary">Bills and reminders for this day</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBill}
                    className="px-2.5 py-1.5 rounded-lg border border-blue-300 dark:border-blue-600 text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                  >
                    Add Bill
                  </button>
                </div>

                {selectedDateBills.length === 0 ? (
                  <p className="text-[11px] text-gray-500 dark:text-dark-text-tertiary">No bills scheduled on this date.</p>
                ) : (
                  <div className="space-y-1 pr-0.5">
                    {selectedDateBills.map((bill) => (
                      <div key={bill._id || bill.id} className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 dark:border-slate-700/80 bg-gray-50 dark:bg-slate-900/65 px-2.5 py-2">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-gray-900 dark:text-white truncate">{bill.name}</p>
                          <p className="text-[10px] text-gray-500 dark:text-dark-text-tertiary capitalize">{bill.frequency}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[11px] font-bold text-blue-700 dark:text-blue-300 whitespace-nowrap">{formatCurrency(bill.amount)}</p>
                          <ContextMenu
                            isOpen={activeBillMenuId === (bill._id || bill.id)}
                            onOpenChange={(open) => setActiveBillMenuId(open ? (bill._id || bill.id) : null)}
                            buttonClassName="p-1.5"
                            menuClassName="w-44"
                            items={[
                              {
                                key: 'pay',
                                label: bill.status === 'paid' ? 'Mark Unpaid' : 'Mark Paid',
                                onClick: () => {
                                  if (bill.status === 'paid') {
                                    handleTogglePaidStatus(bill._id || bill.id);
                                  } else {
                                    handlePayBill(bill);
                                  }
                                },
                              },
                              { key: 'edit', label: 'Edit Bill', onClick: () => handleEditBill(bill) },
                              { key: 'delete', label: 'Delete Bill', onClick: () => handleDeleteBill(bill._id || bill.id), variant: 'danger' },
                            ]}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Premium Calculator */}
        <div className="xl:col-span-4 order-3 xl:order-3 h-full">
          <div className="h-full xl:h-[430px] relative overflow-hidden bg-gradient-to-br from-light-surface-primary via-light-surface-secondary to-light-bg-accent dark:from-dark-bg-primary dark:via-dark-bg-secondary dark:to-dark-bg-tertiary rounded-xl p-3 shadow-premium dark:shadow-elevated-dark border border-light-border-default/50 dark:border-dark-border-strong/30 flex flex-col">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>

            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 dark:bg-blue-500/20 backdrop-blur-sm p-2 rounded-xl border border-blue-500/30 dark:border-blue-500/30 shadow-md dark:shadow-glow-blue">
                    <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold bg-gradient-to-r from-light-text-primary to-light-text-secondary dark:from-white dark:to-blue-300 bg-clip-text text-transparent">Calculator</h4>
                    <p className="text-xs text-light-text-secondary dark:text-blue-200/80">Quick math for planning and checks</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCalculatorClear}
                  className="px-3 py-1.5 rounded-lg border border-blue-300/40 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                >
                  Reset
                </button>
              </div>

              <div className="rounded-xl border border-blue-200/60 dark:border-blue-500/30 bg-gradient-to-br from-blue-500 to-blue-700 p-3 text-white shadow-lg mb-2">
                <p className="text-[11px] text-blue-100 h-4">
                  {calcStoredValue !== null && calcOperator ? `${formatCalculatorDisplay(String(calcStoredValue))} ${calcOperator}` : 'Precision mode'}
                </p>
                <p className="text-3xl font-bold mt-1 truncate">{formatCalculatorDisplay(calcDisplay)}</p>
              </div>

              <div className="grid grid-cols-4 gap-1.5 flex-1 min-h-0">
                <button type="button" onClick={handleCalculatorClear} className="rounded-lg border border-red-200 dark:border-red-500/40 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">AC</button>
                <button type="button" onClick={handleCalculatorToggleSign} className="rounded-lg border border-gray-200 dark:border-dark-border-strong bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white text-sm font-semibold hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors">+/-</button>
                <button type="button" onClick={handleCalculatorPercent} className="rounded-lg border border-gray-200 dark:border-dark-border-strong bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white text-sm font-semibold hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors">%</button>
                <button type="button" onClick={() => handleCalculatorOperator('/')} className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all">/</button>

                <button type="button" onClick={() => handleCalculatorNumber('7')} className="rounded-lg border border-gray-200 dark:border-dark-border-strong bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white text-sm font-semibold hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors">7</button>
                <button type="button" onClick={() => handleCalculatorNumber('8')} className="rounded-lg border border-gray-200 dark:border-dark-border-strong bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white text-sm font-semibold hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors">8</button>
                <button type="button" onClick={() => handleCalculatorNumber('9')} className="rounded-lg border border-gray-200 dark:border-dark-border-strong bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white text-sm font-semibold hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors">9</button>
                <button type="button" onClick={() => handleCalculatorOperator('*')} className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all">x</button>

                <button type="button" onClick={() => handleCalculatorNumber('4')} className="rounded-lg border border-gray-200 dark:border-dark-border-strong bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white text-sm font-semibold hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors">4</button>
                <button type="button" onClick={() => handleCalculatorNumber('5')} className="rounded-lg border border-gray-200 dark:border-dark-border-strong bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white text-sm font-semibold hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors">5</button>
                <button type="button" onClick={() => handleCalculatorNumber('6')} className="rounded-lg border border-gray-200 dark:border-dark-border-strong bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white text-sm font-semibold hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors">6</button>
                <button type="button" onClick={() => handleCalculatorOperator('-')} className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all">-</button>

                <button type="button" onClick={() => handleCalculatorNumber('1')} className="rounded-lg border border-gray-200 dark:border-dark-border-strong bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white text-sm font-semibold hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors">1</button>
                <button type="button" onClick={() => handleCalculatorNumber('2')} className="rounded-lg border border-gray-200 dark:border-dark-border-strong bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white text-sm font-semibold hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors">2</button>
                <button type="button" onClick={() => handleCalculatorNumber('3')} className="rounded-lg border border-gray-200 dark:border-dark-border-strong bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white text-sm font-semibold hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors">3</button>
                <button type="button" onClick={() => handleCalculatorOperator('+')} className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all">+</button>

                <button type="button" onClick={handleCalculatorBackspace} className="rounded-lg border border-gray-200 dark:border-dark-border-strong bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white text-sm font-semibold hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors">DEL</button>
                <button type="button" onClick={() => handleCalculatorNumber('0')} className="rounded-lg border border-gray-200 dark:border-dark-border-strong bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white text-sm font-semibold hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors">0</button>
                <button type="button" onClick={() => handleCalculatorNumber('.')} className="rounded-lg border border-gray-200 dark:border-dark-border-strong bg-white dark:bg-dark-surface-secondary text-gray-900 dark:text-white text-sm font-semibold hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors">.</button>
                <button type="button" onClick={handleCalculatorEquals} className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all">=</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End of Three-Column Grid */}

      <InlineEditor
        isOpen={activeBillAction === 'pay' && Boolean(selectedBill)}
        title="Mark Bill as Paid"
        subtitle="Confirm payment in context"
        onClose={() => {
          setActiveBillAction(null);
          setSelectedBill(null);
        }}
        className="max-w-xl"
      >
        {selectedBill && (
          <div>
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
                  setActiveBillAction(null);
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
        )}
      </InlineEditor>

      <InlineEditor
        isOpen={activeBillAction === 'create' || activeBillAction === 'edit'}
        title={editingBill ? 'Edit Bill' : 'Add New Bill'}
        subtitle="Manage bill details inline"
        onClose={() => {
          setActiveBillAction(null);
          setEditingBill(null);
        }}
      >
        <BillForm 
          bill={editingBill}
          onSave={handleSaveBill}
          onCancel={() => {
            setActiveBillAction(null);
            setEditingBill(null);
          }}
          formatCurrency={formatCurrency}
        />
      </InlineEditor>

      <InlineEditor
        isOpen={activeBillAction === 'delete' && Boolean(billToDelete)}
        title="Delete Bill"
        subtitle="This action cannot be undone"
        onClose={cancelDeleteBill}
        className="max-w-xl"
      >
        {billToDelete && (
          <div>
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
        )}
      </InlineEditor>
    </div>
  );
};

export default Dashboard;
