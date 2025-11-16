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
  | string

// ==================== Response Types ====================

export interface CommandResponse {
  success: boolean
  message: string
  data?:   any
}
