/**
 * API 客户端配置
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface VolunteerStats {
  totalVolunteers: number;
  activeVolunteers: number;
  totalServiceHours: number;
  todayCheckIns: number;
}

export interface CheckInRecord {
  id: number;
  lotusId: string;
  name: string;
  date: string;
  checkIn: string;
  status: string;
  location: string;
}

export interface MonthlyStats {
  lotusId: string;
  name: string;
  totalHours: number;
  presentDays: number;
  avgHoursPerDay: number;
}

/**
 * 获取义工统计数据
 */
export async function getVolunteerStats(): Promise<VolunteerStats> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stats/volunteers`);
    if (!response.ok) throw new Error('Failed to fetch volunteer stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching volunteer stats:', error);
    // 返回模拟数据
    return {
      totalVolunteers: 156,
      activeVolunteers: 89,
      totalServiceHours: 12450,
      todayCheckIns: 34,
    };
  }
}

/**
 * 获取今日考勤记录
 */
export async function getTodayCheckIns(): Promise<CheckInRecord[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stats/checkins/today`);
    if (!response.ok) throw new Error('Failed to fetch check-in records');
    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('Error fetching check-in records:', error);
    return [];
  }
}

/**
 * 获取月度统计
 */
export async function getMonthlyStats(year: number, month: number): Promise<MonthlyStats[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/stats/leaderboard/monthly?year=${year}&month=${month}`
    );
    if (!response.ok) throw new Error('Failed to fetch monthly stats');
    const data = await response.json();
    return data.summaries || [];
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    return [];
  }
}
