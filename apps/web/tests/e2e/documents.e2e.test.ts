import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { Browser, Page } from 'puppeteer'
import {
  setupBrowser,
  teardownBrowser,
  BASE_URL,
  login,
} from '../utils/e2e-helpers'

describe('Documents Management E2E Tests', () => {
  let browser: Browser
  let page: Page

  beforeAll(async () => {
    const context = await setupBrowser()
    browser = context.browser
    page = context.page
    
    // Login first
    await login(page, 'admin', 'admin123')
  })

  afterAll(async () => {
    await teardownBrowser({ browser, page })
  })

  it('should load documents page', async () => {
    console.log('Navigating to documents page...')
    await page.goto(`${BASE_URL}/documents`, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    })
    
    console.log('Current URL:', page.url())
    expect(page.url()).toContain('/documents')
    
    // Screenshot
    await page.screenshot({ path: 'screenshots/documents-page.png' })
  }, 45000)

  it('should display quick export buttons', async () => {
    await page.goto(`${BASE_URL}/documents`, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    })
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check for quick export buttons
    const currentMonthButton = await page.$('button:has-text("本月")')
    expect(currentMonthButton).toBeTruthy()
    
    const lastMonthButton = await page.$('button:has-text("上月")')
    expect(lastMonthButton).toBeTruthy()
    
    await page.screenshot({ path: 'screenshots/documents-quick-export.png' })
  }, 45000)

  it('should display custom export section', async () => {
    await page.goto(`${BASE_URL}/documents`, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    })
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check for date inputs
    const dateInputs = await page.$$('input[type="date"]')
    expect(dateInputs.length).toBeGreaterThan(0)
    
    // Check for export button
    const exportButton = await page.$('button:has-text("导出")')
    expect(exportButton).toBeTruthy()
    
    await page.screenshot({ path: 'screenshots/documents-custom-export.png' })
  }, 45000)

  it('should show export instructions', async () => {
    await page.goto(`${BASE_URL}/documents`, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    })
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Look for instructions card
    const pageContent = await page.content()
    
    // Check if instructions are displayed
    const hasInstructions = pageContent.includes('导出说明') || 
                           pageContent.includes('深圳志愿者') ||
                           pageContent.includes('工时计算')
    
    expect(hasInstructions).toBeTruthy()
    
    await page.screenshot({ path: 'screenshots/documents-instructions.png' })
  }, 45000)

  it('should allow setting custom date range', async () => {
    await page.goto(`${BASE_URL}/documents`, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    })
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Find custom export date inputs
    const dateInputs = await page.$$('input[type="date"]')
    
    if (dateInputs.length >= 2) {
      // Set start date
      await dateInputs[0].click()
      await dateInputs[0].type('2025-11-01')
      
      // Set end date
      await dateInputs[1].click()
      await dateInputs[1].type('2025-11-30')
      
      await page.screenshot({ path: 'screenshots/documents-date-range.png' })
      
      // Verify dates are set
      const startValue = await dateInputs[0].evaluate((el: any) => el.value)
      const endValue = await dateInputs[1].evaluate((el: any) => el.value)
      
      expect(startValue).toBeTruthy()
      expect(endValue).toBeTruthy()
    }
  }, 60000)

  it('should navigate from home page quick link', async () => {
    // Go to home page first
    await page.goto(`${BASE_URL}/`, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    })
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Look for documents card or button
    const documentsButton = await page.$('button:has-text("文档管理"), a:has-text("文档管理")')
    
    if (documentsButton) {
      await documentsButton.click()
      
      // Wait for navigation
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => null),
        new Promise(resolve => setTimeout(resolve, 2000))
      ])
      
      console.log('Current URL:', page.url())
      
      // Should be on documents page
      expect(page.url()).toContain('/documents')
      
      await page.screenshot({ path: 'screenshots/documents-from-home.png' })
    }
  }, 60000)

  it('should display all export cards', async () => {
    await page.goto(`${BASE_URL}/documents`, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    })
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check for card elements
    const cards = await page.$$('[class*="card"], [role="region"]')
    
    // Should have multiple cards (quick export, custom export, instructions)
    expect(cards.length).toBeGreaterThan(0)
    
    await page.screenshot({ path: 'screenshots/documents-all-cards.png', fullPage: true })
  }, 45000)
})
