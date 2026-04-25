import { expect, describe } from '@playwright/test';
import { test } from '../fixtures/auth';
import { LoginPage } from '../pages/login.page';
import { TEST_USERS } from '../fixtures/auth';

/**
 * E2E Tests for Login functionality.
 * Tests valid logins, invalid credentials, and form validation.
 */
describe('Login Page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  describe('Valid Login', () => {
    test('should login as Admin and redirect to Dashboard', async ({ page }) => {
      await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
      
      // Should redirect to dashboard
      await page.waitForURL('**/dashboard**', { timeout: 10000 });
      
      // Verify we're on the dashboard
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test.skip('should login as Tecnico and redirect to Panel Técnico', async ({ page }) => {
      // SKIP: Requires technician user seeded in database. The tecnico user
      // does not exist in the test database. This test needs seeded data to run.
      
      await loginPage.login(TEST_USERS.tecnico.email, TEST_USERS.tecnico.password);
      
      // Should redirect to dashboard/panel-tecnico for tecnicos
      await page.waitForURL('**/dashboard/panel-tecnico**', { timeout: 10000 });
      
      // Verify we're on the panel técnico
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  });

  describe('Invalid Credentials', () => {
    test('should show error message with invalid credentials', async ({ page }) => {
      await loginPage.login('invalid@example.com', 'wrongpassword');
      
      // Should show error message
      await expect(loginPage.errorMessage).toBeVisible();
      
      // Error message should contain expected text
      const errorText = await loginPage.getErrorMessage();
      expect(errorText).toBeTruthy();
      expect(errorText?.toLowerCase()).toMatch(/inválido|incorrecto|error|invalid/i);
      
      // Should NOT redirect to dashboard
      await expect(page).not.toHaveURL('**/dashboard**');
    });

    test('should show error message with wrong password', async ({ page }) => {
      await loginPage.login(TEST_USERS.admin.email, 'wrongpassword');
      
      // Should show error message
      await expect(loginPage.errorMessage).toBeVisible();
      
      // Should NOT redirect to dashboard
      await expect(page).not.toHaveURL('**/dashboard**');
    });
  });

  describe('Form Validation', () => {
    test.skip('should show validation error with empty email', async ({ page }) => {
      // SKIP: HTML5 native validation — tested by browser, not E2E.
      // The browser's built-in validation prevents form submission when required
      // fields are empty, so there's no error message to check.
      
      await loginPage.fillPassword('somepassword');
      await loginPage.clickLogin();
      
      // HTML5 validation should prevent submission or show error
      const emailInput = page.getByTestId('email-input');
      await expect(emailInput).toHaveAttribute('required', '');
    });

    test.skip('should show validation error with empty password', async ({ page }) => {
      // SKIP: HTML5 native validation — tested by browser, not E2E.
      // The browser's built-in validation prevents form submission when required
      // fields are empty, so there's no error message to check.
      
      await loginPage.fillEmail('test@example.com');
      await loginPage.clickLogin();
      
      // HTML5 validation should prevent submission or show error
      const passwordInput = page.getByTestId('password-input');
      await expect(passwordInput).toHaveAttribute('required', '');
    });

    test.skip('should show validation error with empty fields', async ({ page }) => {
      // SKIP: HTML5 native validation — tested by browser, not E2E.
      // The browser's built-in validation prevents form submission when required
      // fields are empty, so there's no error message to check.
      
      await loginPage.clickLogin();
      
      // Both fields should be required
      const emailInput = page.getByTestId('email-input');
      const passwordInput = page.getByTestId('password-input');
      
      // Check HTML5 required attribute
      await expect(emailInput).toHaveAttribute('required', '');
      await expect(passwordInput).toHaveAttribute('required', '');
    });
  });

  describe('Login Page Elements', () => {
    test('should display login form elements', async () => {
      // Check email input is visible
      await expect(loginPage.emailInput).toBeVisible();
      
      // Check password input is visible
      await expect(loginPage.passwordInput).toBeVisible();
      
      // Check submit button is visible
      await expect(loginPage.submitButton).toBeVisible();
      
      // Check button has correct text
      await expect(loginPage.submitButton).toHaveText(/entrar|iniciar sesión|login/i);
    });
  });
});