import { useEffect, useState } from 'react';
import { Users, UserCheck, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { SEO } from '../components/SEO';
import { PageHeader } from '../components/PageHeader';
import { StatsCard } from '../components/stats/StatsCard';
import { RealtimeCheckIns } from '../components/stats/RealtimeCheckIns';
import { getVolunteerStats, getMonthlyStats, VolunteerStats, MonthlyStats } from '../lib/api';
import { AnimatedSection, StaggeredList } from '../components/ui/AnimatedSection';
import { StatsCardSkeleton, ListItemSkeleton } from '../components/ui/Skeleton';
import { cn } from '../lib/utils';

export function StatsPage() {
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadStats();
    // 每分钟刷新一次统计数据
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  async function loadStats() {
    try {
      const [volunteerStats, monthly] = await Promise.all([
        getVolunteerStats(),
        getMonthlyStats(new Date().getFullYear(), new Date().getMonth() + 1),
      ]);
      setStats(volunteerStats);
      setMonthlyStats(monthly.slice(0, 10)); // 前10名
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats();
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return { emoji: '🥇', bg: 'bg-yellow-100', text: 'text-yellow-700' };
    if (index === 1) return { emoji: '🥈', bg: 'bg-gray-100', text: 'text-gray-600' };
    if (index === 2) return { emoji: '🥉', bg: 'bg-orange-100', text: 'text-orange-700' };
    return { emoji: '', bg: 'bg-warm-100', text: 'text-muted-foreground' };
  };

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <SEO title="实时数据 | 莲花生命关怀" />
      <PageHeader
        title="实时数据"
        subtitle="义工服务与考勤数据实时展示"
        breadcrumbs={[{ label: '实时数据' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 刷新按钮和最后更新时间 */}
        <AnimatedSection className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            最后更新: {lastUpdate.toLocaleTimeString()}
          </p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm",
              "bg-white border border-border shadow-sm",
              "hover:bg-warm-50 transition-all",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              "disabled:opacity-50"
            )}
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            刷新数据
          </button>
        </AnimatedSection>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <AnimatedSection animation="scale" delay={0}>
                <StatsCard
                  title="注册义工"
                  value={stats?.totalVolunteers || 0}
                  icon={Users}
                  className="card-hover"
                />
              </AnimatedSection>
              <AnimatedSection animation="scale" delay={100}>
                <StatsCard
                  title="活跃义工"
                  value={stats?.activeVolunteers || 0}
                  icon={UserCheck}
                  className="card-hover"
                />
              </AnimatedSection>
              <AnimatedSection animation="scale" delay={200}>
                <StatsCard
                  title="累计服务时长"
                  value={`${stats?.totalServiceHours || 0}h`}
                  icon={Clock}
                  className="card-hover"
                />
              </AnimatedSection>
              <AnimatedSection animation="scale" delay={300}>
                <StatsCard
                  title="今日签到"
                  value={stats?.todayCheckIns || 0}
                  icon={TrendingUp}
                  className="card-hover"
                />
              </AnimatedSection>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 实时签到动态 */}
          <AnimatedSection animation="fadeLeft" delay={400}>
            <RealtimeCheckIns />
          </AnimatedSection>

          {/* 本月服务排行 */}
          <AnimatedSection animation="fadeRight" delay={500}>
            <div className="bg-white rounded-2xl shadow-warm border border-[#e8e0d5] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#2d2a26]">本月服务排行</h3>
                <span className="text-xs text-muted-foreground bg-warm-100 px-2 py-1 rounded-full">
                  TOP 10
                </span>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <>
                    {[1, 2, 3, 4, 5].map(i => (
                      <ListItemSkeleton key={i} />
                    ))}
                  </>
                ) : monthlyStats.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="text-muted-foreground">暂无数据</p>
                  </div>
                ) : (
                  <StaggeredList staggerDelay={50}>
                    {monthlyStats.map((stat, index) => {
                      const badge = getRankBadge(index);
                      return (
                        <div
                          key={stat.lotusId}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl",
                            "bg-[#faf8f5] hover:bg-[#f5ede0] transition-all duration-300",
                            "hover:shadow-sm cursor-default"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                            badge.bg, badge.text
                          )}>
                            {badge.emoji || index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[#2d2a26] truncate">{stat.name}</p>
                            <p className="text-sm text-[#6b6560]">
                              {stat.presentDays} 天 · {stat.totalHours.toFixed(1)} 小时
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-[#b8860b]">
                              {stat.avgHoursPerDay.toFixed(1)}h/天
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </StaggeredList>
                )}
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* 数据说明 */}
        <AnimatedSection delay={600}>
          <div className="mt-8 bg-[#f5ede0] border border-[#e8e0d5] rounded-2xl p-6">
            <h4 className="font-semibold text-[#2d2a26] mb-2">数据说明</h4>
            <ul className="text-sm text-[#6b6560] space-y-1">
              <li>• 数据每30秒自动更新，展示最新的义工服务情况</li>
              <li>• 服务时长根据考勤打卡记录自动计算</li>
              <li>• 排行榜按本月累计服务时长排序</li>
              <li>• 所有数据来源于真实的考勤系统</li>
            </ul>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
