/**
 * 测试头像 URL 访问
 */

import { getBackendUrl } from '../src/config/network';

const backendUrl = getBackendUrl();

console.log('=== 头像 URL 测试 ===\n');
console.log('后端地址:', backendUrl);
console.log('');

// 测试不同格式的 URL
const testUrls = [
  '/upload/avatar/test.jpg',
  'upload/avatar/test.jpg',
  `${backendUrl}/upload/avatar/test.jpg`,
];

console.log('测试 URL 格式：');
testUrls.forEach((url, index) => {
  const fullUrl = url.startsWith('http') ? url : `${backendUrl}${url.startsWith('/') ? url : '/' + url}`;
  console.log(`${index + 1}. 原始: ${url}`);
  console.log(`   完整: ${fullUrl}`);
  console.log('');
});

console.log('请在浏览器中测试以下 URL 是否可以访问：');
console.log(`${backendUrl}/upload/avatar/`);
console.log('');
console.log('如果无法访问，请检查：');
console.log('1. 后端服务是否正常运行');
console.log('2. public/upload/avatar 目录是否存在');
console.log('3. 静态文件服务是否正确配置');
console.log('4. CORS 配置是否正确');
