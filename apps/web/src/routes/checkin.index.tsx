import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { BarChart3, List, AlertCircle, FileDown } from "lucide-react";
import { OverviewTab } from "@/components/checkin/OverviewTab";
import { RecordsTab } from "@/components/checkin/RecordsTab";
import { StrangersTab } from "@/components/checkin/StrangersTab";
import { ExportTab } from "@/components/checkin/ExportTab";

export const Route = createFileRoute("/checkin/")({
	component: CheckinPage,
});

function CheckinPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const [activeTab, setActiveTab] = useState("overview");

	if (authLoading) {
		return (
			<div className="space-y-6">
				<div className="h-10 bg-muted rounded-md w-1/3 animate-pulse" />
				<div className="h-64 bg-muted rounded-lg animate-pulse" />
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	return (
		<div className="space-y-6 animate-in fade-in duration-500">
			{/* 页面标题 */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight">考勤管理</h1>
				<p className="text-muted-foreground mt-1">
					查看统计数据、管理打卡记录、导出报表
				</p>
			</div>

			{/* 标签页 */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
					<TabsTrigger value="overview" className="gap-2">
						<BarChart3 className="h-4 w-4" />
						<span className="hidden sm:inline">统计概览</span>
					</TabsTrigger>
					<TabsTrigger value="records" className="gap-2">
						<List className="h-4 w-4" />
						<span className="hidden sm:inline">打卡记录</span>
					</TabsTrigger>
					<TabsTrigger value="strangers" className="gap-2">
						<AlertCircle className="h-4 w-4" />
						<span className="hidden sm:inline">陌生人</span>
					</TabsTrigger>
					<TabsTrigger value="export" className="gap-2">
						<FileDown className="h-4 w-4" />
						<span className="hidden sm:inline">数据导出</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-6">
					<OverviewTab />
				</TabsContent>

				<TabsContent value="records" className="space-y-6">
					<RecordsTab />
				</TabsContent>

				<TabsContent value="strangers" className="space-y-6">
					<StrangersTab />
				</TabsContent>

				<TabsContent value="export" className="space-y-6">
					<ExportTab />
				</TabsContent>
			</Tabs>
		</div>
	);
}
