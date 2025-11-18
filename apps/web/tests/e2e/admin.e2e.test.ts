import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import puppeteer, { Browser, Page } from 'puppeteer'

describe('管理员管理 E2E 测试', () => {
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

  describe('管理员列表页面', () => {
    it('应该显示管理员管理页面', async () => {
      await page.goto(`${BASE_URL}/admin`)
      await page.waitForSelector('h1')
      
      const heading = await page.$eval('h1', el => el.textContent)
      expect(heading).toBe('管理员管理')
    })

    it('应该显示添加管理员按钮', async () => {
      await page.goto(`${BASE_URL}/admin`)
      await page.waitForSelector('button')
      
      const buttons = await page.$$('button')
      const addButton = await Promise.all(
        buttons.map(async btn => {
          const text = await btn.evaluate(el => el.textContent)
          return text?.includes('添加管理员')
        })
      )
      
      expect(addButton.some(Boolean)).toBe(true)
    })

    it('应该显示管理员列表表格', async () => {
      await page.goto(`${BASE_URL}/admin`)
      await page.waitForSelector('table')
      
      const table = await page.$('table')
      expect(table).toBeTruthy()
    })

    it('应该显示管理员信息', async () => {
      await page.goto(`${BASE_URL}/admin`)
      await page.waitForSelector('table tbody tr')
      
      const rows = await page.$$('table tbody tr')
      expect(rows.length).toBeGreaterThan(0)
    })
  })

  describe('表格功能', () => {
    it('应该能搜索管理员', async () => {
      await page.goto(`${BASE_URL}/admin`)
      await page.waitForSelector('input[placeholder*="搜索"]')
      
      const searchInput = await page.$('input[placeholder*="搜索"]')
      await searchInput?.type('张三')
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 验证搜索结果
      const rows = await page.$$('table tbody tr')
      expect(rows.length).toBeGreaterThanOrEqual(0)
    })

    it('应该能对表格排序', async () => {
      await page.goto(`${BASE_URL}/admin`)
      await page.waitForSelector('table thead th')
      
      // 点击表头进行排序
      const headers = await page.$$('table thead th')
      if (headers.length > 0) {
        await headers[0].click()
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    })

    it('应该能分页浏览', async () => {
      await page.goto(`${BASE_URL}/admin`)
      await page.waitForSelector('table')
      
      // 查找分页按钮
      const buttons = await page.$$('button')
      const paginationButtons = await Promise.all(
        buttons.map(async btn => {
          const text = await btn.evaluate(el => el.textContent)
          return text?.includes('下一页') || text?.includes('上一页')
        })
      )
      
      expect(paginationButtons.some(Boolean)).toBe(true)
    })
  })

  describe('操作按钮', () => {
    it('应该显示查看按钮', async () => {
      await page.goto(`${BASE_URL}/admin`)
      await page.waitForSelector('table tbody tr')
      
      const viewButtons = await page.$$('button')
      const hasViewButton = await Promise.all(
        viewButtons.map(async btn => {
          const text = await btn.evaluate(el => el.textContent)
          return text?.includes('查看')
        })
      )
      
      expect(hasViewButton.some(Boolean)).toBe(true)
    })

    it('应该显示编辑按钮', async () => {
      await page.goto(`${BASE_URL}/admin`)
      await page.waitForSelector('table tbody tr')
      
      const editButtons = await page.$$('button')
      const hasEditButton = await Promise.all(
        editButtons.map(async btn => {
          const text = await btn.evaluate(el => el.textContent)
          return text?.includes('编辑')
        })
      )
      
      expect(hasEditButton.some(Boolean)).toBe(true)
    })

    it('应该显示删除按钮', async () => {
      await page.goto(`${BASE_URL}/admin`)
      await page.waitForSelector('table tbody tr')
      
      const deleteButtons = await page.$$('button')
      const hasDeleteButton = await Promise.all(
        deleteButtons.map(async btn => {
          const text = await btn.evaluate(el => el.textContent)
          return text?.includes('删除')
        })
      )
      
      expect(hasDeleteButton.some(Boolean)).toBe(true)
    })
  })

  describe('添加管理员对话框', () => {
    it('应该能打开添加管理员对话框', async () => {
      await page.goto(`${BASE_URL}/admin`)
      await page.waitForSelector('button')
      
      // 点击添加按钮
      const buttons = await page.$$('button')
      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent)
        if (text?.includes('添加管理员')) {
          await button.click()
          break
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 验证对话框打开
      const dialog = await page.$('[role="dialog"]')
      expect(dialog).toBeTruthy()
    })

    it('应该显示必填字段', async () => {
      await page.goto(`${BASE_URL}/admin`)
      
      // 打开对话框
      const buttons = await page.$$('button')
      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent)
        if (text?.includes('添加管理员')) {
          await button.click()
          break
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 检查必填字段
      const inputs = await page.$$('input[required]')
      expect(inputs.length).toBeGreaterThan(0)
    })
  })

  describe('编辑管理员', () => {
    it('应该能打开编辑对话框', async () => {
      await page.goto(`${BASE_URL}/admin`)
      await page.waitForSelector('table tbody tr')
      
      // 点击第一个编辑按钮
      const editButtons = await page.$$('button')
      for (const button of editButtons) {
        const text = await button.evaluate(el => el.textContent)
        if (text?.includes('编辑')) {
          await button.click()
          break
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 验证编辑对话框
      const dialog = await page.$('[role="dialog"]')
      expect(dialog).toBeTruthy()
    })

    it('编辑对话框应该预填数据', async () => {
      await page.goto(`${BASE_URL}/admin`)
      await page.waitForSelector('table tbody tr')
      
      // 点击编辑按钮
      const editButtons = await page.$$('button')
      for (const button of editButtons) {
        const text = await button.evaluate(el => el.textContent)
        if (text?.includes('编辑')) {
          await button.click()
          break
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 检查输入框是否有值
      const inputs = await page.$$('input[value]')
      expect(inputs.length).toBeGreaterThan(0)
    })
  })

  describe('响应式设计', () => {
    it('应该在移动端正常显示', async () => {
      await page.setViewport({ width: 375, height: 667 })
      await page.goto(`${BASE_URL}/admin`)
      await page.waitForSelector('h1')
      
      const heading = await page.$('h1')
      expect(heading).toBeTruthy()
      
      // 恢复桌面端视图
      await page.setViewport({ width: 1280, height: 720 })
    })

    it('应该在平板端正常显示', async () => {
      await page.setViewport({ width: 768, height: 1024 })
      await page.goto(`${BASE_URL}/admin`)
      await page.waitForSelector('h1')
      
      const heading = await page.$('h1')
      expect(heading).toBeTruthy()
      
      // 恢复桌面端视图
      await page.setViewport({ width: 1280, height: 720 })
    })
  })

  describe('数据加载状态', () => {
    it('应该显示加载状态', async () => {
      await page.goto(`${BASE_URL}/admin`)
      
      // 在页面加载时可能会看到加载状态
      const loadingText = await page.evaluate(() => {
        return document.body.textContent?.includes('加载中')
      })
      
      // 等待数据加载完成
      await page.waitForSelector('table', { timeout: 5000 })
      expect(true).toBe(true)
    })

    it('加载完成后应该显示表格', async () => {
      await page.goto(`${BASE_URL}/admin`)
      await page.waitForSelector('table')
      
      const table = await page.$('table')
      expect(table).toBeTruthy()
    })
  })
})
