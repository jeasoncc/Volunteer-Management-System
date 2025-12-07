/**
 * 获取本机局域网IP地址
 */

import { networkInterfaces } from 'os'

/**
 * 获取本机的局域网IP地址
 * 优先返回192.168.x.x或10.x.x.x的地址
 */
export function getLocalIP(): string {
  const interfaces = networkInterfaces()
  
  // 存储找到的IP地址
  const ips: string[] = []
  
  for (const name of Object.keys(interfaces)) {
    const nets = interfaces[name]
    if (!nets) continue
    
    for (const net of nets) {
      // 跳过内部地址和非IPv4地址
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address)
      }
    }
  }
  
  // 优先选择192.168.x.x的地址
  const ip192 = ips.find(ip => ip.startsWith('192.168.'))
  if (ip192) return ip192
  
  // 其次选择10.x.x.x的地址
  const ip10 = ips.find(ip => ip.startsWith('10.'))
  if (ip10) return ip10
  
  // 其次选择172.16-31.x.x的地址
  const ip172 = ips.find(ip => {
    const parts = ip.split('.')
    if (parts[0] === '172') {
      const second = parseInt(parts[1])
      return second >= 16 && second <= 31
    }
    return false
  })
  if (ip172) return ip172
  
  // 如果都没有，返回第一个找到的IP
  if (ips.length > 0) return ips[0]
  
  // 如果什么都没找到，返回localhost
  return 'localhost'
}

/**
 * 获取所有网络接口的IP地址（用于调试）
 */
export function getAllIPs(): { name: string; ip: string; internal: boolean }[] {
  const interfaces = networkInterfaces()
  const result: { name: string; ip: string; internal: boolean }[] = []
  
  for (const name of Object.keys(interfaces)) {
    const nets = interfaces[name]
    if (!nets) continue
    
    for (const net of nets) {
      if (net.family === 'IPv4') {
        result.push({
          name,
          ip: net.address,
          internal: net.internal,
        })
      }
    }
  }
  
  return result
}
