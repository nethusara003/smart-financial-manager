import { describe, it, expect } from "@jest/globals";
import { calculateErrorMetrics, runRollingBacktest } from "../forecast.js";

describe("Forecast backtest utilities", () => {
  it("calculates MAE, RMSE, and MAPE correctly", () => {
    const actuals = [100, 120, 80];
    const predictions = [110, 100, 70];

    const metrics = calculateErrorMetrics(actuals, predictions);

    expect(metrics.sampleSize).toBe(3);
    expect(metrics.mae).toBe(13.33);
    expect(metrics.rmse).toBe(14.14);
    expect(metrics.mape).toBe(13.06);
    expect(metrics.mapeSampleSize).toBe(3);
  });

  it("ignores zero actuals when calculating MAPE", () => {
    const metrics = calculateErrorMetrics([0, 100], [10, 110]);

    expect(metrics.sampleSize).toBe(2);
    expect(metrics.mae).toBe(10);
    expect(metrics.rmse).toBe(10);
    expect(metrics.mape).toBe(10);
    expect(metrics.mapeSampleSize).toBe(1);
  });

  it("runs deterministic rolling-origin backtest", () => {
    const constantSeries = [100, 100, 100, 100, 100];
    const result = runRollingBacktest(constantSeries, "rent", { minTrainSize: 3 });

    expect(result.metrics.sampleSize).toBe(2);
    expect(result.metrics.mae).toBe(0);
    expect(result.metrics.rmse).toBe(0);
    expect(result.metrics.mape).toBe(0);
    expect(result.predictions).toEqual([100, 100]);
    expect(result.actuals).toEqual([100, 100]);
  });
});