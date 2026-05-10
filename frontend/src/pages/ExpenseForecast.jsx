import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useExpenseForecast } from '../hooks/useInsights';

const ExpenseForecast = ({ months, hubData }) => {
  const { formatCurrency } = useCurrency();
  const {
    data: forecast,
    isLoading: loading,
    error,
  } = useExpenseForecast(months);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="text-red-400" size={16} />;
      case 'decreasing': return <TrendingDown className="text-emerald-400" size={16} />;
      default: return <Minus className="text-cyan-400" size={16} />;
    }
  };

  const renderSolidProgressBar = (value, max = 10, accentClass = 'bg-cyan-400') => {
    const percentage = Math.max(0, Math.min(100, (Number(value) / max) * 100));
    return (
      <div className="h-[6px] w-full overflow-hidden rounded-full bg-[#05070A]">
        <div className={`h-full rounded-full ${accentClass}`} style={{ width: `${percentage}%` }} />
      </div>
    );
  };

  // Confidence to numeric scale (for LED bar)
  const confidenceToScore = (confidence) => {
    switch (confidence) {
      case 'High': return 9;
      case 'Medium': return 5;
      case 'Low': return 2;
      default: return 0;
    }
  };

  // Severity badge renderer
  const renderSeverityBadge = (priority) => {
    const config = {
      high: { bg: 'bg-red-500/20', border: 'border-red-400/50', text: 'text-red-300', label: 'HIGH' },
      medium: { bg: 'bg-yellow-500/20', border: 'border-yellow-400/50', text: 'text-yellow-300', label: 'MEDIUM' },
      low: { bg: 'bg-green-500/20', border: 'border-green-400/50', text: 'text-green-300', label: 'LOW' },
    };
    const style = config[priority] || config.low;
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${style.bg} ${style.border} border ${style.text}`}>
        {style.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-[#9CA3AF] text-sm">Generating forecast...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <AlertCircle className="text-red-400 mx-auto mb-3" size={48} />
          <h3 className="text-lg font-semibold text-red-300 mb-2">Unable to Generate Forecast</h3>
          <p className="text-red-400">{error?.message || 'Failed to generate forecast'}</p>
        </div>
      </div>
    );
  }

  if (!forecast?.success) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-8 text-center max-w-2xl mx-auto">
          <AlertCircle className="text-yellow-400 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-semibold text-yellow-300 mb-3">Insufficient Data</h3>
          <p className="text-yellow-400 mb-4">{forecast?.message || 'No expense data available'}</p>
          <p className="text-sm text-yellow-400/70">
            ADD_EXPENSE_TRANSACTIONS_FOR_PREDICTIONS
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Overall Expense Predictions - Diagnostic Terminal Card */}
      <div className="rounded-2xl border border-white/5 bg-[#0D1117] p-6 max-w-full">
        <div className="mb-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#9CA3AF]">Historical Average</p>
                <p className="mt-1 text-2xl font-semibold text-[#F9FAFB]">{formatCurrency(forecast.summary.historicalMonthlyAverage)}</p>
                <p className="mt-0.5 text-xs text-[#9CA3AF]">Per Month Baseline</p>
              </div>
              <div className="hidden sm:block text-sm text-[#9CA3AF]">Projected expense trend for the selected period.</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-right min-w-[160px]">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">Next</p>
                <p className="text-lg font-semibold text-cyan-300">{formatCurrency(forecast.summary.overallForecast?.[0]?.totalPredicted || 0)}</p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">Min</p>
                <p className="text-lg font-semibold text-emerald-300">{formatCurrency(forecast.summary.overallForecast?.[0]?.minEstimate || 0)}</p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">Max</p>
                <p className="text-lg font-semibold text-red-300">{formatCurrency(forecast.summary.overallForecast?.[0]?.maxEstimate || 0)}</p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">Confidence</p>
                <p className="text-lg font-semibold text-cyan-300">{forecast.summary.overallForecast?.[0]?.confidence || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Predictions Grid - High Density */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {forecast.summary.overallForecast.map((month, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/5 bg-[#05070A] p-4 transition-colors hover:border-cyan-400/30"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#F9FAFB]">{month.month}</h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  month.confidence === 'High' ? 'bg-emerald-500/20 text-emerald-300' :
                  month.confidence === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {month.confidence}
                </span>
              </div>

              <div className="mb-3">
                {renderSolidProgressBar(confidenceToScore(month.confidence), 10, month.confidence === 'High' ? 'bg-emerald-400' : month.confidence === 'Medium' ? 'bg-yellow-400' : 'bg-red-400')}
              </div>

              <p className="mb-3 text-xl font-semibold text-cyan-300">
                {formatCurrency(month.totalPredicted)}
              </p>

              <div className="space-y-1 border-t border-white/5 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9CA3AF]">Min</span>
                  <span className="text-emerald-300">{formatCurrency(month.minEstimate)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#9CA3AF]">Max</span>
                  <span className="text-red-300">{formatCurrency(month.maxEstimate)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forecast Insights - Surgical List */}
      {forecast.insights && forecast.insights.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-[#0D1117] p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
            Diagnostic Insights
          </h2>

          <div className="space-y-3">
            {forecast.insights.map((insight, index) => (
              <div key={index} className="relative pl-4">
                {/* Circuit-style connector line */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-white/5"></div>

                {/* Insight Card */}
                <div className="rounded-2xl border border-white/5 bg-[#0D1117] p-3 transition-colors hover:border-white/10">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-[#F9FAFB]">{insight.category}</p>
                    </div>
                    {renderSeverityBadge(insight.priority)}
                  </div>

                  <p className="mb-2 text-xs text-[#9CA3AF]">{insight.message}</p>
                  <p className="text-xs text-cyan-300/60">→ {insight.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category-wise Predictions - Diagnostic Terminal Grid */}
      <div className="rounded-2xl border border-white/5 bg-[#0D1117] p-6">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
          Category Predictions
        </h2>

        <div className="space-y-4">
          {forecast.categoryForecasts.map((cat, index) => (
            <div key={index} className="rounded-2xl border border-white/5 bg-[#0D1117] p-4 transition-colors hover:border-white/10">
              {/* Category Header with Trend */}
                <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-[#F9FAFB]">{cat.category}</h3>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(cat.historical.trend)}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      cat.historical.trend === 'increasing' ? 'bg-red-500/20 text-red-300' :
                      cat.historical.trend === 'decreasing' ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {cat.historical.trend.toUpperCase()} {String(cat.historical.percentChange || "").replace("%", "")}%
                    </span>
                  </div>
                </div>
                <span className="text-xs text-[#9CA3AF]">{cat.historical.trendConfidence} confidence</span>
              </div>

              {/* Metric Strip (Compact) */}
              <div className="mb-3 grid grid-cols-2 gap-2 border-b border-white/5 pb-3 md:grid-cols-4">
                <div className="rounded-xl border border-white/5 bg-[#0D1117] px-3 py-2">
                  <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-[#9CA3AF]">Historical</p>
                  <p className="text-lg font-semibold leading-none text-[#F9FAFB]">{formatCurrency(cat.historical.average)}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-[#0D1117] px-3 py-2">
                  <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-[#9CA3AF]">Month 1</p>
                  <p className="text-lg font-semibold leading-none text-cyan-300">{formatCurrency(cat.forecast[0]?.predicted || 0)}</p>
                </div>
                {cat.forecast[1] && (
                  <div className="rounded-xl border border-white/5 bg-[#0D1117] px-3 py-2">
                    <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-[#9CA3AF]">Month 2</p>
                    <p className="text-lg font-semibold leading-none text-cyan-300">{formatCurrency(cat.forecast[1].predicted)}</p>
                  </div>
                )}
                {cat.forecast[2] && (
                  <div className="rounded-xl border border-white/5 bg-[#0D1117] px-3 py-2">
                    <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-[#9CA3AF]">Month 3</p>
                    <p className="text-lg font-semibold leading-none text-cyan-300">{formatCurrency(cat.forecast[2].predicted)}</p>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <p className="mb-2 text-xs uppercase tracking-[0.16em] text-[#9CA3AF]">Trend Projection</p>
                <div className="grid gap-2">
                  {cat.forecast.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-12 text-xs text-[#9CA3AF]">M{f.month}</div>
                      <div className="flex-1">
                        {renderSolidProgressBar(
                          (f.predicted / Math.max(...cat.forecast.map(x => x.predicted || 0), 1)) * 10,
                          10,
                          idx === 0 ? 'bg-cyan-400' : idx === 1 ? 'bg-blue-400' : 'bg-violet-400'
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Insights Tags */}
              <div className="flex flex-wrap gap-2">
                {cat.insights.seasonalPattern && (
                  <span className="rounded border border-cyan-400/30 bg-cyan-500/20 px-2 py-1 text-xs text-cyan-300">
                    {cat.insights.seasonalPattern}
                  </span>
                )}
                {cat.insights.anomalies > 0 && (
                  <span className="rounded border border-yellow-400/30 bg-yellow-500/20 px-2 py-1 text-xs text-yellow-300">
                    ⚠️ {cat.insights.anomalies} anomalies
                  </span>
                )}
                {cat.insights.reliability && (
                  <span className="rounded border border-emerald-400/30 bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300">
                    {cat.insights.reliability} reliability
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseForecast;

