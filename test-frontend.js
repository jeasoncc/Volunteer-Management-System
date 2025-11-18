/**
 * 前端测试脚本
 * 使用 Playwright 测试登录和首页显示
 */

const { chromium } = require('playwright');

async function testFrontend() {
  console.log('=== 前端自动化测试 ===\n');
  
  // 使用系统已安装的 Chromium
  const browser = await chromium.launch({
    headless: false, // 显示浏览器窗口，方便调试
    executablePath: '/usr/bin/chromium', // 使用系统的 Chromium
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. 访问登录页
    console.log('1. 访问登录页...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    console.log('   ✅ 登录页加载成功');
    
    // 2. 填写登录表单
    console.log('\n2. 填写登录表单...');
    await page.fill('input[name="account"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    console.log('   ✅ 表单填写完成');
    
    // 3. 点击登录按钮
    console.log('\n3. 点击登录...');
    await page.click('button[type="submit"]');
    
    // 等待跳转到首页
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    console.log('   ✅ 登录成功，已跳转到首页');
    
    // 4. 等待页面加载完成
    console.log('\n4. 等待首页数据加载...');
    await page.waitForTimeout(2000); // 等待 API 请求完成
    
    // 5. 检查义工总数
    console.log('\n5. 检查义工总数显示...');
    
    // 查找包含"义工总数"的卡片
    const volunteerCard = await page.locator('text=义工总数').locator('..').locator('..');
    
    if (await volunteerCard.count() > 0) {
      // 获取数字
      const numberElement = await volunteerCard.locator('.text-2xl').first();
      const volunteerCount = await numberElement.textContent();
      
      console.log(`   📊 义工总数: ${volunteerCount}`);
      
      if (volunteerCount === '0') {
        console.log('   ❌ 义工总数显示为 0（错误）');
        
        // 截图保存
        await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
        console.log('   📸 已保存错误截图: error-screenshot.png');
        
        // 检查网络请求
        console.log('\n6. 检查网络请求...');
        const apiResponse = await page.evaluate(async () => {
          const response = await fetch('/volunteer?page=1&pageSize=1', {
            credentials: 'include'
          });
          return await response.json();
        });
        
        console.log('   API 响应:', JSON.stringify(apiResponse, null, 2));
        
        return false;
      } else {
        console.log('   ✅ 义工总数显示正常');
        
        // 截图保存
        await page.screenshot({ path: 'success-screenshot.png', fullPage: true });
        console.log('   📸 已保存成功截图: success-screenshot.png');
        
        return true;
      }
    } else {
      console.log('   ❌ 未找到义工总数卡片');
      await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
    console.log('📸 已保存错误截图: error-screenshot.png');
    return false;
  } finally {
    await browser.close();
  }
}

// 运行测试
testFrontend().then(success => {
  console.log('\n=== 测试完成 ===');
  if (success) {
    console.log('✅ 所有测试通过');
    process.exit(0);
  } else {
    console.log('❌ 测试失败');
    process.exit(1);
  }
}).catch(error => {
  console.error('测试执行出错:', error);
  process.exit(1);
});
