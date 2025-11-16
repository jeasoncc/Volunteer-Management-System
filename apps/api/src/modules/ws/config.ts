import {
  AddUserRequestSchema,
  AddImageAdRequestSchema,
  SetVisitorQRCodeRequestSchema,
} from './model'

/**
 * WebSocket 模块路由配置
 */
export const WebSocketConfig = {
  /**
   * 添加单个用户
   */
  addUser:             {
    body:   AddUserRequestSchema,
    detail: {
      summary:     '添加用户到考勤设备',
      description: '将指定用户信息同步到考勤设备',
      tags:        ['Device'],
    },
  },

  /**
   * 添加所有用户
   */
  addAllUsers:         {
    detail: {
      summary:     '批量添加所有用户',
      description: '将所有用户信息同步到考勤设备',
      tags:        ['Device'],
    },
  },

  /**
   * 删除所有用户
   */
  deleteAllUsers:      {
    detail: {
      summary:     '删除设备上所有用户',
      description: '清空考勤设备上的所有用户数据',
      tags:        ['Device'],
    },
  },

  /**
   * 在线授权
   */
  onlineAuthorization: {
    detail: {
      summary:     '在线授权',
      description: '向设备发送在线授权命令',
      tags:        ['Device'],
    },
  },

  /**
   * 添加图片广告
   */
  addImageAd:          {
    body:   AddImageAdRequestSchema,
    detail: {
      summary:     '添加图片广告',
      description: '向设备推送图片广告',
      tags:        ['Device'],
    },
  },

  /**
   * 设置访客二维码
   */
  setVisitorQRCode:    {
    body:   SetVisitorQRCodeRequestSchema,
    detail: {
      summary:     '设置访客申请二维码',
      description: '设置设备上的访客申请二维码',
      tags:        ['Device'],
    },
  },

  /**
   * 获取设备状态
   */
  getDeviceStatus:     {
    detail: {
      summary:     '获取设备状态',
      description: '查询所有设备的在线状态',
      tags:        ['Device'],
    },
  },
}
