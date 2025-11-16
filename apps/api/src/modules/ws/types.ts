/**
 * 设备信息
 */
export interface DeviceInfo {
  sn:             string
  ip:             string
  version_code:   string
  version_name:   string
  connectedAt:    Date
  lastHeartbeat?: Date
}

/**
 * WebSocket 消息类型
 */
export enum MessageType {
  DECLARE = 'declare',
  PING = 'ping',
  PONG = 'pong',
  TO_DEVICE = 'to_device',
  FROM_DEVICE = 'from_device',
}

/**
 * 设备命令类型
 */
export enum DeviceCommandType {
  ADD_USER = 'addUser',
  DELETE_ALL_USERS = 'delAllUser',
  ONLINE_AUTHORIZATION = 'onlineAuthorization',
  ADD_IMAGE_AD = 'addImageAd',
  SET_VISITOR_QR = 'setVisitorApplyValue',
  UPLOAD_FACE_INFO = 'uploadFaceInfo',
}

/**
 * 设备状态
 */
export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  ERROR = 'error',
}
