import { useLocation, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import ExpenseForecast from "./ExpenseForecast";
import RetirementPlanner from "./RetirementPlanner";
import { useExpenseForecast } from "../hooks/useInsights";
import { TrendingUp } from "lucide-react";
import SystemPageHeader from "../components/layout/SystemPageHeader";

function ForecastPlanningHub() {
  const navigate = useNavigate();
  const location = useLocation();

  const [months, setMonths] = useState(3);

  const activeTab = location.pathname === "/retirement" ? "retirement" : "forecast";

  // Fetch forecast data for the ribbon metrics
  const {
    data: forecast,
    isLoading: forecastLoading,
  } = useExpenseForecast(months);

  // Compute predictive ribbon metrics
  const ribbonMetrics = useMemo(() => {
    if (!forecast?.success || !forecast?.dataQuality) {
      return {
        analyzed: "—",
        transactions: "—",
        categories: "—",
        reliability: "—",
        reliabilityLevel: "low",
      };
    }

    return {
      analyzed: forecast.dataQuality.monthsAnalyzed || "—",
      transactions: forecast.dataQuality.transactionsAnalyzed || "—",
      categories: forecast.dataQuality.categoriesTracked || "—",
      reliability: forecast.dataQuality.reliability || "—",
      reliabilityLevel:
        forecast.dataQuality.reliability === "High"
          ? "high"
          : forecast.dataQuality.reliability === "Medium"
            ? "medium"
            : "low",
    };
  }, [forecast]);

  const renderSolidProgressBar = (level) => {
    const width = level === "high" ? 84 : level === "medium" ? 56 : 28;
    const tone = level === "high" ? "bg-emerald-400" : level === "medium" ? "bg-yellow-400" : "bg-red-400";

    return (
      <div className="h-[6px] w-full overflow-hidden rounded-full bg-[#05070A]">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${width}%` }} />
      </div>
    );
  };

  const handleSectorToggle = (newTab) => {
    if (newTab === "forecast") {
      navigate("/forecast");
    } else if (newTab === "retirement") {
      navigate("/retirement");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in overflow-x-hidden">
      <SystemPageHeader
        tagline={activeTab === "retirement" ? "LONG_TERM_EQUITY_PROJECTION" : "SYSTEM_INSIGHTS"}
        title={activeTab === "retirement" ? "Retirement Planner" : "Forecast"}
        subtitle={activeTab === "retirement"
          ? "Long-term planning and contribution modeling aligned to the shared application shell."
          : "Forward-looking expense analysis with the same compact, Obsidian-based system language."}
        actions={(
          <>
            {activeTab === "forecast" && (
              <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-2">
                <TrendingUp className="h-4 w-4 text-slate-300" />
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">Window</label>
                <select
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="min-w-[96px] bg-transparent text-sm font-semibold text-white outline-none"
                >
                  <option value="1">1M</option>
                  <option value="3">3M</option>
                  <option value="6">6M</option>
                </select>
              </div>
            )}

            <div className="inline-flex rounded-full border border-white/5 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => handleSectorToggle("forecast")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "forecast"
                    ? "border border-white/10 bg-white/10 text-white"
                    : "border border-transparent bg-transparent text-[#9CA3AF] hover:border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                Forecast
              </button>
              <button
                type="button"
                onClick={() => handleSectorToggle("retirement")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "retirement"
                    ? "border border-white/10 bg-white/10 text-white"
                    : "border border-transparent bg-transparent text-[#9CA3AF] hover:border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                Retirement
              </button>
            </div>
          </>
        )}
      />

      {activeTab === "forecast" && (
        <div className="rounded-2xl border border-white/5 bg-[#0D1117] p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4 items-start">
            <div className="flex flex-col gap-1.5 rounded-2xl border border-white/5 bg-[#0D1117] p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-cyan-300/60">Analyzed</p>
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-semibold text-[#F9FAFB]">{ribbonMetrics.analyzed}</p>
                <p className="text-xs text-[#9CA3AF]">months</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 rounded-2xl border border-white/5 bg-[#0D1117] p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-cyan-300/60">Transactions</p>
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-semibold text-[#F9FAFB]">{ribbonMetrics.transactions}</p>
                <p className="text-xs text-[#9CA3AF]">total</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 rounded-2xl border border-white/5 bg-[#0D1117] p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-cyan-300/60">Categories</p>
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-semibold text-[#F9FAFB]">{ribbonMetrics.categories}</p>
                <p className="text-xs text-[#9CA3AF]">tracked</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 rounded-2xl border border-white/5 bg-[#0D1117] p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-cyan-300/60">Reliability</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">{renderSolidProgressBar(ribbonMetrics.reliabilityLevel === "high" ? 84 : ribbonMetrics.reliabilityLevel === "medium" ? 56 : 28)}</div>
                <p className="text-xs text-[#9CA3AF]">{ribbonMetrics.reliability}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Renderer */}
      {activeTab === "retirement" ? (
        <RetirementPlanner />
      ) : (
        <ExpenseForecast months={months} setMonths={setMonths} hubData={{ forecast, isLoading: forecastLoading }} />
      )}
    </div>
  );
}

export default ForecastPlanningHub;