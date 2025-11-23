import {
  bigint,
  boolean,
  date,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  serial,
  text,
  time,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core'

export const volunteer = mysqlTable('volunteer', {
  id:                   serial('id').primaryKey(),
  lotusId:              varchar('lotus_id', { length: 50 }).unique(),
  volunteerId:          varchar('volunteer_id', { length: 50 }).unique(),
  idNumber:             varchar('id_number', { length: 18 }).notNull().unique(),
  lotusRole:            mysqlEnum('lotus_role', ['admin', 'volunteer']).default(
    'volunteer',
  ),
  account:              varchar('account', { length: 50 }).notNull().unique(),
  password:             varchar('password', { length: 255 }).notNull(),
  name:                 varchar('name', { length: 50 }).notNull(),
  gender:               mysqlEnum('gender', ['male', 'female', 'other']).notNull(),
  birthDate:            date('birth_date'),
  phone:                varchar('phone', { length: 20 }).notNull(),
  wechat:               varchar('wechat', { length: 50 }),
  email:                varchar('email', { length: 100 }),
  address:              text('address'),
  avatar:               text('avatar'),
  dharmaName:           varchar('dharma_name', { length: 50 }), // 法名
  education:            mysqlEnum('education', [
    'none',
    'elementary',
    'middle_school',
    'high_school',
    'bachelor',
    'master',
    'phd',
    'other',
  ]).default('high_school'),
  hasBuddhismFaith:     boolean('has_buddhism_faith').default(false),
  refugeStatus:         mysqlEnum('refuge_status', [
    'none',
    'took_refuge',
    'five_precepts',
    'bodhisattva',
  ]).default('none'),
  healthConditions:     mysqlEnum('health_conditions', [
    'healthy',
    'has_chronic_disease',
    'has_disability',
    'has_allergies',
    'recovering_from_illness',
    'other_conditions',
  ]).default('healthy'),
  religiousBackground:  mysqlEnum('religious_background', [
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
  ]).default('upasaka'),
  joinReason:           text('join_reason'),
  hobbies:              text('hobbies'),
  availableTimes:       varchar('available_times', { length: 255 }),
  trainingRecords:      varchar('training_records', { length: 255 }),
  serviceHours:         int('service_hours').default(0),
  isCertified:          boolean('is_certified').default(false),
  emergencyContact:     varchar('emergency_contact', { length: 50 }),
  familyConsent:        mysqlEnum('family_consent', [
    'approved',
    'partial',
    'rejected',
    'self_decided',
  ]).default('self_decided'),
  notes:                text('notes'),
  reviewer:             varchar('reviewer', { length: 100 }),
  volunteerStatus:      mysqlEnum('volunteer_status', [
    'applicant',
    'trainee',
    'registered',
    'inactive',
    'suspended',
  ]).default('applicant'),
  signedCommitment:     boolean('signed_commitment').default(false),
  commitmentSignedDate: date('commitment_signed_date'),
  severPosition:        mysqlEnum('sever_position', [
    'kitchen',
    'chanting',
    'cleaning',
    'reception',
    'security',
    'office',
    'other',
  ]).default('other'),
  status:               mysqlEnum('status', [
    'active',
    'inactive',
    'applicant',
    'trainee',
    'registered',
    'suspended',
  ]).default('applicant'),
  memberStatus:         mysqlEnum('member_status', ['volunteer', 'resident']).default('volunteer'),
  roomId:               int('room_id').default(0),
  createdAt:            timestamp('created_at').defaultNow(),
  updatedAt:            timestamp('updated_at').defaultNow().onUpdateNow(),
})

export const admin = mysqlTable('admin', {
  id:          serial('id')
    .primaryKey()
    .notNull()
    .references(() => volunteer.id),
  role:        mysqlEnum('role', ['super', 'admin', 'operator']).notNull(),
  permissions: json('permissions'),
  lastLogin:   timestamp('last_login'),
  loginIp:     varchar('login_ip', { length: 50 }),
  loginCount:  int('login_count').default(0),
  isActive:    boolean('is_active').default(true),
  department:  varchar('department', { length: 50 }),
  updatedAt:   timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})

/**
 * 义工签到记录表（原始打卡记录）
 * 数据库列名：snake_case（下划线命名）
 * TypeScript 属性名：camelCase（小驼峰命名）
 */
export const volunteerCheckIn = mysqlTable('volunteer_checkin', {
  id:              bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey(),
  userId:          bigint('user_id', { mode: 'number', unsigned: true })
    .notNull()
    .references(() => volunteer.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  date:            date('date').notNull(),
  checkIn:         time('check_in'),
  status:          mysqlEnum('status', ['present', 'late', 'early_leave', 'absent', 'on_leave']).default('present'),
  location:        varchar('location', { length: 100 }).default('深圳市龙岗区慈海医院福慧园七栋一楼'),
  notes:           text('notes'),
  createdAt:       timestamp('created_at').defaultNow(),
  lotusId:         varchar('lotus_id', { length: 50 }).notNull(),
  name:            varchar('name', { length: 50 }).notNull(),
  recordType:      varchar('record_type', { length: 50 }),
  deviceSn:        varchar('device_sn', { length: 50 }),
  originTime:      varchar('origin_time', { length: 50 }),
  recordId:        varchar('record_id', { length: 100 }),
  bodyTemperature: varchar('body_temperature', { length: 10 }),
  confidence:      varchar('confidence', { length: 10 }),
})

export const strangerCheckIn = mysqlTable('stranger_checkin', {
	id:              bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey(),
	deviceSn:        varchar('device_sn', { length: 50 }),
	date:            date('date').notNull(),
	time:            time('time'),
	userId:          varchar('user_id', { length: 50 }),
	userName:        varchar('user_name', { length: 50 }),
	gender:          int('gender'),
	bodyTemperature: varchar('body_temperature', { length: 10 }),
	confidence:      varchar('confidence', { length: 10 }),
	photo:           text('photo'),
	location:        json('location'),
	originTime:      varchar('origin_time', { length: 50 }),
	recordType:      varchar('record_type', { length: 50 }),
	createdAt:       timestamp('created_at').defaultNow(),
})

/**
 * 义工考勤每日汇总表（计算后的工时数据）
 */
export const volunteerCheckInSummary = mysqlTable('volunteer_checkin_summary', {
  id:                bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey(),
  userId:            bigint('user_id', { mode: 'number', unsigned: true })
    .notNull()
    .references(() => volunteer.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  lotusId:           varchar('lotus_id', { length: 50 }).notNull(),
  name:              varchar('name', { length: 50 }).notNull(),
  date:              date('date').notNull(),
  firstCheckinTime:  time('first_checkin_time'),
  lastCheckinTime:   time('last_checkin_time'),
  checkinCount:      int('checkin_count').default(0),
  workHours:         int('work_hours').default(0),
  calculationRule:   varchar('calculation_rule', { length: 50 }),
  status:            mysqlEnum('status', ['present', 'late', 'early_leave', 'absent', 'on_leave', 'manual']).default('present'),
  isNightShift:      boolean('is_night_shift').default(false),
  deviceSn:          varchar('device_sn', { length: 50 }),
  bodyTemperature:   varchar('body_temperature', { length: 10 }),
  confidence:        varchar('confidence', { length: 10 }),
  notes:             text('notes'),
  isManual:          boolean('is_manual').default(false),
  adjustedBy:        varchar('adjusted_by', { length: 50 }),
  adjustedAt:        timestamp('adjusted_at'),
  createdAt:         timestamp('created_at').defaultNow(),
  updatedAt:         timestamp('updated_at').defaultNow().onUpdateNow(),
})

/**
 * 往生者信息表
 * 用于记录往生者的基本信息和助念安排
 */
export const deceased = mysqlTable('deceased', {
  id:                  serial('id').primaryKey(),
  name:                varchar('name', { length: 50 }).notNull(),
  title:               varchar('title', { length: 20 }).notNull(),
  chantNumber:         varchar('chant_number', { length: 20 }),
  chantPosition:       mysqlEnum('chant_position', [
    'room-one',
    'room-two',
    'room-three',
    'room-four',
    'unknow',
  ]).default('unknow'),
  gender:              mysqlEnum('gender', ['male', 'female', 'other']).notNull(),
  deathDate:           date('death_date').notNull(),
  deathTime:           time('death_time'),
  age:                 int('age'),
  visitTime:           timestamp('visit_time'),
  visitationTeam:      json('visitation_team').$type<string[]>(),
  birthDate:           date('birth_date'),
  religion:            varchar('religion', { length: 50 }),
  isOrdained:          boolean('is_ordained').default(false),
  address:             text('address').notNull(),
  causeOfDeath:        text('cause_of_death'),
  familyContact:       varchar('family_contact', { length: 50 }),
  familyRelationship:  varchar('family_relationship', { length: 50 }),
  familyPhone:         varchar('phone', { length: 20 }).notNull(),
  specialNotes:        text('special_notes'),
  funeralArrangements: text('funeral_arrangements'),
  createdAt:           timestamp('created_at').defaultNow(),
})

/**
 * 助念排班表
 * 用于安排往生者的助念时间和义工排班
 * 
 * 业务说明：
 * - 为往生者安排助念时间段
 * - 分配敲钟义工、领诵义工、备用义工
 * - 记录助念的实际执行情况和反馈
 */
export const chantingSchedule = mysqlTable('chanting_schedule', {
  id:                   serial('id').primaryKey(),
  location:             mysqlEnum('location', ['fuhuiyuan', 'waiqin']).default('fuhuiyuan'),
  date:                 date('date').notNull(),
  timeSlot:             varchar('time_slot', { length: 20 }).notNull(),
  bellVolunteerId:      bigint('bell_volunteer_id', { mode: 'number', unsigned: true }).references(
    () => volunteer.id,
  ),
  teachingVolunteerId:  bigint('teaching_volunteer_id', {
    mode:     'number',
    unsigned: true,
  }).references(() => volunteer.id),
  backupVolunteerId:    bigint('backup_volunteer_id', {
    mode:     'number',
    unsigned: true,
  }).references(() => volunteer.id),
  deceasedId:           bigint('deceased_id', { mode: 'number', unsigned: true })
    .notNull()
    .references(() => deceased.id),
  status:               mysqlEnum('status', [
    'pending',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
  ]).default('pending'),
  actualStartTime:      timestamp('actual_start_time'),
  actualEndTime:        timestamp('actual_end_time'),
  feedback:             text('feedback'),
  expectedParticipants: int('expected_participants'),
  specialRequirements:  text('special_requirements'),
  createdBy:            bigint('created_by', { mode: 'number', unsigned: true }).references(
    () => volunteer.id,
  ),
  createdAt:            timestamp('created_at').defaultNow(),
  updatedAt:            timestamp('updated_at').defaultNow().onUpdateNow(),
})
