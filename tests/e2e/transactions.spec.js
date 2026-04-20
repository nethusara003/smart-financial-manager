import { test, expect } from "@playwright/test";
import { registerAndLogin } from "./helpers";

test.describe("Transactions flow", () => {
  test("adds, edits, and deletes a transaction with UI updates", async ({ page }) => {
    await registerAndLogin(page);

    const firstNote = `Playwright Tx ${Date.now()}`;
    const updatedNote = `${firstNote} Updated`;

    // Step 1: Open transactions page and start Add Transaction flow.
    await page.goto("/transactions");
    await page.getByTestId("open-add-transaction-button").click();

    // Step 2: Create an expense transaction using the modal form.
    await page.getByTestId("transaction-type-select").selectOption("expense");
    await page.getByTestId("transaction-category-select").selectOption("Food");
    await page.getByTestId("transaction-amount-input").fill("1200");
    await page.getByTestId("transaction-note-input").fill(firstNote);
    await page.getByTestId("transaction-submit-button").click();

    // Step 3: Verify new transaction appears in the table.
    const createdRow = page.locator("tbody tr", { hasText: firstNote });
    await expect(createdRow).toBeVisible();

    // Step 4: Edit the same transaction through row actions.
    await createdRow.hover();
    await createdRow.getByRole("button", { name: "Open actions menu" }).click();
    await page.getByRole("button", { name: "Edit Transaction" }).click();

    await page.getByTestId("transaction-amount-input").fill("1500");
    await page.getByTestId("transaction-note-input").fill(updatedNote);
    await page.getByTestId("transaction-submit-button").click();

    // Step 5: Verify edited values are rendered.
    const updatedRow = page.locator("tbody tr", { hasText: updatedNote });
    await expect(updatedRow).toBeVisible();
    await expect(updatedRow).toContainText(/1,?500(?:\.00)?/);

    // Step 6: Delete the edited transaction.
    await updatedRow.hover();
    await updatedRow.getByRole("button", { name: "Open actions menu" }).click();
    await page.getByRole("button", { name: "Delete Transaction" }).click();
    await page.getByRole("button", { name: /^Delete$/ }).click();

    // Step 7: Verify row is removed from the table.
    await expect(page.locator("tbody tr", { hasText: updatedNote })).toHaveCount(0);
  });

  test("prevents submitting empty transaction form", async ({ page }) => {
    await registerAndLogin(page);

    // Step 1: Open transaction modal.
    await page.goto("/transactions");
    await page.getByTestId("open-add-transaction-button").click();

    // Step 2: Do not select a category and try to submit.
    await page.getByTestId("transaction-amount-input").fill("100");
    await page.getByTestId("transaction-submit-button").click();

    // Step 3: Verify submit is blocked by required field and modal remains open.
    await expect(page.getByRole("heading", { name: "Add Transaction" })).toBeVisible();
    await expect(page.getByTestId("transaction-category-select")).toHaveValue("");
  });
});
