import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';

export interface DailyPractice {
  date: string; // YYYY-MM-DD
  scriptureRead: boolean; // 是否读经
  scriptureId?: string; // 读的经文ID
  chanting: boolean; // 是否念佛
  chantingCount?: number; // 念佛次数
  meditation: boolean; // 是否打坐
  meditationMinutes?: number; // 打坐分钟数
  notes?: string; // 备注
  completed: boolean; // 是否完成当日功课
  createdAt: number;
  updatedAt: number;
}

interface DailyPracticeContextType {
  todayPractice: DailyPractice | null;
  practices: DailyPractice[]; // 历史记录
  updatePractice: (practice: Partial<DailyPractice>) => Promise<void>;
  getPracticeByDate: (date: string) => DailyPractice | null;
  getStreakDays: () => number; // 连续打卡天数
  getTotalDays: () => number; // 总打卡天数
  getMonthStats: (year: number, month: number) => {
    totalDays: number;
    completedDays: number;
    completionRate: number;
  };
}

const DailyPracticeContext = createContext<DailyPracticeContextType | undefined>(undefined);

const STORAGE_KEY = 'daily_practices';

export function DailyPracticeProvider({children}: {children: ReactNode}) {
  const [practices, setPractices] = useState<DailyPractice[]>([]);
  const [todayPractice, setTodayPractice] = useState<DailyPractice | null>(null);

  useEffect(() => {
    loadPractices();
  }, []);

  useEffect(() => {
    // 初始化今日功课
    const today = dayjs().format('YYYY-MM-DD');
    const existing = practices.find(p => p.date === today);
    if (!existing) {
      const newPractice: DailyPractice = {
        date: today,
        scriptureRead: false,
        chanting: false,
        meditation: false,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setTodayPractice(newPractice);
    } else {
      setTodayPractice(existing);
    }
  }, [practices]);

  const loadPractices = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const loaded = JSON.parse(data);
        setPractices(loaded);
      }
    } catch (error) {
      console.error('加载每日功课失败:', error);
    }
  };

  const savePractices = async (newPractices: DailyPractice[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPractices));
      setPractices(newPractices);
    } catch (error) {
      console.error('保存每日功课失败:', error);
    }
  };

  const updatePractice = async (updates: Partial<DailyPractice>) => {
    const today = dayjs().format('YYYY-MM-DD');
    const existing = practices.find(p => p.date === today);

    const practice: DailyPractice = existing
      ? {
          ...existing,
          ...updates,
          date: today,
          updatedAt: Date.now(),
          completed:
            (updates.scriptureRead ?? existing.scriptureRead) &&
            (updates.chanting ?? existing.chanting) &&
            (updates.meditation ?? existing.meditation),
        }
      : {
          date: today,
          scriptureRead: false,
          chanting: false,
          meditation: false,
          completed: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          ...updates,
          completed:
            (updates.scriptureRead ?? false) &&
            (updates.chanting ?? false) &&
            (updates.meditation ?? false),
        };

    const newPractices = existing
      ? practices.map(p => (p.date === today ? practice : p))
      : [...practices, practice];

    await savePractices(newPractices);
    setTodayPractice(practice);
  };

  const getPracticeByDate = (date: string): DailyPractice | null => {
    return practices.find(p => p.date === date) || null;
  };

  const getStreakDays = (): number => {
    let streak = 0;
    let currentDate = dayjs();

    while (true) {
      const dateStr = currentDate.format('YYYY-MM-DD');
      const practice = practices.find(p => p.date === dateStr);
      if (practice && practice.completed) {
        streak++;
        currentDate = currentDate.subtract(1, 'day');
      } else {
        break;
      }
    }

    return streak;
  };

  const getTotalDays = (): number => {
    return practices.filter(p => p.completed).length;
  };

  const getMonthStats = (year: number, month: number) => {
    const startDate = dayjs(`${year}-${month}-01`);
    const endDate = startDate.endOf('month');
    const totalDays = endDate.date();
    let completedDays = 0;

    for (let i = 1; i <= totalDays; i++) {
      const date = dayjs(`${year}-${month}-${i}`).format('YYYY-MM-DD');
      const practice = practices.find(p => p.date === date);
      if (practice && practice.completed) {
        completedDays++;
      }
    }

    return {
      totalDays,
      completedDays,
      completionRate: totalDays > 0 ? (completedDays / totalDays) * 100 : 0,
    };
  };

  return (
    <DailyPracticeContext.Provider
      value={{
        todayPractice,
        practices,
        updatePractice,
        getPracticeByDate,
        getStreakDays,
        getTotalDays,
        getMonthStats,
      }}>
      {children}
    </DailyPracticeContext.Provider>
  );
}

export function useDailyPractice() {
  const context = useContext(DailyPracticeContext);
  if (context === undefined) {
    throw new Error('useDailyPractice must be used within a DailyPracticeProvider');
  }
  return context;
}

