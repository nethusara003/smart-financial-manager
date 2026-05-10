import React, { useState } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { CurrencyInput, Overlay, useToast } from '../ui';
import { X, DollarSign, Calendar, FileText, CreditCard } from 'lucide-react';

const RecordPaymentModal = ({ loan, onClose, onSuccess }) => {
  const { formatCurrency } = useCurrency();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    paymentAmount: loan?.emiAmount?.toString() || '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentType: 'regular',
    notes: '',
    createTransaction: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const paymentData = {
        paymentAmount: parseFloat(formData.paymentAmount),
        paymentDate: formData.paymentDate,
        paymentType: formData.paymentType,
        notes: formData.notes,
        createTransaction: formData.createTransaction
      };

      console.log('Recording payment:', paymentData);
      await onSuccess(paymentData);
      console.log('Payment recorded successfully');
      onClose();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error(error.message || error.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay
      isOpen
      onClose={onClose}
      containerClassName="z-[9999]"
      panelClassName="max-w-md rounded-lg bg-white dark:bg-gray-800 shadow-xl overflow-hidden"
      ariaLabelledBy="record-payment-title"
    >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 id="record-payment-title" className="text-xl font-semibold text-gray-900 dark:text-white">
            Record Payment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Loan Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                {loan?.loanName}
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Regular EMI:</span>
                  <span className="font-medium">{formatCurrency(loan?.emiAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining Balance:</span>
                  <span className="font-medium">{formatCurrency(loan?.remainingBalance)}</span>
                </div>
              </div>
            </div>

            {/* Payment Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Payment Amount *
              </label>
              <CurrencyInput
                name="paymentAmount"
                value={formData.paymentAmount}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter payment amount"
              />
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Payment Date *
              </label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Payment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <CreditCard className="w-4 h-4 inline mr-1" />
                Payment Type *
              </label>
              <select
                name="paymentType"
                value={formData.paymentType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="regular">Regular EMI</option>
                <option value="extra">Extra Payment</option>
                <option value="prepayment">Prepayment (Extra Principal)</option>
                <option value="final">Final Payment</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Add any notes about this payment..."
              />
            </div>

            {/* Create Transaction Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="createTransaction"
                checked={formData.createTransaction}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Automatically create transaction record
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 
                       dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       disabled:bg-gray-400 transition"
            >
              {loading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
    </Overlay>
  );
};

export default RecordPaymentModal;
