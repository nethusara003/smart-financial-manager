/**
 * Intent Recognition System
 * Identifies user intent from natural language messages
 */

import { extractAllEntities } from './entityExtractor.js';

/**
 * Intent patterns and keywords for each intent category
 */
const intentPatterns = {
  transaction_query: {
    keywords: [
      'spend', 'spent', 'spending', 'expense', 'expenses', 'bought', 'purchase',
      'how much', 'total', 'cost', 'paid', 'income', 'earned', 'revenue',
      'show transactions', 'list transactions', 'transactions for',
      'biggest expense', 'largest', 'smallest', 'average spending',
      'money', 'cash', 'payment', 'receipt', 'bill', 'invoice'
    ],
    patterns: [
      /how much (did|have|do) i (spend|spent|pay|paid)/i,
      /what (did|have|do) i (spend|spent|buy|bought)/i,
      /show (my|me|all) (spending|expenses|transactions)/i,
      /total (spending|expenses|income)/i,
      /list (all|my) transactions/i,
      /(biggest|largest|highest|most expensive) (expense|transaction|purchase)/i,
      /(where|what) did (i|my) money go/i,
      /spending (this|last) (month|week|year)/i,
      /how much money (did i|have i)/i
    ],
    weight: 1.0
  },
  
  budget_query: {
    keywords: [
      'budget', 'budgets', 'budgeted', 'budgeting',
      'on track', 'over budget', 'under budget',
      'budget status', 'budget left', 'remaining budget',
      'overspending', 'overspent'
    ],
    patterns: [
      /am i (on track|over|under)/i,
      /budget (status|left|remaining)/i,
      /(how much|what) budget (do i have|left|remaining)/i,
      /am i overspending/i,
      /show (my|me) budget/i,
      /budget for/i
    ],
    weight: 1.2
  },
  
  goal_query: {
    keywords: [
      'goal', 'goals', 'target', 'save', 'saving', 'savings',
      'progress', 'close to', 'reach', 'achieve',
      'how much more', 'need to save', 'goal status'
    ],
    patterns: [
      /how close (am i|to)/i,
      /goal progress/i,
      /show (my|me) goal/i,
      /when will i reach/i,
      /how much (more|do i need)/i,
      /savings goal/i,
      /track (my|goal)/i
    ],
    weight: 1.1
  },
  
  analytics: {
    keywords: [
      'trend', 'trends', 'pattern', 'patterns', 'analysis', 'analyze',
      'compare', 'comparison', 'versus', 'vs',
      'most', 'least', 'average', 'summary',
      'breakdown', 'distribution', 'insights',
      'month over month', 'year over year'
    ],
    patterns: [
      /spending (trend|pattern)/i,
      /compare (this|last) (month|year)/i,
      /(which|what) category (do i|did i) spend most/i,
      /financial (summary|overview|insights)/i,
      /show (me|my) (trends|patterns|analysis)/i,
      /breakdown of/i
    ],
    weight: 1.0
  },
  
  action_request: {
    keywords: [
      'add', 'create', 'set', 'make', 'new',
      'delete', 'remove', 'update', 'edit', 'change',
      'start', 'begin', 'setup'
    ],
    patterns: [
      /add (a|an|new) (expense|income|transaction|budget|goal)/i,
      /create (a|an|new) (budget|goal)/i,
      /set (a|an|new) (budget|goal)/i,
      /delete (my|the) (transaction|budget|goal)/i,
      /update (my|the)/i,
      /record (a|an) (expense|income)/i
    ],
    weight: 1.3
  },
  
  help: {
    keywords: [
      'help', 'how to', 'how do i', 'can you', 'tutorial',
      'guide', 'explain', 'what is', 'what are',
      'show me how', 'teach', 'learn'
    ],
    patterns: [
      /how (do i|to|can i)/i,
      /what (is|are|does)/i,
      /can you (help|show|explain)/i,
      /i (need|want) help/i,
      /show me how/i,
      /teach me/i
    ],
    weight: 0.9
  },
  
  financial_advice: {
    keywords: [
      'advice', 'suggestion', 'recommend', 'recommendation', 'tip', 'tips',
      'should i', 'better', 'improve', 'optimize',
      'save money', 'reduce spending', 'cut costs',
      'financial health', 'money management'
    ],
    patterns: [
      /how (can|should) i (save|reduce|cut)/i,
      /tips (for|on)/i,
      /advice (for|on|about)/i,
      /should i/i,
      /help me (save|reduce|improve)/i,
      /what (should|can) i do/i,
      /financial advice/i
    ],
    weight: 1.0
  },
  
  general: {
    keywords: [
      'hello', 'hi', 'hey', 'greetings',
      'thank', 'thanks', 'appreciate',
      'bye', 'goodbye', 'see you',
      'yes', 'no', 'okay', 'ok', 'sure',
      'what can you do', 'capabilities', 'features'
    ],
    patterns: [
      /^(hello|hi|hey|greetings)/i,
      /^(thank|thanks)/i,
      /^(bye|goodbye)/i,
      /what can you (do|help)/i,
      /tell me about (yourself|your features)/i
    ],
    weight: 0.8
  }
};

/**
 * Calculate intent score for a message
 */
