import { calculateRetirement } from "../modules/retirement/retirement.service.js";
import { runMonteCarloSimulation } from "../modules/retirement/retirement.simulation.js";

const buildSeries = (years, base, growth) =>
  Array.from({ length: years }, (_, index) => Number((base * Math.pow(1 + growth, index)).toFixed(2)));

const assertFinite = (value, label) => {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} is not finite`);
  }
};

const runDeterministicChecks = () => {
  [10, 20, 40].forEach((years) => {
    const result = calculateRetirement({
      currentSavings: 25000,
      monthlySavings: 450,
      years,
      predictedIncome: buildSeries(years, 95000, 0.03),
      predictedExpenses: buildSeries(years, 62000, 0.025),
      returnRate: 0.08,
      inflation: 0.03,
      salaryGrowth: 0.04,
    });

    assertFinite(result.projectedFund, `projectedFund(${years})`);

    result.yearlyBreakdown.forEach((row, index) => {
      assertFinite(row.income, `income(${years},${index})`);
      assertFinite(row.expenses, `expenses(${years},${index})`);
      assertFinite(row.annualContribution, `annualContribution(${years},${index})`);
      assertFinite(row.endingBalance, `endingBalance(${years},${index})`);
    });
  });
};

const runSimulationChecks = () => {
  const years = 40;
  const income = buildSeries(years, 120000, 0.03);
  const expenses = buildSeries(years, 70000, 0.025);

  const startedAt = Date.now();
  const simulation = runMonteCarloSimulation({
    currentSavings: 50000,
    monthlySavings: 750,
    years,
    predictedIncome: income,
    predictedExpenses: expenses,
    targetAmount: 2000000,
    config: {
      simulations: 1000,
    },
  });
  const elapsedMs = Date.now() - startedAt;

  if (simulation.allSimulations.some((value) => !Number.isFinite(value))) {
    throw new Error("Simulation contains non-finite values");
  }

  if (simulation.percentile10 > simulation.median || simulation.median > simulation.percentile90) {
    throw new Error("Simulation percentile ordering is invalid");
  }

  if (simulation.probabilityOfSuccess < 0 || simulation.probabilityOfSuccess > 1) {
    throw new Error("Simulation probability is outside [0,1]");
  }

  return elapsedMs;
};

const main = () => {
  runDeterministicChecks();
  const elapsedMs = runSimulationChecks();

  console.log(
    JSON.stringify(
      {
        success: true,
        deterministicChecks: [10, 20, 40],
        monteCarloSimulations: 1000,
        simulationElapsedMs: elapsedMs,
      },
      null,
      2
    )
  );
};

main();
