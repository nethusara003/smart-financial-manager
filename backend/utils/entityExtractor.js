/**
 * Entity Extraction Utilities
 * Extracts entities like amounts, dates, categories, and time periods from user messages
 */

import * as chrono from 'chrono-node';

/**
 * Extract monetary amounts from text
 * Supports: $50, 50 dollars, fifty dollars, $1,234.56
 */
function extractAmounts(text) {
  const amounts = [];
  
  // Pattern 1: Currency symbols ($, €, £) followed by numbers
  const currencyPattern = /[$€£¥₹]\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g;
  let match;
  while ((match = currencyPattern.exec(text)) !== null) {
    amounts.push(parseFloat(match[1].replace(/,/g, '')));
  }
  
  // Pattern 2: Numbers followed by currency words
  const wordCurrencyPattern = /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(dollars?|euros?|pounds?|bucks?|usd|eur|gbp)/gi;
  while ((match = wordCurrencyPattern.exec(text)) !== null) {
    const amount = parseFloat(match[1].replace(/,/g, ''));
    if (!amounts.includes(amount)) {
      amounts.push(amount);
    }
  }
  
  // Pattern 3: Written numbers (basic support)
  const writtenNumbers = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
    'hundred': 100, 'thousand': 1000
  };
  
  for (const [word, value] of Object.entries(writtenNumbers)) {
    const writtenPattern = new RegExp(`\\b(${word})\\s*(dollars?|euros?|pounds?)\\b`, 'gi');
    if ((match = writtenPattern.exec(text)) !== null) {
      if (!amounts.includes(value)) {
        amounts.push(value);
      }
    }
  }
  
  return amounts;
}

/**
 * Extract dates and date ranges from text
 * Uses chrono-node for natural language date parsing
 */
function extractDates(text) {
  const dates = [];
  
  try {
    // Parse natural language dates
    const parsedDates = chrono.parse(text);
    
    for (const parsed of parsedDates) {
      if (parsed.start) {
        dates.push({
          date: parsed.start.date(),
          text: parsed.text,
          isRange: !!parsed.end
        });
        
        if (parsed.end) {
          dates.push({
            date: parsed.end.date(),
            text: parsed.text,
            isRange: true
          });
        }
      }
    }
  } catch (error) {
    console.error('Date parsing error:', error);
  }
  
  return dates;
}

/**
 * Extract time periods from text
 * Examples: this week, last month, this year, Q1, January
 */
function extractTimePeriod(text) {
  const normalized = text.toLowerCase();
  
  // Relative periods
  const relativePeriods = {
    'today': 'day',
    'yesterday': 'day',
    'this week': 'week',
    'last week': 'week',
    'this month': 'month',
    'last month': 'month',
    'this year': 'year',
    'last year': 'year',
    'this quarter': 'quarter',
    'last quarter': 'quarter'
  };
  
  for (const [phrase, period] of Object.entries(relativePeriods)) {
    if (normalized.includes(phrase)) {
      return {
        period,
        relative: phrase,
        startDate: calculatePeriodStart(phrase),
        endDate: calculatePeriodEnd(phrase)
      };
    }
  }
  
  // Month names
  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  
  for (let i = 0; i < months.length; i++) {
    if (normalized.includes(months[i])) {
      return {
        period: 'month',
        month: i,
        monthName: months[i]
      };
    }
  }
  
  // Quarter patterns
  const quarterMatch = normalized.match(/q([1-4])/);
  if (quarterMatch) {
    return {
      period: 'quarter',
      quarter: parseInt(quarterMatch[1])
    };
  }
  
  return null;
}

/**
 * Calculate start date for relative period
 */
function calculatePeriodStart(relativePeriod) {
  const now = new Date();
  const start = new Date(now);
  
  switch (relativePeriod) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'yesterday':
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'this week':
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      break;
    case 'last week':
      start.setDate(start.getDate() - start.getDay() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case 'this month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'last month':
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'this year':
      start.setMonth(0);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'last year':
      start.setFullYear(start.getFullYear() - 1);
      start.setMonth(0);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'this quarter':
      const currentQuarter = Math.floor(start.getMonth() / 3);
      start.setMonth(currentQuarter * 3);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'last quarter':
      const lastQuarter = Math.floor(start.getMonth() / 3) - 1;
      start.setMonth(lastQuarter * 3);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
  }
  
  return start;
}

