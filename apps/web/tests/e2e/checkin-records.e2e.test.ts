import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { Browser, Page } from 'puppeteer'
import {
  setupBrowser,
  teardownBrowser,
  BASE_URL,
  login,
} from '../utils/e2e-helpers'

describe('Checkin Records E2E Tests', () => {
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

  it('should load checkin records page', async () => {
    console.log('Navigating to checkin records page...')
    await page.goto(`${BASE_URL}/checkin/records`, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    })
    
    console.log('Current URL:', page.url())
    expect(page.url()).toContain('/checkin/records')
    
    // Screenshot
    await page.screenshot({ path: 'screenshots/checkin-records-page.png' })
  }, 45000)

  it('should display filter controls', async () => {
    await page.goto(`${BASE_URL}/checkin/records`, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    })
    
    // Check for date inputs
    const startDateInput = await page.$('input[type="date"]')
    expect(startDateInput).toBeTruthy()
    
    // Check for lotus ID filter
    const lotusIdInput = await page.$('input[placeholder*="莲花斋ID"], input[placeholder*="ID"]')
    expect(lotusIdInput).toBeTruthy()
    
    // Check for query button
    const queryButton = await page.$('button:has-text("查询")')
    expect(queryButton).toBeTruthy()
    
    await page.screenshot({ path: 'screenshots/checkin-records-filters.png' })
  }, 45000)

  it('should filter records by date range', async () => {
    await page.goto(`${BASE_URL}/checkin/records`, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    })
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Find date inputs
    const dateInputs = await page.$$('input[type="date"]')
    if (dateInputs.length >= 2) {
      // Set start date
      await dateInputs[0].click({ clickCount: 3 })
      await dateInputs[0].type('2025-11-01')
      
      // Set end date
      await dateInputs[1].click({ clickCount: 3 })
      await dateInputs[1].type('2025-11-30')
      
      // Click query button
      const queryButton = await page.$('button:has-text("查询")')
      if (queryButton) {
        await queryButton.click()
        
        // Wait for results to load
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        await page.screenshot({ path: 'screenshots/checkin-records-filtered.png' })
      }
    }
  }, 60000)

  it('should filter records by lotus ID', async () => {
    await page.goto(`${BASE_URL}/checkin/records`, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    })
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Find lotus ID input
    const lotusIdInput = await page.$('input[placeholder*="莲花斋ID"], input[placeholder*="ID"]')
    if (lotusIdInput) {
      await lotusIdInput.click()
      await lotusIdInput.type('LZ-V-6020135')
      
      // Click query button
      const queryButton = await page.$('button:has-text("查询")')
      if (queryButton) {
        await queryButton.click()
        
        // Wait for results
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        await page.screenshot({ path: 'screenshots/checkin-records-by-id.png' })
      }
    }
  }, 60000)

  it('should display checkin records table', async () => {
    await page.goto(`${BASE_URL}/checkin/records`, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    })
    
    // Wait for table to load
    await page.waitForSelector('table, [role="table"]', { timeout: 10000 }).catch(() => null)
    
    // Check if table exists
    const table = await page.$('table, [role="table"]')
    expect(table).toBeTruthy()
    
    await page.screenshot({ path: 'screenshots/checkin-records-table.png' })
  }, 45000)

  it('should navigate back to checkin management', async () => {
    await page.goto(`${BASE_URL}/checkin/records`, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    })
    
    // Look for back button
    const backButton = await page.$('button:has-text("返回"), a:has-text("返回")')
    if (backButton) {
      await backButton.click()
      
      // Wait for navigation
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => null),
        new Promise(resolve => setTimeout(resolve, 2000))
      ])
      
      console.log('After back URL:', page.url())
      
      // Should be on checkin page
      expect(page.url()).toContain('/checkin')
      expect(page.url()).not.toContain('/records')
    }
  }, 45000)
})
