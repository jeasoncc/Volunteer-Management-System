import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { checkinService } from "@/services/checkin";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/checkin/strangers")({
  component: CheckinStrangersPage,
} as any);

function CheckinStrangersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [startDate, setStartDate] = useState(
    dayjs().subtract(7, "day").format("YYYY-MM-DD"),
  );
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [deviceSn, setDeviceSn] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["checkin-strangers", startDate, endDate, deviceSn],
    queryFn: () =>
      checkinService.getStrangerRecords({
        page: 1,
        pageSize: 100,
        startDate,
        endDate,
        deviceSn: deviceSn || undefined,
      }),
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const records = (data as any)?.data || [];
  const pagination = (data as any)?.pagination || {};

  return (
    
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/checkin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">陌生人记录</h1>
              <p className="text-muted-foreground mt-1">
                查看考勤设备上传的陌生人识别记录，共 {pagination.total || records.length} 条
              </p>
            </div>
          </div>
        </div>

        {/* 筛选区域 */}
        <div className="bg-card rounded-lg border p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">开始日期</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">结束日期</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">设备编号</label>
              <Input
                placeholder="输入设备 SN 筛选"
                value={deviceSn}
                onChange={(e) => setDeviceSn(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => refetch()} className="w-full">
                查询
              </Button>
            </div>
          </div>
        </div>

        {/* 列表 */}
        <div className="bg-card rounded-lg border p-6 overflow-x-auto">
          {isLoading ? (
            <div className="text-center text-muted-foreground">加载中...</div>
          ) : records.length === 0 ? (
            <div className="text-center text-muted-foreground">暂无记录</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-4">时间</th>
                  <th className="py-2 pr-4">设备编号</th>
                  <th className="py-2 pr-4">用户ID</th>
                  <th className="py-2 pr-4">姓名</th>
                  <th className="py-2 pr-4">性别</th>
                  <th className="py-2 pr-4">体温</th>
                  <th className="py-2 pr-4">置信度</th>
                  <th className="py-2 pr-4">识别类型</th>
                  <th className="py-2 pr-4">照片</th>
                </tr>
              </thead>
              <tbody>
                {records.map((item: any) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">
                      {dayjs(item.date).format("YYYY-MM-DD")} {item.time || ""}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs">{item.deviceSn || "-"}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{item.userId || "-"}</td>
                    <td className="py-2 pr-4">{item.userName || "-"}</td>
                    <td className="py-2 pr-4">
                      {item.gender === 0
                        ? "男"
                        : item.gender === 1
                        ? "女"
                        : item.gender === -1
                        ? "未知"
                        : "-"}
                    </td>
                    <td className="py-2 pr-4">{item.bodyTemperature || "-"}</td>
                    <td className="py-2 pr-4">{item.confidence || "-"}</td>
                    <td className="py-2 pr-4">{item.recordType || "-"}</td>
                    <td className="py-2 pr-4">{item.photo ? "有" : "无"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    
  );
}
