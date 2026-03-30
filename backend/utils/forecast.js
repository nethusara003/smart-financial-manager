const DEFAULT_FORECAST_CONFIG = {
  minDataPoints: 3,
  weights: [0.5, 0.3, 0.2],
  trendFactor: 0.3,
  seasonality: {
    minDataPoints: 6,
    significanceThreshold: 0.15,
    minAdjustment: 0.03,
    maxAdjustment: 0.08,
  },
  categoryRules: {
    rent: { type: "fixed" },
    food: { type: "mild", variation: 0.03 },
    travel: { type: "high", minBoost: 0.05, maxBoost: 0.1 },
  },
  clamp: {
    minMultiplier: 0.75,
    maxMultiplier: 1.25,
  },
};

const normalizeCategory = (category = "") =>
  String(category).trim().toLowerCase();

const getLastValue = (data) => {
  if (!Array.isArray(data) || data.length === 0) return 0;
  return Number(data[data.length - 1]) || 0;
};

const weightedMovingAverage = (data, weights) => {
  const safeWeights = Array.isArray(weights) && weights.length === 3 ? weights : [0.5, 0.3, 0.2];
  const [w1, w2, w3] = safeWeights;
  const last = Number(data[data.length - 1]) || 0;
  const prev = Number(data[data.length - 2]) || last;
  const third = Number(data[data.length - 3]) || prev;
  return last * w1 + prev * w2 + third * w3;
};

const calculateVariance = (data) => {
  if (!Array.isArray(data) || data.length === 0) return 0;
  const avg = data.reduce((sum, value) => sum + Number(value || 0), 0) / data.length;
  const variance =
    data.reduce((sum, value) => sum + Math.pow(Number(value || 0) - avg, 2), 0) / data.length;
  return variance;
};

export const calculateConfidence = (data) => {
  if (!Array.isArray(data) || data.length < 2) {
    return "low";
  }

  const values = data.map((value) => Number(value || 0));
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;

  if (mean <= 0) {
    return "low";
  }

  const variance = calculateVariance(values);
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;

  if (cv <= 0.2) return "high";
  if (cv <= 0.45) return "medium";
  return "low";
};

const getSeasonalityAdjustment = (data, config) => {
  if (!Array.isArray(data) || data.length < config.seasonality.minDataPoints) {
    return 0;
  }

  const values = data.map((value) => Number(value || 0));
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;

  if (avg <= 0) {
    return 0;
  }

  const last = values[values.length - 1];
  const deviationRatio = (last - avg) / avg;

  if (Math.abs(deviationRatio) < config.seasonality.significanceThreshold) {
    return 0;
  }

  const magnitude = Math.min(
    Math.max(Math.abs(deviationRatio) * 0.5, config.seasonality.minAdjustment),
    config.seasonality.maxAdjustment
  );

  return Math.sign(deviationRatio) * magnitude;
};

const applyCategoryRule = (forecast, category, trend, seasonalityRatio, lastValue, config) => {
  const normalized = normalizeCategory(category);
  const rule = config.categoryRules[normalized];

  if (!rule) {
    return forecast;
  }

  if (rule.type === "fixed") {
    return lastValue;
  }

  if (rule.type === "mild") {
    const signal = Math.sign(trend || seasonalityRatio || 0);
    return forecast * (1 + signal * rule.variation);
  }

  if (rule.type === "high") {
    const baseline = lastValue > 0 ? Math.abs(trend) / lastValue : 0;
    const boost = Math.min(Math.max(rule.minBoost + baseline * 0.25, rule.minBoost), rule.maxBoost);
    return forecast * (1 + boost);
  }

  return forecast;
};

const clampGrowth = (forecast, lastValue, config) => {
  const minAllowed = lastValue * config.clamp.minMultiplier;
  const maxAllowed = lastValue * config.clamp.maxMultiplier;
  return Math.min(Math.max(forecast, minAllowed), maxAllowed);
};

export const forecastExpense = (data, category, customConfig = {}) => {
  const config = {
    ...DEFAULT_FORECAST_CONFIG,
    ...customConfig,
    seasonality: {
      ...DEFAULT_FORECAST_CONFIG.seasonality,
      ...(customConfig.seasonality || {}),
    },
    categoryRules: {
      ...DEFAULT_FORECAST_CONFIG.categoryRules,
      ...(customConfig.categoryRules || {}),
    },
    clamp: {
      ...DEFAULT_FORECAST_CONFIG.clamp,
      ...(customConfig.clamp || {}),
    },
  };

  const values = Array.isArray(data) ? data.map((value) => Number(value || 0)) : [];

  if (values.length === 0) {
    return {
      forecast: 0,
      confidence: "low",
    };
  }

  const lastMonth = getLastValue(values);

  if (values.length < config.minDataPoints) {
    return {
      forecast: Math.max(0, Math.round(lastMonth)),
      confidence: calculateConfidence(values),
    };
  }

  const baseline = weightedMovingAverage(values, config.weights);
  const previousMonth = Number(values[values.length - 2]) || lastMonth;
  const trend = lastMonth - previousMonth;

  let forecast = baseline + trend * config.trendFactor;

  const seasonalityRatio = getSeasonalityAdjustment(values, config);
  forecast = forecast * (1 + seasonalityRatio);

  forecast = applyCategoryRule(forecast, category, trend, seasonalityRatio, lastMonth, config);
  forecast = clampGrowth(forecast, lastMonth, config);

  return {
    forecast: Math.max(0, Math.round(forecast)),
    confidence: calculateConfidence(values),
  };
};

export const forecastExpenseSeries = (data, category, periods = 3, config = {}) => {
  const values = Array.isArray(data) ? data.map((value) => Number(value || 0)) : [];

  if (values.length === 0) {
    return {
      forecasts: Array(Math.max(0, periods)).fill(0),
      confidence: "low",
    };
  }

  const working = [...values];
  const forecasts = [];

  for (let i = 0; i < periods; i++) {
    const { forecast } = forecastExpense(working, category, config);
    forecasts.push(forecast);
    working.push(forecast);
    if (working.length > 18) {
      working.shift();
    }
  }

  return {
    forecasts,
    confidence: calculateConfidence(values),
  };
};

export { DEFAULT_FORECAST_CONFIG };
