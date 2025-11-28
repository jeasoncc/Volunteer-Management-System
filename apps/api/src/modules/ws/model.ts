import { t } from 'elysia'

// ==================== WebSocket Message Schemas ====================

/**
 * 设备声明消息
 */
export const DeviceDeclarationSchema = t.Object({
  cmd:          t.String(),
  type:         t.String(),
  sn:           t.String(),
  ip:           t.String(),
  version_code: t.String(),
  version_name: t.String(),
  timestamp:    t.Number(),
  token:        t.String(),
})

/**
 * 心跳消息
 */
export const HeartbeatSchema = t.Object({
  cmd:       t.Literal('ping'),
  sn:        t.String(),
  timestamp: t.Number(),
})

// ==================== HTTP Request Schemas ====================

/**
 * 添加单个用户请求
 */
export const AddUserRequestSchema = t.Object({
  lotusId: t.String({ minLength: 1 }),
})

/**
 * 添加图片广告请求
 */
export const AddImageAdRequestSchema = t.Object({
  id:       t.Optional(t.String()),
  duration: t.Optional(t.String()),
  imageUrl: t.String(),
})

/**
 * 设置访客申请二维码请求
 */
export const SetVisitorQRCodeRequestSchema = t.Object({
  value:    t.Number(),
  photoUrl: t.String(),
})

// ==================== Device Command Schemas ====================

/**
 * 添加用户命令
 */
export interface AddUserCommand {
  cmd:           'addUser'
  mode:          number
  name:          string
  user_id:       string
  user_id_card:  string
  face_template: string
  phone:         string
  id_valid:      string  // 必填：有效期，空字符串表示永久
  user_type?:    number  // 可选：0=正常, 2=访客, 10=黑名单, 20=只测温
  effect_time?:  string  // 可选：生效时间
  tts_name?:     string  // 可选：播报名称（多音字）
  Ic?:           string  // 可选：IC卡号
  confidence_level?: number  // 可选：置信度
  valid_cycle?:  Array<{ start_time: string; end_time: string }>  // 可选：通行周期
}

/**
 * 删除所有用户命令
 */
export interface DeleteAllUsersCommand {
  cmd: 'delAllUser'
}

/**
 * 在线授权命令
 */
export interface OnlineAuthorizationCommand {
  cmd: 'onlineAuthorization'
}

/**
 * 添加图片广告命令
 */
export interface AddImageAdCommand {
  cmd:      'addImageAd'
  id:       string
  duration: string
  value:    string
}

/**
 * 设置访客申请二维码命令
 */
export interface SetVisitorQRCodeCommand {
  cmd:   'setVisitorApplyValue'
  value: number
  photo: string
}

/**
 * 查询设备人员信息命令
 * value: 0=读取人脸总数, 1=读取所有人员user id, 2=读取人证总数, 3=读取所有人证user id
 */
export interface GetUserInfoCommand {
  cmd:   'getUserInfo'
  value: 0 | 1 | 2 | 3
}

/**
 * 设备返回的人员信息
 */
export interface GetUserInfoResponse {
  cmd:     'getUserInfoRet'
  code:    number
  userIds?: string[]  // value为1或3时返回
  total?:  number     // value为0或2时返回
}

// ==================== TypeScript Types ====================

export type DeviceDeclarationDto = typeof DeviceDeclarationSchema.static
export type HeartbeatDto = typeof HeartbeatSchema.static
export type AddUserRequestDto = typeof AddUserRequestSchema.static
export type AddImageAdRequestDto = typeof AddImageAdRequestSchema.static
export type SetVisitorQRCodeRequestDto = typeof SetVisitorQRCodeRequestSchema.static

export type DeviceCommand =
  | AddUserCommand
  | DeleteAllUsersCommand
  | OnlineAuthorizationCommand
  | AddImageAdCommand
  | SetVisitorQRCodeCommand
  | GetUserInfoCommand
  | string

// ==================== Response Types ====================

export interface CommandResponse {
  success: boolean
  message: string
  data?:   any
}

// ==================== WebSocket Push Message Types ====================

/**
 * 进度更新消息
 */
export interface ProgressMessage {
  type: 'progress'
  data: {
    batchId: string | null
    total: number
    sent: number
    confirmed: number
    failed: number
    skipped: number
    status: 'idle' | 'syncing' | 'completed'
    estimatedTimeRemaining: number | null
    logs: Array<{
      time: string
      type: 'info' | 'success' | 'error' | 'warning'
      message: string
    }>
    failedUsers: Array<{ lotusId: string; name: string; reason: string }>
  }
}

/**
 * 用户反馈消息
 */
export interface UserFeedbackMessage {
  type: 'user_feedback'
  data: {
    batchId: string | null
    lotusId: string
    name: string
    status: 'success' | 'failed'
    code: number
    message: string
    timestamp: string
  }
}

/**
 * 批次开始消息
 */
export interface BatchStartMessage {
  type: 'batch_start'
  data: {
    batchId: string
    total: number
    strategy: string
    photoFormat: string
  }
}

/**
 * 批次完成消息
 */
export interface BatchCompleteMessage {
  type: 'batch_complete'
  data: {
    batchId: string
    total: number
    confirmed: number
    failed: number
    skipped: number
    duration: number
  }
}

/**
 * WebSocket 推送消息联合类型
 */
export type WebSocketPushMessage = 
  | ProgressMessage 
  | UserFeedbackMessage 
  | BatchStartMessage 
  | BatchCompleteMessage
