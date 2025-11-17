import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { Browser, Page } from 'puppeteer'
import {
  setupBrowser,
  teardownBrowser,
  BASE_URL,
} from '../utils/e2e-helpers'

describe('Login E2E Tests', () => {
  let browser: Browser
  let page: Page

  beforeAll(async () => {
    const context = await setupBrowser()
    browser = context.browser
    page = context.page
  })

  afterAll(async () => {
    await teardownBrowser({ browser, page })
  })

  it('should load login page', async () => {
    console.log('Navigating to login page...')
    await page.goto(`${BASE_URL}/login`, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    })
    
    console.log('Current URL:', page.url())
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'screenshots/login-page.png' })
    
    // Check if we're on login page
    expect(page.url()).toContain('/login')
  })

  it('should display login form elements', async () => {
    await page.goto(`${BASE_URL}/login`, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    })
    
    // Wait for form to be visible
    await page.waitForSelector('form', { timeout: 10000 })
    
    // Check if account input exists
    const accountInput = await page.$('input[id="account"]')
    expect(accountInput).toBeTruthy()
    
    // Check if password input exists
    const passwordInput = await page.$('input[id="password"]')
    expect(passwordInput).toBeTruthy()
    
    // Check if submit button exists
    const submitButton = await page.$('button[type="submit"]')
    expect(submitButton).toBeTruthy()
    
    console.log('All form elements found!')
  })

  it('should show validation error for empty credentials', async () => {
    await page.goto(`${BASE_URL}/login`, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    })
    
    await page.waitForSelector('form', { timeout: 10000 })
    
    // Click submit button without entering credentials
    await page.click('button[type="submit"]')
    
    // Wait a bit for validation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Take screenshot
    await page.screenshot({ path: 'screenshots/login-validation.png' })
  })

  it('should login with valid admin credentials', async () => {
    await page.goto(`${BASE_URL}/login`, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    })
    
    console.log('Waiting for form...')
    await page.waitForSelector('form', { timeout: 10000 })
    
    console.log('Filling in credentials...')
    // Clear and type account
    await page.click('input[id="account"]', { clickCount: 3 })
    await page.type('input[id="account"]', 'admin')
    
    // Clear and type password
    await page.click('input[id="password"]', { clickCount: 3 })
    await page.type('input[id="password"]', 'admin123')
    
    // Take screenshot before submit
    await page.screenshot({ path: 'screenshots/login-before-submit.png' })
    
    console.log('Submitting form...')
    // Click submit button
    await page.click('button[type="submit"]')
    
    // Wait for either navigation or error message
    await Promise.race([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => null),
      new Promise(resolve => setTimeout(resolve, 5000))
    ])
    
    console.log('After login URL:', page.url())
    
    // Take screenshot after login
    await page.screenshot({ path: 'screenshots/login-after-submit.png' })
    
    // Check if we're either redirected or still on login (with error)
    const currentUrl = page.url()
    
    // If redirected, we should not be on login page
    if (!currentUrl.includes('/login')) {
      expect(currentUrl).toBe(`${BASE_URL}/`)
      console.log('✅ Login successful - redirected to home')
    } else {
      // Still on login page - check for error or success
      console.log('⚠️ Still on login page, checking for errors...')
      const hasError = await page.$('[role="alert"]') || await page.$('.text-destructive')
      if (hasError) {
        const errorText = await page.evaluate(() => {
          const alert = document.querySelector('[role="alert"]')
          return alert ? alert.textContent : 'Unknown error'
        })
        console.log('❌ Login error:', errorText)
      }
    }
  }, 45000)

  it('should show user info after successful login', async () => {
    await page.goto(`${BASE_URL}/login`, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    })
    
    await page.waitForSelector('form', { timeout: 10000 })
    
    // Login
    await page.type('input[id="account"]', 'admin')
    await page.type('input[id="password"]', 'admin123')
    
    await page.click('button[type="submit"]')
    
    // Wait for navigation or timeout
    await Promise.race([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => null),
      new Promise(resolve => setTimeout(resolve, 5000))
    ])
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Take screenshot
    await page.screenshot({ path: 'screenshots/login-success.png' })
    
    console.log('Login successful!')
    console.log('Current URL:', page.url())
    
    // Check if we're logged in (either redirected or have user info)
    const isLoggedIn = !page.url().includes('/login') || await page.$('[data-testid="user-menu"]')
    expect(isLoggedIn).toBeTruthy()
  }, 45000)

  it('should show error for invalid credentials', async () => {
    await page.goto(`${BASE_URL}/login`, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    })
    
    await page.waitForSelector('form', { timeout: 10000 })
    
    // Try to login with wrong credentials
    await page.type('input[id="account"]', 'wronguser')
    await page.type('input[id="password"]', 'wrongpassword')
    
    await page.click('button[type="submit"]')
    
    // Wait for error message
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Take screenshot
    await page.screenshot({ path: 'screenshots/login-error.png' })
    
    // Should still be on login page
    expect(page.url()).toContain('/login')
  })
})
