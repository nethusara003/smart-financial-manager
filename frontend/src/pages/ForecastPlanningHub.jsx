import { useLocation, useNavigate } from "react-router-dom";
import ExpenseForecast from "./ExpenseForecast";
import RetirementPlanner from "./RetirementPlanner";

function ForecastPlanningHub() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname === "/retirement" ? "retirement" : "forecast";

  return (
    <div className="mx-auto w-full">
      <section className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-dark-border-default dark:bg-dark-surface-secondary">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">Forecast & Retirement Planning</h1>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
              Both forecasting and retirement planning are now available in one unified page.
            </p>
          </div>

          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-dark-border-strong dark:bg-dark-surface-elevated">
            <button
              type="button"
              onClick={() => navigate("/forecast")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "forecast"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-dark-text-secondary dark:hover:bg-dark-surface-hover"
              }`}
            >
              Expense Forecast
            </button>
            <button
              type="button"
              onClick={() => navigate("/retirement")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "retirement"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-dark-text-secondary dark:hover:bg-dark-surface-hover"
              }`}
            >
              Retirement Planner
            </button>
          </div>
        </div>
      </section>

      {activeTab === "retirement" ? <RetirementPlanner /> : <ExpenseForecast />}
    </div>
  );
}

export default ForecastPlanningHub;