import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import Transaction from "../../models/Transaction.js";
import {
  generateExpenseForecast,
  getCategoryForecast,
} from "../forecastingService.js";

const buildTransactions = () => {
  const monthlyRows = [
    { month: "2025-01-15", food: 200, rent: 800 },
    { month: "2025-02-15", food: 210, rent: 800 },
    { month: "2025-03-15", food: 220, rent: 800 },
    { month: "2025-04-15", food: 230, rent: 800 },
    { month: "2025-05-15", food: 240, rent: 800 },
    { month: "2025-06-15", food: 250, rent: 800 },
  ];

  return monthlyRows.flatMap((row) => [
    {
      user: "user-1",
      type: "expense",
      category: "Food",
      amount: row.food,
      date: new Date(`${row.month}T12:00:00.000Z`),
    },
    {
      user: "user-1",
      type: "expense",
      category: "rent",
      amount: row.rent,
      date: new Date(`${row.month}T12:00:00.000Z`),
    },
  ]);
};

describe("forecastingService", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("includes aggregate and category backtest metrics in expense forecast", async () => {
    const transactions = buildTransactions();
    const leanMock = jest.fn().mockResolvedValue(transactions);
    const sortMock = jest.fn().mockReturnValue({ lean: leanMock });

    Transaction.find = jest.fn().mockReturnValue({
      sort: sortMock,
    });

    const result = await generateExpenseForecast("user-1", 3);

    expect(result.success).toBe(true);
    expect(result.confidenceModel).toEqual(
      expect.objectContaining({
        method: "blended_variance_backtest_v1",
        varianceSource: "coefficient_of_variation",
      })
    );
    expect(result.confidenceModel.backtest).toEqual(
      expect.objectContaining({
        strategy: "rolling-origin-1-step",
        minTrainSize: 3,
        minWindows: 2,
      })
    );
    expect(result.summary.backtestQuality).toEqual(
      expect.objectContaining({
        windows: expect.any(Number),
        categoriesWithBacktest: expect.any(Number),
        mae: expect.any(Number),
        rmse: expect.any(Number),
        mape: expect.any(Number),
      })
    );

    const foodForecast = result.categoryForecasts.find((item) => item.category === "Food");
    expect(foodForecast).toBeDefined();
    expect(foodForecast.backtest).toEqual(
      expect.objectContaining({
        windows: expect.any(Number),
        mae: expect.any(Number),
        rmse: expect.any(Number),
      })
    );
    expect(foodForecast.recurrence).toEqual(
      expect.objectContaining({
        monthlyRecurringAmount: expect.any(Number),
        includedInForecast: expect.any(Boolean),
      })
    );
    expect(["high", "medium", "low"]).toContain(foodForecast.backtest.confidence);
    expect(["high", "medium", "low"]).toContain(
      foodForecast.forecast[0].confidence.toLowerCase()
    );
  });

  it("returns category forecast confidence breakdown with backtest metrics", async () => {
    const transactions = buildTransactions();
    const leanMock = jest.fn().mockResolvedValue(transactions);
    const sortMock = jest.fn().mockReturnValue({ lean: leanMock });

    Transaction.find = jest.fn().mockReturnValue({
      sort: sortMock,
    });

    const result = await getCategoryForecast("user-1", "Food", 6);

    expect(result.success).toBe(true);
    expect(["high", "medium", "low"]).toContain(result.confidence);
    expect(result.confidenceBreakdown).toEqual(
      expect.objectContaining({
        variance: expect.any(String),
        backtest: expect.any(String),
      })
    );
    expect(result.backtest).toEqual(
      expect.objectContaining({
        windows: expect.any(Number),
        mae: expect.any(Number),
        rmse: expect.any(Number),
      })
    );
    expect(result.confidenceModel).toEqual(
      expect.objectContaining({
        method: "blended_variance_backtest_v1",
      })
    );
  });
});