import puppeteer, { Browser, Page } from 'puppeteer'

const BASE_URL = process.env.VITE_APP_URL || 'http://localhost:3000'
const API_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001'

export interface TestContext {
  browser: Browser
  page: Page
}

/**
 * Setup browser and page for E2E tests
 */
export async function setupBrowser(): Promise<TestContext> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 720 })

  return { browser, page }
}

/**
 * Cleanup browser after tests
 */
export async function teardownBrowser(context: TestContext): Promise<void> {
  if (context.page) {
    await context.page.close()
  }
  if (context.browser) {
    await context.browser.close()
  }
}

/**
 * Login as admin user
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' })
  
  // Fill in login form
  await page.waitForSelector('input[id="account"]')
  await page.type('input[id="account"]', 'admin')
  await page.type('input[id="password"]', 'admin123')
  
  // Click login button
  await page.click('button[type="submit"]')
  
  // Wait for navigation to complete
  await page.waitForNavigation({ waitUntil: 'networkidle2' })
}

/**
 * Login with custom credentials
 */
export async function login(page: Page, account: string, password: string): Promise<void> {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' })
  
  // Fill in login form
  await page.waitForSelector('input[id="account"]')
  await page.type('input[id="account"]', account)
  await page.type('input[id="password"]', password)
  
  // Click login button
  await page.click('button[type="submit"]')
  
  // Wait for navigation to complete
  await page.waitForNavigation({ waitUntil: 'networkidle2' })
}

/**
 * Wait for element to be visible
 */
export async function waitForElement(page: Page, selector: string, timeout = 5000): Promise<void> {
  await page.waitForSelector(selector, { visible: true, timeout })
}

/**
 * Get text content of element
 */
export async function getTextContent(page: Page, selector: string): Promise<string> {
  const element = await page.waitForSelector(selector)
  if (!element) {
    throw new Error(`Element not found: ${selector}`)
  }
  const text = await element.evaluate((el: Element) => el.textContent)
  return text || ''
}

/**
 * Click element and wait for navigation
 */
export async function clickAndWaitForNavigation(page: Page, selector: string): Promise<void> {
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click(selector),
  ])
}

/**
 * Take screenshot for debugging
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true })
}

export { BASE_URL, API_URL }
