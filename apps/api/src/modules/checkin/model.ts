import { t } from 'elysia'

// ==================== DTO Schemas ====================

/**
 * 签到记录数据结构（考勤设备上传格式）
 */
export const CheckInRecordSchema = t.Object({
  // 必填字段
  user_id:          t.String(),
  recog_type:       t.String(), // face, password, manual, card, fingerprint, etc.
  recog_time:       t.String(), // yyyy-MM-dd HH:mm:ss
  gender:           t.Number(), // 0 男、1 女、-1 未知
  
  // 可选字段
  photo:            t.Optional(t.String()), // base64 图片
  pass_status:      t.Optional(t.Number()), // 0 开门、1 未开门、2 关联识别
  user_name:        t.Optional(t.String()),
  user_type:        t.Optional(t.Number()),
  body_temperature: t.Optional(t.String()),
  confidence:       t.Optional(t.String()),
  reflectivity:     t.Optional(t.Number()),
  room_temperature: t.Optional(t.Number()),
  extra:            t.Optional(t.String()),
  card_number:      t.Optional(t.String()),
  panoramic_picture: t.Optional(t.String()),
  password:         t.Optional(t.String()),
  qr_code:          t.Optional(t.String()),
  health_code_color: t.Optional(t.String()),
  health_code_info: t.Optional(t.Any()),
  signature:        t.Optional(t.String()),
  alcohol_result:   t.Optional(t.String()),
  alcohol_pass:     t.Optional(t.Number()),
  location:         t.Optional(t.Object({
    longitude:   t.Optional(t.String()),
    latitude:    t.Optional(t.String()),
    code:        t.Optional(t.String()),
    error_info:  t.Optional(t.String()),
    error_detail: t.Optional(t.String()),
  })),
  action:           t.Optional(t.String()),
  association_mark: t.Optional(t.String()),
})

/**
 * 陌生人记录请求（考勤设备格式）
 */
export const StrangerRecordRequestSchema = t.Object({
  sn:    t.String(), // 设备号
  Count: t.Number(), // 固定为 1
  logs:  t.Array(CheckInRecordSchema),
})

/**
 * 人脸识别签到请求（考勤设备格式）
 */
export const FaceCheckInRequestSchema = t.Object({
  sn:    t.String(), // 设备号
  Count: t.Number(), // 固定为 1
  logs:  t.Array(CheckInRecordSchema),
})

/**
 * 同步用户照片请求
 */
export const SyncUserPhotoRequestSchema = t.Object({
  content: t.Array(
    t.Object({
      user_id:  t.String(),
      vl_photo: t.String(),
    }),
  ),
})

// ==================== TypeScript Types ====================

export type CheckInRecordDto = typeof CheckInRecordSchema.static
export type StrangerRecordRequestDto = typeof StrangerRecordRequestSchema.static
export type FaceCheckInRequestDto = typeof FaceCheckInRequestSchema.static
export type SyncUserPhotoRequestDto = typeof SyncUserPhotoRequestSchema.static

// ==================== Response Types ====================

export interface CheckInResponse {
  success: boolean
  Result:  number
  Msg:     string
  data:    any
  message: string
}
