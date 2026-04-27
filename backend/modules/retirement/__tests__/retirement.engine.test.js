import { describe, expect, it } from "@jest/globals";
import { calculateRetirement } from "../retirement.service.js";
import { runMonteCarloSimulation } from "../retirement.simulation.js";

const buildSeries = (years, base, growth = 0.03) =>
  Array.from({ length: years }, (_, index) => Number((base * Math.pow(1 + growth, index)).toFixed(2)));

describe("retirement financial engine", () => {
  it.each([10, 20, 40])("calculates deterministic projection without NaN for %i-year plan", (years) => {
    const predictedIncome = buildSeries(years, 9000, 0.04);
    const predictedExpenses = buildSeries(years, 5500, 0.03);

    const result = calculateRetirement({
      currentSavings: 25000,
      monthlySavings: 400,
      years,
      predictedIncome,
      predictedExpenses,
      returnRate: 0.08,
      inflation: 0.03,
      salaryGrowth: 0.04,
    });

    expect(Number.isFinite(result.projectedFund)).toBe(true);
    expect(result.yearlyBreakdown).toHaveLength(years);

    result.yearlyBreakdown.forEach((yearRecord) => {
      expect(Number.isFinite(yearRecord.income)).toBe(true);
      expect(Number.isFinite(yearRecord.expenses)).toBe(true);
      expect(Number.isFinite(yearRecord.annualContribution)).toBe(true);
      expect(Number.isFinite(yearRecord.endingBalance)).toBe(true);
    });
  });
});

describe("retirement monte carlo simulation", () => {
  it("returns stable simulation metrics under 2 seconds", () => {
    const years = 40;
    const predictedIncome = buildSeries(years, 110000, 0.03);
    const predictedExpenses = buildSeries(years, 65000, 0.025);

    const startedAt = Date.now();

    const simulation = runMonteCarloSimulation({
      currentSavings: 50000,
      monthlySavings: 600,
      years,
      predictedIncome,
      predictedExpenses,
      targetAmount: 1500000,
      config: {
        simulations: 1000,
      },
    });

    const elapsedMs = Date.now() - startedAt;

    expect(elapsedMs).toBeLessThan(2000);
    expect(simulation.allSimulations).toHaveLength(1000);
    expect(simulation.allSimulations.every((value) => Number.isFinite(value))).toBe(true);
    expect(simulation.percentile10).toBeLessThanOrEqual(simulation.median);
    expect(simulation.median).toBeLessThanOrEqual(simulation.percentile90);
    expect(simulation.probabilityOfSuccess).toBeGreaterThanOrEqual(0);
    expect(simulation.probabilityOfSuccess).toBeLessThanOrEqual(1);
  });
});
