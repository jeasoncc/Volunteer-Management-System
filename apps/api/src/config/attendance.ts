/**
 * 满勤档位配置
 * 
 * 档位越高，要求的工时越长
 */

export interface AttendanceTier {
  tier: number
  hours: number
  checkInTime: string
  checkOutTime: string
  description: string
}

export const ATTENDANCE_TIERS: AttendanceTier[] = [
  {
    tier: 1,
    hours: 2,
    checkInTime: '09:00:00',
    checkOutTime: '11:00:00',
    description: '1档 - 2小时',
  },
  {
    tier: 2,
    hours: 4,
    checkInTime: '09:00:00',
    checkOutTime: '13:00:00',
    description: '2档 - 4小时',
  },
  {
    tier: 3,
    hours: 6,
    checkInTime: '09:00:00',
    checkOutTime: '15:00:00',
    description: '3档 - 6小时',
  },
  {
    tier: 4,
    hours: 8,
    checkInTime: '09:00:00',
    checkOutTime: '17:00:00',
    description: '4档 - 8小时（标准）',
  },
  {
    tier: 5,
    hours: 10,
    checkInTime: '08:00:00',
    checkOutTime: '18:00:00',
    description: '5档 - 10小时',
  },
  {
    tier: 6,
    hours: 12,
    checkInTime: '08:00:00',
    checkOutTime: '20:00:00',
    description: '6档 - 12小时（全天）',
  },
]

/**
 * 默认档位
 */
export const DEFAULT_TIER = 6 // 默认使用6档（12小时），保持向后兼容

/**
 * 根据档位获取配置
 */
export function getAttendanceTier(tier: number): AttendanceTier {
  const config = ATTENDANCE_TIERS.find(t => t.tier === tier)
  if (!config) {
    // 如果找不到，返回默认档位
    return ATTENDANCE_TIERS.find(t => t.tier === DEFAULT_TIER)!
  }
  return config
}

/**
 * 获取所有档位选项（用于前端下拉菜单）
 */
export function getAllTiers() {
  return ATTENDANCE_TIERS.map(t => ({
    value: t.tier,
    label: t.description,
    hours: t.hours,
  }))
}
