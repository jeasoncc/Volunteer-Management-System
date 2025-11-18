import cors from '@elysiajs/cors'
import { Elysia } from 'elysia'
import swagger from '@elysiajs/swagger'
import { SWAGGER_CONFIG } from './config/swagger'
import { createLogger } from './log'
import { adminModule } from './modules/admin'
import { volunteerModule } from './modules/volunteer'
import { volunteerRegisterModule } from './modules/volunteer/register'
import { approvalModule } from './modules/volunteer/approval'
import { authModule } from './modules/auth'
import { checkinModule } from './modules/checkin'
import { staticPlugin } from '@elysiajs/static'
import { wsModule } from './modules/ws'
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import { documentModule } from './modules/document'
import { uploadModule } from './modules/upload'
import { startCronJobs } from './cron'

dotenvExpand.expand(dotenv.config())

const app = new Elysia()
  .use(cors({
    origin: true,
    credentials: true,
  }))
  .use(staticPlugin({
    assets: 'public',
    prefix: '/',
  }))
  .use(swagger(SWAGGER_CONFIG))
  .use(authModule)
  .use(uploadModule)
  .use(volunteerRegisterModule) // 公开的注册接口
  .use(approvalModule) // 义工审批模块
  .use(volunteerModule)
  .use(adminModule)
  .use(checkinModule)
  .use(documentModule)
  .use(wsModule)
  .listen(3001)

const logger = createLogger()

// 获取本机IP地址
function getLocalIPAddress() {
  const { networkInterfaces } = require('os')
  const nets = networkInterfaces()
  const results = []

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // 跳过内部（即127.0.0.1）和非IPv4地址
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address)
      }
    }
  }

  return results
}

const port = app.server?.port || 3001
const hostname = app.server?.hostname || 'localhost'
const localIPs = getLocalIPAddress()

logger.info(`🦊 Server is running at:`)
logger.info(`   - Local:   http://${hostname}:${port}`)
if (localIPs.length > 0) {
  localIPs.forEach(ip => {
    logger.info(`   - Network: http://${ip}:${port}`)
  })
}
logger.info(`🥸 WebSocket is running at http://${hostname}:${port}/ws`)
logger.info(`📝 Register page: http://${localIPs[0] || hostname}:${port}/register.html`)

// 启动定时任务
startCronJobs()
