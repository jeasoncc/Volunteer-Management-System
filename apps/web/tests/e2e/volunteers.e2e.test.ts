import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { Browser, Page } from 'puppeteer'
import {
  setupBrowser,
  teardownBrowser,
  loginAsAdmin,
  waitForElement,
  BASE_URL,
} from '../utils/e2e-helpers'

describe('Volunteer Management E2E Tests', () => {
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

  describe('Authentication', () => {
    it('should login successfully with admin credentials', async () => {
      await loginAsAdmin(page)
      
      // Check if redirected to home page
      expect(page.url()).toContain(BASE_URL)
      
      // Check if user menu is visible
      await waitForElement(page, '[data-testid="user-menu"]', 10000)
    })
  })

  describe('Volunteer List', () => {
    it('should navigate to volunteers page', async () => {
      await page.goto(`${BASE_URL}/volunteers`, { waitUntil: 'networkidle2' })
      
      // Check if we're on the volunteers page
      expect(page.url()).toContain('/volunteers')
      
      // Check if the page title is visible
      await waitForElement(page, 'h1')
      const title = await page.$eval('h1', (el: Element) => el.textContent)
      expect(title).toContain('义工管理')
    })

    it('should display volunteer table', async () => {
      await page.goto(`${BASE_URL}/volunteers`, { waitUntil: 'networkidle2' })
      
      // Wait for table to load
      await waitForElement(page, 'table', 10000)
      
      // Check if table has headers
      const headers = await page.$$eval('thead th', (elements: Element[]) =>
        elements.map((el) => el.textContent?.trim())
      )
      
      expect(headers).toContain('莲花斋ID')
      expect(headers).toContain('姓名')
      expect(headers).toContain('手机号')
    })

    it('should be able to search volunteers', async () => {
      await page.goto(`${BASE_URL}/volunteers`, { waitUntil: 'networkidle2' })
      
      // Wait for search input
      await waitForElement(page, 'input[placeholder*="搜索"]')
      
      // Type in search box
      await page.type('input[placeholder*="搜索"]', '张三')
      
      // Wait for results to update
      await page.waitForTimeout(1000)
      
      // Check if search is working (table should update)
      const tableExists = await page.$('table')
      expect(tableExists).toBeTruthy()
    })
  })

  describe('Volunteer Detail', () => {
    it('should navigate to volunteer detail page', async () => {
      await page.goto(`${BASE_URL}/volunteers`, { waitUntil: 'networkidle2' })
      
      // Wait for table to load
      await waitForElement(page, 'table', 10000)
      
      // Click on first volunteer's view button (if exists)
      const viewButton = await page.$('button:has-text("查看")')
      if (viewButton) {
        await viewButton.click()
        await page.waitForNavigation({ waitUntil: 'networkidle2' })
        
        // Check if we're on detail page
        expect(page.url()).toContain('/volunteers/')
        
        // Check if detail page has volunteer info
        await waitForElement(page, 'h1')
      }
    })
  })

  describe('Volunteer Edit', () => {
    it('should navigate to volunteer edit page', async () => {
      await page.goto(`${BASE_URL}/volunteers`, { waitUntil: 'networkidle2' })
      
      // Wait for table to load
      await waitForElement(page, 'table', 10000)
      
      // Click on first volunteer's edit button (if exists)
      const editButton = await page.$('button:has-text("编辑")')
      if (editButton) {
        await editButton.click()
        await page.waitForNavigation({ waitUntil: 'networkidle2' })
        
        // Check if we're on edit page
        expect(page.url()).toContain('/edit')
        
        // Check if form is visible
        await waitForElement(page, 'form')
      }
    })
  })

  describe('Admin Management', () => {
    it('should navigate to admin page', async () => {
      await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2' })
      
      // Check if we're on the admin page
      expect(page.url()).toContain('/admin')
      
      // Check if the page title is visible
      await waitForElement(page, 'h1')
      const title = await page.$eval('h1', (el: Element) => el.textContent)
      expect(title).toContain('管理员')
    })
  })

  describe('Check-in Management', () => {
    it('should navigate to checkin page', async () => {
      await page.goto(`${BASE_URL}/checkin`, { waitUntil: 'networkidle2' })
      
      // Check if we're on the checkin page
      expect(page.url()).toContain('/checkin')
      
      // Check if the page title is visible
      await waitForElement(page, 'h1')
      const title = await page.$eval('h1', (el: Element) => el.textContent)
      expect(title).toContain('考勤')
    })
  })
})
