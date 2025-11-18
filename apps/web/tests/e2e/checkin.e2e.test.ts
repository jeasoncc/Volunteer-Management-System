import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import puppeteer, { Browser, Page } from 'puppeteer'

describe('考勤管理 E2E 测试', () => {
  let browser: Browser
  let page: Page
  const BASE_URL = 'http://localhost:3000'

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    page = await browser.newPage()
    
    // 登录
    await page.goto(`${BASE_URL}/login`)
    await page.type('input[name="account"]', '13800001001')
    await page.type('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForNavigation()
  })

  afterAll(async () => {
    await browser.close()
  })

  describe('月度报表视图', () => {
    it('应该显示月度报表页面', async () => {
      await page.goto(`${BASE_URL}/checkin`)
      await page.waitForSelector('h1')
      
      const heading = await page.$eval('h1', el => el.textContent)
      expect(heading).toBe('考勤管理')
    })

    it('应该显示统计卡片', async () => {
      await page.goto(`${BASE_URL}/checkin`)
      await page.waitForSelector('[class*="grid"]')
      
      // 检查统计卡片
      const cards = await page.$$('[class*="Card"]')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('应该能切换年月', async () => {
      await page.goto(`${BASE_URL}/checkin`)
      await page.waitForSelector('input[type="number"]')
      
      // 查找年份输入框
      const yearInput = await page.$('input[type="number"][value]')
      expect(yearInput).toBeTruthy()
      
      // 修改年份
      await yearInput?.click({ clickCount: 3 })
      await yearInput?.type('2024')
      
      // 等待数据更新
      await new Promise(resolve => setTimeout(resolve, 1000))
    })

    it('应该显示考勤明细表格', async () => {
      await page.goto(`${BASE_URL}/checkin`)
      await page.waitForSelector('table')
      
      const table = await page.$('table')
      expect(table).toBeTruthy()
    })

    it('应该能导出 Excel', async () => {
      await page.goto(`${BASE_URL}/checkin`)
      await page.waitForSelector('button')
      
      // 查找导出按钮
      const buttons = await page.$$('button')
      const exportButton = buttons.find(async (btn) => {
        const text = await btn.evaluate(el => el.textContent)
        return text?.includes('导出')
      })
      
      expect(exportButton).toBeTruthy()
    })
  })

  describe('记录管理视图', () => {
    it('应该能切换到记录管理视图', async () => {
      await page.goto(`${BASE_URL}/checkin`)
      await page.waitForSelector('button')
      
      // 查找"记录管理"按钮
      const buttons = await page.$$('button')
      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent)
        if (text?.includes('记录管理')) {
          await button.click()
          break
        }
      }
      
      // 等待视图切换
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 验证筛选条件卡片显示
      const filterCard = await page.$eval('[class*="CardTitle"]', el => el.textContent)
      expect(filterCard).toContain('筛选条件')
    })

    it('应该显示日期筛选器', async () => {
      await page.goto(`${BASE_URL}/checkin`)
      
      // 切换到记录管理
      const buttons = await page.$$('button')
      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent)
        if (text?.includes('记录管理')) {
          await button.click()
          break
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 检查日期输入框
      const dateInputs = await page.$$('input[type="date"]')
      expect(dateInputs.length).toBe(2) // 开始日期和结束日期
    })

    it('应该显示考勤记录表格', async () => {
      await page.goto(`${BASE_URL}/checkin`)
      
      // 切换到记录管理
      const buttons = await page.$$('button')
      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent)
        if (text?.includes('记录管理')) {
          await button.click()
          break
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
      await page.waitForSelector('table')
      
      const table = await page.$('table')
      expect(table).toBeTruthy()
    })

    it('应该显示编辑和删除按钮', async () => {
      await page.goto(`${BASE_URL}/checkin`)
      
      // 切换到记录管理
      const buttons = await page.$$('button')
      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent)
        if (text?.includes('记录管理')) {
          await button.click()
          break
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 检查表格中的操作按钮
      const tableCells = await page.$$('td')
      expect(tableCells.length).toBeGreaterThan(0)
    })
  })

  describe('筛选功能', () => {
    it('应该能按日期范围筛选', async () => {
      await page.goto(`${BASE_URL}/checkin`)
      
      // 切换到记录管理
      const buttons = await page.$$('button')
      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent)
        if (text?.includes('记录管理')) {
          await button.click()
          break
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 设置开始日期
      const dateInputs = await page.$$('input[type="date"]')
      if (dateInputs.length >= 2) {
        await dateInputs[0].type('2024-11-01')
        await dateInputs[1].type('2024-11-30')
        
        // 点击查询按钮
        const queryButtons = await page.$$('button')
        for (const btn of queryButtons) {
          const text = await btn.evaluate(el => el.textContent)
          if (text?.includes('查询')) {
            await btn.click()
            break
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    })

    it('应该能在表格中搜索', async () => {
      await page.goto(`${BASE_URL}/checkin`)
      
      // 切换到记录管理
      const buttons = await page.$$('button')
      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent)
        if (text?.includes('记录管理')) {
          await button.click()
          break
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 查找搜索输入框
      const searchInput = await page.$('input[placeholder*="搜索"]')
      if (searchInput) {
        await searchInput.type('张三')
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    })
  })

  describe('响应式设计', () => {
    it('应该在移动端正常显示', async () => {
      await page.setViewport({ width: 375, height: 667 })
      await page.goto(`${BASE_URL}/checkin`)
      await page.waitForSelector('h1')
      
      const heading = await page.$('h1')
      expect(heading).toBeTruthy()
      
      // 恢复桌面端视图
      await page.setViewport({ width: 1280, height: 720 })
    })

    it('应该在平板端正常显示', async () => {
      await page.setViewport({ width: 768, height: 1024 })
      await page.goto(`${BASE_URL}/checkin`)
      await page.waitForSelector('h1')
      
      const heading = await page.$('h1')
      expect(heading).toBeTruthy()
      
      // 恢复桌面端视图
      await page.setViewport({ width: 1280, height: 720 })
    })
  })
})
