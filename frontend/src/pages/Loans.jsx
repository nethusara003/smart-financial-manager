import React, { useState, useEffect, useCallback } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { Overlay, useToast } from '../components/ui';
import * as loanAPI from '../services/api';
import {
  Plus,
  Home,
  Car,
  GraduationCap,
  Briefcase,
  User,
  Filter,
  Search,
  DollarSign,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  CreditCard,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoanForm from '../components/loans/LoanForm';
import RecordPaymentModal from '../components/loans/RecordPaymentModal';

const Loans = ({ hideHeader = false }) => {
  const { formatCurrency } = useCurrency();
  const toast = useToast();
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('nextPaymentDate');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [summary, setSummary] = useState(null);

  // Load loans
  const loadLoans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Only pass status filter if it's not 'all'
      const filters = {};
      if (filterStatus && filterStatus !== 'all') {
        filters.status = filterStatus;
      }
      const response = await loanAPI.getLoans(filters);
      console.log('Loans response:', response);
      setLoans(response.loans || []);
      setSummary(response.summary || {});
    } catch (err) {
      console.error('Load loans error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  const getLoanIcon = (loanType) => {
    const iconMap = {
      home: Home,
      car: Car,
      education: GraduationCap,
      business: Briefcase,
      personal: User,
      other: DollarSign
    };
    return iconMap[loanType] || DollarSign;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-blue-600 bg-blue-50';
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'closed':
        return 'text-gray-600 bg-gray-50';
      case 'defaulted':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return Clock;
      case 'paid':
        return CheckCircle2;
      case 'defaulted':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const calculateDaysUntilDue = (nextPaymentDate) => {
    if (!nextPaymentDate) return null;
    const today = new Date();
    const dueDate = new Date(nextPaymentDate);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDelete = async () => {
    if (!loanToDelete) return;

    try {
      await loanAPI.deleteLoan(loanToDelete._id);
      setLoans(loans.filter(l => l._id !== loanToDelete._id));
      closeDeleteModal();
    } catch (err) {
      toast.error('Failed to delete loan: ' + err.message);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setLoanToDelete(null);
  };

  const handleRecordPayment = async (paymentData) => {
    if (!selectedLoan) return;

    try {
      await loanAPI.recordPayment(selectedLoan._id, paymentData);
      // Reload loans to get updated data
      await loadLoans();
      setShowPaymentModal(false);
      setSelectedLoan(null);
    } catch (err) {
      console.error('Error recording payment:', err);
      throw err; // Re-throw to be handled by the modal
    }
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.loanName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || loan.status === filterStatus;
    const matchesType = filterType === 'all' || loan.loanType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedLoans = [...filteredLoans].sort((a, b) => {
    switch (sortBy) {
      case 'amount':
        return b.principalAmount - a.principalAmount;
      case 'emi':
        return b.emiAmount - a.emiAmount;
      case 'balance':
        return b.remainingBalance - a.remainingBalance;
      case 'nextPaymentDate':
        return new Date(a.nextPaymentDate || 0) - new Date(b.nextPaymentDate || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      {!hideHeader && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Loan Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage all your loans and EMI payments
          </p>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Loans</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {summary.totalLoans || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.activeLoans || 0} active
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly EMI</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(summary.totalMonthlyEmi || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">per month</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Outstanding</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(summary.totalOutstanding || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">remaining</p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-full">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Borrowed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(summary.totalBorrowed || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">lifetime</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search loans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paid">Paid Off</option>
            <option value="closed">Closed</option>
            <option value="defaulted">Defaulted</option>
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="home">Home Loan</option>
            <option value="car">Car Loan</option>
            <option value="personal">Personal Loan</option>
            <option value="education">Education Loan</option>
            <option value="business">Business Loan</option>
            <option value="other">Other</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="nextPaymentDate">Next Payment</option>
            <option value="amount">Loan Amount</option>
            <option value="emi">EMI Amount</option>
            <option value="balance">Remaining Balance</option>
          </select>

          {/* Add Loan Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Loan
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loans Grid */}
      {sortedLoans.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow text-center">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No loans found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || filterStatus !== 'all' || filterType !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first loan'}
          </p>
          {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Loan
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedLoans.map((loan) => {
            const Icon = getLoanIcon(loan.loanType);
            const StatusIcon = getStatusIcon(loan.status);
            const progress = ((loan.principalAmount - loan.remainingBalance) / loan.principalAmount) * 100;
            const daysUntilDue = calculateDaysUntilDue(loan.nextPaymentDate);

            return (
              <div
                key={loan._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {loan.loanName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {loan.loanType} Loan
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                      <StatusIcon className="w-3 h-3" />
                      {loan.status}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Loan Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">EMI Amount</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(loan.emiAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Remaining Balance</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(loan.remainingBalance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Interest Rate</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {loan.interestRate}% p.a.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tenure</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {loan.tenure} months
                    </p>
                  </div>
                </div>

                {/* Next Payment */}
                {loan.status === 'active' && loan.nextPaymentDate && (
                  <div className={`p-3 rounded-lg mb-4 ${
                    daysUntilDue < 0 ? 'bg-red-50 dark:bg-red-900/20' :
                    daysUntilDue <= 3 ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                    'bg-gray-50 dark:bg-gray-700'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${
                          daysUntilDue < 0 ? 'text-red-600' :
                          daysUntilDue <= 3 ? 'text-yellow-600' :
                          'text-gray-600'
                        }`} />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Next Payment
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${
                        daysUntilDue < 0 ? 'text-red-600' :
                        daysUntilDue <= 3 ? 'text-yellow-600' :
                        'text-gray-900 dark:text-white'
                      }`}>
                        {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` :
                         daysUntilDue === 0 ? 'Due today' :
                         `Due in ${daysUntilDue} days`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {new Date(loan.nextPaymentDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {loan.status === 'active' && (
                    <button
                      onClick={() => {
                        setSelectedLoan(loan);
                        setShowPaymentModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CreditCard className="w-4 h-4" />
                      Record Payment
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/loans/${loan._id}`)}
                    className={`${loan.status === 'active' ? 'flex-1' : 'flex-[2]'} flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors`}
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      setLoanToDelete(loan);
                      setShowDeleteModal(true);
                    }}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Overlay
          isOpen={showDeleteModal}
          onClose={closeDeleteModal}
          containerClassName="z-[9999]"
          panelClassName="max-w-md"
          ariaLabelledBy="loan-delete-modal-title"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              <span id="loan-delete-modal-title">Delete Loan</span>
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{loanToDelete?.loanName}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
              Delete Loan
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* Add/Edit Loan Modal */}
      {showAddModal && (
        <LoanForm
          onClose={() => setShowAddModal(false)}
          onSuccess={loadLoans}
        />
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && selectedLoan && (
        <RecordPaymentModal
          loan={selectedLoan}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedLoan(null);
          }}
          onSuccess={handleRecordPayment}
        />
      )}
    </div>
  );
};

export default Loans;
