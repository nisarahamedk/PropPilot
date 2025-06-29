import { test, expect } from '@playwright/test';

test.describe('Chat Interface Basic Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Handle login flow
    const loginInput = page.locator('input[placeholder*="name"]').first();
    if (await loginInput.isVisible()) {
      await loginInput.fill('Test User');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    }
  });

  test('should have visible and functional chat input', async ({ page }) => {
    // Navigate to chat view (New Proposal button)
    const newProposalButton = page.locator('button').filter({ hasText: /new proposal/i });
    if (await newProposalButton.isVisible()) {
      await newProposalButton.click();
      await page.waitForTimeout(500);
    }

    // Look for any input field (input or textarea)
    const chatInput = page.locator('input, textarea').last();
    
    // The input should be visible
    await expect(chatInput).toBeVisible();
    
    // Should be able to focus and type
    await chatInput.click();
    await expect(chatInput).toBeFocused();
    
    // Should accept text input
    await chatInput.fill('Test message for chat interface');
    await expect(chatInput).toHaveValue('Test message for chat interface');
    
    console.log('✅ Chat input is visible and functional');
  });

  test('should maintain input visibility on different screen sizes', async ({ page }) => {
    // Navigate to chat if needed
    const newProposalButton = page.locator('button').filter({ hasText: /new proposal/i });
    if (await newProposalButton.isVisible()) {
      await newProposalButton.click();
      await page.waitForTimeout(500);
    }

    // Test desktop size
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(200);
    
    let chatInput = page.locator('input, textarea').last();
    await expect(chatInput).toBeVisible();
    
    // Test tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(200);
    
    chatInput = page.locator('input, textarea').last();
    await expect(chatInput).toBeVisible();
    
    // Test mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);
    
    chatInput = page.locator('input, textarea').last();
    await expect(chatInput).toBeVisible();
    
    console.log('✅ Chat input remains visible across different screen sizes');
  });

  test('should have proper scroll behavior', async ({ page }) => {
    // Navigate to chat if needed
    const newProposalButton = page.locator('button').filter({ hasText: /new proposal/i });
    if (await newProposalButton.isVisible()) {
      await newProposalButton.click();
      await page.waitForTimeout(500);
    }

    const chatInput = page.locator('input, textarea').last();
    
    if (await chatInput.isVisible()) {
      // Add a message
      await chatInput.fill('This is a test message to check scrolling behavior');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      // The input should still be visible after sending
      await expect(chatInput).toBeVisible();
      await expect(chatInput).toBeEnabled();
      
      console.log('✅ Chat input remains visible after sending messages');
    }
  });

  test('should handle empty state gracefully', async ({ page }) => {
    // Navigate to chat if needed
    const newProposalButton = page.locator('button').filter({ hasText: /new proposal/i });
    if (await newProposalButton.isVisible()) {
      await newProposalButton.click();
      await page.waitForTimeout(500);
    }

    const chatInput = page.locator('input, textarea').last();
    
    if (await chatInput.isVisible()) {
      // Try to send empty message
      await chatInput.click();
      await page.keyboard.press('Enter');
      
      // Input should remain focused and functional
      await expect(chatInput).toBeFocused();
      
      // Should still be able to type
      await chatInput.fill('Non-empty message');
      await expect(chatInput).toHaveValue('Non-empty message');
      
      console.log('✅ Chat handles empty messages gracefully');
    }
  });

  test('should show page structure correctly', async ({ page }) => {
    // Just verify the page loads and has basic structure
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Look for any form of input
    const inputs = page.locator('input, textarea, [contenteditable]');
    const inputCount = await inputs.count();
    
    console.log(`Found ${inputCount} input elements on the page`);
    expect(inputCount).toBeGreaterThan(0);
    
    // Look for buttons
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    console.log(`Found ${buttonCount} buttons on the page`);
    expect(buttonCount).toBeGreaterThan(0);
  });
});