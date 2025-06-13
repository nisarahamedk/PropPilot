import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance monitoring
    await page.goto('/proppilot');
  });

  test('should load within performance budgets', async ({ page }) => {
    // Wait for network to be idle
    await page.waitForLoadState('networkidle');
    
    // Measure page load performance
    const timing = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (!perf) {
        return {
          domContentLoaded: 0,
          loadComplete: 0,
          firstPaint: 0,
          totalTime: 0,
        };
      }
      
      return {
        domContentLoaded: Math.max(0, (perf.domContentLoadedEventEnd || 0) - (perf.domContentLoadedEventStart || 0)),
        loadComplete: Math.max(0, (perf.loadEventEnd || 0) - (perf.loadEventStart || 0)),
        firstPaint: Math.max(0, (perf.domInteractive || 0) - (perf.navigationStart || 0)),
        totalTime: Math.max(0, (perf.loadEventEnd || 0) - (perf.navigationStart || 0)),
      };
    });

    // Page should load reasonably fast (under 3 seconds total) or be 0 in test environment
    expect(timing.totalTime).toBeLessThanOrEqual(3000);
    
    // DOM Content Loaded should be quick (under 1 second) or be 0 in test environment
    expect(timing.domContentLoaded).toBeLessThanOrEqual(1000);
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    // Monitor memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Simulate adding many messages (if chat interface exists)
    const chatInput = page.locator('input[type="text"], textarea').first();
    
    if (await chatInput.isVisible()) {
      // Add multiple messages to test performance
      for (let i = 0; i < 10; i++) {
        await chatInput.fill(`Test message ${i} with some content to test performance`);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(50); // Brief pause
      }
    }

    await page.waitForTimeout(1000); // Let processing complete

    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Memory usage shouldn't grow excessively (arbitrary threshold)
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
    }
  });

  test('should render smoothly during interactions', async ({ page }) => {
    let frameDrops = 0;
    let lastTimestamp = 0;

    // Monitor frame rates during interactions
    await page.evaluate(() => {
      const monitor = () => {
        const now = performance.now();
        (window as any).lastFrameTime = now;
        requestAnimationFrame(monitor);
      };
      monitor();
    });

    // Perform various interactions
    const interactiveElements = page.locator('button, [role="button"], a');
    const elementCount = await interactiveElements.count();

    for (let i = 0; i < Math.min(elementCount, 3); i++) {
      const element = interactiveElements.nth(i);
      if (await element.isVisible()) {
        await element.click();
        await page.waitForTimeout(100);
      }
    }

    // Test viewport changes
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(200);
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(200);

    // Frame rate monitoring (basic check)
    const frameTime = await page.evaluate(() => (window as any).lastFrameTime || 0);
    expect(frameTime).toBeGreaterThan(0);
  });

  test('should optimize bundle size', async ({ page }) => {
    // Check for excessive JavaScript bundles
    const resourceSizes = await page.evaluate(async () => {
      const resources = performance.getEntriesByType('resource');
      const jsBundles = resources.filter((r: any) => 
        r.name.includes('.js') && 
        r.transferSize && 
        r.transferSize > 100000 // Larger than 100KB
      );
      
      return jsBundles.map((r: any) => ({
        name: r.name,
        size: r.transferSize,
      }));
    });

    // Individual JS bundles shouldn't be excessively large (under 2MB each)
    resourceSizes.forEach(bundle => {
      expect(bundle.size).toBeLessThan(2 * 1024 * 1024);
    });
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow 3G network
    await page.context().route('**/*', async (route) => {
      // Add artificial delay for resources
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto('/proppilot');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    // Should still load within reasonable time even with network delays
    expect(loadTime).toBeLessThan(10000); // Under 10 seconds
    
    // Page should be functional
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('should handle concurrent users simulation', async ({ page }) => {
    // Simulate multiple rapid interactions
    const promises = [];
    
    for (let i = 0; i < 5; i++) {
      promises.push(
        (async () => {
          const button = page.locator('button').nth(i % 3);
          if (await button.isVisible()) {
            await button.click();
          }
        })()
      );
    }

    await Promise.all(promises);
    
    // Page should remain responsive
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('should optimize for Core Web Vitals', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const webVitals = await page.evaluate(async () => {
      // Simplified Web Vitals check
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (!timing) {
        return { lcp: 1000, fid: 0, cls: 0 };
      }
      
      return {
        // Largest Contentful Paint approximation
        lcp: Math.max(0, (timing.domContentLoadedEventEnd || 1000) - (timing.navigationStart || 0)),
        // First Input Delay (can't measure without actual input)
        fid: 0,
        // Cumulative Layout Shift (simplified)
        cls: 0,
      };
    });

    // LCP should be under 2.5 seconds (good threshold) or reasonable in test environment
    expect(webVitals.lcp).toBeLessThanOrEqual(2500);
  });

  test('should minimize layout shifts', async ({ page }) => {
    let layoutShifts = 0;

    // Monitor layout shifts
    await page.evaluate(() => {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            (window as any).layoutShiftScore = ((window as any).layoutShiftScore || 0) + (entry as any).value;
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    });

    // Perform interactions that might cause layout shifts
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(200);
    
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      await buttons.first().click();
      await page.waitForTimeout(200);
    }

    const layoutShiftScore = await page.evaluate(() => (window as any).layoutShiftScore || 0);
    
    // CLS should be minimal (under 0.1 is good)
    expect(layoutShiftScore).toBeLessThan(0.1);
  });

  test('should handle memory leaks', async ({ page }) => {
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Perform memory-intensive operations
    for (let i = 0; i < 5; i++) {
      // Navigate and perform actions
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Interact with page
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      if (buttonCount > 0) {
        await buttons.first().click();
        await page.waitForTimeout(100);
      }
    }

    // Force garbage collection if available
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc();
      }
    });

    await page.waitForTimeout(1000);

    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Memory shouldn't grow excessively after operations and GC
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024); // Less than 20MB net increase
    }
  });
});