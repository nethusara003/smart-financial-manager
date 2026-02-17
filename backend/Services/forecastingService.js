import Transaction from "../models/Transaction.js";
import RecurringTransaction from "../models/RecurringTransaction.js";

/* =========================
   PREDICTIVE EXPENSE FORECASTING
   - Historical data analysis
   - Trend detection
   - Future expense estimation
========================= */

/**
 * Get historical transaction data
 */
const getHistoricalData = async (userId, months = 6) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const transactions = await Transaction.find({
    user: userId,
    type: "expense",
    date: { $gte: startDate },
  }).sort({ date: 1 });

  return transactions;
};

/**
 * Group transactions by month and category
 */
const groupByMonthAndCategory = (transactions) => {
  const grouped = {};

  transactions.forEach((t) => {
    const monthKey = new Date(t.date).toISOString().slice(0, 7); // YYYY-MM
    
    if (!grouped[monthKey]) {
      grouped[monthKey] = {};
    }
    
    if (!grouped[monthKey][t.category]) {
      grouped[monthKey][t.category] = 0;
    }
    
    grouped[monthKey][t.category] += t.amount;
  });

  return grouped;
};

/**
 * Calculate moving average
 */
const calculateMovingAverage = (values, window = 3) => {
  if (values.length < window) {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  const recentValues = values.slice(-window);
  return recentValues.reduce((a, b) => a + b, 0) / window;
};

/**
 * Detect trend (increasing, decreasing, stable)
 */
const detectTrend = (values) => {
  if (values.length < 2) {
    return { direction: "stable", slope: 0, confidence: "low" };
  }

  // Simple linear regression
  const n = values.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  
  const sumX = indices.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = indices.reduce((sum, x, i) => sum + x * values[i], 0);
  const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const avgY = sumY / n;
  
  // Calculate percentage change
  const percentChange = (slope / avgY) * 100;

  let direction = "stable";
  let confidence = "medium";

  if (percentChange > 5) {
    direction = "increasing";
    confidence = percentChange > 15 ? "high" : "medium";
  } else if (percentChange < -5) {
    direction = "decreasing";
    confidence = percentChange < -15 ? "high" : "medium";
  } else {
    confidence = "low";
  }

  return {
    direction,
    slope: slope.toFixed(2),
    percentChange: percentChange.toFixed(2),
    confidence,
  };
};

/**
 * Calculate seasonal pattern
 */
const detectSeasonalPattern = (monthlyData) => {
  const months = Object.keys(monthlyData).sort();
  
  if (months.length < 6) {
    return { hasPattern: false, factor: 1 };
  }

  const values = months.map((m) => monthlyData[m]);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  
  // Calculate coefficient of variation
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = (stdDev / avg) * 100;

  return {
    hasPattern: coefficientOfVariation > 20,
    variation: coefficientOfVariation.toFixed(2),
    average: avg.toFixed(2),
  };
};

/**
 * Detect anomalies in spending
 */
const detectAnomalies = (values) => {
  if (values.length < 3) {
    return [];
  }

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const anomalies = [];
  values.forEach((value, index) => {
    const zScore = Math.abs((value - mean) / stdDev);
    if (zScore > 2) {
      // More than 2 standard deviations
      anomalies.push({
        index,
        value,
        deviation: zScore.toFixed(2),
        type: value > mean ? "spike" : "drop",
      });
    }
  });

  return anomalies;
};

/**
 * Simple linear forecast
 */
const forecastLinear = (values, periods = 3) => {
  const n = values.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  
  const sumX = indices.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = indices.reduce((sum, x, i) => sum + x * values[i], 0);
  const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const forecasts = [];
  for (let i = 1; i <= periods; i++) {
    const nextValue = intercept + slope * (n + i - 1);
    forecasts.push(Math.max(0, nextValue)); // Ensure non-negative
  }

  return forecasts;
};

/**
 * Get forecast for upcoming months
 */
const getForecastForPeriod = (historicalValues, months = 3) => {
  if (historicalValues.length === 0) {
    return Array(months).fill(0);
  }

  // Use moving average with trend adjustment
  const movingAvg = calculateMovingAverage(historicalValues, 3);
  const trend = detectTrend(historicalValues);
  
  const forecasts = [];
  let lastValue = movingAvg;

  for (let i = 1; i <= months; i++) {
    // Apply trend
    const slopeValue = typeof trend.slope === 'string' ? parseFloat(trend.slope) : Number(trend.slope);
    const trendAdjustment = slopeValue * i;
    const forecast = lastValue + trendAdjustment;
    forecasts.push(Math.max(0, Math.round(forecast)));
  }

  return forecasts;
};

/**
 * Get recurring expenses for forecast
 */
const getRecurringExpenses = async (userId) => {
  const recurringTransactions = await RecurringTransaction.find({
    user: userId,
    type: "expense",
    isActive: true,
  });

  const monthlyRecurring = {};

  recurringTransactions.forEach((rt) => {
    if (!monthlyRecurring[rt.category]) {
      monthlyRecurring[rt.category] = 0;
    }

    // Convert to monthly amount
    let monthlyAmount = rt.amount;
    if (rt.frequency === "daily") monthlyAmount *= 30;
    else if (rt.frequency === "weekly") monthlyAmount *= 4;
    else if (rt.frequency === "yearly") monthlyAmount /= 12;

    monthlyRecurring[rt.category] += monthlyAmount;
  });

  return monthlyRecurring;
};

/**
 * Generate expense forecast
 */
export const generateExpenseForecast = async (userId, forecastMonths = 3) => {
  try {
    // Minimum 3 months of data required
    const minMonths = 3;
    const historicalMonths = 6;

    const transactions = await getHistoricalData(userId, historicalMonths);

    if (transactions.length === 0) {
      return {
        success: false,
        message: "Insufficient historical data. Please add at least 3 months of transactions.",
        forecast: [],
      };
    }

    // Group data by month and category
    const monthlyData = groupByMonthAndCategory(transactions);
    const months = Object.keys(monthlyData).sort();

    if (months.length < minMonths) {
      return {
        success: false,
        message: `Need at least ${minMonths} months of data. You have ${months.length} month(s).`,
        forecast: [],
      };
    }

    // Get all categories
    const allCategories = new Set();
    transactions.forEach((t) => allCategories.add(t.category));

    // Get recurring expenses
    const recurringExpenses = await getRecurringExpenses(userId);

    // Forecast by category
    const categoryForecasts = [];
    let totalHistoricalAvg = 0;

    allCategories.forEach((category) => {
      // Get historical values for this category
      const historicalValues = months.map((month) => monthlyData[month][category] || 0);
      
      const avg = historicalValues.reduce((a, b) => a + b, 0) / historicalValues.length;
      totalHistoricalAvg += avg;

      // Detect trend
      const trend = detectTrend(historicalValues);
      
      // Detect seasonal pattern
      const seasonalInfo = detectSeasonalPattern(
        months.reduce((obj, m) => {
          obj[m] = monthlyData[m][category] || 0;
          return obj;
        }, {})
      );

      // Detect anomalies
      const anomalies = detectAnomalies(historicalValues);

      // Generate forecast
      const forecastValues = getForecastForPeriod(historicalValues, forecastMonths);

      // Add recurring expenses if any
      const recurringAmount = recurringExpenses[category] || 0;

      categoryForecasts.push({
        category,
        historical: {
          values: historicalValues.map((v) => Math.round(v)),
          average: Math.round(avg),
          trend: trend.direction,
          trendConfidence: trend.confidence,
          percentChange: trend.percentChange + "%",
        },
        forecast: forecastValues.map((v, i) => ({
          month: i + 1,
          predicted: Math.round(v + recurringAmount),
          baseAmount: Math.round(v),
          recurringAmount: Math.round(recurringAmount),
        })),
        insights: {
          seasonalPattern: seasonalInfo.hasPattern ? "Detected" : "Not detected",
          anomalies: anomalies.length,
          reliability: historicalValues.length >= 6 ? "High" : "Medium",
        },
      });
    });

    // Calculate overall forecast
    const overallForecast = [];
    for (let i = 0; i < forecastMonths; i++) {
      let total = 0;
      let minEstimate = 0;
      let maxEstimate = 0;

      categoryForecasts.forEach((cf) => {
        const predicted = cf.forecast[i].predicted;
        total += predicted;
        minEstimate += predicted * 0.9; // 10% lower
        maxEstimate += predicted * 1.1; // 10% higher
      });

      const forecastDate = new Date();
      forecastDate.setMonth(forecastDate.getMonth() + i + 1);

      overallForecast.push({
        month: forecastDate.toLocaleString("default", { month: "short", year: "numeric" }),
        totalPredicted: Math.round(total),
        minEstimate: Math.round(minEstimate),
        maxEstimate: Math.round(maxEstimate),
        confidence: "Medium",
      });
    }

    // Generate insights
    const insights = generateForecastInsights(
      categoryForecasts,
      overallForecast,
      totalHistoricalAvg
    );

    return {
      success: true,
      dataQuality: {
        monthsAnalyzed: months.length,
        transactionsAnalyzed: transactions.length,
        categoriesTracked: allCategories.size,
        reliability: months.length >= 6 ? "High" : "Medium",
      },
      summary: {
        historicalMonthlyAverage: Math.round(totalHistoricalAvg),
        forecastPeriod: forecastMonths,
        overallForecast,
      },
      categoryForecasts: categoryForecasts.sort((a, b) => 
        b.historical.average - a.historical.average
      ),
      insights,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error generating expense forecast:", error);
    throw error;
  }
};

/**
 * Generate forecast insights
 */
const generateForecastInsights = (categoryForecasts, overallForecast, historicalAvg) => {
  const insights = [];

  // Overall trend insight
  const avgForecast =
    overallForecast.reduce((sum, f) => sum + f.totalPredicted, 0) / overallForecast.length;
  const changePercent = ((avgForecast - historicalAvg) / historicalAvg) * 100;

  if (changePercent > 10) {
    insights.push({
      type: "warning",
      category: "Overall",
      message: `Expenses are predicted to increase by ${changePercent.toFixed(1)}% in coming months.`,
      priority: "high",
      recommendation: "Review and adjust budgets to accommodate increased expenses.",
    });
  } else if (changePercent < -10) {
    insights.push({
      type: "success",
      category: "Overall",
      message: `Expenses are predicted to decrease by ${Math.abs(changePercent).toFixed(1)}%.`,
      priority: "medium",
      recommendation: "Great! Consider allocating savings to goals.",
    });
  }

  // Category-specific insights
  categoryForecasts.forEach((cf) => {
    if (cf.historical.trend === "increasing" && cf.historical.trendConfidence !== "low") {
      const avgForecast = cf.forecast.reduce((sum, f) => sum + f.predicted, 0) / cf.forecast.length;
      
      insights.push({
        type: "info",
        category: cf.category,
        message: `${cf.category} expenses are trending upward. Average forecast: ${Math.round(avgForecast)}`,
        priority: "medium",
        recommendation: `Consider setting a budget limit for ${cf.category}.`,
      });
    }

    if (cf.insights.anomalies > 0) {
      insights.push({
        type: "info",
        category: cf.category,
        message: `${cf.insights.anomalies} unusual spending pattern(s) detected in ${cf.category}.`,
        priority: "low",
        recommendation: "Review historical transactions for irregularities.",
      });
    }
  });

  // Cash flow insight
  const nextMonthForecast = overallForecast[0];
  insights.push({
    type: "info",
    category: "Cash Flow",
    message: `Next month's estimated expenses: ${nextMonthForecast.totalPredicted} (Range: ${nextMonthForecast.minEstimate} - ${nextMonthForecast.maxEstimate})`,
    priority: "high",
    recommendation: "Ensure sufficient funds are available.",
  });

  return insights;
};

/**
 * Get category-specific forecast
 */
export const getCategoryForecast = async (userId, category, months = 6) => {
  try {
    const transactions = await getHistoricalData(userId, months * 2);
    const categoryTransactions = transactions.filter((t) => t.category === category);

    if (categoryTransactions.length === 0) {
      return {
        success: false,
        message: `No historical data for category: ${category}`,
      };
    }

    const monthlyData = groupByMonthAndCategory(categoryTransactions);
    const monthKeys = Object.keys(monthlyData).sort();
    const values = monthKeys.map((m) => monthlyData[m][category] || 0);

    const trend = detectTrend(values);
    const forecast = getForecastForPeriod(values, 3);

    return {
      success: true,
      category,
      historical: values,
      trend,
      forecast,
    };
  } catch (error) {
    console.error("Error generating category forecast:", error);
    throw error;
  }
};
