import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Browser, chromium, Page } from 'playwright';

describe('React FormPage Debug Mode E2E Test', () => {
  let browser: Browser;
  let page: Page;
  
  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    
    // Listen for console logs to capture form submission
    page.on('console', msg => {
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should render FormPage in debug mode and handle submission', async () => {
    // Navigate to debug React route
    await page.goto('http://localhost:5000/debug/react/15');
    
    // Wait for React component to load
    await page.waitForSelector('#root', { timeout: 10000 });
    
    // Wait a bit more for React to fully render
    await page.waitForTimeout(2000);
    
    // Verify form fields are present
    const fullNameField = await page.locator('input[name="fullName"], input[placeholder*="name"]');
    const agreeTermsField = await page.locator('input[type="checkbox"]');
    
    await expect(fullNameField).toBeVisible();
    await expect(agreeTermsField).toBeVisible();
    
    // Fill out the form
    await fullNameField.fill('React Test User');
    await agreeTermsField.check();
    
    // Set up console log listener for submission
    const submissionPromise = new Promise((resolve) => {
      page.on('console', (msg) => {
        if (msg.text().includes('React Form Submission:')) {
          resolve(msg.text());
        }
      });
    });
    
    // Submit the form - look for submit button
    const submitButton = await page.locator('button:has-text("Submit"), button[type="submit"], .formio-button-submit');
    await submitButton.click();
    
    // Wait for submission log
    const submissionLog = await submissionPromise;
    
    // Verify submission contains expected data
    expect(submissionLog).toContain('React Test User');
    
    // Verify submission UI appears
    await page.waitForSelector('#submission-log', { state: 'visible' });
    const submissionData = await page.locator('#submission-data').textContent();
    
    expect(submissionData).toContain('"fullName":"React Test User"');
    expect(submissionData).toContain('"agreeTerms":true');
    
    console.log('✅ React FormPage debug test passed - component renders and submits correctly');
  });

  it('should validate required fields in debug mode', async () => {
    await page.goto('http://localhost:5000/debug/react/15');
    
    // Wait for React component to load
    await page.waitForSelector('#root');
    await page.waitForTimeout(2000);
    
    // Try to submit without filling required fields
    const submitButton = await page.locator('button:has-text("Submit"), button[type="submit"], .formio-button-submit');
    await submitButton.click();
    
    // Should show validation errors
    const errorElements = await page.locator('.formio-error-wrapper, .alert-danger, .has-error, .is-invalid');
    const errorCount = await errorElements.count();
    
    expect(errorCount).toBeGreaterThan(0);
    console.log('✅ React form validation test passed - required fields properly validated');
  });
});