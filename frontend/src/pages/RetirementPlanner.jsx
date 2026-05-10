import { useEffect, useState } from "react";
import RetirementForm from "../features/retirement/RetirementForm";
import RetirementResult from "../features/retirement/RetirementResult";
import AdvicePanel from "../features/retirement/AdvicePanel";
import SystemPageHeader from "../components/layout/SystemPageHeader";
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
    <div className="space-y-6 animate-fade-in">

      <RetirementForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-light-border-default dark:border-white/5 bg-light-surface-secondary dark:bg-[#0D1117] p-4">
        <div>
          <p className="text-sm font-semibold text-light-text-primary dark:text-[#F9FAFB]">Saved retirement plans</p>
          <p className="text-sm text-light-text-secondary dark:text-[#9CA3AF]">
            {savedPlans.length === 0
              ? "No saved plan yet. Save the current plan after generating it."
              : `${savedPlans.length} saved plan${savedPlans.length === 1 ? "" : "s"} available.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadSavedPlans()}
            className="rounded-lg border border-light-border-default dark:border-white/5 bg-light-surface-primary dark:bg-white/5 px-4 py-2 text-sm font-semibold text-light-text-primary dark:text-[#F9FAFB] transition-colors hover:bg-light-bg-accent dark:hover:border-blue-500/30 dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoadingPlans}
          >
            {isLoadingPlans ? "Loading plans..." : "Refresh saved plans"}
          </button>
          <button
            type="button"
            onClick={handleSavePlan}
            disabled={!latestPayload || isSavingPlan || isSubmitting || Boolean(activePlanId)}
            className="rounded-lg border border-blue-500/30 bg-blue-50 dark:bg-white/10 px-4 py-2 text-sm font-semibold text-blue-700 dark:text-[#F9FAFB] transition-colors hover:bg-blue-100 dark:hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingPlan ? "Saving plan..." : "Save current plan"}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      {resolvedInput && (
        <section className="rounded-2xl border border-light-border-default dark:border-white/5 bg-light-surface-secondary dark:bg-[#0D1117] p-5 text-sm text-light-text-secondary dark:text-[#9CA3AF]">
          <h3 className="mb-2 text-base font-semibold text-light-text-primary dark:text-[#F9FAFB]">System-derived financial profile</h3>
          <p>
            Current Savings: <span>{formatCurrency(resolvedInput.currentSavings)}</span>
          </p>
          <p>
            Monthly Savings: <span>{formatCurrency(resolvedInput.monthlySavings)}</span>
          </p>
          <p>Profile Source: {resolvedInput.profileSource || "system-derived"}</p>
          {activePlanId && (
            <p className="mt-2 text-xs font-medium text-emerald-300">
              Last refreshed on {formatDateTime(savedPlans.find((plan) => plan.id === activePlanId)?.lastRefreshedAt)}
            </p>
          )}
        </section>
      )}

      <RetirementResult deterministic={deterministic} simulation={simulation} planInput={resolvedInput} />
      <AdvicePanel advice={advice} />

      {predictionMeta && (
        <section className="rounded-2xl border border-light-border-default dark:border-white/5 bg-light-surface-secondary dark:bg-[#0D1117] p-5">
          <h3 className="mb-2 text-lg font-semibold text-light-text-primary dark:text-[#F9FAFB]">
            Prediction Source
          </h3>
          <p className="text-sm text-light-text-secondary dark:text-[#9CA3AF]">
            Source: {predictionMeta.source || "unknown"}
            {predictionMeta.fallbackUsed ? " (fallback enabled)" : ""}
          </p>
          {predictionMeta.mlMeta && (
            <p className="mt-1 text-xs text-light-text-secondary dark:text-[#9CA3AF]">
              ML latency: {predictionMeta.mlMeta.latencyMs || "n/a"} ms
            </p>
          )}
          {predictionMeta.fallbackReason && (
            <p className="mt-1 text-xs text-amber-300">Fallback reason: {predictionMeta.fallbackReason}</p>
          )}
        </section>
      )}

      {savedPlans.length > 0 && (
        <section className="rounded-2xl border border-light-border-default dark:border-white/5 bg-light-surface-secondary dark:bg-[#0D1117] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-light-text-primary dark:text-[#F9FAFB]">Saved plans</h3>
              <p className="text-sm text-light-text-secondary dark:text-[#9CA3AF]">
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
                      ? "border-blue-500/30 bg-blue-50 dark:bg-white/5"
                      : "border-light-border-default dark:border-white/5 bg-light-surface-primary dark:bg-[#05070A]"
                  }`}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-semibold text-light-text-primary dark:text-[#F9FAFB]">
                          {plan.name || "Retirement Plan"}
                        </h4>
                        <span className="rounded-full border border-light-border-default dark:border-white/5 bg-light-surface-secondary dark:bg-[#0D1117] px-3 py-1 text-xs font-semibold text-light-text-secondary dark:text-[#9CA3AF]">
                          Last refreshed {formatDateTime(plan.lastRefreshedAt)}
                        </span>
                      </div>
                        <p className="mt-1 text-sm text-light-text-secondary dark:text-[#9CA3AF]">
                        Current savings: <span>{formatCurrency(planCurrentSavings)}</span> | Monthly savings: <span>{formatCurrency(planMonthlySavings)}</span> | Probability of success: <span>{formatProbability(plan.probability)}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => applyPlanToPreview(plan)}
                        className="rounded-lg border border-light-border-default dark:border-white/5 bg-light-surface-primary dark:bg-white/5 px-3 py-2 text-sm font-semibold text-light-text-primary dark:text-[#F9FAFB] transition-colors hover:bg-light-bg-accent dark:hover:border-blue-500/30 dark:hover:bg-white/10"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleRefreshPlan(plan.id)}
                        disabled={refreshingPlanId === plan.id}
                        className="rounded-lg border border-emerald-500/30 bg-emerald-50 dark:bg-white/10 px-3 py-2 text-sm font-semibold text-emerald-700 dark:text-[#F9FAFB] transition-colors hover:bg-emerald-100 dark:hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
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
