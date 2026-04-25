import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Dashboard page.
 * Provides locators and methods for interacting with the main layout and dashboard content.
 */
export class DashboardPage {
  readonly page: Page;
  readonly welcomeMessage: Locator;
  readonly sidebarNav: Locator;
  readonly navLinkAvisos: Locator;
  readonly navLinkPanelTecnico: Locator;
  readonly navLinkDashboard: Locator;
  readonly navLinkUsuarios: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeMessage = page.getByRole('heading', { level: 1 });
    this.sidebarNav = page.getByTestId('sidebar-nav');
    this.navLinkAvisos = page.getByTestId('nav-link-avisos');
    this.navLinkPanelTecnico = page.getByTestId('nav-link-panel-tecnico');
    this.navLinkDashboard = page.getByTestId('nav-link-dashboard');
    this.navLinkUsuarios = page.getByTestId('nav-link-usuarios');
    this.logoutButton = page.getByRole('button', { name: /salir|logout|cierre/i });
  }

  /**
   * Navigate to the dashboard page.
   */
  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
  }

  /**
   * Get the welcome message text.
   */
  async getWelcomeMessage(): Promise<string> {
    return this.welcomeMessage.textContent() ?? '';
  }

  /**
   * Get a KPI value by label.
   * @param label - The KPI label (e.g., 'Total Avisos', 'Pendientes')
   */
  async getKpiValue(label: string): Promise<string> {
    const kpiCard = this.page.locator('.grid').getByText(label);
    const valueLocator = kpiCard.locator('..').locator('.text-3xl, .text-4xl, [class*="text-"]');
    return valueLocator.textContent() ?? '';
  }

  /**
   * Click a navigation link by its path or text.
   * @param link - The route path (e.g., '/dashboard/avisos') or link text
   */
  async clickNav(link: string): Promise<void> {
    // Try by testid first for known links
    if (link.includes('avisos') && !link.includes('panel')) {
      await this.navLinkAvisos.click();
    } else if (link.includes('panel-tecnico')) {
      await this.navLinkPanelTecnico.click();
    } else if (link.includes('home') || link === '/dashboard') {
      await this.navLinkDashboard.click();
    } else if (link.includes('usuarios')) {
      await this.navLinkUsuarios.click();
    } else {
      // Fallback: click by href
      await this.page.getByRole('link', { has: link }).click();
    }
  }

  /**
   * Perform logout action.
   */
  async logout(): Promise<void> {
    await this.logoutButton.click();
    // Wait for redirect to login page
    await this.page.waitForURL('**/login**', { timeout: 5000 });
  }

  /**
   * Verify the user is on the dashboard page.
   */
  async isDashboard(): Promise<boolean> {
    return this.page.url().includes('/dashboard');
  }

  /**
   * Wait for the dashboard to fully load.
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForURL('**/dashboard**', { timeout: 10000 });
    await this.welcomeMessage.waitFor({ state: 'visible' });
  }
}