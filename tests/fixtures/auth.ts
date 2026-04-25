import { test as base, Page, Browser, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { LoginPage } from '../pages/login.page';

export interface AuthUser {
  email: string;
  password: string;
  role: 'ADMIN' | 'TECNICO' | 'COORDINADOR';
  storageStatePath: string;
}

/**
 * Pre-configured test users for different roles.
 */
export const TEST_USERS: Record<string, AuthUser> = {
  admin: {
    email: 'admin@serviflow.com',
    password: 'admin123',
    role: 'ADMIN',
    storageStatePath: '.auth/admin.json',
  },
  tecnico: {
    email: 'tecnico@serviflow.com',
    password: 'tecnico123',
    role: 'TECNICO',
    storageStatePath: '.auth/tecnico.json',
  },
  coordinador: {
    email: 'coordinador@serviflow.com',
    password: 'coordinador123',
    role: 'COORDINADOR',
    storageStatePath: '.auth/coordinador.json',
  },
};

/**
 * Custom test fixture that provides authenticated pages.
 * Supports different user roles with pre-generated auth state.
 */
type AuthFixtures = {
  authenticatedPage: Page;
  adminPage: Page;
  tecnicoPage: Page;
};

const STORAGE_STATE_DIR = 'tests/.auth';

/**
 * Checks if a storage state file exists and is valid JSON.
 * Falls back to UI login if file is missing or corrupt.
 */
function isValidStorageState(storagePath: string): boolean {
  try {
    if (!fs.existsSync(storagePath)) {
      return false;
    }
    const content = fs.readFileSync(storagePath, 'utf-8');
    // Check for empty or corrupt content
    if (!content || content.trim() === '') {
      return false;
    }
    // Try to parse as JSON
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates an authenticated page context by logging in via UI once,
 * saving the storage state, and providing a pre-authenticated page for tests.
 * Falls back to UI login if storage state file is missing or corrupt.
 */
async function createAuthenticatedContext(
  browser: Browser,
  user: AuthUser
): Promise<Page> {
  const storagePath = path.join(STORAGE_STATE_DIR, `${user.role.toLowerCase()}.json`);
  
  // Ensure the auth directory exists
  if (!fs.existsSync(STORAGE_STATE_DIR)) {
    fs.mkdirSync(STORAGE_STATE_DIR, { recursive: true });
  }

  // Check if we have a valid storage state file
  const hasValidStorage = isValidStorageState(storagePath);
  
  if (hasValidStorage) {
    try {
      // Try to use existing storage state
      const authContext = await browser.newContext({
        storageState: storagePath,
      });
      const authPage = await authContext.newPage();
      
      // Verify the auth state is still valid by navigating to dashboard
      await authPage.goto('/dashboard', { timeout: 5000 });
      await authPage.waitForURL('**/dashboard**', { timeout: 5000 }).catch(() => {
        // If redirect to login happens, auth is invalid
        throw new Error('Auth state invalid, need to re-login');
      });
      
      return authPage;
    } catch {
      // Auth state invalid, fall through to UI login
    }
  }

  // Create a fresh context for login via UI
  const context = await browser.newContext();
  const page = await context.newPage();

  const loginPage = new LoginPage(page);

  // Navigate to login and authenticate
  await loginPage.goto();
  await loginPage.login(user.email, user.password);

  // Wait for successful login redirect
  await page.waitForURL('**/dashboard**', { timeout: 15000 });

  // Save the authenticated state to file
  await context.storageState({ path: storagePath });

  // Close the login context
  await context.close();

  // Create a new context with the saved auth state
  const authContext = await browser.newContext({
    storageState: storagePath,
  });
  const authPage = await authContext.newPage();

  return authPage;
}

export const test = base.extend<AuthFixtures>({
  /**
   * Default authenticated page using admin credentials.
   * Tests can use this fixture directly without manual login.
   */
  authenticatedPage: async ({ browser }, use) => {
    const page = await createAuthenticatedContext(browser, TEST_USERS.admin);
    await use(page);
    await page.context().close();
  },

  /**
   * Admin-authenticated page with full dashboard access.
   */
  adminPage: async ({ browser }, use) => {
    const page = await createAuthenticatedContext(browser, TEST_USERS.admin);
    await use(page);
    await page.context().close();
  },

  /**
   * Technician-authenticated page with restricted dashboard access.
   */
  tecnicoPage: async ({ browser }, use) => {
    const page = await createAuthenticatedContext(browser, TEST_USERS.tecnico);
    await use(page);
    await page.context().close();
  },
});

// Re-export expect for assertions
export { expect } from '@playwright/test';

/**
 * Creates a custom test with a specific authenticated role.
 * @param role - The role to authenticate with: 'admin', 'tecnico', or 'coordinador'
 */
export function createAuthTest(role: 'admin' | 'tecnico' | 'coordinador') {
  const user = TEST_USERS[role];
  return base.extend<{ authenticatedPage: Page }>({
    authenticatedPage: async ({ browser }, use) => {
      const page = await createAuthenticatedContext(browser, user);
      await use(page);
      await page.context().close();
    },
  });
}