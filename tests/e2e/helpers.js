import { expect } from "@playwright/test";

export function buildUserSeed() {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  return {
    name: `E2E User ${stamp}`,
    email: `e2e.${stamp}@example.com`,
    password: "Passw0rd!",
  };
}

export async function registerUser(page, user) {
  await page.goto("/register");

  await page.getByTestId("register-name-input").fill(user.name);
  await page.getByTestId("register-email-input").fill(user.email);
  await page.getByTestId("register-password-input").fill(user.password);
  await page.getByTestId("register-confirm-password-input").fill(user.password);

  await page.getByTestId("register-submit-button").click();

  await expect(page.getByText("Account created successfully! Redirecting to login...")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
}

export async function loginUser(page, user) {
  await page.goto("/login");

  await page.getByTestId("login-email-input").fill(user.email);
  await page.getByTestId("login-password-input").fill(user.password);
  await page.getByTestId("login-submit-button").click();

  await expect(page).toHaveURL(/\/dashboard$/);
}

export async function registerAndLogin(page) {
  const user = buildUserSeed();
  await registerUser(page, user);
  await loginUser(page, user);
  return user;
}
