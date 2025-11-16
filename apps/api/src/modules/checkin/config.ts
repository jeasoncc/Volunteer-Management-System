import {
  StrangerRecordRequestSchema,
  FaceCheckInRequestSchema,
  SyncUserPhotoRequestSchema,
} from './model'

/**
 * 签到模块路由配置
 */
export const CheckInConfig = {
  /**
   * 陌生人记录
   */
  strangerRecord: {
    body:   StrangerRecordRequestSchema,
    detail: {
      summary:     '陌生人记录',
      description: '处理考勤设备上传的陌生人识别记录',
      tags:        ['CheckIn'],
    },
  },

  /**
   * 人脸识别签到
   */
  faceCheckIn:    {
    body:   FaceCheckInRequestSchema,
    detail: {
      summary:     '人脸识别签到',
      description: '处理考勤设备上传的人脸识别签到记录',
      tags:        ['CheckIn'],
    },
  },

  /**
   * 同步用户照片
   */
  syncUserPhoto:  {
    body:   SyncUserPhotoRequestSchema,
    detail: {
      summary:     '同步用户照片',
      description: '同步用户照片到系统',
      tags:        ['CheckIn'],
    },
  },
}
