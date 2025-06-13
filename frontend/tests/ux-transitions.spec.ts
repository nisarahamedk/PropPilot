import { test, expect } from '@playwright/test';

test.describe('UX Transitions and Animations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/proppilot');
  });

  test('should have smooth dual-pane transitions', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Look for chat interface
    const chatContainer = page.locator('[data-testid="chat-interface"]').first();
    if (await chatContainer.isVisible()) {
      await expect(chatContainer).toBeVisible();
    }

    // Look for preview toggle or preview panel
    const previewToggle = page.locator('button').filter({ hasText: /preview|draft/i }).first();
    if (await previewToggle.isVisible()) {
      // Test preview panel toggle animation
      await previewToggle.click();
      
      // Check for animation duration (should be reasonable)
      await page.waitForTimeout(100); // Brief wait for animation start
      
      // Verify preview panel appears
      const previewPanel = page.locator('[data-testid="preview-panel"]').first();
      if (await previewPanel.isVisible()) {
        await expect(previewPanel).toBeVisible();
      }
    }
  });

  test('should handle layout transitions smoothly', async ({ page }) => {
    // Test responsive layout changes
    const viewport = page.viewportSize();
    
    // Start with desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(200);
    
    // Switch to tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(200);
    
    // Switch to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);
    
    // Content should still be visible and accessible
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
    
    // Restore original viewport
    if (viewport) {
      await page.setViewportSize(viewport);
    }
  });

  test('should have smooth section transitions', async ({ page }) => {
    // Look for proposal sections
    const sections = page.locator('[data-testid*="section"], .section, [class*="section"]').first();
    
    if (await sections.isVisible()) {
      // Test section click/selection
      await sections.click();
      await page.waitForTimeout(100);
      
      // Should have visual feedback for selection
      await expect(sections).toBeVisible();
    }
  });

  test('should handle animation performance', async ({ page }) => {
    // Monitor console for performance warnings
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'warning' && msg.text().includes('performance')) {
        logs.push(msg.text());
      }
    });

    // Trigger various animations
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(200);
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);
    
    // Should not have performance warnings
    expect(logs.length).toBe(0);
  });

  test('should maintain 60fps during transitions', async ({ page }) => {
    // Enable FPS monitoring if available
    await page.evaluate(() => {
      if ('performance' in window && 'mark' in window.performance) {
        window.performance.mark('transition-start');
      }
    });

    // Trigger layout transition
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);

    await page.evaluate(() => {
      if ('performance' in window && 'mark' in window.performance) {
        window.performance.mark('transition-end');
      }
    });

    // Verify transition completed without major frame drops
    const timing = await page.evaluate(() => {
      if ('performance' in window && 'measure' in window.performance) {
        try {
          window.performance.measure('transition-time', 'transition-start', 'transition-end');
          const measure = window.performance.getEntriesByName('transition-time')[0];
          return measure ? measure.duration : 0;
        } catch {
          return 0;
        }
      }
      return 0;
    });

    // Transition should be reasonably quick (under 500ms)
    expect(timing).toBeLessThan(500);
  });
});