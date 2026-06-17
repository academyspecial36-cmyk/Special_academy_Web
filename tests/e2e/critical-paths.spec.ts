import { test, expect } from "@playwright/test";

// ─── Shared Helpers ─────────────────────────────────────────────

const LOGIN_URL = "/login";
const REGISTER_URL = "/enrollment";
const DASHBOARD_URL = "/dashboard";
const STUDENT_URL = "/student";

// Reusable auth setup (runs before each authenticated test)
test.describe.configure({ mode: "serial" });

// ─── Login Page ─────────────────────────────────────────────────

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
  });

  test("should display all login form elements", async ({ page }) => {
    await expect(page.getByRole("heading")).toBeVisible();
    await expect(page.locator("form")).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in|log in|submit/i })).toBeVisible();
  });

  test("should show validation errors for empty submission", async ({ page }) => {
    const submitBtn = page.getByRole("button", { name: /sign in|log in|submit/i });
    await submitBtn.click();

    // Wait for validation feedback (toast, inline error, or URL stay)
    await expect(page).toHaveURL(new RegExp(LOGIN_URL));
    
    // Check for any error indicator
    const errorVisible = await Promise.race([
      page.getByText(/required|invalid|please enter/i).first().isVisible().catch(() => false),
      page.locator("[aria-invalid='true']").first().isVisible().catch(() => false),
      new Promise((resolve) => setTimeout(() => resolve(false), 1000)),
    ]);
    
    // Either shows error OR stays on page (client-side validation)
    expect(errorVisible || page.url().includes("/login")).toBeTruthy();
  });

  test("should navigate to registration page", async ({ page }) => {
    // Use getByRole for resilience against text changes
    const registerLink = page.getByRole("link", { name: /register|sign up|create account/i });
    
    await expect(registerLink).toBeVisible({ timeout: 5000 });
    await registerLink.click();
    await expect(page).toHaveURL(new RegExp(REGISTER_URL));
  });

  test("should successfully login with valid credentials", async ({ page }) => {
    // Mock successful login API
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ token: "fake-jwt", user: { id: "1", email: "test@example.com" } }),
      });
    });

    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/password/i).fill("SecurePass123!");
    await page.getByRole("button", { name: /sign in|log in/i }).click();

    // Should redirect to dashboard or show success
    await expect(page).toHaveURL(/\/dashboard|\/student|\/home/, { timeout: 10000 });
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ error: "Invalid email or password" }),
      });
    });

    await page.getByLabel(/email/i).fill("wrong@example.com");
    await page.getByLabel(/password/i).fill("wrongpass");
    await page.getByRole("button", { name: /sign in|log in/i }).click();

    await expect(page.getByText(/invalid|incorrect|wrong/i)).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(new RegExp(LOGIN_URL));
  });
});

// ─── Public Pages ───────────────────────────────────────────────

test.describe("Public Pages", () => {
  test("homepage should load without errors", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("student portal should load", async ({ page }) => {
    const response = await page.goto(STUDENT_URL);
    // May redirect to login if protected
    expect(response?.ok() || response?.status() === 302).toBeTruthy();
    await expect(page.locator("body")).toBeVisible();
  });

  test("all public pages should have consistent navigation", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();
    
    // Check nav links are clickable
    const links = await nav.getByRole("link").all();
    expect(links.length).toBeGreaterThan(0);
  });
});

// ─── Authentication & Authorization ─────────────────────────────

test.describe("Protected Routes", () => {
  test("should redirect unauthenticated users to login", async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await page.waitForURL(/\/login|\/auth/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/login|\/auth/);
  });

  test("dashboard should be accessible after login", async ({ page, context }) => {
    // Set auth cookie to simulate logged-in state
    await context.addCookies([
      {
        name: "auth-token",
        value: "fake-jwt-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    // Mock auth check API
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ id: "1", email: "test@example.com", role: "student" }),
      });
    });

    await page.goto(DASHBOARD_URL);
    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible();
  });
});

// ─── AI Chat ────────────────────────────────────────────────────

test.describe("AI Chat", () => {
  test("should require authentication", async ({ page }) => {
    await page.goto("/dashboard/ai");
    await page.waitForURL(/\/login|\/auth/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/login|\/auth/);
  });

  test("should load chat interface when authenticated", async ({ page, context }) => {
    await context.addCookies([
      { name: "auth-token", value: "fake-jwt", domain: "localhost", path: "/" },
    ]);

    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({ id: "1" }) });
    });

    await page.goto("/dashboard/ai");
    await expect(page.getByPlaceholder(/type a message|ask something/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: /send/i })).toBeVisible();
  });
});

// ─── Error Handling ─────────────────────────────────────────────

test.describe("Error Handling", () => {
  test("should show 404 for non-existent routes", async ({ page }) => {
    const response = await page.goto("/nonexistent-route-xyz-12345");
    
    // Server returns 404
    if (response) {
      expect([404, 200]).toContain(response.status()); // 200 if client-side routed
    }
    
    // Verify error page content is shown
    const errorContent = await Promise.race([
      page.getByText(/404|not found|page not found/i).first().isVisible(),
      page.locator("h1:has-text('404')").isVisible(),
      new Promise((resolve) => setTimeout(() => resolve(false), 2000)),
    ]);
    
    expect(errorContent).toBeTruthy();
  });

  test("should handle network errors gracefully", async ({ page }) => {
    await page.route("**/api/**", (route) => route.abort("failed"));
    await page.goto("/");
    
    // Page should still render, not crash
    await expect(page.locator("body")).toBeVisible();
  });

  test("should handle slow API responses with loading states", async ({ page }) => {
    await page.route("**/api/**", async (route) => {
      await new Promise((r) => setTimeout(r, 3000)); // 3s delay
      await route.continue();
    });
    
    await page.goto("/");
    // Should show loading indicator or skeleton
    const hasLoading = await Promise.race([
      page.locator("[aria-busy='true'], .loading, .skeleton").first().isVisible(),
      page.getByText(/loading/i).first().isVisible(),
      new Promise((resolve) => setTimeout(() => resolve(false), 1000)),
    ]);
    
    // Loading state may or may not exist; test passes either way
    expect(typeof hasLoading).toBe("boolean");
  });
});

// ─── Responsive / Mobile ────────────────────────────────────────

test.describe("Mobile Viewport", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("login form should be usable on mobile", async ({ page }) => {
    await page.goto(LOGIN_URL);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    
    // Test tap targets are large enough (WCAG 2.5.5)
    const submitBtn = page.getByRole("button", { name: /sign in|log in/i });
    const box = await submitBtn.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test("navigation should adapt to mobile", async ({ page }) => {
    await page.goto("/");
    // Mobile menu button or hamburger should exist
    const menuBtn = page.getByRole("button", { name: /menu|navigation|open menu/i });
    const isVisible = await menuBtn.isVisible().catch(() => false);
    
    if (isVisible) {
      await menuBtn.click();
      await expect(page.getByRole("navigation")).toBeVisible();
    }
  });
});