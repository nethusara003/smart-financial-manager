import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";
import { API_BASE_URL } from "../services/apiClient";
import { useToast } from "../components/ui";
import GuestRestricted from "../components/GuestRestricted";
import UserSearchInput from "../components/transfer/UserSearchInput";
import TransferCard from "../components/transfer/TransferCard";
import TransferPreview from "../components/transfer/TransferPreview";
import PinInputModal from "../components/transfer/PinInputModal";
import {
  Send,
  ArrowDownLeft,
  History,
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  RefreshCw,
  Filter,
  Calendar,
  DollarSign
} from "lucide-react";

const TransferHub = ({ auth }) => {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("send");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transfers, setTransfers] = useState([]);
  const [limits, setLimits] = useState(null);
  const [stats, setStats] = useState({ totalSent: 0, totalReceived: 0, transferCount: 0 });

  // Send money form state
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  // Transfer history filters
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch data on mount
  const fetchBalance = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch balance from wallet instead of calculating from transactions
      const res = await fetch(`${API_BASE_URL}/wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success && data.wallet) {
        setBalance(data.wallet.balance || 0);
      } else {
        setBalance(0);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(0);
    }
  }, []);

  const fetchTransferLimits = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/transfers/my-limits`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setLimits(data.limits || null);
    } catch (error) {
      console.error("Error fetching limits:", error);
    }
  }, []);

  const fetchTransfers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      let url = `${API_BASE_URL}/transfers/my-transfers?`;
      if (filterType && filterType !== "all") url += `type=${filterType}&`;
      if (filterStatus && filterStatus !== "all") url += `status=${filterStatus}&`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      setTransfers(data.transfers || []);
      if (data.stats) setStats(data.stats);
    } catch (error) {
      console.error("Error fetching transfers:", error);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus]);

  useEffect(() => {
    const loadTransferHubData = async () => {
      await fetchBalance();
      await fetchTransferLimits();
      await fetchTransfers();
    };

    loadTransferHubData();
  }, [fetchBalance, fetchTransferLimits, fetchTransfers]);

  useEffect(() => {
    if (activeTab === "history") {
      const loadTransfers = async () => {
        await fetchTransfers();
      };

      loadTransfers();
    }
  }, [activeTab, fetchTransfers]);

  const handleReviewTransfer = () => {
    if (!selectedUser) {
      toast.warning("Please select a recipient");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.warning("Please enter a valid amount");
      return;
    }
    if (parseFloat(amount) > balance) {
      toast.error("Insufficient balance");
      return;
    }
    setShowPreview(true);
  };

  const handleConfirmTransfer = () => {
    setShowPreview(false);
    setShowPinModal(true);
  };

  const handleSubmitTransfer = async (transferPin) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${API_BASE_URL}/transfers/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverIdentifier: selectedUser.userId,
          amount: parseFloat(amount),
          description,
          transferPin: transferPin || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Transfer failed");
      }

      // Success!
      toast.success(`Transfer successful. Transfer ID: ${data.transferId}`);
      
      // Reset form
      setSelectedUser(null);
      setAmount("");
      setDescription("");
      setShowPinModal(false);
      
      // Refresh data
      fetchBalance();
      fetchTransfers();
      
      // Switch to history tab
      setActiveTab("history");
    } catch (error) {
      toast.error(error.message || "Transfer failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateFee = () => {
    // Currently no fees, but you can implement fee logic here
    return 0;
  };

  const fee = calculateFee(amount);
  const total = parseFloat(amount || 0) + fee;

  // Block guest users
  if (auth?.isGuest) {
    return <GuestRestricted featureName="Money Transfers" />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Money Transfers
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Send and receive money instantly
            </p>
          </div>
          <button
            onClick={() => navigate('/wallet')}
            className="text-right group hover:bg-gradient-to-br hover:from-blue-50 hover:to-green-50 dark:hover:from-blue-900/20 dark:hover:to-green-900/20 px-6 py-3 rounded-xl transition-all border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md"
          >
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium transition-colors">
                Available Balance
              </p>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
              {formatCurrency(balance)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 mt-1 transition-colors">
              Click to view wallet →
            </p>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Total Sent
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                  {formatCurrency(stats.totalSent)}
                </p>
              </div>
              <ArrowUpRight className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-6 border border-green-200 dark:border-green-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Total Received
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
                  {formatCurrency(stats.totalReceived)}
                </p>
              </div>
              <ArrowDownLeft className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  Total Transfers
                </p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
                  {stats.transferCount}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-dark-surface-elevated rounded-xl shadow-sm dark:shadow-elevated-dark border border-gray-200 dark:border-dark-border-default">
          <div className="flex border-b border-gray-200 dark:border-dark-border-default">
            <button
              onClick={() => setActiveTab("send")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
                activeTab === "send"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
              }`}
            >
              <Send className="w-4 h-4 inline mr-2" />
              Send Money
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
                activeTab === "history"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
              }`}
            >
              <History className="w-4 h-4 inline mr-2" />
              Transfer History
            </button>
          </div>

          <div className="p-6">
            {/* Send Money Tab */}
            {activeTab === "send" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Who do you want to send money to?
                  </label>
                  <UserSearchInput
                    onSelectUser={setSelectedUser}
                    selectedUser={selectedUser}
                  />
                </div>

                {selectedUser && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        How much?
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-border-default rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      {amount && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex justify-between">
                            <span>Fee:</span>
                            <span>{formatCurrency(fee)}</span>
                          </div>
                          <div className="flex justify-between font-medium text-gray-800 dark:text-white mt-1">
                            <span>Total:</span>
                            <span>{formatCurrency(total)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Add a note (optional)
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What's this for?"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border-default rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>

                    {limits && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-2">
                          Transfer Limits
                        </p>
                        <div className="space-y-1 text-xs text-blue-700 dark:text-blue-400">
                          <div className="flex justify-between">
                            <span>Daily Remaining:</span>
                            <span className="font-medium">{formatCurrency(limits.dailyRemaining)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Monthly Remaining:</span>
                            <span className="font-medium">{formatCurrency(limits.monthlyRemaining)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleReviewTransfer}
                      disabled={loading || !selectedUser || !amount || parseFloat(amount) <= 0}
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Review Transfer
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Transfer History Tab */}
            {activeTab === "history" && (
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-dark-border-default rounded-lg text-sm bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Transfers</option>
                      <option value="sent">Sent</option>
                      <option value="received">Received</option>
                    </select>

                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-dark-border-default rounded-lg text-sm bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <button
                    onClick={fetchTransfers}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>

                {/* Transfer List */}
                {loading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin" />
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Loading transfers...</p>
                  </div>
                ) : transfers.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600" />
                    <p className="text-gray-600 dark:text-gray-400 mt-2">No transfers found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transfers.map((transfer) => (
                      <TransferCard
                        key={transfer._id}
                        transfer={transfer}
                        currentUserId={auth?.user?._id}
                        onRefresh={fetchTransfers}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {showPreview && (
          <TransferPreview
            sender={auth?.user}
            receiver={selectedUser}
            amount={parseFloat(amount)}
            fee={fee}
            description={description}
            balance={balance}
            onConfirm={handleConfirmTransfer}
            onCancel={() => setShowPreview(false)}
          />
        )}

        {showPinModal && (
          <PinInputModal
            onSubmit={handleSubmitTransfer}
            onCancel={() => setShowPinModal(false)}
            requiredForAmount={limits?.requirePinAbove || 1000}
            transferAmount={parseFloat(amount)}
          />
        )}
      </div>
  );
};

export default TransferHub;
