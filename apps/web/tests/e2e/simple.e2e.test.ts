import { describe, it, expect } from 'vitest'
import puppeteer from 'puppeteer'

describe('Simple E2E Test', () => {
  it('should launch browser and navigate to Google', async () => {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    
    const page = await browser.newPage()
    await page.goto('https://www.google.com', { waitUntil: 'networkidle0' })
    
    const title = await page.title()
    console.log('Page title:', title)
    
    expect(title).toContain('Google')
    
    await browser.close()
  }, 30000)

  it('should navigate to localhost:3000', async () => {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    
    const page = await browser.newPage()
    
    try {
      await page.goto('http://localhost:3000', { 
        waitUntil: 'networkidle0',
        timeout: 10000 
      })
      
      const url = page.url()
      console.log('Current URL:', url)
      
      expect(url).toContain('localhost:3000')
    } catch (error) {
      console.error('Error navigating to localhost:3000:', error)
      throw error
    } finally {
      await browser.close()
    }
  }, 30000)
})
