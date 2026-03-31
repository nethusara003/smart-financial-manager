import React, { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";
import { ContextMenu, InlineEditor, useToast } from "../components/ui";
import {
  useBills,
  useCreateBill,
  useDeleteBill,
  useMarkBillPaid,
  useUpdateBill,
} from "../hooks/useBills";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  Film,
  Filter,
  Home,
  MoreVertical,
  Plus,
  Repeat,
  Shield,
  ShoppingCart,
  Smartphone,
  Wifi,
  XCircle,
  Zap,
} from "lucide-react";

const BillForm = ({ bill, onSave, onCancel }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: bill?.name || "",
    amount: bill?.amount || "",
    date: bill?.date
      ? new Date(bill.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    type: bill?.type || bill?.category || "utility",
    category: bill?.category || bill?.type || "utility",
    frequency: bill?.frequency || "monthly",
    recurring: bill?.recurring !== undefined ? bill.recurring : true,
    icon: bill?.icon || Zap,
    color: bill?.color || "blue",
  });

  const iconOptions = [
    { value: "Zap", label: "Electricity", icon: Zap, color: "yellow" },
    { value: "Wifi", label: "Internet", icon: Wifi, color: "blue" },
    { value: "Smartphone", label: "Mobile", icon: Smartphone, color: "purple" },
    { value: "Home", label: "Rent/Housing", icon: Home, color: "green" },
    { value: "Film", label: "Entertainment", icon: Film, color: "red" },
    { value: "ShoppingCart", label: "Shopping", icon: ShoppingCart, color: "orange" },
    { value: "CreditCard", label: "Credit Card", icon: CreditCard, color: "blue" },
    { value: "DollarSign", label: "Other", icon: DollarSign, color: "gray" },
  ];

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.warning("Please enter a bill name");
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      toast.warning("Please enter a valid amount");
      return;
    }

    onSave({
      ...formData,
      amount: Number(formData.amount),
      date: new Date(formData.date),
      category: formData.type || formData.category,
      recurring: formData.recurring,
      frequency: formData.frequency,
    });
  };

  const handleIconChange = (iconOption) => {
    setFormData((current) => ({
      ...current,
      icon: iconOption.icon,
      color: iconOption.color,
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
            Bill Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-light-border-default dark:border-dark-border-strong bg-light-bg-accent dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="e.g., Netflix Premium"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(event) => setFormData({ ...formData, amount: event.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-light-border-default dark:border-dark-border-strong bg-light-bg-accent dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
            Due Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(event) => setFormData({ ...formData, date: event.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-light-border-default dark:border-dark-border-strong bg-light-bg-accent dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
            Type
          </label>
          <select
            value={formData.type}
            onChange={(event) => setFormData({ ...formData, type: event.target.value })}
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

        <div>
          <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
            Frequency
          </label>
          <select
            value={formData.frequency}
            onChange={(event) => setFormData({ ...formData, frequency: event.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-light-border-default dark:border-dark-border-strong bg-light-bg-accent dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="weekly">Weekly</option>
            <option value="quarterly">Quarterly</option>
            <option value="one-time">One Time</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center gap-3 p-4 bg-light-bg-accent dark:bg-dark-surface-secondary rounded-lg border border-light-border-default dark:border-dark-border-strong">
            <input
              id="recurring-bill"
              type="checkbox"
              checked={formData.recurring}
              onChange={(event) => setFormData({ ...formData, recurring: event.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="recurring-bill" className="flex-1 cursor-pointer select-none">
              <div className="font-semibold text-light-text-primary dark:text-dark-text-primary">Recurring Bill</div>
              <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">This bill repeats automatically based on the selected frequency.</div>
            </label>
          </div>
        </div>

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
                      ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                      : "border-light-border-default dark:border-dark-border-default hover:border-blue-400 dark:hover:border-blue-600 bg-light-surface-primary dark:bg-dark-surface-secondary"
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-light-text-secondary dark:text-dark-text-secondary"}`} />
                  <span className={`text-xs font-medium ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-light-text-secondary dark:text-dark-text-secondary"}`}>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-dark-border-default">
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
          {bill ? "Update Bill" : "Add Bill"}
        </button>
      </div>
    </form>
  );
};

const BillsReminders = ({ auth }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { formatCurrency } = useCurrency();
  const toast = useToast();

  const initialDateParam = searchParams.get("date");
  const initialSelectedDate = initialDateParam ? new Date(initialDateParam) : new Date();

  const [currentDate, setCurrentDate] = useState(initialSelectedDate);
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [billFilter, setBillFilter] = useState("all");
  const [activeBillAction, setActiveBillAction] = useState(null);
  const [activeMenuBillId, setActiveMenuBillId] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [editingBill, setEditingBill] = useState(null);
  const [billToDelete, setBillToDelete] = useState(null);

  const {
    data: bills = [],
    isLoading: loading,
    isError: billsLoadFailed,
  } = useBills({ enabled: !auth?.isGuest });
  const createBillMutation = useCreateBill();
  const updateBillMutation = useUpdateBill();
  const deleteBillMutation = useDeleteBill();
  const markBillPaidMutation = useMarkBillPaid();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getBillIconComponent = useCallback((iconName) => {
    const icons = {
      Film,
      Zap,
      Wifi,
      Smartphone,
      Home,
      ShoppingCart,
      CreditCard,
      DollarSign,
      utility: Zap,
      subscription: Film,
      rent: Home,
      housing: Home,
      insurance: Shield,
      loan: CreditCard,
      shopping: ShoppingCart,
      internet: Wifi,
      mobile: Smartphone,
      other: DollarSign,
    };
    return icons[String(iconName || "").trim()] || CreditCard;
  }, []);

  const getBillStatus = useCallback((dueDate, isPaid) => {
    if (isPaid) return "paid";
    const due = new Date(dueDate);
    const today = new Date();
    if (due < today) return "overdue";
    return "upcoming";
  }, []);

  const isSameDate = useCallback((date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
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

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let index = 0; index < firstDay.getDay(); index += 1) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const selectedDateBills = useMemo(
    () => upcomingBills.filter((bill) => isSameDate(bill.date, selectedDate)),
    [isSameDate, selectedDate, upcomingBills]
  );

  const filteredBills = useMemo(() => {
    if (billFilter === "all") return upcomingBills;
    if (billFilter === "selected") return selectedDateBills;
    return upcomingBills.filter((bill) => bill.status === billFilter);
  }, [billFilter, selectedDateBills, upcomingBills]);

  const billStats = useMemo(() => ({
    overdue: upcomingBills.filter((bill) => bill.status === "overdue").length,
    upcoming: upcomingBills.filter((bill) => bill.status === "upcoming").length,
    paid: upcomingBills.filter((bill) => bill.status === "paid").length,
    totalDue: upcomingBills.filter((bill) => bill.status !== "paid").reduce((sum, bill) => sum + Number(bill.amount || 0), 0),
  }), [upcomingBills]);

  const upcomingReminders = useMemo(
    () => [...upcomingBills].filter((bill) => bill.status !== "paid").sort((a, b) => a.date - b.date).slice(0, 6),
    [upcomingBills]
  );

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleAddBill = () => {
    setEditingBill(null);
    setActiveBillAction("create");
  };

  const handleEditBill = (bill) => {
    setEditingBill(bill);
    setActiveBillAction("edit");
    setActiveMenuBillId(null);
  };

  const handleDeleteBill = (billId) => {
    const bill = upcomingBills.find((item) => item._id === billId || item.id === billId);
    setBillToDelete(bill);
    setActiveBillAction("delete");
    setActiveMenuBillId(null);
  };

  const confirmDeleteBill = async () => {
    if (!billToDelete) return;

    try {
      await deleteBillMutation.mutateAsync(billToDelete._id);
      toast.success("Bill deleted successfully");
    } catch (error) {
      toast.error(error.message || "Error deleting bill");
    } finally {
      setActiveBillAction(null);
      setBillToDelete(null);
      setActiveMenuBillId(null);
    }
  };

  const handleTogglePaidStatus = async (billId) => {
    try {
      const bill = upcomingBills.find((item) => item._id === billId || item.id === billId);
      if (!bill) return;

      await updateBillMutation.mutateAsync({
        billId: bill._id,
        billData: {
          isPaid: bill.status !== "paid",
          paidDate: bill.status !== "paid" ? new Date().toISOString() : null,
        },
      });

      toast.success(bill.status === "paid" ? "Bill marked as unpaid" : "Bill status updated");
    } catch (error) {
      toast.error(error.message || "Error toggling bill status");
    } finally {
      setActiveMenuBillId(null);
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
        frequency: billData.frequency || "monthly",
        reminderDays: billData.reminderDays || 3,
        notes: billData.notes || "",
      };

      if (editingBill) {
        await updateBillMutation.mutateAsync({
          billId: editingBill._id,
          billData: payload,
        });
      } else {
        await createBillMutation.mutateAsync(payload);
      }

      setActiveBillAction(null);
      setEditingBill(null);
      toast.success(editingBill ? "Bill updated successfully" : "Bill added successfully");
    } catch (error) {
      toast.error(error.message || "Error saving bill");
    }
  };

  const handlePayBill = (bill) => {
    setSelectedBill(bill);
    setActiveBillAction("pay");
  };

  const handleConfirmPayment = async () => {
    try {
      const billId = selectedBill?._id || selectedBill?.id;

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading bills and reminders...</p>
        </div>
      </div>
    );
  }

  if (billsLoadFailed) {
    return (
      <div className="rounded-xl border border-danger-200 dark:border-danger-500/30 bg-danger-50 dark:bg-danger-500/10 p-4">
        <p className="text-sm font-medium text-danger-700 dark:text-danger-300">Unable to load bills right now. Please refresh and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">Bills & Reminders</h1>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Manage scheduled payments and track upcoming due dates.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-3 py-2 rounded-lg border border-light-border-default dark:border-dark-border-strong bg-light-surface-primary dark:bg-dark-surface-secondary text-sm font-semibold text-light-text-primary dark:text-dark-text-primary"
          >
            Back to Dashboard
          </button>
          <button
            onClick={handleAddBill}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold shadow-md hover:from-blue-600 hover:to-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Bill
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="rounded-xl p-3 border border-danger-200 dark:border-danger-500/30 bg-danger-50 dark:bg-danger-500/10">
          <p className="text-xs font-medium text-danger-700 dark:text-danger-400">Overdue</p>
          <p className="text-xl font-bold text-danger-800 dark:text-danger-300">{billStats.overdue}</p>
        </div>
        <div className="rounded-xl p-3 border border-warning-200 dark:border-warning-500/30 bg-warning-50 dark:bg-warning-500/10">
          <p className="text-xs font-medium text-warning-700 dark:text-warning-400">Upcoming</p>
          <p className="text-xl font-bold text-warning-800 dark:text-warning-300">{billStats.upcoming}</p>
        </div>
        <div className="rounded-xl p-3 border border-success-200 dark:border-success-500/30 bg-success-50 dark:bg-success-500/10">
          <p className="text-xs font-medium text-success-700 dark:text-success-400">Paid</p>
          <p className="text-xl font-bold text-success-800 dark:text-success-300">{billStats.paid}</p>
        </div>
        <div className="rounded-xl p-3 border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Total Due</p>
          <p className="text-xl font-bold text-blue-800 dark:text-blue-300">{formatCurrency(billStats.totalDue)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white dark:bg-dark-surface-primary rounded-xl p-4 shadow-lg dark:shadow-card-dark border border-gray-200 dark:border-dark-border-strong">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Scheduled Bills</h2>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Track recurring payments and one-time obligations.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="bg-blue-100 dark:bg-blue-500/10 p-1.5 rounded-lg border border-blue-200 dark:border-blue-500/20">
                <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              {[
                { value: "all", label: "All", count: upcomingBills.length },
                { value: "selected", label: "Selected Day", count: selectedDateBills.length },
                { value: "overdue", label: "Overdue", count: billStats.overdue },
                { value: "upcoming", label: "Upcoming", count: billStats.upcoming },
                { value: "paid", label: "Paid", count: billStats.paid },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setBillFilter(filter.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                    billFilter === filter.value
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg"
                      : "bg-light-bg-accent dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary border-light-border-default dark:border-dark-border-strong hover:bg-light-bg-hover dark:hover:bg-dark-surface-hover"
                  }`}
                >
                  {filter.label} <span className={billFilter === filter.value ? "opacity-90" : "opacity-60"}>({filter.count})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[42rem] overflow-y-auto custom-scrollbar pr-1">
            {filteredBills.length === 0 ? (
              <div className="text-center py-10">
                <div className="bg-blue-100 dark:bg-blue-500/10 p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center mb-3">
                  <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm font-medium">No bills in this view</p>
              </div>
            ) : (
              filteredBills.map((bill) => {
                const IconComponent = bill.icon;
                const isOverdue = bill.status === "overdue";
                const isPaid = bill.status === "paid";
                const daysUntilDue = Math.ceil((bill.date - new Date()) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={bill._id || bill.id}
                    className={`group relative overflow-visible rounded-xl border transition-all duration-300 ${
                      isOverdue
                        ? "border-danger-200 dark:border-danger-500/40 bg-gradient-to-br from-danger-50 via-white to-danger-50/30 dark:from-danger-900/20 dark:via-dark-surface-primary dark:to-danger-900/10"
                        : isPaid
                        ? "border-success-200 dark:border-success-500/40 bg-gradient-to-br from-success-50 via-white to-success-50/30 dark:from-success-900/20 dark:via-dark-surface-primary dark:to-success-900/10 opacity-80"
                        : "border-blue-200 dark:border-blue-500/40 bg-gradient-to-br from-blue-50 via-white to-blue-50/30 dark:from-blue-900/10 dark:via-dark-surface-primary dark:to-blue-900/5"
                    }`}
                  >
                    <div className="p-3.5">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-light-bg-accent dark:bg-dark-surface-secondary border border-light-border-default dark:border-dark-border-default">
                          <IconComponent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <h3 className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary truncate">{bill.name}</h3>
                              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary capitalize">{bill.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-base font-bold text-blue-700 dark:text-blue-300">{formatCurrency(bill.amount)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{bill.date.toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Repeat className="w-3.5 h-3.5" />{bill.frequency}</span>
                            <span className={`px-2 py-0.5 rounded-full font-semibold ${isPaid ? "bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-400" : isOverdue ? "bg-danger-100 text-danger-700 dark:bg-danger-500/20 dark:text-danger-400" : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"}`}>
                              {isPaid ? "Paid" : isOverdue ? `${Math.abs(daysUntilDue)}d overdue` : `Due in ${daysUntilDue}d`}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {!isPaid && (
                              <button
                                onClick={() => handlePayBill(bill)}
                                className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold"
                              >
                                Mark Paid
                              </button>
                            )}
                            <button
                              onClick={() => handleTogglePaidStatus(bill._id || bill.id)}
                              className="px-3 py-2 rounded-lg border border-light-border-default dark:border-dark-border-strong text-xs font-semibold text-light-text-primary dark:text-dark-text-primary"
                            >
                              {isPaid ? "Mark Unpaid" : "Toggle Status"}
                            </button>
                            <ContextMenu
                              isOpen={activeMenuBillId === (bill._id || bill.id)}
                              onOpenChange={(open) => setActiveMenuBillId(open ? (bill._id || bill.id) : null)}
                              items={[
                                { key: "edit", label: "Edit Bill", onClick: () => handleEditBill(bill) },
                                { key: "delete", label: "Delete Bill", onClick: () => handleDeleteBill(bill._id || bill.id), variant: "danger" },
                              ]}
                              icon={<MoreVertical className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />}
                            />
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

        <div className="space-y-4">
          <div className="bg-white dark:bg-dark-surface-primary rounded-xl p-4 shadow-lg dark:shadow-card-dark border border-gray-200 dark:border-dark-border-strong">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Reminder Calendar</h2>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Every marked day has a bill or reminder attached.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={previousMonth} className="p-1.5 rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-surface-hover">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary min-w-[110px] text-center">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </div>
                <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-surface-hover">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1.5">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-[11px] font-semibold text-light-text-secondary dark:text-dark-text-secondary py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentDate).map((date, index) => {
                const dayBills = date ? upcomingBills.filter((bill) => isSameDate(bill.date, date)) : [];
                const MarkerIcon = dayBills[0]?.icon || CreditCard;
                const isSelected = date && isSameDate(date, selectedDate);

                return (
                  <button
                    key={index}
                    onClick={() => date && setSelectedDate(date)}
                    disabled={!date}
                    className={`relative h-14 rounded-lg border transition-all ${!date ? "invisible" : ""} ${isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" : "border-transparent hover:border-blue-300 hover:bg-light-bg-hover dark:hover:bg-dark-surface-hover"}`}
                  >
                    {date && (
                      <>
                        <span className="absolute top-2 left-2 text-xs font-semibold text-light-text-primary dark:text-dark-text-primary">{date.getDate()}</span>
                        {dayBills.length > 0 && (
                          <div className="absolute bottom-1 left-1 right-1 flex items-center justify-center gap-1">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                              <MarkerIcon className="w-2.5 h-2.5" />
                            </span>
                            <span className="text-[10px] font-semibold text-light-text-secondary dark:text-dark-text-secondary truncate max-w-[2.5rem]">
                              {dayBills[0].name.slice(0, 4)}
                            </span>
                            {dayBills.length > 1 && (
                              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">+{dayBills.length - 1}</span>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface-primary rounded-xl p-4 shadow-lg dark:shadow-card-dark border border-gray-200 dark:border-dark-border-strong">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {selectedDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                </h3>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Bills due on the selected day</p>
              </div>
            </div>

            <div className="space-y-2">
              {selectedDateBills.length === 0 ? (
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">No bills on this date.</p>
              ) : (
                selectedDateBills.map((bill) => {
                  const IconComponent = bill.icon;
                  return (
                    <div key={bill._id || bill.id} className="flex items-center justify-between gap-2 rounded-lg p-2.5 border border-light-border-default dark:border-dark-border-default bg-light-bg-accent dark:bg-dark-surface-secondary">
                      <div className="flex items-center gap-2 min-w-0">
                        <IconComponent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary truncate">{bill.name}</p>
                          <p className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary">{bill.frequency}</p>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-blue-700 dark:text-blue-300 whitespace-nowrap">{formatCurrency(bill.amount)}</p>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-light-border-default dark:border-dark-border-default">
              <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">Upcoming Reminders</h3>
              <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                {upcomingReminders.map((bill) => {
                  const IconComponent = bill.icon;
                  return (
                    <div key={bill._id || bill.id} className="flex items-center justify-between gap-2 rounded-lg p-2 border border-light-border-default dark:border-dark-border-default bg-light-bg-accent dark:bg-dark-surface-secondary">
                      <div className="flex items-center gap-2 min-w-0">
                        <IconComponent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary truncate">{bill.name}</p>
                          <p className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary">{bill.date.toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Clock className="w-3.5 h-3.5 text-light-text-secondary dark:text-dark-text-secondary" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <InlineEditor
        isOpen={activeBillAction === "pay" && Boolean(selectedBill)}
        title="Mark Bill as Paid"
        subtitle="Confirm payment where you initiated the action"
        onClose={() => {
          setActiveBillAction(null);
          setSelectedBill(null);
        }}
        className="max-w-xl"
      >
        {selectedBill && (
          <div>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-dark-text-secondary mb-4">Have you completed the payment for this bill outside the app?</p>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-surface-secondary dark:to-dark-surface-elevated rounded-xl p-4 border border-gray-200 dark:border-dark-border-default">
                <h4 className="font-bold text-gray-900 dark:text-white">{selectedBill.name}</h4>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">{formatCurrency(selectedBill.amount)}</p>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">Due: {new Date(selectedBill.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setActiveBillAction(null); setSelectedBill(null); }} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-border-default text-gray-900 dark:text-white bg-white dark:bg-dark-surface-primary font-semibold">
                Cancel
              </button>
              <button onClick={handleConfirmPayment} disabled={markBillPaidMutation.isPending} className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold disabled:opacity-50">
                {markBillPaidMutation.isPending ? "Processing..." : "Yes, Mark as Paid"}
              </button>
            </div>
          </div>
        )}
      </InlineEditor>

      <InlineEditor
        isOpen={activeBillAction === "create" || activeBillAction === "edit"}
        title={editingBill ? "Edit Bill" : "Add New Bill"}
        subtitle="Update bill details in place"
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
        />
      </InlineEditor>

      <InlineEditor
        isOpen={activeBillAction === "delete" && Boolean(billToDelete)}
        title="Delete Bill"
        subtitle="This action cannot be undone"
        onClose={() => {
          setActiveBillAction(null);
          setBillToDelete(null);
        }}
        className="max-w-xl"
      >
        {billToDelete && (
          <div>
            <p className="text-sm text-light-text-primary dark:text-dark-text-primary mb-6">Delete {billToDelete.name} from scheduled bills?</p>
            <div className="flex gap-3">
              <button onClick={() => { setActiveBillAction(null); setBillToDelete(null); }} className="flex-1 px-4 py-2.5 bg-light-bg-accent dark:bg-dark-surface-secondary text-light-text-primary dark:text-dark-text-primary rounded-lg font-semibold border border-light-border-default dark:border-dark-border-strong">
                Cancel
              </button>
              <button onClick={confirmDeleteBill} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-danger-500 to-danger-600 text-white rounded-lg font-semibold">
                Delete
              </button>
            </div>
          </div>
        )}
      </InlineEditor>
    </div>
  );
};

export default BillsReminders;