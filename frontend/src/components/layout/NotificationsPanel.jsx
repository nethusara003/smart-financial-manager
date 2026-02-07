import { useState, useEffect } from 'react';
import { X, Bell, CheckCircle, AlertCircle, Info, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

const NotificationsPanel = ({ isOpen, onClose, transactions = [] }) => {
  const [notifications, setNotifications] = useState([]);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    if (isOpen) {
      generateNotifications();
    }
  }, [isOpen, transactions]);

  const generateNotifications = () => {
    const notifs = [];
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    // Recent transactions (last 5)
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    recentTransactions.forEach(tx => {
      notifs.push({
        id: `tx-${tx._id}`,
        type: tx.type === 'income' ? 'success' : 'info',
        icon: tx.type === 'income' ? TrendingDown : DollarSign,
        title: `${tx.type === 'income' ? 'Income' : 'Expense'} Added`,
        message: `${tx.category}: ${formatCurrency(tx.amount)}`,
        time: getTimeAgo(new Date(tx.date)),
        read: false
      });
    });

    // Monthly expense summary
    const monthlyExpenses = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return tx.type === 'expense' && 
             txDate.getMonth() === thisMonth && 
             txDate.getFullYear() === thisYear;
    });

    if (monthlyExpenses.length > 0) {
      const totalExpenses = monthlyExpenses.reduce((sum, tx) => sum + tx.amount, 0);
      notifs.push({
        id: 'monthly-summary',
        type: 'warning',
        icon: Calendar,
        title: 'Monthly Expense Summary',
        message: `You've spent ${formatCurrency(totalExpenses)} this month`,
        time: 'Today',
        read: false
      });
    }

    // Budget alerts (simulate - would come from actual budget data)
    const categoryExpenses = {};
    monthlyExpenses.forEach(tx => {
      categoryExpenses[tx.category] = (categoryExpenses[tx.category] || 0) + tx.amount;
    });

    Object.entries(categoryExpenses).forEach(([category, amount]) => {
      if (amount > 500) { // Example threshold
        notifs.push({
          id: `budget-${category}`,
          type: 'warning',
          icon: AlertCircle,
          title: 'Budget Alert',
          message: `${category} spending is high: ${formatCurrency(amount)}`,
          time: 'Today',
          read: false
        });
      }
    });

    setNotifications(notifs.slice(0, 10)); // Limit to 10 notifications
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  if (!isOpen) return null;

  const iconColors = {
    success: 'text-success-600 bg-success-100',
    info: 'text-blue-600 bg-blue-100',
    warning: 'text-warning-600 bg-warning-100',
    error: 'text-danger-600 bg-danger-100'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-slide-in-down mr-4">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-secondary-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <Bell className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Notifications</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {notifications.filter(n => !n.read).length} unread
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white dark:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {notifications.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={markAllAsRead}
                className="px-3 py-1.5 text-xs font-medium text-primary-600 bg-white hover:bg-primary-50 rounded-lg transition-colors"
              >
                Mark all as read
              </button>
              <button
                onClick={clearAll}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No notifications</p>
              <p className="text-gray-400 text-xs mt-2">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => {
                const IconComponent = notif.icon;
                return (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-4 hover:bg-gray-50 dark:bg-gray-700 transition-colors cursor-pointer ${
                      !notif.read ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-lg ${iconColors[notif.type]} flex-shrink-0`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {notif.time}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
