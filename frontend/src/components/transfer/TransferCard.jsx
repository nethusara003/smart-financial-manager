import React from "react";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "../../context/CurrencyContext";
import TransferStatusBadge from "./TransferStatusBadge";
import {
  ArrowUpRight,
  ArrowDownLeft,
  User,
  Calendar,
  MessageSquare,
  ChevronRight
} from "lucide-react";

const TransferCard = ({ transfer, currentUserId }) => {
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();

  const isSent = transfer.sender.userId === currentUserId;
  const otherParty = isSent ? transfer.receiver : transfer.sender;

  const handleClick = () => {
    navigate(`/transfer/${transfer._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-dark-surface-elevated border border-gray-200 dark:border-dark-border-default rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-3 flex-1">
          {/* Icon */}
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              isSent
                ? "bg-red-100 dark:bg-red-900/30"
                : "bg-green-100 dark:bg-green-900/30"
            }`}
          >
            {isSent ? (
              <ArrowUpRight className="w-6 h-6 text-red-600 dark:text-red-400" />
            ) : (
              <ArrowDownLeft className="w-6 h-6 text-green-600 dark:text-green-400" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-gray-800 dark:text-white truncate">
                {isSent ? "Sent to" : "Received from"} {otherParty.userName}
              </p>
              <TransferStatusBadge status={transfer.status} />
            </div>

            {transfer.description && (
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <MessageSquare className="w-3 h-3" />
                <span className="truncate">{transfer.description}</span>
              </div>
            )}

            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(transfer.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="text-right flex items-center gap-2">
          <div>
            <p
              className={`text-lg font-bold ${
                isSent
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {isSent ? "-" : "+"}
              {formatCurrency(transfer.amount)}
            </p>
            {transfer.fee > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Fee: {formatCurrency(transfer.fee)}
              </p>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default TransferCard;
