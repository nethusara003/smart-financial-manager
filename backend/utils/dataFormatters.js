/**
 * Data Formatters for Chatbot Responses
 * Format numbers, currencies, dates, and other data types for user-friendly display
 */

// Currency symbols map
const CURRENCIES = {
  LKR: 'Rs.',
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
  JPY: '¥',
  CNY: '¥'
};

/**
 * Format currency amount
 */
function formatCurrency(amount, currencyCode = 'LKR') {
  if (typeof amount !== 'number' || isNaN(amount)) {
    const symbol = CURRENCIES[currencyCode] || CURRENCIES['LKR'];
    return `${symbol}0.00`;
  }
  
  const symbol = CURRENCIES[currencyCode] || CURRENCIES['LKR'];
  const formatted = Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = amount < 0 ? '-' : '';
  
  return `${sign}${symbol}${formatted}`;
}

/**
 * Format percentage
 */
function formatPercentage(value, decimals = 1) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }
  
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format date for display
 */
function formatDate(date, style = 'short') {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Relative dates for recent times
  if (style === 'relative') {
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }
  
  // Absolute dates
  /** @type {Intl.DateTimeFormatOptions} */
  const options = style === 'long' 
    ? { year: 'numeric', month: 'long', day: 'numeric' }
    : { year: 'numeric', month: 'short', day: 'numeric' };
  
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format number with proper thousands separators
 */
function formatNumber(num, decimals = 0) {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }
  
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format date range
 */
function formatDateRange(startDate, endDate) {
  const start = formatDate(startDate, 'short');
  const end = formatDate(endDate, 'short');
  
  return `${start} - ${end}`;
}

/**
 * Format list of items
 */
function formatList(items, type = 'unordered') {
  if (!Array.isArray(items) || items.length === 0) {
    return '';
  }
  
  if (type === 'ordered') {
    return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
  }
  
  return items.map(item => `• ${item}`).join('\n');
}

/**
 * Format transaction summary
 */
function formatTransactionSummary(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return 'No transactions found';
  }
  
  const summary = transactions.map(t => {
    const date = formatDate(new Date(t.date), 'short');
    const amount = formatCurrency(t.amount);
    const type = t.type === 'expense' ? '⚫' : '⚪';
    return `${type} ${amount} - ${t.category} (${date})`;
  });
  
  return summary.join('\n');
}

/**
 * Truncate text with ellipsis
 */
function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format time period name
 */
function formatTimePeriod(timePeriod) {
  if (!timePeriod) return 'this period';
  
  const periodNames = {
    'day': 'today',
    'week': 'this week',
    'month': 'this month',
    'quarter': 'this quarter',
    'year': 'this year'
  };
  
  return periodNames[timePeriod.period] || timePeriod.relative || 'this period';
}

/**
 * Format comparison text
 */
function formatComparison(current, previous, metric = 'spending') {
  if (typeof current !== 'number' || typeof previous !== 'number') {
    return `Unable to compare ${metric}`;
  }
  
  if (previous === 0) {
    return `Your ${metric} is ${formatCurrency(current)} (no previous data to compare)`;
  }
  
  const diff = current - previous;
  const percentChange = ((diff / previous) * 100);
  const direction = diff > 0 ? 'more' : 'less';
  const emoji = diff > 0 ? '📈' : '📉';
  
  return `${emoji} You're ${metric} ${formatCurrency(Math.abs(diff))} ${direction} than before (${formatPercentage(Math.abs(percentChange))} change)`;
}

/**
 * Format budget status
 */
function formatBudgetStatus(spent, budget, category) {
  const percentage = (spent / budget) * 100;
  const remaining = budget - spent;
  
  let status, emoji;
  if (percentage >= 100) {
    status = 'over budget';
    emoji = '🔴';
  } else if (percentage >= 80) {
    status = 'nearing limit';
    emoji = '🟡';
  } else {
    status = 'on track';
    emoji = '🟢';
  }
  
  return {
    message: `${emoji} ${category}: ${formatCurrency(spent)} of ${formatCurrency(budget)} used (${formatPercentage(percentage)})`,
    status,
    emoji,
    percentage,
    remaining: formatCurrency(remaining)
  };
}

/**
 * Format goal progress
 */
function formatGoalProgress(current, target, goalName) {
  const percentage = (current / target) * 100;
  const remaining = target - current;
  
  let message, emoji;
  if (percentage >= 100) {
    message = `🎉 Congratulations! You've reached your ${goalName} goal!`;
    emoji = '🎉';
  } else if (percentage >= 75) {
    message = `⭐ Great progress on your ${goalName} goal! You're ${formatPercentage(percentage)} there (${formatCurrency(remaining)} to go)`;
    emoji = '⭐';
  } else if (percentage >= 50) {
    message = `👍 You're halfway to your ${goalName} goal! ${formatCurrency(remaining)} remaining`;
    emoji = '👍';
  } else {
    message = `🎯 Keep going! You're ${formatPercentage(percentage)} toward your ${goalName} goal (${formatCurrency(remaining)} to go)`;
    emoji = '🎯';
  }
  
  return {
    message,
    emoji,
    percentage,
    current: formatCurrency(current),
    target: formatCurrency(target),
    remaining: formatCurrency(remaining)
  };
}

/**
 * Create a text-based progress bar
 */
function createProgressBar(percentage, length = 20) {
  const filled = Math.round((percentage / 100) * length);
  const empty = length - filled;
  
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${formatPercentage(percentage)}`;
}

export {
  formatCurrency,
  formatPercentage,
  formatDate,
  formatNumber,
  formatDateRange,
  formatList,
  formatTransactionSummary,
  truncate,
  formatTimePeriod,
  formatComparison,
  formatBudgetStatus,
  formatGoalProgress,
  createProgressBar
};
