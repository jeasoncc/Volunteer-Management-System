// generate-volunteers.ts
import { faker } from '@faker-js/faker/locale/zh_CN'
import { writeFileSync } from 'fs'

// 定义性别选项
const genders = ['male', 'female', 'other'] as const
// 定义教育程度选项
const educationLevels = [
  'none',
  'elementary',
  'middle_school',
  'high_school',
  'bachelor',
  'master',
  'phd',
  'other',
] as const
// 定义皈依状态选项
const refugeStatuses = ['none', 'took_refuge', 'five_precepts', 'bodhisattva'] as const
// 定义健康状况选项
const healthConditions = [
  'healthy',
  'has_chronic_disease',
  'has_disability',
  'has_allergies',
  'recovering_from_illness',
  'other_conditions',
] as const
// 定义宗教背景选项
const religiousBackgrounds = [
  'upasaka',
  'upasika',
  'sramanera',
  'sramanerika',
  'bhikkhu',
  'bhikkhuni',
  'anagarika',
  'siladhara',
  'novice_monk',
  'buddhist_visitor',
  'none',
] as const
// 定义家人同意状态选项
const familyConsentStatuses = ['approved', 'partial', 'rejected', 'self_decided'] as const
// 定义服务岗位选项
const servicePositions = [
  'kitchen',
  'chanting',
  'cleaning',
  'reception',
  'security',
  'office',
  'other',
] as const
// 定义可服务时间段
const availableTimeSlots = [
  '周一上午',
  '周一下午',
  '周二上午',
  '周二下午',
  '周三上午',
  '周三下午',
  '周四上午',
  '周四下午',
  '周五上午',
  '周五下午',
  '周六上午',
  '周六下午',
  '周日上午',
  '周日下午',
]

// 生成随机身份证号
function generateIdNumber() {
  const provinceCode = [
    '11',
    '12',
    '13',
    '14',
    '15',
    '21',
    '22',
    '23',
    '31',
    '32',
    '33',
    '34',
    '35',
    '36',
    '37',
    '41',
    '42',
    '43',
    '44',
    '45',
    '46',
    '50',
    '51',
    '52',
    '53',
    '54',
    '61',
    '62',
    '63',
    '64',
    '65',
  ]
  const cityCode = [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
  ]
  const countyCode = [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '27',
    '28',
    '29',
    '30',
  ]

  const birthYear = faker.number.int({ min: 1950, max: 2005 })
  const birthMonth = faker.number.int({ min: 1, max: 12 }).toString().padStart(2, '0')
  const birthDay = faker.number.int({ min: 1, max: 28 }).toString().padStart(2, '0')

  const randomCode = faker.number.int({ min: 100, max: 999 }).toString()

  // 前17位
  const partialId = `${faker.helpers.arrayElement(provinceCode)}${faker.helpers.arrayElement(cityCode)}${faker.helpers.arrayElement(countyCode)}${birthYear}${birthMonth}${birthDay}${randomCode}`

  // 计算校验码
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(partialId.charAt(i)) * weights[i]
  }
  const checkCode = checkCodes[sum % 11]

  return `${partialId}${checkCode}`
}

// 生成随机手机号
function generatePhoneNumber() {
  const prefixes = [
    '130',
    '131',
    '132',
    '133',
    '134',
    '135',
    '136',
    '137',
    '138',
    '139',
    '150',
    '151',
    '152',
    '153',
    '155',
    '156',
    '157',
    '158',
    '159',
    '180',
    '181',
    '182',
    '183',
    '184',
    '185',
    '186',
    '187',
    '188',
    '189',
  ]
  return `${faker.helpers.arrayElement(prefixes)}${faker.string.numeric(8)}`
}

// 生成随机出生日期
function generateBirthDate() {
  const year = faker.number.int({ min: 1950, max: 2005 })
  const month = faker.number.int({ min: 1, max: 12 }).toString().padStart(2, '0')
  const day = faker.number.int({ min: 1, max: 28 }).toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 生成随机培训记录
function generateTrainingRecords() {
  const trainings = [
    '基础佛学培训',
    '寺院礼仪培训',
    '厨房安全培训',
    '接待礼仪培训',
    '应急处理培训',
    '诵经指导培训',
    '禅修指导培训',
  ]
  const count = faker.number.int({ min: 0, max: 5 })
  return faker.helpers.arrayElements(trainings, count)
}

// 生成随机可服务时间
function generateAvailableTimes() {
  const count = faker.number.int({ min: 1, max: 5 })
  return faker.helpers.arrayElements(availableTimeSlots, count)
}

// 生成单个志愿者数据
function generateVolunteer(index: number) {
  const hasBuddhismFaith = faker.datatype.boolean({ probability: 0.7 })
  const refugeStatus = hasBuddhismFaith ? faker.helpers.arrayElement(refugeStatuses) : 'none'

  return {
    idNumber:            generateIdNumber(),
    account:             `volunteer_${index.toString().padStart(6, '0')}`,
    password:            faker.internet.password({ length: 10 }),
    name:                faker.person.fullName(),
    gender:              faker.helpers.arrayElement(genders),
    phone:               generatePhoneNumber(),
    lotusId:             faker.datatype.boolean({ probability: 0.3 })
      ? `L${faker.string.numeric(6)}`
      : undefined,
    volunteerId:         faker.datatype.boolean({ probability: 0.2 })
      ? `V${faker.string.numeric(6)}`
      : undefined,
    birthDate:           faker.datatype.boolean({ probability: 0.8 })
      ? generateBirthDate()
      : undefined,
    wechat:              faker.datatype.boolean({ probability: 0.6 })
      ? faker.internet.userName()
      : undefined,
    email:               faker.datatype.boolean({ probability: 0.5 })
      ? faker.internet.email()
      : undefined,
    address:             faker.datatype.boolean({ probability: 0.7 })
      ? faker.location.streetAddress()
      : undefined,
    avatar:              faker.datatype.boolean({ probability: 0.4 })
      ? faker.image.avatar()
      : undefined,
    education:           faker.helpers.arrayElement(educationLevels),
    hasBuddhismFaith,
    refugeStatus,
    healthConditions:    faker.helpers.arrayElement(healthConditions),
    religiousBackground: faker.helpers.arrayElement(religiousBackgrounds),
    joinReason:          faker.lorem.sentence(),
    hobbies:             faker.lorem.words({ min: 3, max: 10 }),
    availableTimes:      generateAvailableTimes(),
    trainingRecords:     generateTrainingRecords(),
    emergencyContact:    `${faker.person.fullName()} ${generatePhoneNumber()}`,
    familyConsent:       faker.helpers.arrayElement(familyConsentStatuses),
    severPosition:       faker.helpers.arrayElement(servicePositions),
  }
}

// 生成10万条数据
function generateVolunteers(count: number) {
  const volunteers = []
  for (let i = 0; i < count; i++) {
    volunteers.push(generateVolunteer(i + 1))
  }
  return volunteers
}

// 主函数
function main() {
  const count = 1000
  console.log(`开始生成${count}条志愿者数据...`)

  const startTime = Date.now()
  const volunteers = generateVolunteers(count)
  const endTime = Date.now()

  console.log(`数据生成完成，耗时: ${(endTime - startTime) / 1000}秒`)

  // 保存为JSON文件
  console.log('正在保存数据到文件...')
  writeFileSync('volunteers.json', JSON.stringify(volunteers, null, 2))
  console.log('数据已保存到 volunteers.json 文件')
}

main()
