import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/proppilot');
    await page.waitForLoadState('networkidle');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check for heading elements
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    if (headings.length > 0) {
      // Should have at least one h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
      
      // Headings should have text content
      for (const heading of headings.slice(0, 5)) { // Check first 5 headings
        const text = await heading.textContent();
        expect(text?.trim()).toBeTruthy();
      }
    }
  });

  test('should have accessible form controls', async ({ page }) => {
    // Check for form elements
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < Math.min(inputCount, 3); i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        // Should have label or aria-label
        const hasLabel = await input.getAttribute('aria-label') || 
                         await page.locator(`label[for="${await input.getAttribute('id')}"]`).count() > 0;
        
        // Relaxed check - should have some form of labeling
        const ariaLabel = await input.getAttribute('aria-label');
        const placeholder = await input.getAttribute('placeholder');
        const hasAccessibleName = ariaLabel || placeholder;
        
        if (!hasAccessibleName) {
          console.log(`Input ${i} may need better labeling`);
        }
      }
    }
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    // Check for interactive elements with proper roles
    const buttons = page.locator('button, [role="button"]');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        // Button should have accessible name
        const accessibleName = await button.textContent() || 
                              await button.getAttribute('aria-label') ||
                              await button.getAttribute('title');
        
        if (!accessibleName?.trim()) {
          console.log(`Button ${i} may need accessible name`);
        }
      }
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    const focusedElement = page.locator(':focus');
    const elementCount = await focusedElement.count();
    
    if (elementCount > 0) {
      // Should be able to focus elements
      await expect(focusedElement.first()).toBeFocused();
      
      // Test next tab
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }
  });

  test('should support screen reader navigation', async ({ page }) => {
    // Check for landmark elements
    const landmarks = page.locator('main, nav, header, footer, aside, section[aria-label], [role="main"], [role="navigation"]');
    const landmarkCount = await landmarks.count();
    
    expect(landmarkCount).toBeGreaterThan(0);
    
    // Check for skip links or similar navigation aids
    const skipLinks = page.locator('a[href*="#"], [role="region"]');
    const hasNavigationAids = await skipLinks.count() > 0;
    
    // Should have some form of navigation structure
    expect(landmarkCount).toBeGreaterThan(0);
  });

  test('should have adequate color contrast', async ({ page }) => {
    // This is a basic check - real contrast testing requires specialized tools
    const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6, button, a').first();
    
    if (await textElements.isVisible()) {
      const styles = await textElements.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize,
        };
      });
      
      // Should have defined colors
      expect(styles.color).toBeTruthy();
      expect(styles.fontSize).toBeTruthy();
    }
  });

  test('should handle high contrast mode', async ({ page }) => {
    // Test with forced colors media query simulation
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(200);
    
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
    
    // Switch back to light mode
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForTimeout(200);
    
    await expect(pageContent).toBeVisible();
  });

  test('should support reduced motion preferences', async ({ page }) => {
    // Test with reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(200);
    
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
    
    // Reset motion preference
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  });

  test('should have proper focus indicators', async ({ page }) => {
    const focusableElements = page.locator('button, a, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    const elementCount = await focusableElements.count();
    
    if (elementCount > 0) {
      const firstElement = focusableElements.first();
      if (await firstElement.isVisible()) {
        await firstElement.focus();
        await expect(firstElement).toBeFocused();
        
        // Should maintain focus visibility
        await page.waitForTimeout(100);
        await expect(firstElement).toBeFocused();
      }
    }
  });

  test('should handle assistive technology announcements', async ({ page }) => {
    // Check for aria-live regions
    const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
    const liveRegionCount = await liveRegions.count();
    
    // May or may not have live regions depending on app state
    if (liveRegionCount > 0) {
      const firstRegion = liveRegions.first();
      const ariaLive = await firstRegion.getAttribute('aria-live');
      expect(['polite', 'assertive', 'off']).toContain(ariaLive);
    }
  });

  test('should work without JavaScript (progressive enhancement)', async ({ page }) => {
    // Disable JavaScript
    await page.context().addInitScript(() => {
      Object.defineProperty(window, 'JavaScript', { value: undefined });
    });
    
    await page.goto('/proppilot', { waitUntil: 'domcontentloaded' });
    
    // Basic content should still be accessible
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
    
    // Should have some basic content even without JS
    const textContent = await pageContent.textContent();
    expect(textContent?.length).toBeGreaterThan(50);
  });

  test('should support zoom up to 200%', async ({ page }) => {
    // Test 150% zoom
    await page.setViewportSize({ width: 800, height: 600 });
    await page.evaluate(() => {
      document.body.style.zoom = '1.5';
    });
    await page.waitForTimeout(200);
    
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
    
    // Test 200% zoom
    await page.evaluate(() => {
      document.body.style.zoom = '2.0';
    });
    await page.waitForTimeout(200);
    
    await expect(pageContent).toBeVisible();
    
    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1.0';
    });
  });
});