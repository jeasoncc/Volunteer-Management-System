/**
 * 签到记录数据接口（考勤设备格式）
 */
export interface CheckInData {
  // 必填字段
  user_id:          string
  recog_type:       string
  recog_time:       string
  gender:           number
  
  // 可选字段
  photo?:            string
  pass_status?:      number
  user_name?:        string
  user_type?:        number
  body_temperature?: string
  confidence?:       string
  reflectivity?:     number
  room_temperature?: number
  extra?:            string
  card_number?:      string
  panoramic_picture?: string
  password?:         string
  qr_code?:          string
  health_code_color?: string
  health_code_info?: any
  signature?:        string
  alcohol_result?:   string
  alcohol_pass?:     number
  location?: {
    longitude?:   string
    latitude?:    string
    code?:        string
    error_info?:  string
    error_detail?: string
  }
  action?:           string
  association_mark?: string
}

/**
 * 签到记录类
 */
export class CheckInRecord {
  user_id:          string
  recog_type:       string
  recog_time:       string
  gender:           number
  photo:            string
  pass_status:      number
  user_name:        string
  user_type:        number
  body_temperature: string
  confidence:       string
  reflectivity:     number
  room_temperature: number
  extra:            string
  card_number:      string
  panoramic_picture: string
  password:         string
  qr_code:          string
  health_code_color: string
  health_code_info: any
  signature:        string
  alcohol_result:   string
  alcohol_pass:     number
  location:         any
  action:           string
  association_mark: string

  constructor(data: CheckInData) {
    this.user_id = data.user_id
    this.recog_type = data.recog_type
    this.recog_time = data.recog_time
    this.gender = data.gender
    this.photo = data.photo || ''
    this.pass_status = data.pass_status || 0
    this.user_name = data.user_name || ''
    this.user_type = data.user_type || 0
    this.body_temperature = data.body_temperature || ''
    this.confidence = data.confidence || ''
    this.reflectivity = data.reflectivity || 0
    this.room_temperature = data.room_temperature || 0
    this.extra = data.extra || ''
    this.card_number = data.card_number || ''
    this.panoramic_picture = data.panoramic_picture || ''
    this.password = data.password || ''
    this.qr_code = data.qr_code || ''
    this.health_code_color = data.health_code_color || ''
    this.health_code_info = data.health_code_info || {}
    this.signature = data.signature || ''
    this.alcohol_result = data.alcohol_result || ''
    this.alcohol_pass = data.alcohol_pass || 0
    this.location = data.location || {}
    this.action = data.action || ''
    this.association_mark = data.association_mark || ''
  }

  /**
   * 打印简要信息（截断照片数据）
   */
  print(): void {
    const truncatedPhoto = this.photo.length > 10 ? `${this.photo.substring(0, 10)}...` : this.photo

    console.table({
      user_id: this.user_id,
      user_name: this.user_name,
      recog_type: this.recog_type,
      recog_time: this.recog_time,
      photo: truncatedPhoto,
    })
  }

  /**
   * 打印详细信息
   */
  printDetailed(): void {
    const truncatedPhoto =
      this.photo.length > 10
        ? `${this.photo.substring(0, 10)}... (长度: ${this.photo.length})`
        : this.photo

    const message = `用户信息:
      用户ID: ${this.user_id}
      用户名: ${this.user_name}
      识别类型: ${this.recog_type}
      识别时间: ${this.recog_time}
      照片数据: ${truncatedPhoto}
      性别: ${this.gender}
      体温: ${this.body_temperature}
      置信度: ${this.confidence}
      通过状态: ${this.pass_status}`

    console.log(message)
  }
}
