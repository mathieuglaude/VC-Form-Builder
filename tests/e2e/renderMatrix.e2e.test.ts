import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Browser, chromium, Page } from 'playwright';

describe('Form Rendering Matrix E2E Tests', () => {
  let browser: Browser;
  let page: Page;
  
  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    
    // Listen for console logs to capture form behavior
    page.on('console', msg => {
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should render form in preview mode at /form/15?preview=1', async () => {
    // Navigate to form preview route
    await page.goto('http://localhost:5000/form/15?preview=1');
    
    // Wait for page to load completely
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Verify form title is present
    const title = await page.locator('h1').textContent();
    expect(title).toContain('Plain Text Demo');
    
    // Verify form fields are present
    const fullNameField = await page.locator('input[name="fullName"], input[placeholder*="name"]');
    const agreeTermsField = await page.locator('input[type="checkbox"]');
    
    await expect(fullNameField).toBeVisible();
    await expect(agreeTermsField).toBeVisible();
    
    // Verify preview mode (submit button might be disabled or hidden)
    const cardTitle = await page.locator('.text-xl').textContent();
    expect(cardTitle).toContain('Form Preview');
    
    console.log('✅ Preview mode test passed - form renders correctly at /form/15?preview=1');
  });

  it('should render form in launch mode at /form/15', async () => {
    // Navigate to form launch route
    await page.goto('http://localhost:5000/form/15');
    
    // Wait for page to load completely
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Verify form title is present
    const title = await page.locator('h1').textContent();
    expect(title).toContain('Plain Text Demo');
    
    // Verify form fields are present and functional
    const fullNameField = await page.locator('input[name="fullName"], input[placeholder*="name"]');
    const agreeTermsField = await page.locator('input[type="checkbox"]');
    const submitButton = await page.locator('button:has-text("Submit"), button[type="submit"]');
    
    await expect(fullNameField).toBeVisible();
    await expect(agreeTermsField).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    // Test form interaction
    await fullNameField.fill('Launch Test User');
    await agreeTermsField.check();
    
    // Verify submit button is enabled
    await expect(submitButton).toBeEnabled();
    
    // Verify launch mode (submit enabled and functional)
    const cardTitle = await page.locator('.text-xl').textContent();
    expect(cardTitle).toContain('Complete the Form');
    
    console.log('✅ Launch mode test passed - form renders and is interactive at /form/15');
  });

  it('should render form at public URL /f/plain-text-demo', async () => {
    // Navigate to public form route
    await page.goto('http://localhost:5000/f/plain-text-demo');
    
    // Wait for page to load completely
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Verify form title is present
    const title = await page.locator('h1').textContent();
    expect(title).toContain('Plain Text Demo');
    
    // Verify form fields are present and functional
    const fullNameField = await page.locator('input[name="fullName"], input[placeholder*="name"]');
    const agreeTermsField = await page.locator('input[type="checkbox"]');
    const submitButton = await page.locator('button:has-text("Submit"), button[type="submit"]');
    
    await expect(fullNameField).toBeVisible();
    await expect(agreeTermsField).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    // Test form interaction
    await fullNameField.fill('Public Test User');
    await agreeTermsField.check();
    
    // Verify submit button is enabled
    await expect(submitButton).toBeEnabled();
    
    console.log('✅ Public form test passed - form renders correctly at /f/plain-text-demo');
  });

  it('should maintain consistent form behavior across all routes', async () => {
    const routes = [
      { url: 'http://localhost:5000/debug/plain/15', label: 'Raw Form.io' },
      { url: 'http://localhost:5000/debug/react/15', label: 'React Debug' },
      { url: 'http://localhost:5000/form/15', label: 'Launch Page' },
      { url: 'http://localhost:5000/f/plain-text-demo', label: 'Public Page' }
    ];

    for (const route of routes) {
      console.log(`Testing route: ${route.label} at ${route.url}`);
      
      await page.goto(route.url);
      await page.waitForSelector('input, h1', { timeout: 10000 });
      
      // Basic form field presence check
      const inputCount = await page.locator('input[type="text"], input[placeholder*="name"]').count();
      const checkboxCount = await page.locator('input[type="checkbox"]').count();
      
      expect(inputCount).toBeGreaterThan(0);
      expect(checkboxCount).toBeGreaterThan(0);
      
      console.log(`✅ ${route.label} - Fields present: ${inputCount} text, ${checkboxCount} checkbox`);
    }
    
    console.log('✅ Consistency test passed - all routes render form fields correctly');
  });
});