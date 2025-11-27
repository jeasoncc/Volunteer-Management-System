import { ElysiaWS } from 'elysia/dist/ws'
import { logger } from '../../lib/logger'

export const commandFn = (attendanceDevice: ElysiaWS | null, command: any) => {
  const sendMessage = (command: any) => {
    if (typeof command == 'string') {
      return {
        'cmd':  'to_device',
        'from': 'archLinux',
        'to':   'YET88476',
        'data': {
          cmd: command,
        },
      }
    }
    return {
      'cmd':  'to_device',
      'from': 'archLinux',
      'to':   'YET88476',
      'data': command,
    }
  }

  if (!attendanceDevice) return 'not connect!'
  const message = sendMessage(command)
  logger.debug('发送设备命令:', message)
  attendanceDevice.send(message)
  return {
    message: 'coming',
    success: true,
  }
}
