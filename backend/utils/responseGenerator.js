/**
 * Response Generation System
 * Creates dynamic, personalized responses based on intent and user data
 */

import {
  getTransactions,
  getTotalSpending,
  getTotalIncome,
  getSpendingByCategory,
  getLargestTransaction,
  getSmallestTransaction,
  comparePeriods,
  getActiveGoals,
  getGoalByName,
  getUserCategories,
  getFinancialSummary,
  getSpendingTrends
} from './chatDataQueries.js';

import {
  formatCurrency,
  formatPercentage,
  formatDate,
  formatList,
  formatTimePeriod,
  formatComparison,
  formatBudgetStatus,
  formatGoalProgress,
  formatDateRange,
  createProgressBar
} from './dataFormatters.js';

/**
 * Main response generator - updated to accept currency
 */
async function generateResponse(intent, entities, message, userId, userCurrency = 'LKR') {
  console.log(`\n🤖 Generating response for intent: ${intent}`);
  console.log(`💱 User currency: ${userCurrency}`);
  
  try {
    switch (intent) {
      case 'transaction_query':
        return await generateTransactionResponse(userId, entities, message, userCurrency);
      
      case 'budget_query':
        return await generateBudgetResponse(userId, entities, message, userCurrency);
      
      case 'goal_query':
        return await generateGoalResponse(userId, entities, message, userCurrency);
      
      case 'analytics':
        return await generateAnalyticsResponse(userId, entities, message, userCurrency);
      
      case 'financial_advice':
        return generateAdviceResponse(entities, message);
      
      case 'action_request':
        return {
          text: "I'm here to answer questions about your finances and help you understand your money. " +
                "I can't create or edit transactions, budgets, or goals directly - you'll need to use the main app for that.\n\n" +
                "What would you like to know about your finances?",
          suggestions: [
            "Show my spending this month",
            "What are my spending trends?",
            "How much did I spend on food?"
          ]
        };
      
      case 'help':
        return generateHelpResponse(message);
      
      case 'general':
        return generateGeneralResponse(message);
      
      default:
        return generateUnknownResponse();
    }
  } catch (error) {
    console.error('Error generating response:', error);
    return {
      text: "I apologize, but I encountered an error. Please try again or rephrase your question.",
      error: true
    };
  }
}

/**
 * Response templates for different intents
 */
const responseTemplates = {
  greeting: [
    "Hello! I'm your financial assistant. How can I help you manage your money today?",
    "Hi there! Ready to take control of your finances? Ask me anything!",
    "Welcome back! Let's review your financial health or answer any questions you have."
  ],
  
  thanks: [
    "You're welcome! Let me know if you need anything else.",
    "Happy to help! Feel free to ask more questions anytime.",
    "My pleasure! I'm here whenever you need financial insights."
  ],
  
  goodbye: [
    "Goodbye! Keep up the good financial habits!",
    "See you later! Remember to track your spending!",
    "Take care! I'm here whenever you need help with your finances."
  ],
  
  unknown: [
    "I'm not quite sure what you're asking. I can help you with:\n\n💰 Spending analysis - 'How much did I spend this month?'\n📊 Budget tracking - 'Am I on track with my budget?'\n🎯 Goal monitoring - 'Show my savings progress'\n📈 Financial insights - 'Compare this month to last month'\n💡 Money tips - 'How can I save more?'\n\nWhat would you like to know?",
    "I didn't quite understand that. Try asking me about your spending, budgets, savings goals, or financial trends. For example: 'Show my spending by category' or 'How close am I to my goal?'",
    "Hmm, I'm not sure how to help with that specific question. I'm best at answering questions about:\n• Your transactions and spending\n• Budget status and alerts\n• Savings goals progress\n• Financial trends and comparisons\n\nWhat can I help you with?"
  ],
  
  no_data: [
    "I couldn't find any data for that period yet. 📊 Start tracking your transactions to unlock powerful insights! Would you like help getting started?",
    "No transactions found for that query. Try a different time period, or start adding your expenses and income to see detailed analysis.",
    "Looks like you haven't added any data for this yet. Once you start tracking your finances, I'll be able to provide detailed insights and trends!"
  ]
};

/**
 * Generate response for general/greeting intent
 */
