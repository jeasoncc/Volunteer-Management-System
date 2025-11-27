import { Elysia } from 'elysia'
import { logger } from './lib/logger'

new Elysia().get('/id/*', ({ params }) => params).listen(3000)

logger.info('测试服务器启动')
const abc = 123
