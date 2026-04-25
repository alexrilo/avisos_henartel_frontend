# Testing Guide - ServiFlow E2E

This document describes how to run E2E tests using Playwright for the ServiFlow application.

## Prerequisites

Before running E2E tests, ensure you have:

1. **Backend running** on `http://localhost:8080`
   - The tests require the backend API to authenticate users
   - Start the backend first before running tests

2. **Dependencies installed**:
   ```bash
   cd frontend
   npm install
   npx playwright install chromium
   ```

## Running Tests

### Development Mode

Run tests in headed mode (with browser visible):
```bash
npm run test:e2e:headed
```

Run tests with UI mode (interactive):
```bash
npm run test:e2e:ui
```

Run tests headless (default):
```bash
npm run test:e2e
```

### CI Mode

Run tests configured for CI/CD (no `forbidOnly` violations allowed):
```bash
npm run test:e2e:ci
```

This sets:
- `CI=true` environment variable
- `forbidOnly: true` - fails test if `test.only()` or `describe.only()` is left in code
- `retries: 2` for stability

## Test Structure

```
frontend/
├── tests/
│   ├── e2e/
│   │   ├── login.spec.ts        # Login flow tests
│   │   ├── aviso-flow.spec.ts   # Create/edit aviso tests
│   │   └── rbac.spec.ts         # Role-based access control
│   ├── pages/
│   │   ├── login.page.ts        # Login page object
│   │   ├── dashboard.page.ts    # Dashboard page object
│   │   └── aviso-form.page.ts   # Aviso form page object
│   ├── fixtures/
│   │   └── auth.ts              # Authentication fixtures
│   └── .auth/
│       ├── admin.json           # Pre-authenticated admin state
│       └── tecnico.json         # Pre-authenticated technician state
├── playwright.config.ts         # Playwright configuration
└── package.json                 # NPM scripts
```

## Test Categories

### Login Tests (`login.spec.ts`)
- Valid admin login redirects to dashboard
- Valid technician login redirects to panel técnico
- Invalid credentials show error message
- Form validation for empty fields

### Aviso Flow Tests (`aviso-flow.spec.ts`)
- Navigate to new aviso form
- Create new aviso with valid data
- Form validation (required fields)
- Cancel action returns to list

### RBAC Tests (`rbac.spec.ts`)
- Unauthenticated users redirected to login
- Role-appropriate dashboard elements
- Session management (logout)

## Viewing Reports

### HTML Report

After running tests, view the HTML report:
```bash
npx playwright show-report
```

Reports are generated in `playwright-report/` directory.

### Trace Viewer

For failed tests, view traces:
```bash
npx playwright show-trace <trace-file>
```

Traces are saved in `test-results/` on first retry.

## Troubleshooting

### Tests fail with "connection refused"
- Ensure backend is running on `localhost:8080`
- Ensure Angular dev server is running on `localhost:4200`

### Tests timeout
- Increase timeout in `playwright.config.ts`
- Check network connectivity

### Authentication failures
- Verify test users exist in database:
  - `admin@serviflow.com` / `admin123` (ADMIN role)
  - `tecnico@serviflow.com` / `tecnico123` (TECNICO role)

### Flaky tests
- Add explicit waits: `await page.waitForURL(...)`
- Use `await expect(locator).toBeVisible()` for assertions
- Check for timing issues with API calls

## CI/CD Integration

For GitHub Actions or other CI systems:

```yaml
- name: Run E2E Tests
  run: |
    cd frontend
    npm install
    npx playwright install chromium
    npm run test:e2e:ci
```

The CI script:
- Sets `CI=true` to enable CI-specific config
- Uses `forbidOnly` to catch accidental `test.only()` commits
- Has 2 retries for transient failures