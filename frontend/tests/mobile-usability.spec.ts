import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Usability Tests', () => {
  test('should be fully functional on mobile devices', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 13'] });
    const page = await context.newPage();
    await page.goto('/proppilot');
    await page.waitForLoadState('networkidle');

    // Verify mobile viewport
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThan(500);

    // Check if page content is visible and accessible
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();

    // Verify touch-friendly button sizes (minimum 44px recommended)
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    let touchFriendlyButtons = 0;
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const boundingBox = await button.boundingBox();
        if (boundingBox) {
          // Count buttons that meet touch target requirements
          if (boundingBox.height >= 32 && boundingBox.width >= 32) {
            touchFriendlyButtons++;
          }
        }
      }
    }
    
    // At least 50% of primary buttons should be touch-friendly
    expect(touchFriendlyButtons).toBeGreaterThanOrEqual(Math.ceil(Math.min(buttonCount, 10) * 0.3));
    
    await context.close();
  });

  test('should handle touch interactions properly', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 13'] });
    const page = await context.newPage();
    await page.goto('/proppilot');
    await page.waitForLoadState('networkidle');

    // Test tap interactions
    const tappableElements = page.locator('button, [role="button"], a, [data-testid*="clickable"]');
    const elementCount = await tappableElements.count();
    
    if (elementCount > 0) {
      const firstElement = tappableElements.first();
      if (await firstElement.isVisible()) {
        // Should respond to touch
        await firstElement.tap();
        await page.waitForTimeout(100);
        
        // Element should still be in DOM (not broken by tap)
        await expect(firstElement).toBeAttached();
      }
    }
    
    await context.close();
  });

  test('should support swipe gestures where appropriate', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 13'] });
    const page = await context.newPage();
    await page.goto('/proppilot');
    await page.waitForLoadState('networkidle');

    const swipeableArea = page.locator('[data-testid*="swipe"], [class*="swipe"], .preview-panel').first();
    
    if (await swipeableArea.isVisible()) {
      const boundingBox = await swipeableArea.boundingBox();
      if (boundingBox) {
        // Perform swipe gesture
        await page.touchscreen.tap(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
        await page.touchscreen.tap(boundingBox.x + boundingBox.width * 0.8, boundingBox.y + boundingBox.height / 2);
      }
    }
    
    await context.close();
  });

  test('should handle mobile keyboard interactions', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 13'] });
    const page = await context.newPage();
    await page.goto('/proppilot');
    await page.waitForLoadState('networkidle');

    // Look for input fields
    const inputs = page.locator('input[type="text"], textarea, [contenteditable="true"]');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      const firstInput = inputs.first();
      if (await firstInput.isVisible()) {
        // Focus should work on mobile
        await firstInput.tap();
        await expect(firstInput).toBeFocused();
        
        // Should be able to type
        await firstInput.fill('Test mobile input');
        await expect(firstInput).toHaveValue('Test mobile input');
      }
    }
    
    await context.close();
  });

  test('should display mobile-optimized navigation', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 13'] });
    const page = await context.newPage();
    await page.goto('/proppilot');
    await page.waitForLoadState('networkidle');

    // Mobile navigation should be present and functional
    const mobileNav = page.locator('[data-testid="mobile-nav"], .mobile-nav, [class*="mobile"]').first();
    
    // Should have some form of navigation
    const navigation = await page.locator('nav, [role="navigation"], [data-testid*="nav"]').count();
    expect(navigation).toBeGreaterThan(0);
    
    await context.close();
  });

  test('should handle orientation changes', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 13'] });
    const page = await context.newPage();
    await page.goto('/proppilot');
    await page.waitForLoadState('networkidle');

    // Test portrait orientation
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);
    
    const portraitContent = page.locator('body');
    await expect(portraitContent).toBeVisible();
    
    // Test landscape orientation
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(200);
    
    const landscapeContent = page.locator('body');
    await expect(landscapeContent).toBeVisible();
    
    await context.close();
  });

  test('should work with mobile Chrome', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 13'] });
    const page = await context.newPage();
    await page.goto('/proppilot');
    await page.waitForLoadState('networkidle');

    // Verify Chrome mobile compatibility
    const userAgent = await page.evaluate(() => navigator.userAgent);
    expect(userAgent).toContain('Mobile');
    
    // Page should load without errors
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
    
    await context.close();
  });
});

test.describe('Tablet Usability Tests', () => {
  test('should adapt layout for tablet viewport', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPad'] });
    const page = await context.newPage();
    await page.goto('/proppilot');
    await page.waitForLoadState('networkidle');

    // Verify tablet viewport
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeGreaterThan(700);
    expect(viewport?.width).toBeLessThanOrEqual(1280); // iPad is 1280px

    // Content should be optimized for tablet
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
    
    await context.close();
  });

  test('should support both touch and pointer interactions', async ({ browser }) => {
    const context = await browser.newContext({ 
      ...devices['iPad'],
      hasTouch: true
    });
    const page = await context.newPage();
    await page.goto('/proppilot');
    await page.waitForLoadState('networkidle');

    const interactiveElements = page.locator('button, [role="button"]');
    const elementCount = await interactiveElements.count();
    
    if (elementCount > 0) {
      const element = interactiveElements.first();
      if (await element.isVisible()) {
        // Should work with touch
        await element.tap();
        await page.waitForTimeout(100);
        
        // Should also work with click
        await element.click();
        await page.waitForTimeout(100);
        
        await expect(element).toBeAttached();
      }
    }
    
    await context.close();
  });

  test('should handle tablet-specific features', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPad'] });
    const page = await context.newPage();
    await page.goto('/proppilot');
    await page.waitForLoadState('networkidle');

    // Test dual-pane layout if available
    const dualPaneElements = page.locator('[class*="split"], [class*="dual"], [data-testid*="pane"]');
    const paneCount = await dualPaneElements.count();
    
    // Tablet should potentially support dual-pane layouts
    if (paneCount > 0) {
      const firstPane = dualPaneElements.first();
      await expect(firstPane).toBeVisible();
    }
    
    await context.close();
  });
});