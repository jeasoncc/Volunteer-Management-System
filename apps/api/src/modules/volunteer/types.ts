// src/modules/volunteer/types.ts
// import { volunteer } from '../../../db/schema'

import { t } from 'elysia'
import { volunteer } from '../../db/schema'

// 获取所有列名作为类型
type VolunteerColumn = keyof typeof volunteer.$inferSelect

// 定义可筛选字段及其比较方式
export const filterableFields: Record<VolunteerColumn, 'equal' | 'like'> = {
  id:                   'equal',
  account:              'equal',
  password:             'equal',
  name:                 'like',
  gender:               'equal',
  phone:                'like',
  idNumber:             'equal',
  email:                'like',
  address:              'like',
  wechat:               'equal',
  birthDate:            'equal',
  avatar:               'equal',
  education:            'equal',
  hasBuddhismFaith:     'equal',
  refugeStatus:         'equal',
  healthConditions:     'equal',
  religiousBackground:  'equal',
  joinReason:           'like',
  hobbies:              'like',
  availableTimes:       'equal',
  trainingRecords:      'equal',
  emergencyContact:     'equal',
  familyConsent:        'equal',
  severPosition:        'equal',
  lotusId:              'equal',
  status:               'equal',
  volunteerStatus:      'equal',
  signedCommitment:     'equal',
  commitmentSignedDate: 'equal',
  notes:                'like',
  reviewer:             'equal',
  createdAt:            'equal',
  updatedAt:            'equal',
  lotusRole:            'equal',
  isCertified:          'equal',
  serviceHours:         'equal',
  volunteerId:          'equal',
} as const

// src/modules/volunteer/types.ts
export const VolunteerStatusEnum = {
  ACTIVE:     'active',
  INACTIVE:   'inactive',
  APPLICANT:  'applicant',
  TRAINEE:    'trainee',
  REGISTERED: 'registered',
  SUSPENDED:  'suspended',
} as const

export type VolunteerStatus = (typeof VolunteerStatusEnum)[keyof typeof VolunteerStatusEnum]
// 创建状态Schema
export const VolunteerStatusSchema = t.Enum(VolunteerStatusEnum)