function calculateIntentScore(message, intentConfig) {
  const normalized = message.toLowerCase();
  let score = 0;
  
  // Check keyword matches
  let keywordMatches = 0;
  for (const keyword of intentConfig.keywords) {
    if (normalized.includes(keyword.toLowerCase())) {
      keywordMatches++;
    }
  }
  
  // Score based on keyword density
  if (keywordMatches > 0) {
    score += (keywordMatches / intentConfig.keywords.length) * 0.5;
  }
  
  // Check pattern matches
  let patternMatches = 0;
  for (const pattern of intentConfig.patterns) {
    if (pattern.test(message)) {
      patternMatches++;
      score += 0.3; // Each pattern match adds significant score
    }
  }
  
  // Apply weight
  score *= intentConfig.weight;
  
  // Boost score if multiple patterns matched
  if (patternMatches > 1) {
    score *= 1.2;
  }
  
  return Math.min(score, 1.0); // Cap at 1.0
}

/**
 * Recognize intent from user message
 */
function recognizeIntent(message, context = {}) {
  const scores = {};
  
  // Calculate score for each intent
  for (const [intent, config] of Object.entries(intentPatterns)) {
    scores[intent] = calculateIntentScore(message, config);
  }
  
  // Find highest scoring intent
  let maxScore = 0;
  let recognizedIntent = 'unknown';
  
  for (const [intent, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      recognizedIntent = intent;
    }
  }
  
  // If score is too low, mark as unknown
  if (maxScore < 0.15) {
    recognizedIntent = 'unknown';
    maxScore = 0;
  }
  
  // Extract entities
  const entities = extractAllEntities(message, context);
  
  // Refine intent based on entities
  recognizedIntent = refineIntent(recognizedIntent, entities, message);
  
  return {
    intent: recognizedIntent,
    confidence: maxScore,
    entities,
    allScores: scores
  };
}

/**
 * Refine intent based on extracted entities
 */
function refineIntent(intent, entities, message) {
  const normalized = message.toLowerCase();
  
  // If we found amounts and action words, likely an action request
  if (entities.amounts.length > 0 && /add|create|record|log/i.test(message)) {
    return 'action_request';
  }
  
  // If asking about budget with time period, it's a budget query
  if ((entities.timePeriod || entities.dates.length > 0) && /budget/i.test(message)) {
    return 'budget_query';
  }
  
  // If asking about goals with progress indicators
  if (/goal|save|saving/i.test(message) && /progress|close|reach|achieve/i.test(message)) {
    return 'goal_query';
  }
  
  // If comparing time periods, it's analytics
  if (entities.timePeriod && /compare|vs|versus|than/i.test(message)) {
    return 'analytics';
  }
  
  // If has category and time period, likely transaction query
  if (entities.categories.length > 0 && (entities.timePeriod || entities.dates.length > 0)) {
    if (!/budget|goal/i.test(message)) {
      return 'transaction_query';
    }
  }
  
  return intent;
}

/**
 * Get suggested follow-up questions based on intent
 */
function getSuggestedFollowUps(intent, entities) {
  const suggestions = {
    transaction_query: [
      "Show my spending by category",
      "What was my biggest expense?",
      "Compare this month to last month"
    ],
    budget_query: [
      "Show all my budgets",
      "Which categories am I over budget?",
      "Create a new budget"
    ],
    goal_query: [
      "Show all my goals",
      "How can I save more?",
      "Set a new savings goal"
    ],
    analytics: [
      "What are my spending trends?",
      "Show my financial summary",
      "Which category do I spend most on?"
    ],
    action_request: [
      "Add another transaction",
      "Create a budget",
      "Set a savings goal"
    ],
    help: [
      "How do I create a budget?",
      "What can you help me with?",
      "Show me my dashboard"
    ],
    financial_advice: [
      "How can I save money?",
      "Tips for reducing expenses",
      "Should I adjust my budget?"
    ],
    general: [
      "What can you do?",
      "Show my spending this month",
      "How am I doing financially?"
    ],
    unknown: [
      "Show my spending this month",
      "Am I on track with my budget?",
      "How close am I to my goals?"
    ]
  };
  
  return suggestions[intent] || suggestions.general;
}

/**
 * Check if message is a question
 */
function isQuestion(message) {
  return message.includes('?') || 
         /^(what|how|when|where|why|who|which|can|should|is|are|do|does|did)/i.test(message.trim());
}

/**
 * Detect sentiment of message (basic)
 */
function detectSentiment(message) {
  const normalized = message.toLowerCase();
  
  const positiveWords = ['great', 'good', 'excellent', 'awesome', 'thank', 'love', 'happy'];
  const negativeWords = ['bad', 'terrible', 'hate', 'angry', 'sad', 'worried', 'concern'];
  
  let sentiment = 'neutral';
  
  for (const word of positiveWords) {
    if (normalized.includes(word)) {
      sentiment = 'positive';
      break;
    }
  }
  
  for (const word of negativeWords) {
    if (normalized.includes(word)) {
      sentiment = 'negative';
      break;
    }
  }
  
  return sentiment;
}

/**
 * Main function to process user message
 */
function processMessage(message, context = {}) {
  // Validate message
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return {
      intent: 'unknown',
      confidence: 0,
      entities: {},
      error: 'Empty or invalid message'
    };
  }
  
  // Clean message
  const cleanedMessage = message.trim();
  
  // Recognize intent
  const result = recognizeIntent(cleanedMessage, context);
  
  // Add metadata
  result.isQuestion = isQuestion(cleanedMessage);
  result.sentiment = detectSentiment(cleanedMessage);
  result.suggestions = getSuggestedFollowUps(result.intent, result.entities);
  result.messageLength = cleanedMessage.length;
  result.wordCount = cleanedMessage.split(/\s+/).length;
  
  return result;
}

export {
  recognizeIntent,
  processMessage,
  getSuggestedFollowUps,
  isQuestion,
  detectSentiment,
  intentPatterns
};
