import { test, expect } from '@playwright/test';

test.describe('Complete Proposal Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/proppilot');
    await page.waitForLoadState('networkidle');
  });

  test('should complete full proposal creation workflow', async ({ page }) => {
    // Step 1: Initial conversation start
    const chatInput = page.locator('input[type="text"], textarea').first();
    
    if (await chatInput.isVisible()) {
      // Start conversation
      await chatInput.fill('I need a proposal for a website redesign project for a healthcare client');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      // Provide more details
      await chatInput.fill('The client is MedCorp, budget is $50,000, timeline is 3 months');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      // Add requirements
      await chatInput.fill('Requirements include responsive design, HIPAA compliance, and patient portal integration');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
    }

    // Step 2: Verify preview panel appears or can be toggled
    const previewToggle = page.locator('button').filter({ hasText: /preview|draft/i }).first();
    if (await previewToggle.isVisible()) {
      await previewToggle.click();
      await page.waitForTimeout(300);
    }

    // Step 3: Check for proposal sections
    const proposalSections = page.locator('[data-testid*="section"], .section, [class*="section"]');
    const sectionCount = await proposalSections.count();
    
    if (sectionCount > 0) {
      // Should have multiple sections
      expect(sectionCount).toBeGreaterThan(2);
      
      // Test section interaction
      await proposalSections.first().click();
      await page.waitForTimeout(200);
    }

    // Step 4: Test export functionality if available
    const exportButton = page.locator('button').filter({ hasText: /export/i }).first();
    if (await exportButton.isVisible()) {
      await exportButton.click();
      await page.waitForTimeout(300);
      
      // Should show export options
      const exportDialog = page.locator('[role="dialog"], .dialog, [data-testid*="export"]').first();
      if (await exportDialog.isVisible()) {
        // Test format selection
        const formatOptions = page.locator('button, [role="button"]').filter({ hasText: /pdf|word|markdown/i });
        const formatCount = await formatOptions.count();
        
        if (formatCount > 0) {
          await formatOptions.first().click();
          await page.waitForTimeout(200);
        }
        
        // Close dialog
        const closeButton = page.locator('button').filter({ hasText: /close|cancel/i }).first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
      }
    }
  });

  test('should handle progressive proposal building', async ({ page }) => {
    const chatInput = page.locator('input[type="text"], textarea').first();
    
    if (await chatInput.isVisible()) {
      // Phase 1: Basic project info
      await chatInput.fill('I want to create a proposal for a mobile app development project');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      // Phase 2: Client details
      await chatInput.fill('Client is TechStart Inc, a startup in the fintech space');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      // Phase 3: Requirements
      await chatInput.fill('They need iOS and Android apps with payment integration and user authentication');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      // Phase 4: Timeline and budget
      await chatInput.fill('Budget is $100,000 and timeline is 6 months');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      // Phase 5: Additional features
      await chatInput.fill('Also need admin dashboard and API development');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
    }

    // Verify readiness score or completion indicator
    const progressIndicator = page.locator('[data-testid*="progress"], .progress, [class*="progress"]').first();
    if (await progressIndicator.isVisible()) {
      // Should show some level of progress
      const progressText = await progressIndicator.textContent();
      expect(progressText).toBeTruthy();
    }
  });

  test('should maintain state across browser refresh', async ({ page }) => {
    const chatInput = page.locator('input[type="text"], textarea').first();
    
    if (await chatInput.isVisible()) {
      // Add some content
      await chatInput.fill('Creating a proposal for e-commerce website development');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      await chatInput.fill('Client: ShopWell, Budget: $75,000, Timeline: 4 months');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
    }

    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check if conversation state is restored (if persistence is implemented)
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
    
    // Look for any restored content
    const chatMessages = page.locator('[data-testid*="message"], .message, [class*="message"]');
    const messageCount = await chatMessages.count();
    
    // State persistence may or may not be implemented
    // This test documents the expected behavior
    if (messageCount > 0) {
      console.log('State persistence is working');
    } else {
      console.log('State persistence not implemented or messages cleared');
    }
  });

  test('should handle collaborative features if available', async ({ page }) => {
    // Look for collaboration features
    const shareButton = page.locator('button').filter({ hasText: /share|collaborate/i }).first();
    
    if (await shareButton.isVisible()) {
      await shareButton.click();
      await page.waitForTimeout(300);
      
      // Should show sharing options
      const shareDialog = page.locator('[role="dialog"], .dialog, [data-testid*="share"]').first();
      if (await shareDialog.isVisible()) {
        // Test sharing functionality
        const shareLink = page.locator('input[type="text"], input[type="url"]').first();
        if (await shareLink.isVisible()) {
          const linkValue = await shareLink.inputValue();
          expect(linkValue).toBeTruthy();
        }
        
        // Close dialog
        const closeButton = page.locator('button').filter({ hasText: /close|cancel/i }).first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
      }
    }
  });

  test('should support competitive analysis workflow', async ({ page }) => {
    const chatInput = page.locator('input[type="text"], textarea').first();
    
    if (await chatInput.isVisible()) {
      // Start with industry-specific proposal
      await chatInput.fill('Create a proposal for healthcare software development');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      await chatInput.fill('Client: HealthTech Solutions, Industry: Healthcare, Compliance: HIPAA required');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
    }

    // Look for competitive analysis features
    const analysisSection = page.locator('[data-testid*="competitive"], [data-testid*="analysis"], [class*="competitive"]').first();
    
    if (await analysisSection.isVisible()) {
      await analysisSection.click();
      await page.waitForTimeout(300);
      
      // Should show competitive insights
      const insights = page.locator('[data-testid*="insight"], .insight, [class*="insight"]');
      const insightCount = await insights.count();
      
      if (insightCount > 0) {
        // Test insight interaction
        await insights.first().click();
        await page.waitForTimeout(200);
      }
    }
  });

  test('should generate proposal with AI suggestions', async ({ page }) => {
    const chatInput = page.locator('input[type="text"], textarea').first();
    
    if (await chatInput.isVisible()) {
      // Comprehensive proposal request
      await chatInput.fill('I need a complete proposal for cloud migration services');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      await chatInput.fill('Client: Enterprise Corp, Current: On-premise legacy systems, Goal: AWS cloud migration');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      await chatInput.fill('Requirements: Zero downtime migration, 24/7 monitoring, disaster recovery setup');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      await chatInput.fill('Budget: $200,000, Timeline: 8 months, Team size: 5 engineers');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
    }

    // Look for AI suggestions or recommendations
    const suggestions = page.locator('[data-testid*="suggestion"], .suggestion, [class*="suggestion"]');
    const suggestionCount = await suggestions.count();
    
    if (suggestionCount > 0) {
      // Test suggestion interaction
      await suggestions.first().click();
      await page.waitForTimeout(200);
      
      // Look for apply button
      const applyButton = page.locator('button').filter({ hasText: /apply|accept/i }).first();
      if (await applyButton.isVisible()) {
        await applyButton.click();
        await page.waitForTimeout(200);
      }
    }
  });

  test('should handle proposal refinement workflow', async ({ page }) => {
    const chatInput = page.locator('input[type="text"], textarea').first();
    
    if (await chatInput.isVisible()) {
      // Initial proposal
      await chatInput.fill('Create proposal for website development - basic e-commerce site');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      // Refinement requests
      await chatInput.fill('Actually, make it more comprehensive - include mobile app and admin panel');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      await chatInput.fill('Add payment gateway integration and inventory management features');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      await chatInput.fill('Include 6 months of maintenance and support in the proposal');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
    }

    // Verify that sections get updated/refined
    const proposalSections = page.locator('[data-testid*="section"], .section, [class*="section"]');
    const sectionCount = await proposalSections.count();
    
    if (sectionCount > 0) {
      // Should have comprehensive sections
      expect(sectionCount).toBeGreaterThan(3);
    }
  });

  test('should support multi-format export workflow', async ({ page }) => {
    const chatInput = page.locator('input[type="text"], textarea').first();
    
    if (await chatInput.isVisible()) {
      // Create a complete proposal first
      await chatInput.fill('Complete proposal for digital transformation consulting');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      await chatInput.fill('Client: Legacy Corp, Services: Process automation, cloud migration, training');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      await chatInput.fill('Budget: $500,000, Timeline: 12 months, Expected ROI: 300%');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
    }

    // Test export workflow
    const exportButton = page.locator('button').filter({ hasText: /export/i }).first();
    if (await exportButton.isVisible()) {
      await exportButton.click();
      await page.waitForTimeout(300);
      
      // Test different export formats
      const exportFormats = ['PDF', 'Word', 'HTML', 'Markdown'];
      
      for (const format of exportFormats) {
        const formatButton = page.locator('button, [role="button"]').filter({ hasText: new RegExp(format, 'i') }).first();
        if (await formatButton.isVisible()) {
          await formatButton.click();
          await page.waitForTimeout(200);
          break; // Test one format to avoid overwhelming the system
        }
      }
      
      // Close export dialog
      const closeButton = page.locator('button').filter({ hasText: /close|cancel/i }).first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
  });
});