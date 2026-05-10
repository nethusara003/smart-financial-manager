import {
  generateExpenseForecast,
  getCategoryForecast,
} from "../Services/forecastingService.js";

// Simple in-memory cache to avoid repeated heavy forecast calculations
const forecastCache = new Map();
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

function getFromCache(key) {
  const entry = forecastCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    forecastCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  forecastCache.set(key, { data, timestamp: Date.now() });
  if (forecastCache.size > 500) {
    const firstKey = forecastCache.keys().next().value;
    forecastCache.delete(firstKey);
  }
}

/* =========================
   GET EXPENSE FORECAST
========================= */
export const getExpenseForecast = async (req, res) => {
  try {
    // Defensive: if this is a guest session, return a safe non-error response.
    if (req.user?.isGuest) {
      return res.json({
        success: false,
        message: "Guest sessions do not have persisted forecasting data",
        forecast: null,
      });
    }

    const userId = req.user._id || req.user.id;
    const parsedMonths = Number.parseInt(req.query.months, 10);
    const months = Number.isFinite(parsedMonths) && parsedMonths > 0 ? parsedMonths : 3;

    const cacheKey = `expenses:${userId}:${months}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const forecast = await generateExpenseForecast(userId, months);

    setCache(cacheKey, forecast);
    res.json(forecast);
  } catch (error) {
    console.error("Error generating expense forecast:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate expense forecast",
      error: error.message,
    });
  }
};

/* =========================
   GET CATEGORY FORECAST
========================= */
export const getForecastByCategory = async (req, res) => {
  try {
    // Defensive: guests don't have persisted forecasting data
    if (req.user?.isGuest) {
      return res.json({
        success: false,
        message: "Guest sessions do not have persisted forecasting data",
        forecast: null,
      });
    }

    const userId = req.user._id || req.user.id;
    const { category } = req.params;
    const parsedMonths = Number.parseInt(req.query.months, 10);
    const months = Number.isFinite(parsedMonths) && parsedMonths > 0 ? parsedMonths : 6;

    const forecast = await getCategoryForecast(userId, category, months);

    res.json(forecast);
  } catch (error) {
    console.error("Error generating category forecast:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate category forecast",
      error: error.message,
    });
  }
};
