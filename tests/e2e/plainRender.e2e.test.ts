import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Browser, chromium, Page } from 'playwright';

describe('Plain Form.io Render E2E Test', () => {
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

  it('should render plain form and handle submission', async () => {
    // Navigate to debug route
    await page.goto('http://localhost:5000/debug/plain/15');
    
    // Wait for Form.io to load and render
    await page.waitForSelector('#formio-container form', { timeout: 10000 });
    
    // Verify form fields are present
    const fullNameField = await page.locator('input[name="data[fullName]"]');
    const agreeTermsField = await page.locator('input[name="data[agreeTerms]"]');
    
    await expect(fullNameField).toBeVisible();
    await expect(agreeTermsField).toBeVisible();
    
    // Fill out the form
    await fullNameField.fill('Ada Lovelace');
    await agreeTermsField.check();
    
    // Set up console log listener for submission
    const submissionPromise = new Promise((resolve) => {
      page.on('console', (msg) => {
        if (msg.text().includes('Form Submission:')) {
          resolve(msg.text());
        }
      });
    });
    
    // Submit the form
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Wait for submission log
    const submissionLog = await submissionPromise;
    
    // Verify submission contains expected data
    expect(submissionLog).toContain('Ada Lovelace');
    
    // Verify submission UI appears
    await page.waitForSelector('#submission-log', { state: 'visible' });
    const submissionData = await page.locator('#submission-data').textContent();
    
    expect(submissionData).toContain('"fullName":"Ada Lovelace"');
    expect(submissionData).toContain('"agreeTerms":true');
    
    console.log('✅ Plain Form.io render test passed - form renders and submits correctly');
  });

  it('should validate required fields', async () => {
    await page.goto('http://localhost:5000/debug/plain/15');
    
    // Wait for form to load
    await page.waitForSelector('#formio-container form');
    
    // Try to submit without filling required fields
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Should show validation errors
    const errorElements = await page.locator('.formio-error-wrapper, .alert-danger, .has-error');
    const errorCount = await errorElements.count();
    
    expect(errorCount).toBeGreaterThan(0);
    console.log('✅ Form validation test passed - required fields properly validated');
  });
});