function generateGeneralResponse(message) {
  const normalized = message.toLowerCase();
  
  if (/^(hello|hi|hey|greetings)/i.test(normalized)) {
    const greeting = responseTemplates.greeting[Math.floor(Math.random() * responseTemplates.greeting.length)];
    return {
      text: greeting,
      suggestions: [
        "Show my spending this month",
        "How am I doing with my budget?",
        "What can you help me with?"
      ]
    };
  }
  
  if (/^(thank|thanks)/i.test(normalized)) {
    return {
      text: responseTemplates.thanks[Math.floor(Math.random() * responseTemplates.thanks.length)]
    };
  }
  
  if (/^(bye|goodbye)/i.test(normalized)) {
    return {
      text: responseTemplates.goodbye[Math.floor(Math.random() * responseTemplates.goodbye.length)]
    };
  }
  
  if (/what can you (do|help)/i.test(normalized)) {
    return {
      text: "I can help you with:\n\n" +
            "💰 Transaction Insights - View and analyze your spending\n" +
            "📊 Budget Tracking - Check budget status and get alerts\n" +
            "🎯 Goal Progress - Monitor your savings goals\n" +
            "📈 Financial Analytics - Spot trends and patterns\n" +
            "💡 Money Tips - Get personalized financial advice\n\n" +
            "Just ask me a question in plain English!",
      suggestions: [
        "Show my spending this month",
        "Am I on track with my budget?",
        "How close am I to my goals?"
      ]
    };
  }
  
  return {
    text: "I'm your financial assistant! Ask me about your spending, budgets, goals, or get financial advice.",
    suggestions: [
      "What can you help me with?",
      "Show my recent transactions",
      "Give me financial tips"
    ]
  };
}

/**
 * Generate response for transaction queries
 */
