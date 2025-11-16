import { db } from '../../db'
import { volunteer } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { file as fileType } from 'bun'
import { ConnectionManager } from './connection-manager'
import {
  AddUserCommand,
  DeleteAllUsersCommand,
  OnlineAuthorizationCommand,
  AddImageAdCommand,
  SetVisitorQRCodeCommand,
} from './model'
import { DeviceNotConnectedError, UserNotFoundError, FileNotFoundError } from './errors'

/**
 * WebSocket 服务类
 * 处理设备命令和业务逻辑
 */
export class WebSocketService {
  private static readonly BASE_URL = 'http://192.168.101.100:3001'

  /**
   * 添加单个用户到考勤设备
   */
  static async addUser(lotusId: string) {
    // 查询用户信息
    const [user] = await db.select().from(volunteer).where(eq(volunteer.lotusId, lotusId))

    if (!user) {
      throw new UserNotFoundError(lotusId)
    }

    // 构建命令
    const command: AddUserCommand = {
      cmd:           'addUser',
      mode:          0,
      name:          user.name,
      user_id:       user.lotusId!,
      user_id_card:  user.idNumber,
      face_template: user.avatar ? `${this.BASE_URL}${user.avatar}` : '',
      phone:         user.phone,
    }

    // 发送命令
    const success = ConnectionManager.sendToAttendanceDevice(command)

    if (!success) {
      throw new DeviceNotConnectedError('YET88476')
    }

    return {
      success: true,
      message: '用户添加成功',
      data:    {
        lotusId: user.lotusId,
        name:    user.name,
      },
    }
  }

  /**
   * 添加所有用户到考勤设备
   */
  static async addAllUsers() {
    // 获取所有有头像的用户（考勤机需要人脸照片）
    const users = await db.select().from(volunteer)

    console.log(`📊 共查询到 ${users.length} 个用户`)

    let successCount = 0
    let failCount = 0
    let skippedCount = 0

    // 批量发送命令
    for (const user of users) {
      // 跳过没有头像的用户
      if (!user.avatar) {
        console.log(`⏭️  跳过 ${user.name}(${user.lotusId}): 无头像`)
        skippedCount++
        continue
      }

      const command: AddUserCommand = {
        cmd:           'addUser',
        mode:          0,
        name:          user.name,
        user_id:       user.lotusId!,
        user_id_card:  user.idNumber,
        face_template: `${this.BASE_URL}${user.avatar}`,
        phone:         user.phone,
      }

      if (ConnectionManager.sendToAttendanceDevice(command)) {
        successCount++
        console.log(`✅ 添加成功: ${user.name}(${user.lotusId})`)
      } else {
        failCount++
        console.log(`❌ 添加失败: ${user.name}(${user.lotusId})`)
      }
    }

    console.log(`📊 同步完成: 成功 ${successCount}, 失败 ${failCount}, 跳过 ${skippedCount}`)

    return {
      success: true,
      message: `批量添加完成`,
      data:    {
        total: users.length,
        successCount,
        failCount,
        skippedCount,
      },
    }
  }

  /**
   * 删除所有用户
   */
  static async deleteAllUsers() {
    const command: DeleteAllUsersCommand = {
      cmd: 'delAllUser',
    }

    const success = ConnectionManager.sendToAttendanceDevice(command)

    if (!success) {
      throw new DeviceNotConnectedError('YET88476')
    }

    return {
      success: true,
      message: '删除命令已发送',
    }
  }

  /**
   * 在线授权
   */
  static async onlineAuthorization() {
    const command: OnlineAuthorizationCommand = {
      cmd: 'onlineAuthorization',
    }

    const success = ConnectionManager.sendToAttendanceDevice(command)

    if (!success) {
      throw new DeviceNotConnectedError('YET88476')
    }

    return {
      success: true,
      message: '授权命令已发送',
    }
  }

  /**
   * 添加图片广告
   */
  static async addImageAd(params?: { id?: string; duration?: string; imageUrl?: string }) {
    const {
      id = 'test1',
      duration = '2000',
      imageUrl = `${this.BASE_URL}/public/abc.jpg`,
    } = params || {}

    // 检查文件是否存在（如果是本地文件）
    if (imageUrl.startsWith(this.BASE_URL)) {
      const localPath = imageUrl.replace(this.BASE_URL, 'public')
      const file = fileType(localPath)

      if (!(await file.exists())) {
        throw new FileNotFoundError(localPath)
      }
    }

    const command: AddImageAdCommand = {
      cmd:   'addImageAd',
      id,
      duration,
      value: imageUrl,
    }

    const success = ConnectionManager.sendToAttendanceDevice(command)

    if (!success) {
      throw new DeviceNotConnectedError('YET88476')
    }

    return {
      success: true,
      message: '广告添加成功',
      data:    {
        id,
        imageUrl,
      },
    }
  }

  /**
   * 设置访客申请二维码
   */
  static async setVisitorQRCode(params?: { value?: number; photoUrl?: string }) {
    const { value = 0, photoUrl = `${this.BASE_URL}/public/123.jpg` } = params || {}

    const command: SetVisitorQRCodeCommand = {
      cmd:   'setVisitorApplyValue',
      value,
      photo: photoUrl,
    }

    const success = ConnectionManager.sendToAttendanceDevice(command)

    if (!success) {
      throw new DeviceNotConnectedError('YET88476')
    }

    return {
      success: true,
      message: '二维码设置成功',
      data:    {
        value,
        photoUrl,
      },
    }
  }

  /**
   * 获取设备状态
   */
  static getDeviceStatus() {
    const isOnline = ConnectionManager.isOnline('YET88476')
    const onlineDevices = ConnectionManager.getOnlineDevices()

    return {
      success: true,
      data:    {
        attendanceDevice: {
          sn:     'YET88476',
          online: isOnline,
        },
        onlineDevices,
        totalOnline:      ConnectionManager.getOnlineCount(),
      },
    }
  }
}
