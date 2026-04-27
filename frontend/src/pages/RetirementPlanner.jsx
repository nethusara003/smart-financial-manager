import { useEffect, useState } from "react";
import RetirementForm from "../features/retirement/RetirementForm";
import RetirementResult from "../features/retirement/RetirementResult";
import AdvicePanel from "../features/retirement/AdvicePanel";
import {
  adviseRetirement,
  calculateRetirement,
  listRetirementPlans,
  refreshRetirementPlan,
  saveRetirementPlan,
  simulateRetirement,
} from "../services/retirementApi";

const formatDateTime = (value) => {
  if (!value) {
    return "Never refreshed";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Never refreshed";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatProbability = (value) => `${(Number(value || 0) * 100).toFixed(2)}%`;

const RetirementPlanner = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [refreshingPlanId, setRefreshingPlanId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [deterministic, setDeterministic] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [predictionMeta, setPredictionMeta] = useState(null);
  const [resolvedInput, setResolvedInput] = useState(null);
  const [latestPayload, setLatestPayload] = useState(null);
  const [savedPlans, setSavedPlans] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);

  const applyPlanToPreview = (plan) => {
    if (!plan) {
      return;
    }

    setDeterministic(plan.deterministic || null);
    setSimulation(plan.simulation || null);
    setAdvice(plan.advice || null);
    setPredictionMeta(plan.predictions || null);
    setResolvedInput(plan.computedInput || plan.sourceInput || null);
    setLatestPayload(plan.sourceInput || null);
    setActivePlanId(plan.id || null);
  };

  const loadSavedPlans = async () => {
    setIsLoadingPlans(true);

    try {
      const response = await listRetirementPlans();
      setSavedPlans(response?.plans || []);
    } catch (error) {
      setErrorMessage(error?.message || "Failed to load saved retirement plans");
    } finally {
      setIsLoadingPlans(false);
    }
  };

  useEffect(() => {
    void loadSavedPlans();
  }, []);

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const calculateResponse = await calculateRetirement(payload);
      const simulateResponse = await simulateRetirement(payload);
      const adviseResponse = await adviseRetirement({
        ...payload,
        deterministic: simulateResponse?.deterministic,
        simulation: simulateResponse?.simulation,
        predictions: simulateResponse?.predictions,
      });

      setDeterministic(simulateResponse?.deterministic || calculateResponse?.deterministic || null);
      setSimulation(simulateResponse?.simulation || null);
      setAdvice(adviseResponse?.advice || null);
      setPredictionMeta(calculateResponse?.predictions || simulateResponse?.predictions || null);
      setResolvedInput(simulateResponse?.input || calculateResponse?.input || null);
      setLatestPayload(payload);
      setActivePlanId(null);
    } catch (error) {
      setErrorMessage(error?.message || "Failed to run retirement planning workflow");
      setDeterministic(null);
      setSimulation(null);
      setAdvice(null);
      setPredictionMeta(null);
      setResolvedInput(null);
      setLatestPayload(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePlan = async () => {
    if (!latestPayload) {
      setErrorMessage("Generate a plan before saving it.");
      return;
    }

    if (activePlanId) {
      setErrorMessage("This plan is already saved. Use Refresh to update it.");
      return;
    }

    setIsSavingPlan(true);
    setErrorMessage("");

    try {
      const response = await saveRetirementPlan(latestPayload);
      const savedPlan = response?.plan || null;

      if (savedPlan) {
        setSavedPlans((previous) => {
          const remaining = previous.filter((plan) => plan.id !== savedPlan.id);
          return [savedPlan, ...remaining];
        });
        applyPlanToPreview(savedPlan);
        setActivePlanId(savedPlan.id);
      }
    } catch (error) {
      setErrorMessage(error?.message || "Failed to save retirement plan");
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleRefreshPlan = async (planId) => {
    setRefreshingPlanId(planId);
    setErrorMessage("");

    try {
      const response = await refreshRetirementPlan(planId);
      const refreshedPlan = response?.plan || null;

      if (refreshedPlan) {
        setSavedPlans((previous) =>
          previous.map((plan) => (plan.id === refreshedPlan.id ? refreshedPlan : plan))
        );

        if (activePlanId === refreshedPlan.id) {
          applyPlanToPreview(refreshedPlan);
        }
      }
    } catch (error) {
      setErrorMessage(error?.message || "Failed to refresh retirement plan");
    } finally {
      setRefreshingPlanId(null);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-1 md:p-2">
      <section className="rounded-2xl border border-gray-200 bg-gradient-to-r from-cyan-50 via-white to-blue-50 p-5 shadow-sm dark:border-dark-border-default dark:from-cyan-900/20 dark:via-dark-surface-secondary dark:to-blue-900/20">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary md:text-3xl">
          AI-Powered Retirement Planning
        </h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-dark-text-secondary md:text-base">
          Deterministic forecasts, Monte Carlo simulation, and AI guidance combined into one planning workflow.
        </p>
      </section>

      <RetirementForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-dark-border-default dark:bg-dark-surface-secondary">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary">Saved retirement plans</p>
          <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
            {savedPlans.length === 0
              ? "No saved plan yet. Save the current plan after generating it."
              : `${savedPlans.length} saved plan${savedPlans.length === 1 ? "" : "s"} available.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadSavedPlans()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-border-strong dark:text-dark-text-primary dark:hover:bg-dark-surface-elevated"
            disabled={isLoadingPlans}
          >
            {isLoadingPlans ? "Loading plans..." : "Refresh saved plans"}
          </button>
          <button
            type="button"
            onClick={handleSavePlan}
            disabled={!latestPayload || isSavingPlan || isSubmitting || Boolean(activePlanId)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingPlan ? "Saving plan..." : "Save current plan"}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {resolvedInput && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800 dark:bg-emerald-950/20">
          <h3 className="mb-2 text-base font-semibold">System-derived financial profile</h3>
          <p>
            Current Savings: {formatCurrency(resolvedInput.currentSavings)}
          </p>
          <p>
            Monthly Savings: {formatCurrency(resolvedInput.monthlySavings)}
          </p>
          <p>Profile Source: {resolvedInput.profileSource || "system-derived"}</p>
          {activePlanId && (
            <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Last refreshed on {formatDateTime(savedPlans.find((plan) => plan.id === activePlanId)?.lastRefreshedAt)}
            </p>
          )}
        </section>
      )}

      <RetirementResult deterministic={deterministic} simulation={simulation} planInput={resolvedInput} />
      <AdvicePanel advice={advice} />

      {predictionMeta && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-dark-border-default dark:bg-dark-surface-secondary">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
            Prediction Source
          </h3>
          <p className="text-sm text-gray-700 dark:text-dark-text-secondary">
            Source: {predictionMeta.source || "unknown"}
            {predictionMeta.fallbackUsed ? " (fallback enabled)" : ""}
          </p>
          {predictionMeta.mlMeta && (
            <p className="mt-1 text-xs text-gray-600">
              ML latency: {predictionMeta.mlMeta.latencyMs || "n/a"} ms
            </p>
          )}
          {predictionMeta.fallbackReason && (
            <p className="mt-1 text-xs text-amber-700">Fallback reason: {predictionMeta.fallbackReason}</p>
          )}
        </section>
      )}

      {savedPlans.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-dark-border-default dark:bg-dark-surface-secondary">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">Saved plans</h3>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                Open any saved plan, or refresh it after new transactions have been added.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {savedPlans.map((plan) => {
              const isActive = activePlanId === plan.id;
              const planCurrentSavings = plan.computedInput?.currentSavings ?? 0;
              const planMonthlySavings = plan.computedInput?.monthlySavings ?? 0;

              return (
                <div
                  key={plan.id}
                  className={`rounded-xl border p-4 transition ${
                    isActive
                      ? "border-blue-300 bg-blue-50/70 dark:border-blue-700 dark:bg-blue-950/20"
                      : "border-gray-200 bg-gray-50 dark:border-dark-border-default dark:bg-dark-surface-primary"
                  }`}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-dark-text-primary">
                          {plan.name || "Retirement Plan"}
                        </h4>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm dark:bg-dark-surface-elevated dark:text-dark-text-secondary">
                          Last refreshed {formatDateTime(plan.lastRefreshedAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-dark-text-secondary">
                        Current savings: {formatCurrency(planCurrentSavings)} | Monthly savings: {formatCurrency(planMonthlySavings)} | Probability of success: {formatProbability(plan.probability)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => applyPlanToPreview(plan)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-white dark:border-dark-border-strong dark:text-dark-text-primary dark:hover:bg-dark-surface-elevated"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleRefreshPlan(plan.id)}
                        disabled={refreshingPlanId === plan.id}
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {refreshingPlanId === plan.id ? "Refreshing..." : "Refresh"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default RetirementPlanner;