async function generateTransactionResponse(userId, entities, message, userCurrency = 'LKR') {
  try {
    const options = {};
    
    // Handle time period
    if (entities.timePeriod) {
      options.startDate = entities.timePeriod.startDate;
      options.endDate = entities.timePeriod.endDate;
    } else if (entities.dates && entities.dates.length > 0) {
      options.startDate = entities.dates[0].date;
      if (entities.dates.length > 1) {
        options.endDate = entities.dates[1].date;
      }
    } else {
      // Default to current month
      const now = new Date();
      options.startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      options.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    
    // Handle category
    if (entities.categories && entities.categories.length > 0) {
      options.category = entities.categories[0];
    }
    
    const normalized = message.toLowerCase();
    
    // Check for specific queries
    if (/biggest|largest|highest|most expensive/i.test(message)) {
      const transaction = await getLargestTransaction(userId, options);
      
      if (!transaction) {
        return {
          text: responseTemplates.no_data[0],
          suggestions: ["What can you help me with?", "Show financial summary"]
        };
      }
      
      const period = entities.timePeriod ? formatTimePeriod(entities.timePeriod) : 'during this period';
      return {
        text: `💸 Your largest expense ${period} was ${formatCurrency(transaction.amount, userCurrency)} for ${transaction.category} on ${formatDate(new Date(transaction.date), 'short')}.${transaction.note ? `\n\n"${transaction.note}"` : ''}`,
        suggestions: [
          "Show all expenses",
          "Compare to last month",
          "Show spending by category"
        ]
      };
    }
    
    if (/total|how much/i.test(message)) {
      const [spending, income] = await Promise.all([
        getTotalSpending(userId, options),
        getTotalIncome(userId, options)
      ]);
      
      const period = entities.timePeriod ? formatTimePeriod(entities.timePeriod) : 'during this period';
      const categoryText = options.category ? ` on ${options.category}` : '';
      
      if (spending.total === 0 && income.total === 0) {
        return {
          text: responseTemplates.no_data[0],
          suggestions: ["What can you help me with?", "Show my goals"]
        };
      }
      
      let responseText = '';
      
      if (/income/i.test(message)) {
        responseText = `💵 Your total income ${period} was ${formatCurrency(income.total, userCurrency)} from ${income.count} transactions.`;
      } else {
        responseText = `💰 You spent ${formatCurrency(spending.total, userCurrency)}${categoryText} ${period}.\n\n`;
        responseText += `📊 ${spending.count} transactions • Average: ${formatCurrency(spending.average, userCurrency)}`;
        
        if (income.total > 0) {
          const net = income.total - spending.total;
          const savingsRate = (net / income.total) * 100;
          responseText += `\n\n${net >= 0 ? '✅' : '⚠️'} Net: ${formatCurrency(net, userCurrency)} (${formatPercentage(savingsRate)} savings rate)`;
        }
      }
      
      return {
        text: responseText,
        suggestions: [
          "Show spending by category",
          "Compare to last month",
          "Show my biggest expense"
        ]
      };
    }
    
    if (/category|breakdown|distribution/i.test(message)) {
      const categoryBreakdown = await getSpendingByCategory(userId, options);
      
      if (categoryBreakdown.length === 0) {
        return {
          text: responseTemplates.no_data[0],
          suggestions: ["What can you help me with?"]
        };
      }
      
      const period = entities.timePeriod ? formatTimePeriod(entities.timePeriod) : 'during this period';
      const total = categoryBreakdown.reduce((sum, c) => sum + c.total, 0);
      
      let responseText = `📊 **Spending by Category** ${period}\n\n`;
      
      categoryBreakdown.slice(0, 5).forEach((cat, index) => {
        const percentage = (cat.total / total) * 100;
        const bar = createProgressBar(percentage, 10);
        responseText += `${index + 1}. **${cat.category}**: ${formatCurrency(cat.total, userCurrency)} (${formatPercentage(percentage)})\n`;
      });
      
      responseText += `\n💵 Total: ${formatCurrency(total, userCurrency)}`;
      
      return {
        text: responseText,
        suggestions: [
          "Show my budget status",
          "Compare to last month",
          "Tips for reducing spending"
        ]
      };
    }
    
    // Default: show recent transactions
    const transactions = await getTransactions(userId, { ...options, limit: 5 });
    
    if (transactions.length === 0) {
      return {
        text: responseTemplates.no_data[0],
        suggestions: ["What can you help me with?"]
      };
    }
    
    const period = entities.timePeriod ? formatTimePeriod(entities.timePeriod) : 'recently';
    let responseText = `📝 Here are your transactions ${period}:\n\n`;
    
    transactions.forEach((t, index) => {
      const icon = t.type === 'expense' ? '💸' : '💰';
      responseText += `${icon} ${formatCurrency(t.amount, userCurrency)} - ${t.category} (${formatDate(new Date(t.date), 'short')})\n`;
    });
    
    return {
      text: responseText,
      suggestions: [
        "Show total spending",
        "Show by category",
        "What's my biggest expense?"
      ]
    };
    
  } catch (error) {
    console.error('Error generating transaction response:', error);
    return {
      text: "I encountered an issue retrieving your transaction data. This might be because:\n\n" +
            "• You haven't added any transactions yet\n" +
            "• There was a temporary connection issue\n" +
            "• The date range is invalid\n\n" +
            "Try adding some transactions first, or ask me what I can help you with!",
      suggestions: [
        "What can you help me with?",
        "Show my spending trends",
        "Show my recent activity"
      ],
      error: true
    };
  }
}

/**
 * Generate response for budget queries
 */
async function generateBudgetResponse(userId, entities, message, userCurrency = 'LKR') {
  // For now, return a helpful message since budgets aren't fully implemented yet
  return {
    text: "📊 Budget tracking is coming soon! In the meantime, I can help you:\n\n" +
          "• Track your spending by category\n" +
          "• Compare spending across months\n" +
          "• Analyze your spending trends\n\n" +
          "Would you like to see your spending breakdown?",
    suggestions: [
      "Show spending by category",
      "Compare this month to last month",
      "Show my spending trends"
    ]
  };
}

/**
 * Generate response for goal queries
 */
async function generateGoalResponse(userId, entities, message, userCurrency = 'LKR') {
  try {
    // Check if asking about a specific goal
    if (entities.goalName) {
      const goal = await getGoalByName(userId, entities.goalName);
      
      if (!goal) {
        return {
          text: `I couldn't find a goal named "${entities.goalName}". You can view all your goals or check your savings.`,
          suggestions: [
            "Show all my goals",
            "Show my spending",
            "What's my savings rate?"
          ]
        };
      }
      
      const progress = formatGoalProgress(goal.currentAmount, goal.targetAmount, goal.name);
      let responseText = progress.message + '\n\n';
      responseText += createProgressBar(progress.percentage) + '\n\n';
      responseText += `💰 Current: ${progress.current} of ${progress.target}\n`;
      responseText += `🎯 Remaining: ${progress.remaining}`;
      
      if (goal.estimatedCompletion) {
        responseText += `\n📅 Estimated completion: ${formatDate(goal.estimatedCompletion, 'short')}`;
      }
      
      return {
        text: responseText,
        suggestions: [
          "Show all goals",
          "How can I save more?",
          "What's my spending trend?"
        ]
      };
    }
    
    // Show all goals
    const goals = await getActiveGoals(userId);
    
    if (goals.length === 0) {
      return {
        text: "🎯 You don't have any active goals yet. You can create goals in the Goals page of the app.\n\n" +
              "Popular financial goals include:\n" +
              "• Emergency fund (3-6 months expenses)\n" +
              "• Vacation savings\n" +
              "• Down payment for a home\n" +
              "• Debt payoff\n\n" +
              "What else would you like to know about your finances?",
        suggestions: [
          "Show my spending trends",
          "What's my biggest expense?",
          "Financial advice"
        ]
      };
    }
    
    let responseText = `🎯 **Your Financial Goals**\n\n`;
    
    goals.forEach((goal, index) => {
      const progress = formatGoalProgress(goal.currentAmount, goal.targetAmount, goal.name);
      responseText += `${index + 1}. **${goal.name}**\n`;
      responseText += `   ${createProgressBar(progress.percentage)}\n`;
      responseText += `   ${progress.current} of ${progress.target} (${formatPercentage(progress.percentage)})\n\n`;
    });
    
    return {
      text: responseText,
      suggestions: [
        "How can I save more?",
        "Show spending trends",
        "What's my savings rate?"
      ]
    };
    
  } catch (error) {
    console.error('Error generating goal response:', error);
    return {
      text: "Sorry, I encountered an error retrieving your goals. Please try again.",
      error: true
    };
  }
}

/**
 * Generate response for analytics queries
 */
async function generateAnalyticsResponse(userId, entities, message, userCurrency = 'LKR') {
  try {
    const normalized = message.toLowerCase();
    
    // Month comparison
    if (/compare|versus|vs/i.test(message)) {
      const now = new Date();
      const currentMonth = {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      };
      const lastMonth = {
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        endDate: new Date(now.getFullYear(), now.getMonth(), 0)
      };
      
      const comparison = await comparePeriods(userId, currentMonth, lastMonth);
      
      let responseText = `📊 **Monthly Comparison**\n\n`;
      responseText += `This month: ${formatCurrency(comparison.current.total, userCurrency)}\n`;
      responseText += `Last month: ${formatCurrency(comparison.previous.total, userCurrency)}\n\n`;
      responseText += formatComparison(comparison.current.total, comparison.previous.total, 'spending');
      
      if (comparison.trend === 'increasing') {
        responseText += `\n\n💡 Tip: Your spending is trending up. Consider reviewing your recent purchases to identify areas to cut back.`;
      } else if (comparison.trend === 'decreasing') {
        responseText += `\n\n✅ Great job! Your spending is decreasing. Keep up the good work!`;
      }
      
      return {
        text: responseText,
        suggestions: [
          "Show spending by category",
          "How can I save more?",
          "Show 6-month trend"
        ]
      };
    }
    
    // Financial summary
    if (/summary|overview/i.test (message)) {
      const now = new Date();
      const thisMonth = {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      };
      
      const summary = await getFinancialSummary(userId, thisMonth);
      
      let responseText = `💼 **Financial Summary** this month\n\n`;
      responseText += `💰 Income: ${formatCurrency(summary.income, userCurrency)}\n`;
      responseText += `💸 Spending: ${formatCurrency(summary.spending, userCurrency)}\n`;
      responseText += `${summary.netAmount >= 0 ? '✅' : '⚠️'} Net: ${formatCurrency(summary.netAmount, userCurrency)}\n`;
      responseText += `📊 Savings Rate: ${formatPercentage(summary.savingsRate)}\n`;
      responseText += `📝 Transactions: ${summary.transactionCount}\n\n`;
      
      if (summary.topCategory) {
        responseText += `🔝 Top spending: ${summary.topCategory.category} (${formatCurrency(summary.topCategory.total, userCurrency)})`;
      }
      
      return {
        text: responseText,
        suggestions: [
          "Show spending by category",
          "Compare to last month",
          "Tips for saving money"
        ]
      };
    }
    
    // Spending trends
    if (/trend|pattern/i.test(message)) {
      const trends = await getSpendingTrends(userId, 6);
      
      let responseText = `📈 **6-Month Spending Trend**\n\n`;
      
      trends.forEach(t => {
        responseText += `${t.month}: ${formatCurrency(t.spending, userCurrency)}\n`;
      });
      
      // Calculate overall trend
      if (trends.length >= 2) {
        const recent = trends.slice(-3).reduce((sum, t) => sum + t.spending, 0) / 3;
        const older = trends.slice(0, 3).reduce((sum, t) => sum + t.spending, 0) / 3;
        const trendDirection = recent > older ? 'increasing' : recent < older ? 'decreasing' : 'stable';
        
        responseText += `\n📊 Overall trend: ${trendDirection}`;
      }
      
      return {
        text: responseText,
        suggestions: [
          "Compare this month to last month",
          "Show spending by category",
          "Financial advice"
        ]
      };
    }
    
    // Default analytics response
    return {
      text: "📊 I can help you analyze your finances! I can show you:\n\n" +
            "• Month-over-month comparisons\n" +
            "• Spending trends over time\n" +
            "• Financial summaries\n" +
            "• Category breakdowns\n\n" +
            "What would you like to see?",
      suggestions: [
        "Compare this month to last month",
        "Show financial summary",
        "Show spending trends"
      ]
    };
    
  } catch (error) {
    console.error('Error generating analytics response:', error);
    return {
      text: "Sorry, I encountered an error analyzing your data. Please try again.",
      error: true
    };
  }
}

/**
 * Generate response for financial advice
 */
function generateAdviceResponse(entities, message) {
  const normalized = message.toLowerCase();
  
  const adviceTopics = {
    saving: {
      keywords: ['save', 'saving', 'savings'],
      advice: "💡 **Smart Saving Tips:**\n\n" +
              "1. **Pay yourself first** - Set up automatic transfers to savings\n" +
              "2. **50/30/20 Rule** - 50% needs, 30% wants, 20% savings\n" +
              "3. **Cut subscription waste** - Review and cancel unused subscriptions\n" +
              "4. **Cook at home** - Meal prep can save hundreds per month\n" +
              "5. **Use the 24-hour rule** - Wait 24h before non-essential purchases\n\n" +
              "Start small - even $20/week adds up to $1,000+ per year!"
    },
    budget: {
      keywords: ['budget', 'budgeting'],
      advice: "📊 **Budgeting Best Practices:**\n\n" +
              "1. **Track everything** - Every dollar should have a purpose\n" +
              "2. **Be realistic** - Set achievable limits based on your actual spending\n" +
              "3. **Review monthly** - Adjust budgets as your life changes\n" +
              "4. **Include fun money** - Budget for enjoyment to stay motivated\n" +
              "5. **Emergency category** - Plan for unexpected expenses\n\n" +
              "The best budget is one you can stick to!"
    },
    spending: {
      keywords: ['reduce', 'cut', 'less', 'spending'],
      advice: "✂️ **Reduce Spending Strategies:**\n\n" +
              "1. **Track for awareness** - You can't manage what you don't measure\n" +
              "2. **Identify triggers** - Know what causes impulse purchases\n" +
              "3. **Use cash for discretionary** - Physical money makes spending real\n" +
              "4. **Wait before buying** - Implement a cooling-off period\n" +
              "5. **Find free alternatives** - Library, parks, free events\n\n" +
              "Small changes add up to big savings!"
    },
    debt: {
      keywords: ['debt', 'loan', 'credit card', 'pay off'],
      advice: "💳 **Debt Management Tips:**\n\n" +
              "1. **List all debts** - Know exactly what you owe\n" +
              "2. **Avalanche vs Snowball** - Highest interest first or smallest first\n" +
              "3. **Pay more than minimum** - Even $20 extra makes a difference\n" +
              "4. **Negotiate rates** - Call and ask for lower interest rates\n" +
              "5. **Stop adding to it** - No new debt while paying off existing\n\n" +
              "Becoming debt-free is a journey, not a sprint!"
    },
    emergency: {
      keywords: ['emergency', 'fund', 'rainy day'],
      advice: "🆘 **Emergency Fund Essentials:**\n\n" +
              "1. **Start small** - Even $500 can cover minor emergencies\n" +
              "2. **Goal: 3-6 months** - Cover living expenses if income stops\n" +
              "3. **Keep it separate** - Savings account, not checking\n" +
              "4. **Make it automatic** - Auto-transfer each payday\n" +
              "5. **Replenish when used** - Always rebuild your safety net\n\n" +
              "An emergency fund brings peace of mind!"
    }
  };
  
  // Find matching advice topic
  for (const [topic, data] of Object.entries(adviceTopics)) {
    for (const keyword of data.keywords) {
      if (normalized.includes(keyword)) {
        return {
          text: data.advice,
          suggestions: [
            "Show my spending",
            "Show spending trends",
            "More financial tips"
          ]
        };
      }
    }
  }
  
  // Default financial advice
  return {
    text: "💡 **General Financial Advice:**\n\n" +
          "1. **Track your money** - Know where every dollar goes\n" +
          "2. **Live below your means** - Spend less than you earn\n" +
          "3. **Build an emergency fund** - 3-6 months of expenses\n" +
          "4. **Avoid lifestyle inflation** - Don't increase spending with income\n" +
          "5. **Invest in yourself** - Education and skills pay dividends\n\n" +
          "What specific area would you like advice on?",
    suggestions: [
      "Tips for saving money",
      "Help with budgeting",
      "How to reduce spending"
    ]
  };
}

/**
 * Generate response for help intent
 */
function generateHelpResponse(message = '') {
  const normalized = message.toLowerCase();
  
  if (/create|add.*budget/i.test(message)) {
    return {
      text: "📊 To create a budget:\n\n" +
            "1. Go to the Budgets page from the sidebar\n" +
            "2. Click 'Create New Budget'\n" +
            "3. Select a category and set your limit\n" +
            "4. Choose the time period (monthly/quarterly/yearly)\n" +
            "5. Click Save\n\n" +
            "Then I can help you track your progress!",
      suggestions: [
        "Show my spending by category",
        "Budgeting tips"
      ]
    };
  }
  
  if (/add.*transaction/i.test(message)) {
    return {
      text: "💰 To add a transaction:\n\n" +
            "1. Go to the Transactions page\n" +
            "2. Click 'Add Transaction' button\n" +
            "3. Enter the amount, category, and date\n" +
            "4. Add a description (optional)\n" +
            "5. Select type (income or expense)\n" +
            "6. Click Save\n\n" +
            "I'll include it in your financial insights!",
      suggestions: [
        "Show recent transactions",
        "Show spending this month"
      ]
    };
  }
  
  if (/goal/i.test(message)) {
    return {
      text: "🎯 To set a goal:\n\n" +
            "1. Go to the Goals page\n" +
            "2. Click 'Create New Goal'\n" +
            "3. Name your goal and set target amount\n" +
            "4. Set a deadline (optional)\n" +
            "5. Add monthly contribution amount\n" +
            "6. Click Save\n\n" +
            "I'll help you track your progress!",
      suggestions: [
        "Show my goals",
        "Tips for saving"
      ]
    };
  }
  
  return {
    text: "ℹ️ **How I Can Help:**\n\n" +
          "**Ask about your finances:**\n" +
          "• 'How much did I spend this month?'\n" +
          "• 'Show my spending on groceries'\n" +
          "• 'What was my biggest expense?'\n\n" +
          "**Track goals:**\n" +
          "• 'How close am I to my savings goal?'\n" +
          "• 'Show my goal progress'\n\n" +
          "**Get insights:**\n" +
          "• 'Compare this month to last month'\n" +
          "• 'Show my financial summary'\n" +
          "• 'What are my spending trends?'\n\n" +
          "**Get advice:**\n" +
          "• 'How can I save money?'\n" +
          "• 'Tips for budgeting'\n\n" +
          "Just ask naturally!",
    suggestions: [
      "Show my spending this month",
      "Tips for saving money",
      "Show my goals"
    ]
  };
}

/**
 * Generate unknown response
 */
function generateUnknownResponse() {
  return {
    text: responseTemplates.unknown[Math.floor(Math.random() * responseTemplates.unknown.length)],
    suggestions: [
      "Show my spending this month",
      "What can you help me with?",
      "Tips for saving money"
    ]
  };
}

export {
  generateResponse,
  responseTemplates
};
