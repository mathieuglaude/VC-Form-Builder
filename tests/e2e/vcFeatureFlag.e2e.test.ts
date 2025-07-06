import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Browser, chromium, Page } from 'playwright';

describe('VC Feature Flag E2E Tests', () => {
  let browser: Browser;
  let page: Page;
  
  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should NOT show verification panel when VITE_ENABLE_VC=false', async () => {
    // Navigate to form page
    await page.goto('http://localhost:5000/f/plain-text-demo');
    
    // Wait for form to load
    await page.waitForSelector('input[name="fullName"], input[placeholder*="name"]', { timeout: 10000 });
    
    // Check that no verification panel is visible
    const verificationPanels = await page.locator('[data-testid="verification-panel"], .verification-panel, :has-text("Credential Verification")').count();
    expect(verificationPanels).toBe(0);
    
    // Check for the placeholder text indicating VC is disabled
    const placeholderText = await page.locator(':has-text("Available when VC mode is enabled")').count();
    expect(placeholderText).toBeGreaterThan(0);
    
    console.log('✅ Verification panel correctly hidden when VC flag is false');
  });

  it('should show plain form submission workflow when VC disabled', async () => {
    await page.goto('http://localhost:5000/f/plain-text-demo');
    
    // Wait for form to load
    await page.waitForSelector('input[name="fullName"], input[placeholder*="name"]', { timeout: 10000 });
    
    // Fill out form normally
    const fullNameField = await page.locator('input[name="fullName"], input[placeholder*="name"]');
    const agreeTermsField = await page.locator('input[type="checkbox"]');
    
    await fullNameField.fill('Plain Form User');
    await agreeTermsField.check();
    
    // Submit should work normally without any VC logic
    const submitButton = await page.locator('button:has-text("Submit"), button[type="submit"]');
    await submitButton.click();
    
    // Should see success toast
    await page.waitForSelector('.toast:has-text("submitted successfully")', { timeout: 5000 });
    
    console.log('✅ Plain form submission works correctly when VC disabled');
  });

  it('should NOT make API calls to VC endpoints when VC disabled', async () => {
    // Monitor network requests
    const vcApiCalls: string[] = [];
    
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/proofs/') || url.includes('/api/define-proof/') || url.includes('/api/oca/')) {
        vcApiCalls.push(url);
      }
    });
    
    await page.goto('http://localhost:5000/f/plain-text-demo');
    
    // Wait for form to load and interact with it
    await page.waitForSelector('input[name="fullName"], input[placeholder*="name"]', { timeout: 10000 });
    
    const fullNameField = await page.locator('input[name="fullName"], input[placeholder*="name"]');
    await fullNameField.fill('Test User');
    
    // Wait a bit to ensure no VC API calls are made
    await page.waitForTimeout(3000);
    
    // Verify no VC API calls were made
    expect(vcApiCalls).toHaveLength(0);
    
    console.log('✅ No VC API calls made when feature flag is disabled');
  });

  it('should display feature flag status in console logs', async () => {
    const consoleLogs: string[] = [];
    
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });
    
    await page.goto('http://localhost:5000/f/plain-text-demo');
    await page.waitForSelector('input[name="fullName"], input[placeholder*="name"]', { timeout: 10000 });
    
    // Check that FormPage logs show VC is disabled
    const vcFlagLogs = consoleLogs.filter(log => 
      log.includes('[FormPage]') && log.includes('vcFlag')
    );
    
    expect(vcFlagLogs.length).toBeGreaterThan(0);
    
    // Parse the log to verify flag status
    const flagLog = vcFlagLogs[0];
    expect(flagLog).toContain('vcFlag":"false"') || expect(flagLog).toContain('"vcFlag":false');
    
    console.log('✅ Console logs correctly show VC flag status');
  });
});