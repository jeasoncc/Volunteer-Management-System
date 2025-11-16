import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "../hooks/useAuth";
import { Layout } from "../components/Layout";

export const Route = createFileRoute("/")({
  component: HomePage,
} as any);

function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
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

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">欢迎使用莲花斋义工管理系统</h1>
          <p className="mt-2 text-gray-600">请从顶部导航栏选择功能模块</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">义工管理</h2>
            <p className="text-gray-600 mb-4">管理义工信息、查看义工列表、添加新义工</p>
            <a
              href="/volunteers"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              进入义工管理 →
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">考勤管理</h2>
            <p className="text-gray-600 mb-4">查看考勤记录、生成考勤报表、导出统计数据</p>
            <a
              href="/checkin"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              进入考勤管理 →
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
