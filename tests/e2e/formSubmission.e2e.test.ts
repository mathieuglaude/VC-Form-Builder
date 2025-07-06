import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Browser, chromium, Page } from 'playwright';

describe('Form Submission E2E Tests', () => {
  let browser: Browser;
  let page: Page;
  
  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    
    // Listen for console logs and network requests
    page.on('console', msg => {
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/forms/') && response.url().includes('/submit')) {
        console.log(`[API Response] ${response.status()} ${response.url()}`);
      }
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should submit form successfully from launch page /form/15', async () => {
    // Navigate to form launch page
    await page.goto('http://localhost:5000/form/15');
    
    // Wait for form to load
    await page.waitForSelector('input[name="fullName"], input[placeholder*="name"]', { timeout: 10000 });
    
    // Fill out the form
    const fullNameField = await page.locator('input[name="fullName"], input[placeholder*="name"]');
    const agreeTermsField = await page.locator('input[type="checkbox"]');
    
    await fullNameField.fill('Launch Test User');
    await agreeTermsField.check();
    
    // Set up promise to catch success toast
    const toastPromise = page.waitForSelector('.toast:has-text("submitted successfully")', { timeout: 5000 });
    
    // Submit the form
    const submitButton = await page.locator('button:has-text("Submit"), button[type="submit"]');
    await submitButton.click();
    
    // Wait for success feedback
    await toastPromise;
    
    // Verify we're redirected to home page
    await page.waitForURL('http://localhost:5000/', { timeout: 5000 });
    
    console.log('✅ Launch page submission test passed');
  });

  it('should submit form successfully from public page /f/plain-text-demo', async () => {
    // Navigate to public form page
    await page.goto('http://localhost:5000/f/plain-text-demo');
    
    // Wait for form to load
    await page.waitForSelector('input[name="fullName"], input[placeholder*="name"]', { timeout: 10000 });
    
    // Fill out the form
    const fullNameField = await page.locator('input[name="fullName"], input[placeholder*="name"]');
    const agreeTermsField = await page.locator('input[type="checkbox"]');
    
    await fullNameField.fill('Public Test User');
    await agreeTermsField.check();
    
    // Set up promise to catch success toast
    const toastPromise = page.waitForSelector('.toast:has-text("submitted successfully")', { timeout: 5000 });
    
    // Submit the form
    const submitButton = await page.locator('button:has-text("Submit"), button[type="submit"]');
    await submitButton.click();
    
    // Wait for success feedback
    await toastPromise;
    
    console.log('✅ Public page submission test passed');
  });

  it('should validate required fields before submission', async () => {
    await page.goto('http://localhost:5000/f/plain-text-demo');
    
    // Wait for form to load
    await page.waitForSelector('input[name="fullName"], input[placeholder*="name"]', { timeout: 10000 });
    
    // Try to submit without filling required fields
    const submitButton = await page.locator('button:has-text("Submit"), button[type="submit"]');
    
    // Submit button should be disabled for empty required fields
    const isDisabled = await submitButton.isDisabled();
    expect(isDisabled).toBe(true);
    
    // Fill only name field (missing checkbox)
    const fullNameField = await page.locator('input[name="fullName"], input[placeholder*="name"]');
    await fullNameField.fill('Partial User');
    
    // Button should still be disabled
    const stillDisabled = await submitButton.isDisabled();
    expect(stillDisabled).toBe(true);
    
    // Check the required checkbox
    const agreeTermsField = await page.locator('input[type="checkbox"]');
    await agreeTermsField.check();
    
    // Now button should be enabled
    const finallyEnabled = await submitButton.isEnabled();
    expect(finallyEnabled).toBe(true);
    
    console.log('✅ Form validation test passed');
  });

  it('should handle API submission correctly', async () => {
    await page.goto('http://localhost:5000/f/plain-text-demo');
    
    // Wait for form to load
    await page.waitForSelector('input[name="fullName"], input[placeholder*="name"]', { timeout: 10000 });
    
    // Set up network monitoring
    let submissionRequest: any = null;
    page.on('request', request => {
      if (request.url().includes('/api/forms/') && request.url().includes('/submit') && request.method() === 'POST') {
        submissionRequest = request;
      }
    });
    
    // Fill and submit form
    const fullNameField = await page.locator('input[name="fullName"], input[placeholder*="name"]');
    const agreeTermsField = await page.locator('input[type="checkbox"]');
    
    await fullNameField.fill('API Test User');
    await agreeTermsField.check();
    
    const submitButton = await page.locator('button:has-text("Submit"), button[type="submit"]');
    await submitButton.click();
    
    // Wait for API call
    await page.waitForTimeout(2000);
    
    // Verify API request was made
    expect(submissionRequest).toBeTruthy();
    expect(submissionRequest.method()).toBe('POST');
    
    // Parse request body
    const requestBody = JSON.parse(submissionRequest.postData());
    expect(requestBody).toHaveProperty('submissionData');
    expect(requestBody.submissionData).toHaveProperty('fullName', 'API Test User');
    expect(requestBody.submissionData).toHaveProperty('agreeTerms', true);
    expect(requestBody).toHaveProperty('verifiedFields');
    
    console.log('✅ API submission test passed - request format correct');
  });

  it('should disable submit button in preview mode', async () => {
    await page.goto('http://localhost:5000/form/15?preview=1');
    
    // Wait for form to load
    await page.waitForSelector('input[name="fullName"], input[placeholder*="name"]', { timeout: 10000 });
    
    // Fill form fields
    const fullNameField = await page.locator('input[name="fullName"], input[placeholder*="name"]');
    const agreeTermsField = await page.locator('input[type="checkbox"]');
    
    await fullNameField.fill('Preview User');
    await agreeTermsField.check();
    
    // In preview mode, submit should be disabled or hidden
    const submitButtons = await page.locator('button:has-text("Submit"), button[type="submit"]').count();
    
    if (submitButtons > 0) {
      const submitButton = await page.locator('button:has-text("Submit"), button[type="submit"]');
      const isDisabled = await submitButton.isDisabled();
      expect(isDisabled).toBe(true);
    }
    
    // Verify preview mode header
    const cardTitle = await page.locator('.text-xl').textContent();
    expect(cardTitle).toContain('Preview');
    
    console.log('✅ Preview mode test passed - submission properly disabled');
  });
});