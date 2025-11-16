import { ElysiaWS } from 'elysia/dist/ws'

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
    console.log('cmming')
    return {
      'cmd':  'to_device',
      'from': 'archLinux',
      'to':   'YET88476',
      'data': command,
    }
  }

  if (!attendanceDevice) return 'not connect!'
  const message = sendMessage(command)
  console.log(message)
  attendanceDevice.send(message)
  return {
    message: 'coming',
    success: true,
  }
}
