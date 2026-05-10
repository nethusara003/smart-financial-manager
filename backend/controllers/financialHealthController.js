// @ts-nocheck
// @ts-ignore - Runtime module resolution is valid; JS check can misresolve this path on Windows casing.
import {
  calculateFinancialHealthScore,
  getFinancialHealthHistory,
} from "../Services/financialHealthService.js";

// Simple in-memory cache: avoids recomputing the same health score within 2 minutes.
const scoreCache = new Map();
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

function getCacheKey(userId, months) {
  return `${userId}:${months}`;
}

function getFromCache(key) {
  const entry = scoreCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    scoreCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  scoreCache.set(key, { data, timestamp: Date.now() });
  // Prevent unbounded growth — keep at most 500 entries
  if (scoreCache.size > 500) {
    const firstKey = scoreCache.keys().next().value;
    scoreCache.delete(firstKey);
  }
}

/* =========================
   GET FINANCIAL HEALTH SCORE
========================= */
export const getFinancialHealthScore = async (req, res) => {
  try {
    // Defensive: if this is a guest session, return a safe non-error response.
    if (req.user?.isGuest) {
      return res.json({
        success: false,
        message: "Guest sessions do not have persisted financial health data",
      });
    }

    const userId = req.user._id || req.user.id;
    const monthsParam = Number.parseInt(req.query.months, 10);
    const months = Number.isFinite(monthsParam) ? Math.min(24, Math.max(1, monthsParam)) : 1;

    // Check the server-side cache first
    const cacheKey = getCacheKey(userId.toString(), months);
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const healthScore = await calculateFinancialHealthScore(userId, months);

    // If success is false, return 400 status so frontend catches it properly
    if (healthScore.success === false) {
      return res.status(400).json(healthScore);
    }

    setCache(cacheKey, healthScore);
    res.json(healthScore);
  } catch (error) {
    console.error("Error fetching financial health score:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate financial health score",
      error: error.message,
    });
  }
};

/* =========================
   GET FINANCIAL HEALTH HISTORY
========================= */
export const getHealthHistory = async (req, res) => {
  try {
    // Defensive: guests don't have persisted insight history
    if (req.user?.isGuest) {
      return res.json({
        success: false,
        message: "Guest sessions do not have persisted financial health history",
        history: [],
      });
    }

    const userId = req.user._id || req.user.id;
    const months = parseInt(req.query.months) || 6;

    const history = await getFinancialHealthHistory(userId, months);

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Error fetching financial health history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch financial health history",
      error: error.message,
    });
  }
};
