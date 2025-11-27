export interface CheckInData {
  real_user_id:     string
  user_id:          string
  recog_type:       string
  recog_time:       string
  photo:            string
  gender:           number
  user_name:        string
  body_temperature: string
  confidence:       string
  card_number:      string
  user_type:        number
  alcohol_result:   string
  password:         string
  reflectivity:     number
  room_temperature: number
  pass_status:      number
}

export class CheckIn {
  real_user_id:     string
  user_id:          string
  recog_type:       string
  recog_time:       string
  photo:            string
  gender:           number
  user_name:        string
  body_temperature: string
  confidence:       string
  card_number:      string
  user_type:        number
  alcohol_result:   string
  password:         string
  reflectivity:     number
  room_temperature: number
  pass_status:      number

  constructor(checkInData: CheckInData) {
    this.real_user_id = checkInData.real_user_id || ''
    this.user_id = checkInData.user_id || ''
    this.recog_type = checkInData.recog_type || ''
    this.recog_time = checkInData.recog_time || ''
    this.photo = checkInData.photo || ''
    this.gender = checkInData.gender || 0
    this.user_name = checkInData.user_name || ''
    this.body_temperature = checkInData.body_temperature || ''
    this.confidence = checkInData.confidence || ''
    this.card_number = checkInData.card_number || ''
    this.user_type = checkInData.user_type || 0
    this.alcohol_result = checkInData.alcohol_result || ''
    this.password = checkInData.password || ''
    this.reflectivity = checkInData.reflectivity || 0
    this.room_temperature = checkInData.room_temperature || 0
    this.pass_status = checkInData.pass_status || 0
  }

  // 添加print方法，限制photo显示长度
  print() {
    const truncatedPhoto = this.photo.length > 10 ? `${this.photo.substring(0, 10)}...` : this.photo

    const message = {
      ...this,
      photo: truncatedPhoto,
    }
    console.table(message)
    return ''
  }

  // 或者提供一个更详细的格式化输出
  printDetailed() {
    const truncatedPhoto =
      this.photo.length > 10
        ? `${this.photo.substring(0, 10)}... (长度: ${this.photo.length})`
        : this.photo

    const message = `用户信息:
            真实用户ID: ${this.real_user_id}
            用户ID: ${this.user_id}
            识别类型: ${this.recog_type}
            识别时间: ${this.recog_time}
            照片数据: ${truncatedPhoto}
            性别: ${this.gender}
            用户名: ${this.user_name}
            体温: ${this.body_temperature}
            置信度: ${this.confidence}
            卡号: ${this.card_number}
            用户类型: ${this.user_type}
            酒精检测结果: ${this.alcohol_result}
            密码: ${this.password}
            反射率: ${this.reflectivity}
            室温: ${this.room_temperature}
            通过状态: ${this.pass_status}`
    // 使用 logger 而不是 console
    // logger.debug(message)
    return ''
  }
}
