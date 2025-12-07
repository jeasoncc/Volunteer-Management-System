import { useEffect, useState } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { getTodayCheckIns, CheckInRecord } from '../../lib/api';

export function RealtimeCheckIns() {
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCheckIns();
    // 每30秒刷新一次
    const interval = setInterval(loadCheckIns, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadCheckIns() {
    try {
      const data = await getTodayCheckIns();
      setRecords(data.slice(0, 10)); // 只显示最新10条
    } catch (error) {
      console.error('Failed to load check-ins:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-warm border border-[#e8e0d5] p-6">
        <h3 className="text-lg font-semibold text-[#2d2a26] mb-4">今日签到动态</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-[#f5ede0] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-warm border border-[#e8e0d5] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#2d2a26]">今日签到动态</h3>
        <span className="text-sm text-[#7cb342] flex items-center gap-1">
          <span className="w-2 h-2 bg-[#7cb342] rounded-full animate-pulse" />
          实时更新
        </span>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {records.length === 0 ? (
          <p className="text-center text-[#6b6560] py-8">暂无签到记录</p>
        ) : (
          records.map((record) => (
            <div
              key={record.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#faf8f5] hover:bg-[#f5ede0] transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#b8860b]/10 flex items-center justify-center text-[#b8860b] font-semibold">
                {record.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#2d2a26]">{record.name}</p>
                <div className="flex items-center gap-3 text-sm text-[#6b6560]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {record.checkIn}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {record.location.split('市')[1]?.substring(0, 10) || '深圳'}
                  </span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                record.status === 'present' ? 'bg-[#7cb342]/10 text-[#7cb342]' :
                record.status === 'late' ? 'bg-[#d4a574]/20 text-[#d4a574]' :
                'bg-[#e8e0d5] text-[#6b6560]'
              }`}>
                {record.status === 'present' ? '正常' :
                 record.status === 'late' ? '迟到' : '其他'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
