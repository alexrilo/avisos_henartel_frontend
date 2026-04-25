import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Login page.
 * Provides locators and methods for interacting with the login form.
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.submitButton = page.getByTestId('login-button');
    this.errorMessage = page.getByTestId('error-message');
  }

  /**
   * Navigate to the login page.
   */
  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  /**
   * Fill the login form with credentials and submit.
   * @param email - User email address
   * @param password - User password
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /**
   * Fill only the email field.
   * @param email - User email address
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  /**
   * Fill only the password field.
   * @param password - User password
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * Click the login/submit button.
   */
  async clickLogin(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Get the error message element.
   * Returns null if error message is not visible.
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.errorMessage.isVisible()) {
      return this.errorMessage.textContent();
    }
    return null;
  }

  /**
   * Wait for the page to navigate away from login after successful auth.
   * @param expectedPath - Expected path pattern after login (e.g., '/dashboard')
   */
  async waitForLoginRedirect(expectedPath: string): Promise<void> {
    await this.page.waitForURL(`**${expectedPath}**`, { timeout: 10000 });
  }
}