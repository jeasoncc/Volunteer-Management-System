import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { checkinService } from "../services/checkin";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import dayjs from "dayjs";

export const Route = createFileRoute("/checkin")({
  component: CheckinPage,
} as any);

function CheckinPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["checkin", "monthly-report", year, month],
    queryFn: () => checkinService.getMonthlyReport({ year, month }),
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handleExport = async () => {
    try {
      const startDate = dayjs(`${year}-${month.toString().padStart(2, "0")}-01`).format("YYYY-MM-DD");
      const endDate = dayjs(startDate).endOf("month").format("YYYY-MM-DD");
      
      const blob = await checkinService.exportVolunteerService(startDate, endDate);
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `志愿者服务时间统计表_${year}年${month}月.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      alert(error.message || "导出失败");
    }
  };

  const report = reportData?.data || {};
  const volunteers = report.volunteers || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">考勤管理</h1>
        </div>

        {/* 月份选择 */}
        <Card>
          <CardHeader>
            <CardTitle>月度考勤报表</CardTitle>
            <CardDescription>选择年月查看考勤统计</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">年份</label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-32"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">月份</label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-32"
                />
              </div>
              <Button onClick={handleExport}>导出 Excel</Button>
            </div>
          </CardContent>
        </Card>

        {/* 统计概览 */}
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">加载中...</div>
        ) : volunteers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">暂无数据</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">参与义工</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{volunteers.length}</div>
                  <p className="text-sm text-gray-500 mt-1">人</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">总服务时长</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {volunteers.reduce((sum: number, v: any) => sum + (v.totalHours || 0), 0)}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">小时</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">总打卡次数</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {volunteers.reduce((sum: number, v: any) => sum + (v.totalDays || 0), 0)}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">次</p>
                </CardContent>
              </Card>
            </div>

            {/* 义工列表 */}
            <Card>
              <CardHeader>
                <CardTitle>义工考勤明细</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {volunteers.map((volunteer: any) => (
                    <div
                      key={volunteer.lotusId}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <div className="font-medium">{volunteer.name}</div>
                        <div className="text-sm text-gray-500">{volunteer.lotusId}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{volunteer.totalHours || 0} 小时</div>
                        <div className="text-sm text-gray-500">{volunteer.totalDays || 0} 天</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
