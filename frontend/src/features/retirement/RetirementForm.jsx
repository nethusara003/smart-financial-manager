import { useMemo, useState } from "react";

const DEFAULT_FORM_STATE = {
  age: "30",
  dob: "",
  retirementAge: "60",
  years: "",
  targetAmount: "500000",
  returnRate: "",
  inflationRate: "3",
  salaryGrowthRate: "4",
  applyGrowthAdjustments: false,
};

const toNumberOrUndefined = (value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const calculateAgeFromDob = (dobValue) => {
  if (!dobValue) {
    return "";
  }

  const dob = new Date(dobValue);
  if (Number.isNaN(dob.getTime())) {
    return "";
  }

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDifference = today.getMonth() - dob.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age >= 0 ? String(age) : "";
};

const inputBaseClass =
  "w-full rounded-lg border border-gray-300 dark:border-dark-border-strong bg-white dark:bg-dark-surface-secondary px-3 py-2 text-sm text-gray-800 dark:text-dark-text-primary focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

const RetirementForm = ({ onSubmit, isSubmitting = false }) => {
  const [formValues, setFormValues] = useState(DEFAULT_FORM_STATE);
  const [validationMessage, setValidationMessage] = useState("");
  const [showAdvancedAssumptions, setShowAdvancedAssumptions] = useState(false);

  const yearsPreview = useMemo(() => {
    const age = Number(formValues.age);
    const retirementAge = Number(formValues.retirementAge);

    if (Number.isFinite(age) && Number.isFinite(retirementAge) && retirementAge > age) {
      return retirementAge - age;
    }

    return null;
  }, [formValues.age, formValues.retirementAge]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name === "dob") {
      const calculatedAge = calculateAgeFromDob(value);
      setFormValues((previous) => ({
        ...previous,
        dob: value,
        age: calculatedAge,
      }));
      return;
    }

    setFormValues((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidationMessage("");

    const age = toNumberOrUndefined(formValues.age);
    const retirementAge = toNumberOrUndefined(formValues.retirementAge);

    if (age !== undefined && retirementAge !== undefined && retirementAge <= age) {
      setValidationMessage("Retirement age must be greater than current age.");
      return;
    }

    const payload = {
      age,
      dob: formValues.dob || undefined,
      retirementAge,
      years: toNumberOrUndefined(formValues.years),
      targetAmount: toNumberOrUndefined(formValues.targetAmount) || 0,
      returnRate: toNumberOrUndefined(formValues.returnRate),
      applyGrowthAdjustments: formValues.applyGrowthAdjustments,
      inflationRate: formValues.applyGrowthAdjustments
        ? toNumberOrUndefined(formValues.inflationRate)
        : undefined,
      salaryGrowthRate: formValues.applyGrowthAdjustments
        ? toNumberOrUndefined(formValues.salaryGrowthRate)
        : undefined,
    };

    await onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 dark:border-dark-border-default bg-white dark:bg-dark-surface-secondary p-5 shadow-sm"
    >
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">Retirement Inputs</h2>
          <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
            Enter minimum planning details. Current savings and monthly savings are auto-derived from your data.
          </p>
        </div>
        {yearsPreview !== null && (
          <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
            Planning Horizon: {yearsPreview} years
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
          Date of Birth
          <input
            type="date"
            name="dob"
            value={formValues.dob}
            onChange={handleChange}
            className={inputBaseClass}
          />
        </label>

        <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
          Current Age
          <input
            type="number"
            min="1"
            max="100"
            name="age"
            value={formValues.age}
            onChange={handleChange}
            className={inputBaseClass}
          />
        </label>

        <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
          Retirement Age
          <input
            type="number"
            min="30"
            max="100"
            name="retirementAge"
            value={formValues.retirementAge}
            onChange={handleChange}
            className={inputBaseClass}
            required
          />
        </label>

        <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
          Years (optional override)
          <input
            type="number"
            min="1"
            max="70"
            name="years"
            value={formValues.years}
            onChange={handleChange}
            className={inputBaseClass}
            placeholder="Auto-calculated if empty"
          />
        </label>

        <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
          Target Amount
          <input
            type="number"
            step="0.01"
            min="0"
            name="targetAmount"
            value={formValues.targetAmount}
            onChange={handleChange}
            className={inputBaseClass}
            required
          />
        </label>
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-dark-border-strong dark:bg-dark-surface-elevated">
        <button
          type="button"
          onClick={() => setShowAdvancedAssumptions((previous) => !previous)}
          className="text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          {showAdvancedAssumptions ? "Hide" : "Show"} advanced assumptions
        </button>

        {showAdvancedAssumptions && (
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
              Annual Return Rate (%)
              <input
                type="number"
                step="0.01"
                name="returnRate"
                value={formValues.returnRate}
                onChange={handleChange}
                className={inputBaseClass}
                placeholder="Defaults to system value"
              />
            </label>

            <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary md:col-span-3 flex items-center gap-2">
              <input
                type="checkbox"
                name="applyGrowthAdjustments"
                checked={formValues.applyGrowthAdjustments}
                onChange={handleChange}
                className="h-4 w-4"
              />
              Apply additional inflation and salary growth adjustments on top of ML prediction
            </label>

            {formValues.applyGrowthAdjustments && (
              <>
                <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                  Inflation Rate (%)
                  <input
                    type="number"
                    step="0.01"
                    name="inflationRate"
                    value={formValues.inflationRate}
                    onChange={handleChange}
                    className={inputBaseClass}
                  />
                </label>

                <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                  Salary Growth Rate (%)
                  <input
                    type="number"
                    step="0.01"
                    name="salaryGrowthRate"
                    value={formValues.salaryGrowthRate}
                    onChange={handleChange}
                    className={inputBaseClass}
                  />
                </label>
              </>
            )}
          </div>
        )}
      </div>

      {validationMessage && (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {validationMessage}
        </p>
      )}

      <div className="mt-5 flex items-center justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Running Projection..." : "Run Retirement Plan"}
        </button>
      </div>
    </form>
  );
};

export default RetirementForm;
