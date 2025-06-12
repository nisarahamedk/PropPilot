import { test, expect } from '@playwright/test';

test.describe('PropPilot Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads successfully
    await expect(page).toHaveTitle(/PropPilot/);
  });

  test('should navigate to PropPilot page', async ({ page }) => {
    await page.goto('/');
    
    // Try to navigate to the PropPilot feature page
    await page.goto('/proppilot');
    
    // Check if the PropPilot page loads
    await expect(page).toHaveURL(/proppilot/);
  });
});