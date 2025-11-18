import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import puppeteer, { Browser, Page } from 'puppeteer'

describe('设置页面 E2E 测试', () => {
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

  describe('页面渲染', () => {
    it('应该显示设置页面', async () => {
      await page.goto(`${BASE_URL}/settings`)
      await page.waitForSelector('h1')
      
      const heading = await page.$eval('h1', el => el.textContent)
      expect(heading).toBe('设置')
    })

    it('应该显示个人信息卡片', async () => {
      await page.goto(`${BASE_URL}/settings`)
      await page.waitForSelector('[class*="Card"]')
      
      const cards = await page.$$('[class*="Card"]')
      expect(cards.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('个人信息显示', () => {
    it('应该显示用户姓名', async () => {
      await page.goto(`${BASE_URL}/settings`)
      await page.waitForSelector('p')
      
      const content = await page.evaluate(() => document.body.textContent)
      expect(content).toContain('姓名')
    })

    it('应该显示莲花斋ID', async () => {
      await page.goto(`${BASE_URL}/settings`)
      
      const content = await page.evaluate(() => document.body.textContent)
      expect(content).toContain('莲花斋ID')
    })

    it('应该显示账号信息', async () => {
      await page.goto(`${BASE_URL}/settings`)
      
      const content = await page.evaluate(() => document.body.textContent)
      expect(content).toContain('账号')
    })

    it('应该显示角色信息', async () => {
      await page.goto(`${BASE_URL}/settings`)
      
      const content = await page.evaluate(() => document.body.textContent)
      expect(content).toContain('角色')
    })
  })

  describe('修改密码功能', () => {
    it('应该显示修改密码表单', async () => {
      await page.goto(`${BASE_URL}/settings`)
      await page.waitForSelector('input[type="password"]')
      
      const passwordInputs = await page.$$('input[type="password"]')
      expect(passwordInputs.length).toBe(3) // 当前密码、新密码、确认密码
    })

    it('应该有密码长度验证', async () => {
      await page.goto(`${BASE_URL}/settings`)
      
      const passwordInputs = await page.$$('input[type="password"]')
      const newPasswordInput = passwordInputs[1]
      
      const minLength = await newPasswordInput.evaluate(el => 
        el.getAttribute('minlength')
      )
      expect(minLength).toBe('6')
    })

    it('应该显示修改密码按钮', async () => {
      await page.goto(`${BASE_URL}/settings`)
      await page.waitForSelector('button[type="submit"]')
      
      const submitButton = await page.$('button[type="submit"]')
      const buttonText = await submitButton?.evaluate(el => el.textContent)
      expect(buttonText).toContain('修改密码')
    })

    it('表单应该有必填字段验证', async () => {
      await page.goto(`${BASE_URL}/settings`)
      
      const requiredInputs = await page.$$('input[required]')
      expect(requiredInputs.length).toBeGreaterThan(0)
    })
  })

  describe('通知设置', () => {
    it('应该显示通知设置卡片', async () => {
      await page.goto(`${BASE_URL}/settings`)
      
      const content = await page.evaluate(() => document.body.textContent)
      expect(content).toContain('通知设置')
    })

    it('应该显示考勤提醒选项', async () => {
      await page.goto(`${BASE_URL}/settings`)
      
      const content = await page.evaluate(() => document.body.textContent)
      expect(content).toContain('考勤提醒')
    })

    it('应该显示排班通知选项', async () => {
      await page.goto(`${BASE_URL}/settings`)
      
      const content = await page.evaluate(() => document.body.textContent)
      expect(content).toContain('排班通知')
    })

    it('应该显示系统消息选项', async () => {
      await page.goto(`${BASE_URL}/settings`)
      
      const content = await page.evaluate(() => document.body.textContent)
      expect(content).toContain('系统消息')
    })
  })

  describe('系统信息', () => {
    it('应该显示系统版本', async () => {
      await page.goto(`${BASE_URL}/settings`)
      
      const content = await page.evaluate(() => document.body.textContent)
      expect(content).toContain('版本')
    })

    it('应该显示前端框架信息', async () => {
      await page.goto(`${BASE_URL}/settings`)
      
      const content = await page.evaluate(() => document.body.textContent)
      expect(content).toContain('React')
    })

    it('应该显示后端框架信息', async () => {
      await page.goto(`${BASE_URL}/settings`)
      
      const content = await page.evaluate(() => document.body.textContent)
      expect(content).toContain('Elysia')
    })
  })

  describe('导航功能', () => {
    it('应该能通过侧边栏导航到设置页面', async () => {
      await page.goto(`${BASE_URL}/`)
      await page.waitForSelector('a')
      
      // 查找设置链接
      const links = await page.$$('a')
      for (const link of links) {
        const text = await link.evaluate(el => el.textContent)
        if (text?.includes('设置')) {
          await link.click()
          break
        }
      }
      
      await page.waitForNavigation()
      const url = page.url()
      expect(url).toContain('/settings')
    })

    it('面包屑导航应该正确', async () => {
      await page.goto(`${BASE_URL}/settings`)
      
      const content = await page.evaluate(() => document.body.textContent)
      expect(content).toContain('首页')
      expect(content).toContain('设置')
    })
  })

  describe('响应式设计', () => {
    it('应该在移动端正常显示', async () => {
      await page.setViewport({ width: 375, height: 667 })
      await page.goto(`${BASE_URL}/settings`)
      await page.waitForSelector('h1')
      
      const heading = await page.$('h1')
      expect(heading).toBeTruthy()
      
      // 恢复桌面端视图
      await page.setViewport({ width: 1280, height: 720 })
    })

    it('应该在平板端正常显示', async () => {
      await page.setViewport({ width: 768, height: 1024 })
      await page.goto(`${BASE_URL}/settings`)
      await page.waitForSelector('h1')
      
      const heading = await page.$('h1')
      expect(heading).toBeTruthy()
      
      // 恢复桌面端视图
      await page.setViewport({ width: 1280, height: 720 })
    })
  })

  describe('用户体验', () => {
    it('所有卡片应该有标题', async () => {
      await page.goto(`${BASE_URL}/settings`)
      await page.waitForSelector('[class*="CardTitle"]')
      
      const cardTitles = await page.$$('[class*="CardTitle"]')
      expect(cardTitles.length).toBeGreaterThan(0)
    })

    it('所有卡片应该有描述', async () => {
      await page.goto(`${BASE_URL}/settings`)
      
      const cardDescriptions = await page.$$('[class*="CardDescription"]')
      expect(cardDescriptions.length).toBeGreaterThan(0)
    })

    it('应该有图标美化', async () => {
      await page.goto(`${BASE_URL}/settings`)
      
      const svgs = await page.$$('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })
  })
})
