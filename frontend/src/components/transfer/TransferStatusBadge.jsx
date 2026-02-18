import React from "react";
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  Ban
} from "lucide-react";

const TransferStatusBadge = ({ status, size = "sm" }) => {
  const configs = {
    completed: {
      label: "Completed",
      icon: CheckCircle,
      className: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700"
    },
    pending: {
      label: "Pending",
      icon: Clock,
      className: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700"
    },
    processing: {
      label: "Processing",
      icon: RefreshCw,
      className: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700"
    },
    failed: {
      label: "Failed",
      icon: XCircle,
      className: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700"
    },
    cancelled: {
      label: "Cancelled",
      icon: Ban,
      className: "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700"
    },
    reversed: {
      label: "Reversed",
      icon: AlertCircle,
      className: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-700"
    },
    initiated: {
      label: "Initiated",
      icon: Clock,
      className: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700"
    }
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${config.className} ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </span>
  );
};

export default TransferStatusBadge;
