/**
 * API 接口测试脚本
 * 用于验证统计接口是否正常工作
 */

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001';

interface TestResult {
  endpoint: string;
  success: boolean;
  data?: any;
  error?: string;
}

async function testEndpoint(endpoint: string, description: string): Promise<TestResult> {
  console.log(`\n测试: ${description}`);
  console.log(`请求: ${API_BASE_URL}${endpoint}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ 成功');
    console.log('响应数据:', JSON.stringify(data, null, 2));
    
    return {
      endpoint,
      success: true,
      data,
    };
  } catch (error) {
    console.log('❌ 失败');
    console.log('错误:', error instanceof Error ? error.message : String(error));
    
    return {
      endpoint,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('Care-Web API 接口测试');
  console.log('='.repeat(60));
  console.log(`API 地址: ${API_BASE_URL}`);
  
  const results: TestResult[] = [];
  
  // 测试义工统计
  results.push(await testEndpoint(
    '/api/stats/volunteers',
    '获取义工统计数据'
  ));
  
  // 测试今日签到
  results.push(await testEndpoint(
    '/api/stats/checkins/today',
    '获取今日签到记录'
  ));
  
  // 测试月度排行榜
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  results.push(await testEndpoint(
    `/api/stats/leaderboard/monthly?year=${year}&month=${month}`,
    `获取 ${year}年${month}月 排行榜`
  ));
  
  // 汇总结果
  console.log('\n' + '='.repeat(60));
  console.log('测试结果汇总');
  console.log('='.repeat(60));
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log(`总计: ${results.length} 个接口`);
  console.log(`成功: ${successCount} 个 ✅`);
  console.log(`失败: ${failCount} 个 ❌`);
  
  if (failCount > 0) {
    console.log('\n失败的接口:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.endpoint}: ${r.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  // 退出码
  process.exit(failCount > 0 ? 1 : 0);
}

// 运行测试
runTests().catch(error => {
  console.error('测试执行失败:', error);
  process.exit(1);
});
