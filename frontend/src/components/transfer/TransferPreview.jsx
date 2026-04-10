import React from "react";
import { useCurrency } from "../../context/CurrencyContext";
import { X, User, ArrowRight, AlertCircle } from "lucide-react";
import Overlay from "../ui/Overlay";

const TransferPreview = ({
  sender,
  receiver,
  amount,
  fee,
  description,
  balance,
  onConfirm,
  onCancel
}) => {
  const { formatCurrency } = useCurrency();
  const total = amount + fee;
  const newBalance = balance - total;

  return (
    <Overlay
      isOpen
      onClose={onCancel}
      panelClassName="max-w-md"
      ariaLabelledBy="transfer-preview-title"
    >
      <div className="bg-white dark:bg-dark-surface-elevated rounded-xl shadow-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border-default">
          <h2 id="transfer-preview-title" className="text-xl font-bold text-gray-800 dark:text-white">
            Review Transfer
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Transfer Flow */}
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                You
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {sender?.email}
              </p>
            </div>

            <ArrowRight className="w-8 h-8 text-gray-400 dark:text-gray-600 mx-4" />

            <div className="text-center flex-1">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {receiver?.name}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {receiver?.email}
              </p>
            </div>
          </div>

          {/* Amount Details */}
          <div className="bg-gray-50 dark:bg-dark-bg-secondary rounded-lg p-4 border border-gray-200 dark:border-dark-border-default">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {formatCurrency(amount)}
                </span>
              </div>
              
              {fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Transfer fee:
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {formatCurrency(fee)}
                  </span>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-dark-border-subtle pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800 dark:text-white">
                    Total:
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white text-lg">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-dark-border-subtle">
                <span className="text-gray-600 dark:text-gray-400">
                  Recipient receives:
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {description && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Note:
              </p>
              <p className="text-gray-800 dark:text-white bg-gray-50 dark:bg-dark-bg-secondary rounded-lg p-3 border border-gray-200 dark:border-dark-border-default">
                {description}
              </p>
            </div>
          )}

          {/* Balance Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-blue-800 dark:text-blue-300">
                Current balance:
              </span>
              <span className="font-medium text-blue-900 dark:text-blue-200">
                {formatCurrency(balance)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-800 dark:text-blue-300">
                New balance:
              </span>
              <span className="font-bold text-blue-900 dark:text-blue-200">
                {formatCurrency(newBalance)}
              </span>
            </div>
          </div>

          {/* Warning if low balance */}
          {newBalance < 100 && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Your balance will be low after this transfer. Consider adding funds.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-dark-border-default">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-gray-300 dark:border-dark-border-default text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all"
          >
            Confirm Transfer
          </button>
        </div>
      </div>
    </Overlay>
  );
};

export default TransferPreview;
