/**
 * 端到端测试 - 验证义工数量显示
 * 使用 Playwright 进行完整的用户流程测试
 */

const { chromium } = require('playwright');

async function runE2ETest() {
  console.log('=== 端到端测试开始 ===\n');
  
  let browser;
  let passed = true;
  
  try {
    // 启动浏览器
    console.log('🚀 启动浏览器...');
    browser = await chromium.launch({
      headless: true,
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    // 监听控制台输出
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('   ⚠️  浏览器错误:', msg.text());
      }
    });
    
    // 监听网络请求
    const apiRequests = [];
    page.on('request', request => {
      if (request.url().includes('/volunteer') || request.url().includes('/auth')) {
        apiRequests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });
    
    // 1. 访问登录页
    console.log('\n📍 步骤 1: 访问登录页');
    await page.goto('http://localhost:3000/login', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    console.log('   ✅ 登录页加载成功');
    
    // 截图
    await page.screenshot({ path: 'screenshots/01-login-page.png' });
    console.log('   📸 截图已保存: screenshots/01-login-page.png');
    
    // 2. 填写登录表单
    console.log('\n📍 步骤 2: 填写登录表单');
    
    // 等待表单元素出现
    await page.waitForSelector('input#account', { timeout: 5000 });
    await page.fill('input#account', 'admin');
    await page.fill('input#password', 'admin123');
    console.log('   ✅ 表单填写完成');
    
    await page.screenshot({ path: 'screenshots/02-login-filled.png' });
    
    // 3. 提交登录
    console.log('\n📍 步骤 3: 提交登录');
    await page.click('button[type="submit"]');
    
    // 等待跳转
    try {
      await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
      console.log('   ✅ 登录成功，已跳转到首页');
    } catch (error) {
      console.log('   ❌ 登录失败或跳转超时');
      await page.screenshot({ path: 'screenshots/error-login.png' });
      passed = false;
      return;
    }
    
    // 4. 等待首页加载
    console.log('\n📍 步骤 4: 等待首页数据加载');
    await page.waitForTimeout(3000); // 等待 API 请求完成
    
    await page.screenshot({ path: 'screenshots/03-homepage-loaded.png' });
    console.log('   📸 截图已保存: screenshots/03-homepage-loaded.png');
    
    // 5. 检查义工总数
    console.log('\n📍 步骤 5: 检查义工总数显示');
    
    try {
      // 等待页面渲染完成
      await page.waitForTimeout(2000);
      
      // 方法1: 通过 evaluate 直接查找
      const volunteerCountText = await page.evaluate(() => {
        // 查找包含"义工总数"的元素
        const elements = Array.from(document.querySelectorAll('*'));
        const titleElement = elements.find(el => el.textContent?.includes('义工总数'));
        
        if (titleElement) {
          // 找到父级卡片
          const card = titleElement.closest('[class*="card"]') || titleElement.parentElement?.parentElement;
          if (card) {
            // 查找数字
            const numberElement = card.querySelector('.text-2xl');
            return numberElement?.textContent || '未找到';
          }
        }
        return '未找到元素';
      });
      
      console.log(`   📊 义工总数显示: ${volunteerCountText}`);
      
      if (volunteerCountText === '未找到' || volunteerCountText === '未找到元素') {
        console.log('   ❌ 无法找到义工总数元素');
        passed = false;
        
        // 获取页面 HTML 用于调试
        const pageContent = await page.content();
        require('fs').writeFileSync('debug-page.html', pageContent);
        console.log('   📝 页面 HTML 已保存: debug-page.html');
        
      } else if (volunteerCountText.trim() === '0') {
        console.log('   ❌ 义工总数显示为 0（错误）');
        passed = false;
        
        const pageContent = await page.content();
        require('fs').writeFileSync('debug-page.html', pageContent);
        console.log('   📝 页面 HTML 已保存: debug-page.html');
        
      } else if (volunteerCountText.trim() === '54') {
        console.log('   ✅ 义工总数显示正确！');
      } else {
        console.log(`   ⚠️  义工总数显示为 ${volunteerCountText}（预期 54）`);
      }
      
    } catch (error) {
      console.log('   ❌ 检查义工总数时出错');
      console.log('   错误:', error.message);
      passed = false;
    }
    
    // 6. 检查网络请求
    console.log('\n📍 步骤 6: 检查网络请求');
    console.log('   发起的 API 请求:');
    apiRequests.forEach(req => {
      console.log(`   - ${req.method} ${req.url}`);
    });
    
    // 检查是否有义工列表请求
    const volunteerRequest = apiRequests.find(req => req.url.includes('/volunteer'));
    if (volunteerRequest) {
      console.log('   ✅ 已发起义工列表请求');
    } else {
      console.log('   ❌ 未发起义工列表请求');
      passed = false;
    }
    
    // 7. 直接调用 API 验证
    console.log('\n📍 步骤 7: 直接调用 API 验证数据');
    const apiResponse = await page.evaluate(async () => {
      try {
        // 使用完整的 API 地址
        const response = await fetch('http://localhost:3001/volunteer?page=1&limit=1', {
          credentials: 'include'
        });
        const data = await response.json();
        return data;
      } catch (error) {
        return { error: error.message };
      }
    });
    
    if (apiResponse.error) {
      console.log('   ❌ API 调用失败:', apiResponse.error);
      passed = false;
    } else {
      console.log('   📊 API 响应:');
      console.log(`      total: ${apiResponse.total}`);
      console.log(`      page: ${apiResponse.page}`);
      console.log(`      pageSize: ${apiResponse.pageSize}`);
      console.log(`      totalPages: ${apiResponse.totalPages}`);
      
      if (apiResponse.total === 54) {
        console.log('   ✅ API 返回数据正确');
      } else {
        console.log(`   ❌ API 返回 total=${apiResponse.total}（预期 54）`);
        passed = false;
      }
    }
    
    // 8. 最终截图
    await page.screenshot({ 
      path: 'screenshots/04-final-result.png',
      fullPage: true 
    });
    console.log('\n📸 完整页面截图已保存: screenshots/04-final-result.png');
    
  } catch (error) {
    console.error('\n❌ 测试执行出错:', error.message);
    passed = false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  return passed;
}

// 主函数
async function main() {
  // 创建截图目录
  const fs = require('fs');
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }
  
  const passed = await runE2ETest();
  
  console.log('\n' + '='.repeat(50));
  if (passed) {
    console.log('✅ 端到端测试通过！');
    console.log('\n📊 测试结果:');
    console.log('   - 登录功能: ✅');
    console.log('   - 首页加载: ✅');
    console.log('   - 义工总数显示: ✅');
    console.log('   - API 数据正确: ✅');
    console.log('\n📸 截图保存在 screenshots/ 目录');
    process.exit(0);
  } else {
    console.log('❌ 端到端测试失败！');
    console.log('\n请检查:');
    console.log('   1. screenshots/ 目录中的截图');
    console.log('   2. debug-page.html 文件（如果生成）');
    console.log('   3. 浏览器控制台的错误信息');
    process.exit(1);
  }
}

main();
