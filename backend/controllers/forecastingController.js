import {
  generateExpenseForecast,
  getCategoryForecast,
} from "../Services/forecastingService.js";

/* =========================
   GET EXPENSE FORECAST
========================= */
export const getExpenseForecast = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const months = parseInt(req.query.months) || 3;

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
    const userId = req.user._id || req.user.id;
    const { category } = req.params;
    const months = parseInt(req.query.months) || 6;

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
