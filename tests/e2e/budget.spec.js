import { test, expect } from "@playwright/test";
import { registerAndLogin } from "./helpers";

test.describe("Budget flow", () => {
  test("creates budget settings, overspends, and shows warning or crisis", async ({ page }) => {
    await registerAndLogin(page);

    // Step 1: Configure a small budget so overspending can be triggered quickly.
    await page.goto("/budgets");
    await page.getByTestId("budget-monthly-salary-input").fill("1000");
    await page.getByTestId("budget-savings-percentage-input").fill("10");
    await page.getByTestId("budget-period-days-input").fill("30");
    await page.getByTestId("budget-save-settings-button").click();

    // Step 2: Add a high expense transaction that exceeds usable budget.
    await page.goto("/transactions");
    await page.getByTestId("open-add-transaction-button").click();
    await page.getByTestId("transaction-type-select").selectOption("expense");
    await page.getByTestId("transaction-category-select").selectOption("Food");
    await page.getByTestId("transaction-amount-input").fill("5000");
    await page.getByTestId("transaction-note-input").fill(`Budget Overspend ${Date.now()}`);
    await page.getByTestId("transaction-submit-button").click();

    // Step 3: Refresh budget status and verify a warning/crisis indicator appears.
    await page.goto("/budgets");
    const refreshButton = page.getByTestId("budget-refresh-status-button");

    if (!(await refreshButton.isVisible().catch(() => false))) {
      await page.getByTestId("budget-save-settings-button").click();
    }

    if (await refreshButton.isVisible().catch(() => false)) {
      await refreshButton.click();
    }

    await expect(
      page.getByText(/Overspending Detected|Crisis Mode Active|Warning Recommendations|Crisis Actions|WARNING|CRISIS/i)
    ).toBeVisible();
  });

  test("shows validation for invalid budget period", async ({ page }) => {
    await registerAndLogin(page);

    // Step 1: Open budget form and enter invalid period days (> 365).
    await page.goto("/budgets");
    await page.getByTestId("budget-monthly-salary-input").fill("2500");
    await page.getByTestId("budget-savings-percentage-input").fill("20");
    await page.getByTestId("budget-period-days-input").fill("500");

    // Step 2: Submit and verify user-facing validation feedback.
    await page.getByTestId("budget-save-settings-button").click();
    await expect(page.getByText("Budget period must be an integer between 1 and 365 days")).toBeVisible();
  });
});
