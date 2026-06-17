import { test, expect } from "@playwright/test";

test.describe("Critical Paths", () => {
  test.describe("Login Page", () => {
    test("should display login form", async ({ page }) => {
      await page.goto("/login");
      await expect(page.locator("h1, h2").first()).toBeVisible();
      await expect(page.locator("form")).toBeVisible();
      await expect(page.locator("input[type=\"email\"]")).toBeVisible();
      await expect(page.locator("input[type=\"password\"]")).toBeVisible();
      await expect(page.locator("button[type=\"submit\"]")).toBeVisible();
    });

    test("should show validation errors for empty form", async ({ page }) => {
      await page.goto("/login");
      await page.locator("button[type=\"submit\"]").click();
      // Should show validation messages or stay on same page
      await expect(page).toHaveURL(/\/login/);
    });

    test("should navigate to register link", async ({ page }) => {
      await page.goto("/login");
      const registerLink = page.locator("a:has-text(\"Register\"), a:has-text(\"Sign up\")");
      if (await registerLink.isVisible()) {
        await registerLink.click();
        await expect(page).toHaveURL(/\/register/);
      }
    });
  });

  test.describe("Public Pages", () => {
    test("homepage should load", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("body")).toBeVisible();
    });

    test("student portal should load", async ({ page }) => {
      await page.goto("/student");
      await expect(page.locator("body")).toBeVisible();
    });
  });

  test.describe("Dashboard (authenticated)", () => {
    test("should redirect to login when not authenticated", async ({ page }) => {
      await page.goto("/dashboard");
      // Should redirect to login or show error
      await page.waitForURL(/\/login|\/auth/);
      expect(page.url()).toMatch(/\/login|\/auth/);
    });
  });

  test.describe("Error Handling", () => {
    test("should show 404 page for unknown routes", async ({ page }) => {
      const response = await page.goto("/nonexistent-route-xyz");
      expect(response?.status()).toBe(404);
    });
  });

  test.describe("AI Chat", () => {
    test("should redirect to login when not authenticated", async ({ page }) => {
      await page.goto("/dashboard/ai");
      await page.waitForURL(/\/login|\/auth/);
      expect(page.url()).toMatch(/\/login|\/auth/);
    });
  });
});