/**
 * Calculate end date for relative period
 */
function calculatePeriodEnd(relativePeriod) {
  const now = new Date();
  const end = new Date(now);
  
  switch (relativePeriod) {
    case 'today':
    case 'yesterday':
      end.setHours(23, 59, 59, 999);
      if (relativePeriod === 'yesterday') {
        end.setDate(end.getDate() - 1);
      }
      break;
    case 'this week':
      end.setDate(end.getDate() - end.getDay() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case 'last week':
      end.setDate(end.getDate() - end.getDay() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case 'this month':
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'last month':
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'this year':
      end.setMonth(11);
      end.setDate(31);
      end.setHours(23, 59, 59, 999);
      break;
    case 'last year':
      end.setFullYear(end.getFullYear() - 1);
      end.setMonth(11);
      end.setDate(31);
      end.setHours(23, 59, 59, 999);
      break;
    case 'this quarter':
      const currentQuarter = Math.floor(end.getMonth() / 3);
      end.setMonth(currentQuarter * 3 + 3);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'last quarter':
      const lastQuarter = Math.floor(end.getMonth() / 3) - 1;
      end.setMonth(lastQuarter * 3 + 3);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
  }
  
  return end;
}

/**
 * Extract transaction categories from text
 * Uses fuzzy matching against common categories
 */
function extractCategories(text, userCategories = []) {
  const normalized = text.toLowerCase();
  const categories = [];
  
  // Common transaction categories
  const commonCategories = [
    'groceries', 'food', 'dining', 'restaurant', 'eating out',
    'transport', 'transportation', 'uber', 'taxi', 'gas', 'fuel',
    'entertainment', 'movies', 'gaming', 'streaming',
    'shopping', 'clothes', 'clothing', 'fashion',
    'utilities', 'electricity', 'water', 'internet', 'phone',
    'healthcare', 'medical', 'doctor', 'pharmacy',
    'insurance', 'rent', 'mortgage', 'housing',
    'education', 'books', 'courses',
    'fitness', 'gym', 'sports',
    'travel', 'vacation', 'hotel',
    'subscriptions', 'bills',
    'income', 'salary', 'wages',
    'savings', 'investment'
  ];
  
  // Combine with user's actual categories
  const allCategories = [...new Set([...commonCategories, ...userCategories])];
  
  // Look for exact matches first
  for (const category of allCategories) {
    if (normalized.includes(category.toLowerCase())) {
      if (!categories.includes(category)) {
        categories.push(category);
      }
    }
  }
  
  // Fuzzy matching for partial matches
  if (categories.length === 0) {
    for (const category of allCategories) {
      const similarity = calculateSimilarity(normalized, category.toLowerCase());
      if (similarity > 0.6) { // 60% similarity threshold
        categories.push(category);
      }
    }
  }
  
  return categories;
}

/**
 * Calculate similarity between two strings (simple Levenshtein-based)
 */
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Extract goal names from text
 */
function extractGoalName(text, userGoals = []) {
  const normalized = text.toLowerCase();
  
  // Check user's actual goals first
  for (const goal of userGoals) {
    if (normalized.includes(goal.toLowerCase())) {
      return goal;
    }
  }
  
  // Common goal keywords
  const goalKeywords = [
    'emergency fund', 'vacation', 'car', 'house', 'home',
    'wedding', 'retirement', 'education', 'savings'
  ];
  
  for (const keyword of goalKeywords) {
    if (normalized.includes(keyword)) {
      return keyword;
    }
  }
  
  return null;
}

/**
 * Extract all entities from a message
 */
function extractAllEntities(text, context = {}) {
  const entities = {
    amounts: extractAmounts(text),
    dates: extractDates(text),
    timePeriod: extractTimePeriod(text),
    categories: extractCategories(text, context.userCategories || []),
    goalName: extractGoalName(text, context.userGoals || [])
  };
  
  return entities;
}

export {
  extractAmounts,
  extractDates,
  extractTimePeriod,
  extractCategories,
  extractGoalName,
  extractAllEntities,
  calculatePeriodStart,
  calculatePeriodEnd
};
