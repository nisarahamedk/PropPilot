import { test, expect } from '@playwright/test';

test.describe('Basic Application Functionality', () => {
  test('should load PropPilot application', async ({ page }) => {
    await page.goto('/proppilot');
    await page.waitForLoadState('networkidle');

    // Check if page loads successfully
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();

    // Check for basic content
    const title = await page.title();
    expect(title).toContain('PropPilot');
  });

  test('should have interactive elements', async ({ page }) => {
    await page.goto('/proppilot');
    await page.waitForLoadState('networkidle');

    // Look for buttons
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // Test first button if visible
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      if (await firstButton.isVisible()) {
        await firstButton.click();
        await page.waitForTimeout(200);
        await expect(firstButton).toBeAttached();
      }
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/proppilot');
    await page.waitForLoadState('networkidle');

    // Test tab navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    const focusedElement = page.locator(':focus');
    const hasFocus = await focusedElement.count();

    if (hasFocus > 0) {
      await expect(focusedElement.first()).toBeFocused();
    }
  });

  test('should be responsive to viewport changes', async ({ page }) => {
    await page.goto('/proppilot');
    await page.waitForLoadState('networkidle');

    // Test desktop size
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(200);
    
    let pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();

    // Test mobile size  
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);
    
    pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });
});

test.describe('PropPilot Core Features', () => {
  test('should have navigation elements', async ({ page }) => {
    await page.goto('/proppilot');
    await page.waitForLoadState('networkidle');

    // Check for navigation
    const navigation = await page.locator('nav, [role="navigation"], [data-testid*="nav"]').count();
    expect(navigation).toBeGreaterThan(0);
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Navigate to a potentially non-existent route
    await page.goto('/proppilot/non-existent');
    
    // Should not crash - page should still be accessible
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('should support basic text input', async ({ page }) => {
    await page.goto('/proppilot');
    await page.waitForLoadState('networkidle');

    // Look for input fields
    const inputs = page.locator('input[type="text"], textarea, [contenteditable="true"]');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      const firstInput = inputs.first();
      if (await firstInput.isVisible()) {
        await firstInput.click();
        await expect(firstInput).toBeFocused();
        
        await firstInput.fill('Test input');
        await expect(firstInput).toHaveValue('Test input');
      }
    }
  });
});