import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { Browser, Page } from 'puppeteer'
import {
  setupBrowser,
  teardownBrowser,
  BASE_URL,
  login,
} from '../utils/e2e-helpers'

describe('Volunteer Edit E2E Tests', () => {
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

  it('should navigate to volunteer edit page from detail page', async () => {
    console.log('Navigating to volunteers page...')
    await page.goto(`${BASE_URL}/volunteers`, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    })
    
    // Wait for table to load
    await page.waitForSelector('table', { timeout: 10000 })
    
    // Click on first volunteer's view button
    const viewButton = await page.$('button:has-text("查看")')
    if (viewButton) {
      await viewButton.click()
      
      // Wait for navigation to detail page
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 })
      
      // Screenshot detail page
      await page.screenshot({ path: 'screenshots/volunteer-detail.png' })
      
      // Click edit button
      const editButton = await page.$('button:has-text("编辑"), a:has-text("编辑")')
      if (editButton) {
        await editButton.click()
        
        // Wait for navigation to edit page
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 })
        
        console.log('Current URL:', page.url())
        expect(page.url()).toContain('/edit')
        
        // Screenshot edit page
        await page.screenshot({ path: 'screenshots/volunteer-edit.png' })
      }
    }
  }, 60000)

  it('should display volunteer edit form with pre-filled data', async () => {
    // Assuming we have a test volunteer with known lotusId
    const testLotusId = 'LZ-V-6020135'
    
    await page.goto(`${BASE_URL}/volunteers/${testLotusId}/edit`, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    })
    
    // Wait for form to load
    await page.waitForSelector('form', { timeout: 10000 })
    
    // Check if form inputs exist
    const nameInput = await page.$('input[name="name"], input[placeholder*="姓名"]')
    expect(nameInput).toBeTruthy()
    
    const phoneInput = await page.$('input[name="phone"], input[placeholder*="手机"]')
    expect(phoneInput).toBeTruthy()
    
    // Check if inputs have values (pre-filled)
    const nameValue = await page.$eval(
      'input[name="name"], input[placeholder*="姓名"]', 
      (el: any) => el.value
    ).catch(() => '')
    
    console.log('Name field value:', nameValue)
    expect(nameValue).toBeTruthy()
    
    await page.screenshot({ path: 'screenshots/volunteer-edit-form.png' })
  }, 45000)

  it('should update volunteer information', async () => {
    const testLotusId = 'LZ-V-6020135'
    
    await page.goto(`${BASE_URL}/volunteers/${testLotusId}/edit`, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    })
    
    await page.waitForSelector('form', { timeout: 10000 })
    
    // Update email field
    const emailInput = await page.$('input[type="email"], input[name="email"]')
    if (emailInput) {
      await emailInput.click({ clickCount: 3 })
      await emailInput.type('updated@example.com')
    }
    
    // Update wechat field
    const wechatInput = await page.$('input[name="wechat"], input[placeholder*="微信"]')
    if (wechatInput) {
      await wechatInput.click({ clickCount: 3 })
      await wechatInput.type('updated_wechat')
    }
    
    await page.screenshot({ path: 'screenshots/volunteer-edit-updated.png' })
    
    // Find and click submit button
    const submitButton = await page.$('button[type="submit"], button:has-text("保存"), button:has-text("提交")')
    if (submitButton) {
      await submitButton.click()
      
      // Wait for navigation or success message
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => null),
        new Promise(resolve => setTimeout(resolve, 3000))
      ])
      
      console.log('After submit URL:', page.url())
      await page.screenshot({ path: 'screenshots/volunteer-edit-success.png' })
      
      // Should redirect back to detail page or volunteers list
      expect(page.url()).not.toContain('/edit')
    }
  }, 60000)

  it('should cancel editing and return to previous page', async () => {
    const testLotusId = 'LZ-V-6020135'
    
    await page.goto(`${BASE_URL}/volunteers/${testLotusId}/edit`, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    })
    
    await page.waitForSelector('form', { timeout: 10000 })
    
    // Find cancel button
    const cancelButton = await page.$('button:has-text("取消"), button:has-text("返回")')
    if (cancelButton) {
      await cancelButton.click()
      
      // Wait for navigation
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => null),
        new Promise(resolve => setTimeout(resolve, 2000))
      ])
      
      console.log('After cancel URL:', page.url())
      
      // Should not be on edit page anymore
      expect(page.url()).not.toContain('/edit')
    }
  }, 45000)
})
