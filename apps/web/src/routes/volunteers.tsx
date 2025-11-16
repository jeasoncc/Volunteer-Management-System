import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { volunteerService } from "../services/volunteer";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

export const Route = createFileRoute("/volunteers")({
  component: VolunteersPage,
} as any);

function VolunteersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["volunteers", page, searchKeyword],
    queryFn: () => volunteerService.getList({ page, pageSize: 20, keyword: searchKeyword }),
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

  const handleSearch = () => {
    setSearchKeyword(keyword);
    setPage(1);
  };

  const volunteers = data?.data?.data || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">义工管理</h1>
          <Button>添加义工</Button>
        </div>

        {/* 搜索栏 */}
        <div className="flex gap-4">
          <Input
            placeholder="搜索义工（姓名、手机号、莲花斋ID）"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="max-w-md"
          />
          <Button onClick={handleSearch}>搜索</Button>
          {searchKeyword && (
            <Button
              variant="outline"
              onClick={() => {
                setKeyword("");
                setSearchKeyword("");
                setPage(1);
              }}
            >
              清除搜索
            </Button>
          )}
        </div>

        {/* 义工列表 */}
        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">加载中...</div>
          ) : volunteers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">暂无数据</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>莲花斋ID</TableHead>
                    <TableHead>姓名</TableHead>
                    <TableHead>性别</TableHead>
                    <TableHead>手机号</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {volunteers.map((volunteer: any) => (
                    <TableRow key={volunteer.id}>
                      <TableCell className="font-medium">{volunteer.lotusId}</TableCell>
                      <TableCell>{volunteer.name}</TableCell>
                      <TableCell>
                        {volunteer.gender === "male" ? "男" : volunteer.gender === "female" ? "女" : "其他"}
                      </TableCell>
                      <TableCell>{volunteer.phone}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            volunteer.volunteerStatus === "registered"
                              ? "bg-green-100 text-green-800"
                              : volunteer.volunteerStatus === "trainee"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {volunteer.volunteerStatus === "registered"
                            ? "已注册"
                            : volunteer.volunteerStatus === "trainee"
                            ? "培训中"
                            : volunteer.volunteerStatus === "applicant"
                            ? "申请中"
                            : volunteer.volunteerStatus}
                        </span>
                      </TableCell>
                      <TableCell>
                        {volunteer.lotusRole === "admin" ? "管理员" : "义工"}
                      </TableCell>
                      <TableCell>
                        {volunteer.createdAt ? new Date(volunteer.createdAt).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            查看
                          </Button>
                          <Button variant="ghost" size="sm">
                            编辑
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 分页 */}
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-700">
                  共 {total} 条记录，第 {page} / {totalPages} 页
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    上一页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
