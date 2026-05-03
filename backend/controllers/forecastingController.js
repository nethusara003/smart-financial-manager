import {
  generateExpenseForecast,
  getCategoryForecast,
} from "../Services/forecastingService.js";

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

    const forecast = await generateExpenseForecast(userId, months);

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
